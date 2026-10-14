import { db } from "@/db";
import { applications, documents, users, notifications, aiAgentTasks, activityLog } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { getSetting } from "@/lib/settings";
import { logActivity } from "@/lib/auth";
import { PRIMARY_COUNTRIES } from "@/lib/countryData";

/* ------------------------------------------------------------------ */
/* Configuration                                                       */
/* ------------------------------------------------------------------ */

export async function getAiConfig() {
  const provider = (await getSetting("AI_PROVIDER")) || "meta";
  const key = await getSetting("META_AI_KEY");
  const baseUrl = ((await getSetting("AI_BASE_URL")) || (provider === "meta" ? "https://api.llama.com/compat/v1" : "")).replace(/\/$/, "");
  const model = (await getSetting("AI_MODEL")) || "Llama-4-Maverick-17B-128E-Instruct-FP8";
  return { provider, key, baseUrl, model, configured: !!key && !!baseUrl };
}

export async function getBrowserbaseConfig() {
  const key = await getSetting("BROWSERBASE_API_KEY");
  const projectId = await getSetting("BROWSERBASE_PROJECT_ID");
  return { key, projectId, configured: !!key && !!projectId };
}

/* ------------------------------------------------------------------ */
/* Country knowledge (fed to the model + used by the PDF generator)    */
/* ------------------------------------------------------------------ */

export function countryKnowledge(name?: string) {
  const list = name ? PRIMARY_COUNTRIES.filter((c) => c.name.toLowerCase() === name.toLowerCase()) : PRIMARY_COUNTRIES;
  return list.map((c) => ({
    country: c.name,
    processing: c.processingTime,
    averageSalary: c.recruitment.averageSalary,
    overview: c.overview,
    eligibility: c.eligibility,
    requiredDocuments: c.requiredDocuments.map((d) => `${d.title}${d.required ? " (required)" : ""} — ${d.desc}`),
    stages: c.processingStages.map((s) => `${s.title} (${s.days})`),
    visaTypes: c.visaCategories.map((v) => `${v.name}: ${v.processingTime}, fee ${v.govFee}, stay ${v.stayPeriod}`),
  }));
}

/* ------------------------------------------------------------------ */
/* LLM                                                                 */
/* ------------------------------------------------------------------ */

type Msg = {
  role: "system" | "user" | "assistant" | "tool";
  content: string | null;
  tool_calls?: any[];
  tool_call_id?: string;
  name?: string;
};

async function llm(messages: Msg[], tools?: any[]) {
  const cfg = await getAiConfig();
  if (!cfg.configured) throw new Error("AI is not configured");
  const res = await fetch(`${cfg.baseUrl}/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${cfg.key}` },
    body: JSON.stringify({
      model: cfg.model,
      messages,
      temperature: 0.3,
      max_tokens: 1200,
      ...(tools && tools.length ? { tools, tool_choice: "auto" } : {}),
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`AI provider error ${res.status}: ${text.slice(0, 300)}`);
  }
  const data = await res.json();
  // OpenAI-compatible shape: choices[0].message ; Llama native shape: completion_message
  const msg = data?.choices?.[0]?.message ?? data?.completion_message;
  if (!msg) throw new Error("AI provider returned an empty response");
  const content =
    typeof msg.content === "string" ? msg.content : Array.isArray(msg.content) ? msg.content.map((c: any) => c.text || "").join("") : msg.content?.text ?? "";
  return { content: content as string, tool_calls: (msg.tool_calls as any[]) || [] };
}

/* ------------------------------------------------------------------ */
/* Browserbase (real cloud browser)                                    */
/* ------------------------------------------------------------------ */

