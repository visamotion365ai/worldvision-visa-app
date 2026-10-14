import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { notifications } from "@/db/schema";
import { ensureDbInitialized } from "@/db/init";
import { and, desc, eq } from "drizzle-orm";
import { getSessionUser, unauthorized } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  await ensureDbInitialized();
  const me = await getSessionUser();
  if (!me) return unauthorized();
  const list = await db.select().from(notifications).where(eq(notifications.userId, me.id)).orderBy(desc(notifications.createdAt)).limit(60);
  return NextResponse.json({ success: true, notifications: list, unread: list.filter((n) => !n.isRead).length });
}

export async function PATCH(req: NextRequest) {
  await ensureDbInitialized();
  const me = await getSessionUser();
  if (!me) return unauthorized();
  const { id, markAllRead } = await req.json();
  if (markAllRead) {
    await db.update(notifications).set({ isRead: true }).where(eq(notifications.userId, me.id));
    return NextResponse.json({ success: true });
  }
  if (id) {
    await db.update(notifications).set({ isRead: true }).where(and(eq(notifications.id, id), eq(notifications.userId, me.id)));
    return NextResponse.json({ success: true });
  }
  return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
}
