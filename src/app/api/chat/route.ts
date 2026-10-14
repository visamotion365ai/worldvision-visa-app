import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { applications, chatMessages, notifications, users } from "@/db/schema";
import { ensureDbInitialized } from "@/db/init";
import { asc, eq, inArray } from "drizzle-orm";
import { getSessionUser, isStaff, logActivity, unauthorized } from "@/lib/auth";
import { clientAssistantReply, countryKnowledge } from "@/lib/agent";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function faq(text: string): string {
  const t = text.toLowerCase();
  const country = ["australia", "singapore", "serbia", "turkey", "malaysia", "russia"].find((c) => t.includes(c));
  if (country) {
    const k = countryKnowledge(country)[0];
    return `${k.country}: typical processing ${k.processing}. Key documents: ${k.requiredDocuments.slice(0, 4).map((d) => d.split(" — ")[0]).join(", ")}. Open Countries → ${k.country} → Start Application when you're ready.`;
  }
  if (t.includes("document")) return "Most files need: valid passport, passport photo, education/experience certificates, bank statement and police clearance. Exact lists are on each country page and in Documents.";
  if (t.includes("which visa") || t.includes("right for me")) return "Tell me your goal (work, visit, business), your profession and your preferred country and I'll point you to the right visa. You can also browse Services.";
  if (t.includes("job") || t.includes("recruit")) return "Open Today → Recruitment to see verified vacancies in our six countries and apply with your CV.";
  return "I'm the automated guide right now (our AI model isn't connected yet). Ask about Australia, Singapore, Serbia, Turkey, Malaysia or Russia — or switch to “Visa desk” to message a human consultant.";
}

export async function GET(req: NextRequest) {
  await ensureDbInitialized();
  const me = await getSessionUser();
  if (!me) return unauthorized();
  const withUser = Number(new URL(req.url).searchParams.get("userId") || 0);
  const targetId = isStaff(me) && withUser ? withUser : me.id;
  const history = await db.select().from(chatMessages).where(eq(chatMessages.userId, targetId)).orderBy(asc(chatMessages.createdAt));
  return NextResponse.json({ success: true, messages: history });
}

export async function POST(req: NextRequest) {
  try {
    await ensureDbInitialized();
    const me = await getSessionUser();
    if (!me) return unauthorized();
    const { message, mode = "ai", toUserId } = await req.json();
    const text = String(message || "").trim().slice(0, 2000);
    if (!text) return NextResponse.json({ success: false, error: "Type a message" }, { status: 400 });

    // Staff reply to a client conversation.
    if (isStaff(me) && toUserId) {
      const [msg] = await db.insert(chatMessages).values({ userId: Number(toUserId), sender: "consultant", senderName: me.fullName, message: text }).returning();
      await db.insert(notifications).values({ userId: Number(toUserId), title: `${me.fullName} replied`, message: text.slice(0, 160), type: "consultation" });
      await logActivity({ id: me.id, name: me.fullName, role: me.role || "agent" }, "replied_to_client", "user", Number(toUserId));
      return NextResponse.json({ success: true, replyMessage: msg });
    }

    const [userMsg] = await db.insert(chatMessages).values({ userId: me.id, sender: "user", senderName: me.fullName, message: text }).returning();

    if (mode === "consultant") {
      const staff = await db.select().from(users).where(inArray(users.role, ["admin", "agent"]));
      for (const s of staff) {
        await db.insert(notifications).values({ userId: s.id, title: `Message from ${me.fullName}`, message: text.slice(0, 160), type: "consultation" });
      }
      const [reply] = await db
        .insert(chatMessages)
        .values({ userId: me.id, sender: "consultant", senderName: "World Vision Visa Desk", message: "Thanks — your message has been sent to our visa desk. A consultant will reply right here and you'll get a notification." })
        .returning();
      return NextResponse.json({ success: true, userMessage: userMsg, replyMessage: reply });
    }

    // AI mode
    const mine = await db.select().from(applications).where(eq(applications.userId, me.id));
    const ctx = `Name: ${me.fullName}. Applications: ${mine.length ? mine.map((a) => `${a.applicationNumber} ${a.country} ${a.visaType} — ${a.status}`).join("; ") : "none yet"}.`;
    const past = await db.select().from(chatMessages).where(eq(chatMessages.userId, me.id)).orderBy(asc(chatMessages.createdAt));
    const hist = past
      .filter((m) => m.sender === "user" || m.sender === "ai")
      .slice(-10)
      .map((m) => ({ role: (m.sender === "user" ? "user" : "assistant") as "user" | "assistant", content: m.message }));

    let answer: string | null = null;
    try {
      answer = await clientAssistantReply(hist, ctx);
    } catch (e) {
      console.error("assistant error", e);
    }
    const [bot] = await db
      .insert(chatMessages)
      .values({ userId: me.id, sender: "ai", senderName: answer ? "Ava • World Vision AI" : "World Vision Guide", message: answer || faq(text) })
      .returning();
    return NextResponse.json({ success: true, userMessage: userMsg, replyMessage: bot });
  } catch (error) {
    console.error("POST /api/chat", error);
    return NextResponse.json({ success: false, error: "Failed to send message" }, { status: 500 });
  }
}