export async function browseWithBrowserbase(url: string) {
  const cfg = await getBrowserbaseConfig();
  if (!cfg.configured) throw new Error("Browserbase is not configured (add API key + project ID in Settings)");
  if (!/^https?:\/\//i.test(url)) throw new Error("URL must start with http:// or https://");

  const headers = { "X-BB-API-Key": cfg.key, "Content-Type": "application/json" };
  const created = await fetch("https://api.browserbase.com/v1/sessions", {
    method: "POST",
    headers,
    body: JSON.stringify({ projectId: cfg.projectId }),
  });
  if (!created.ok) throw new Error(`Browserbase session error ${created.status}: ${(await created.text()).slice(0, 200)}`);
  const session = await created.json();

  let liveUrl: string | undefined;
  try {
    const dbg = await fetch(`https://api.browserbase.com/v1/sessions/${session.id}/debug`, { headers });
    if (dbg.ok) liveUrl = (await dbg.json()).debuggerFullscreenUrl;
  } catch {}

  const { chromium } = await import("playwright-core");
  const browser = await chromium.connectOverCDP(session.connectUrl);
  try {
    const context = browser.contexts()[0] ?? (await browser.newContext());
    const page = context.pages()[0] ?? (await context.newPage());
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 35000 });
    await page.waitForTimeout(1500);
    const title = await page.title();
    const text: string = await page.evaluate(() => (document.body ? document.body.innerText : ""));
    return {
      sessionId: session.id as string,
      liveUrl,
      replayUrl: `https://www.browserbase.com/sessions/${session.id}`,
      finalUrl: page.url(),
      title,
      text: text.replace(/\s+\n/g, "\n").slice(0, 7000),
    };
  } finally {
    await browser.close().catch(() => {});
  }
}

/* ------------------------------------------------------------------ */
/* Agent tools                                                         */
/* ------------------------------------------------------------------ */

const STATUS_PROGRESS: Record<string, number> = {
  under_review: 20,
  documents_verified: 40,
  processing: 60,
  embassy_review: 80,
  approved: 90,
  completed: 100,
  rejected: 100,
};

type Actor = { id?: number | null; name: string; role: string };

const toolDefs = (hasBrowser: boolean, hasBase44: boolean) => {
  const fn = (name: string, description: string, properties: any = {}, required: string[] = []) => ({
    type: "function",
    function: { name, description, parameters: { type: "object", properties, required } },
  });
  const tools: any[] = [
    fn("dashboard_stats", "Get live totals: applications by status, clients, revenue, pending documents."),
    fn(
      "search_applications",
      "Find applications. Filter by free-text query (client name, reference, country, visa type) and/or status.",
      { query: { type: "string" }, status: { type: "string" }, country: { type: "string" } }
    ),
    fn("get_application", "Full detail of one application including client, form data and its documents.", { id: { type: "number" } }, ["id"]),
    fn(
      "update_application",
      "Change an application's status and the 'next step' text the client sees. Status must be one of: under_review, documents_verified, processing, embassy_review, approved, completed, rejected. The client is notified automatically.",
      { id: { type: "number" }, status: { type: "string" }, nextAction: { type: "string" } },
      ["id"]
    ),
    fn(
      "review_document",
      "Verify or reject a client's document. Status: verified | rejected | under_review. Give a reason when rejecting. The client is notified automatically.",
      { id: { type: "number" }, status: { type: "string" }, reason: { type: "string" } },
      ["id", "status"]
    ),
    fn("notify_client", "Send an in-app notification to a client.", { userId: { type: "number" }, title: { type: "string" }, message: { type: "string" } }, [
      "userId",
      "title",
      "message",
    ]),
    fn("list_clients", "List registered clients (optionally filtered by name/email/phone).", { query: { type: "string" } }),
    fn("get_client_profile", "Complete profile of a client: personal details, all applications and all documents.", { userId: { type: "number" } }, ["userId"]),
    fn("country_requirements", "Official-style requirements, documents checklist, stages and visa types for one of the six countries.", { country: { type: "string" } }, [
      "country",
    ]),
  ];
  if (hasBrowser)
    tools.push(
      fn("browse_portal", "Open a real cloud browser (Browserbase), load the URL and return the page title and visible text. Use for government/embassy portal checks.", {
        url: { type: "string" },
      }, ["url"])
    );
  if (hasBase44)
    tools.push(fn("ask_base44_agent", "Ask the company's Base44 agent a question and return its answer.", { message: { type: "string" } }, ["message"]));
  return tools;
};

