import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { aiAgentTasks } from "@/db/schema";
import { ensureDbInitialized } from "@/db/init";
import { forbidden, getSessionUser, isStaff, logActivity, unauthorized } from "@/lib/auth";
import { browseWithBrowserbase, runAgent } from "@/lib/agent";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

export async function POST(req: NextRequest) {
  await ensureDbInitialized();
  const me = await getSessionUser();
  if (!me) return unauthorized();
  if (!isStaff(me)) return forbidden();
  const { url, goal, country } = await req.json();
  const logs: string[] = [];
  try {
    logs.push(`Opening Browserbase cloud session for ${url}`);
    const r = await browseWithBrowserbase(String(url));
    logs.push(`Session ${r.sessionId} loaded “${r.title}” at ${r.finalUrl}`);

    // Optional: ask the model to read the page for the stated goal.
    let analysis: string | null = null;
    if (goal) {
      const out = await runAgent(
        [{ role: "user", content: `Goal: ${goal}\n\nI opened ${r.finalUrl} in a real browser. Visible page text:\n"""${r.text.slice(0, 5500)}"""\n\nAnswer the goal using only this page text. If the page does not say, say so.` }],
        { id: me.id, name: me.fullName, role: me.role || "agent" }
      );
      analysis = out.reply;
      logs.push("AI analysed the page for the stated goal");
    }

    const [task] = await db
      .insert(aiAgentTasks)
      .values({
        taskType: "browser_verification",
        country: country || "—",
        targetUrl: r.finalUrl,
        provider: "browserbase",
        status: "completed",
        prompt: goal || `Open ${url}`,
        result: { title: r.title, replayUrl: r.replayUrl, sessionId: r.sessionId, analysis, excerpt: r.text.slice(0, 1200) },
        logs,
      })
      .returning();
    await logActivity({ id: me.id, name: me.fullName, role: me.role || "agent" }, "browser_session", "task", task.id, r.finalUrl);
    return NextResponse.json({ success: true, task, liveUrl: r.liveUrl, replayUrl: r.replayUrl, title: r.title, text: r.text, analysis, logs });
  } catch (e: any) {
    const [task] = await db
      .insert(aiAgentTasks)
      .values({ taskType: "browser_verification", country: country || "—", targetUrl: String(url || ""), provider: "browserbase", status: "failed", prompt: goal || `Open ${url}`, result: { error: e?.message }, logs: [...logs, `Failed: ${e?.message}`] })
      .returning();
    return NextResponse.json({ success: false, error: e?.message || "Browser session failed", task }, { status: 502 });
  }
}
