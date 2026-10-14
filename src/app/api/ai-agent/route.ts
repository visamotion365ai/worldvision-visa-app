import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { aiAgentTasks } from "@/db/schema";
import { ensureDbInitialized } from "@/db/init";
import { desc } from "drizzle-orm";
import { forbidden, getSessionUser, isStaff, unauthorized } from "@/lib/auth";
import { getAiConfig, getBrowserbaseConfig, recentActivity, runAgent } from "@/lib/agent";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

export async function GET() {
  await ensureDbInitialized();
  const me = await getSessionUser();
  if (!me) return unauthorized();
  if (!isStaff(me)) return forbidden();
  const [ai, bb] = [await getAiConfig(), await getBrowserbaseConfig()];
  const tasks = await db.select().from(aiAgentTasks).orderBy(desc(aiAgentTasks.createdAt)).limit(20);
  const activity = await recentActivity(30);
  return NextResponse.json({
    success: true,
    status: { ai: ai.configured, aiProvider: ai.provider, aiModel: ai.model, browser: bb.configured },
    tasks,
    activity,
  });
}

export async function POST(req: NextRequest) {
  try {
    await ensureDbInitialized();
    const me = await getSessionUser();
    if (!me) return unauthorized();
    if (!isStaff(me)) return forbidden();
    const { messages } = await req.json();
    if (!Array.isArray(messages) || !messages.length) {
      return NextResponse.json({ success: false, error: "Send a message" }, { status: 400 });
    }
    const clean = messages
      .filter((m: any) => (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
      .map((m: any) => ({ role: m.role, content: String(m.content).slice(0, 4000) }));
    const result = await runAgent(clean, { id: me.id, name: me.fullName, role: me.role || "agent" });
    return NextResponse.json({ success: true, ...result });
  } catch (e: any) {
    console.error("POST /api/ai-agent", e);
    return NextResponse.json({ success: false, error: e?.message || "The AI agent failed" }, { status: 502 });
  }
}