async function runTool(name: string, args: any, actor: Actor): Promise<any> {
  switch (name) {
    case "dashboard_stats": {
      const apps = await db.select().from(applications);
      const clients = await db.select().from(users);
      const docs = await db.select({ status: documents.status }).from(documents);
      const byStatus: Record<string, number> = {};
      apps.forEach((a) => (byStatus[a.status] = (byStatus[a.status] || 0) + 1));
      return {
        applications: apps.length,
        byStatus,
        clients: clients.filter((c) => c.role === "applicant").length,
        revenueUSD: apps.reduce((s, a) => s + (a.feeAmount || 0), 0),
        documentsPendingReview: docs.filter((d) => d.status === "under_review" || d.status === "uploaded").length,
      };
    }
    case "search_applications": {
      const rows = await db
        .select({ a: applications, name: users.fullName, email: users.email })
        .from(applications)
        .leftJoin(users, eq(applications.userId, users.id))
        .orderBy(desc(applications.submissionDate));
      const q = String(args.query || "").toLowerCase();
      return rows
        .filter((r) => !args.status || r.a.status === args.status)
        .filter((r) => !args.country || r.a.country.toLowerCase() === String(args.country).toLowerCase())
        .filter(
          (r) =>
            !q ||
            [r.a.applicationNumber, r.a.country, r.a.visaType, r.name, r.email].some((v) => String(v || "").toLowerCase().includes(q))
        )
        .slice(0, 15)
        .map((r) => ({
          id: r.a.id,
          reference: r.a.applicationNumber,
          client: r.name,
          userId: r.a.userId,
          country: r.a.country,
          visaType: r.a.visaType,
          status: r.a.status,
          progress: r.a.progressPct,
          nextAction: r.a.nextAction,
        }));
    }
    case "get_application": {
      const [a] = await db.select().from(applications).where(eq(applications.id, Number(args.id))).limit(1);
      if (!a) return { error: "Application not found" };
      const [c] = a.userId ? await db.select().from(users).where(eq(users.id, a.userId)).limit(1) : [];
      const docs = await db
        .select({ id: documents.id, type: documents.docType, title: documents.title, file: documents.fileName, status: documents.status, reason: documents.rejectionReason })
        .from(documents)
        .where(eq(documents.applicationId, a.id));
      const required = countryKnowledge(a.country)[0]?.requiredDocuments ?? [];
      return {
        application: { ...a },
        client: c ? { id: c.id, name: c.fullName, email: c.email, phone: c.phone, country: c.country } : null,
        documents: docs,
        countryRequiredDocuments: required,
      };
    }
    case "update_application": {
      const status = args.status as string | undefined;
      if (status && !(status in STATUS_PROGRESS)) return { error: `Invalid status. Use: ${Object.keys(STATUS_PROGRESS).join(", ")}` };
      const [u] = await db
        .update(applications)
        .set({
          ...(status ? { status, progressPct: STATUS_PROGRESS[status] } : {}),
          ...(args.nextAction ? { nextAction: String(args.nextAction) } : {}),
          updatedAt: new Date(),
        })
        .where(eq(applications.id, Number(args.id)))
        .returning();
      if (!u) return { error: "Application not found" };
      if (status) {
        await db.insert(notifications).values({
          userId: u.userId,
          title: "Application update",
          message: `${u.country} ${u.visaType} is now: ${status.replace(/_/g, " ")}.${args.nextAction ? " " + args.nextAction : ""}`,
          type: "application",
        });
      }
      await logActivity(actor, "updated_application", "application", u.id, `${status || ""} ${args.nextAction || ""}`.trim());
      return { ok: true, id: u.id, status: u.status, progress: u.progressPct, nextAction: u.nextAction };
    }
    case "review_document": {
      if (!["verified", "rejected", "under_review"].includes(args.status)) return { error: "status must be verified, rejected or under_review" };
      const [d] = await db
        .update(documents)
        .set({
          status: args.status,
          rejectionReason: args.status === "rejected" ? String(args.reason || "Please upload a clearer copy") : null,
          verifiedAt: args.status === "verified" ? new Date() : null,
        })
        .where(eq(documents.id, Number(args.id)))
        .returning({ id: documents.id, userId: documents.userId, title: documents.title, status: documents.status });
      if (!d) return { error: "Document not found" };
      await db.insert(notifications).values({
        userId: d.userId,
        title: d.status === "verified" ? "Document verified" : "Document needs attention",
        message: d.status === "rejected" ? `${d.title}: ${args.reason || "Please upload a clearer copy"}` : `${d.title} is ${d.status}.`,
        type: "document",
      });
      await logActivity(actor, `document_${d.status}`, "document", d.id, d.title);
      return { ok: true, id: d.id, status: d.status };
    }
    case "notify_client": {
      await db.insert(notifications).values({
        userId: Number(args.userId),
        title: String(args.title).slice(0, 120),
        message: String(args.message).slice(0, 600),
        type: "consultation",
      });
      await logActivity(actor, "notified_client", "user", Number(args.userId), String(args.title));
      return { ok: true };
    }
    case "list_clients": {
      const q = String(args.query || "").toLowerCase();
      const all = await db.select().from(users);
      return all
        .filter((u) => u.role === "applicant")
        .filter((u) => !q || [u.fullName, u.email, u.phone].some((v) => String(v || "").toLowerCase().includes(q)))
        .slice(0, 20)
        .map((u) => ({ id: u.id, name: u.fullName, email: u.email, phone: u.phone, country: u.country }));
    }
    case "get_client_profile": {
      const [c] = await db.select().from(users).where(eq(users.id, Number(args.userId))).limit(1);
      if (!c) return { error: "Client not found" };
      const apps = await db.select().from(applications).where(eq(applications.userId, c.id));
      const docs = await db
        .select({ id: documents.id, type: documents.docType, title: documents.title, status: documents.status, applicationId: documents.applicationId })
        .from(documents)
        .where(eq(documents.userId, c.id));
      return {
        client: { id: c.id, name: c.fullName, email: c.email, phone: c.phone, country: c.country, joined: c.createdAt },
        applications: apps.map((a) => ({ id: a.id, ref: a.applicationNumber, country: a.country, visa: a.visaType, status: a.status, progress: a.progressPct, details: a.details })),
        documents: docs,
      };
    }
    case "country_requirements":
      return countryKnowledge(String(args.country))[0] ?? { error: "Country not covered. We serve Australia, Singapore, Serbia, Turkey, Malaysia, Russia." };
    case "browse_portal": {
      const r = await browseWithBrowserbase(String(args.url));
      await db.insert(aiAgentTasks).values({
        taskType: "browser_verification",
        country: "—",
        targetUrl: r.finalUrl,
        provider: "browserbase",
        status: "completed",
        prompt: `Agent browse: ${args.url}`,
        result: { title: r.title, replayUrl: r.replayUrl, sessionId: r.sessionId },
        logs: [`Browserbase session ${r.sessionId}`, `Loaded ${r.finalUrl}`, `Title: ${r.title}`],
      });
      return { title: r.title, url: r.finalUrl, replayUrl: r.replayUrl, text: r.text.slice(0, 3500) };
    }
    case "ask_base44_agent": {
      const url = await getSetting("BASE44_FUNCTION_URL");
      const key = await getSetting("BASE44_API_KEY");
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", api_key: key, Authorization: `Bearer ${key}` },
        body: JSON.stringify({ message: args.message }),
      });
      const text = await res.text();
      if (!res.ok) return { error: `Base44 returned ${res.status}`, body: text.slice(0, 300) };
      return { answer: text.slice(0, 3000) };
    }
    default:
      return { error: `Unknown tool ${name}` };
  }
}

/* ------------------------------------------------------------------ */
/* Agent loop                                                          */
/* ------------------------------------------------------------------ */

const SYSTEM_PROMPT = `You are Ava, the senior operations admin at World Vision Consultancy (ওয়ার্ল্ড ভিশন কনসালটেন্সী), a licensed visa and overseas recruitment agency serving ONLY Australia, Singapore, Serbia, Turkey, Malaysia and Russia.
You work like a diligent human admin colleague: you look things up with your tools, take the actions the staff member asks for, and then report back in short, warm, plain sentences (no long essays, no markdown tables).
Rules:
- Never invent applications, clients, documents or statuses. If you need data, call a tool.
- Before changing a status, check the application with get_application. When rejecting a document always give a clear reason.
- After you act, say exactly what you changed (reference number, new status).
- If asked about a country, use country_requirements and give the document checklist, stages and realistic timeframes.
- You can mention that staff can tap "PDF" on an application or client to download the official dossier / client profile.
- If something is outside your tools, say so honestly.
Today is ${new Date().toDateString()}.`;

export type AgentAction = { tool: string; args: any; ok: boolean; summary: string };

export async function runAgent(history: { role: "user" | "assistant"; content: string }[], actor: Actor) {
  const cfg = await getAiConfig();
  if (!cfg.configured) {
    return {
      configured: false,
      reply:
        "I'm not connected to an AI model yet. An admin can add the Meta Llama (or compatible) API key under Settings → Integrations, and I'll start working straight away.",
      actions: [] as AgentAction[],
    };
  }
  const bb = await getBrowserbaseConfig();
  const hasBase44 = !!(await getSetting("BASE44_FUNCTION_URL")) && !!(await getSetting("BASE44_API_KEY"));
  const tools = toolDefs(bb.configured, hasBase44);

  const messages: Msg[] = [{ role: "system", content: SYSTEM_PROMPT }, ...history.slice(-14).map((m) => ({ role: m.role, content: m.content }))];
  const actions: AgentAction[] = [];

  for (let i = 0; i < 6; i++) {
    const out = await llm(messages, tools);
    if (!out.tool_calls.length) {
      return { configured: true, reply: out.content.trim() || "Done.", actions };
    }
    messages.push({ role: "assistant", content: out.content || null, tool_calls: out.tool_calls });
    for (const call of out.tool_calls) {
      const name = call.function?.name as string;
      let args: any = {};
      try {
        args = typeof call.function?.arguments === "string" ? JSON.parse(call.function.arguments || "{}") : call.function?.arguments || {};
      } catch {}
      let result: any;
      try {
        result = await runTool(name, args, { ...actor, name: `Ava (AI) for ${actor.name}`, role: "ai" });
      } catch (e: any) {
        result = { error: e?.message || "Tool failed" };
      }
      const ok = !result?.error;
      actions.push({ tool: name, args, ok, summary: ok ? summarize(name, result) : String(result.error) });
      messages.push({ role: "tool", tool_call_id: call.id, name, content: JSON.stringify(result).slice(0, 9000) });
    }
  }
  return { configured: true, reply: "I gathered what I could but ran out of steps — ask me to continue and I'll pick it up.", actions };
}

function summarize(tool: string, r: any) {
  switch (tool) {
    case "update_application":
      return `Application #${r.id} → ${String(r.status).replace(/_/g, " ")} (${r.progress}%)`;
    case "review_document":
      return `Document #${r.id} → ${r.status}`;
    case "search_applications":
      return `${r.length} application(s) found`;
    case "list_clients":
      return `${r.length} client(s) found`;
    case "browse_portal":
      return `Opened “${r.title}”`;
    case "notify_client":
      return "Client notified";
    case "dashboard_stats":
      return `${r.applications} applications • ${r.clients} clients`;
    default:
      return "Done";
  }
}

/** Runs in the background when a client submits an application. No-op without an AI key. */
export async function autoReviewApplication(applicationId: number) {
  const cfg = await getAiConfig();
  if (!cfg.configured) return;
  if ((await getSetting("AUTO_REVIEW_APPLICATIONS")) === "false") return;
  const prompt = `A new application (id ${applicationId}) was just submitted. Check it with get_application and compare the uploaded documents with the country checklist. If required documents are missing, set nextAction to a clear instruction for the client and notify them listing exactly what is missing. If everything required is present, set nextAction to say the documents are being verified by our team. Do not change the status.`;
  await runAgent([{ role: "user", content: prompt }], { id: null, name: "System", role: "ai" });
}

/** Client-facing assistant (no write tools). Returns null when AI isn't configured. */
export async function clientAssistantReply(history: { role: "user" | "assistant"; content: string }[], context: string) {
  const cfg = await getAiConfig();
  if (!cfg.configured) return null;
  const system = `You are Ava, a friendly consultant at World Vision Consultancy (visa & overseas recruitment) answering a client inside the mobile app. We serve ONLY Australia, Singapore, Serbia, Turkey, Malaysia and Russia. Be concise (max ~120 words), practical and honest; never guarantee visa approval. Use the knowledge below. Suggest the next in-app step (Countries tab → Start Application, Documents, Recruitment).
CLIENT CONTEXT: ${context}
KNOWLEDGE: ${JSON.stringify(countryKnowledge()).slice(0, 9000)}`;
  const out = await llm([{ role: "system", content: system }, ...history.slice(-10)]);
  return out.content.trim();
}

export async function recentActivity(limit = 25) {
  return db.select().from(activityLog).orderBy(desc(activityLog.createdAt)).limit(limit);
}
