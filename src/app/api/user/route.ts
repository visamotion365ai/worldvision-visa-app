import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users, applications, documents } from "@/db/schema";
import { ensureDbInitialized } from "@/db/init";
import { eq } from "drizzle-orm";
import { getSessionUser, hashPassword, publicUser, unauthorized, verifyPassword } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  await ensureDbInitialized();
  const me = await getSessionUser();
  if (!me) return unauthorized();
  const apps = await db.select().from(applications).where(eq(applications.userId, me.id));
  const docs = await db.select({ status: documents.status }).from(documents).where(eq(documents.userId, me.id));
  return NextResponse.json({
    success: true,
    user: publicUser(me),
    stats: {
      applicationsCount: apps.length,
      countriesCount: new Set(apps.map((a) => a.country)).size,
      documentsCount: docs.length,
      verifiedDocsCount: docs.filter((d) => d.status === "verified").length,
    },
  });
}

export async function PATCH(req: NextRequest) {
  await ensureDbInitialized();
  const me = await getSessionUser();
  if (!me) return unauthorized();
  const body = await req.json();

  if (body.newPassword) {
    if (!verifyPassword(String(body.currentPassword || ""), me.passwordHash)) {
      return NextResponse.json({ success: false, error: "Current password is incorrect" }, { status: 400 });
    }
    if (String(body.newPassword).length < 8) return NextResponse.json({ success: false, error: "New password must be at least 8 characters" }, { status: 400 });
    await db.update(users).set({ passwordHash: hashPassword(body.newPassword) }).where(eq(users.id, me.id));
    return NextResponse.json({ success: true });
  }

  const [updated] = await db
    .update(users)
    .set({
      ...(body.fullName ? { fullName: String(body.fullName).trim() } : {}),
      ...(body.phone !== undefined ? { phone: String(body.phone).trim() || null } : {}),
      ...(body.country ? { country: body.country } : {}),
      ...(body.biometricEnabled !== undefined ? { biometricEnabled: !!body.biometricEnabled } : {}),
    })
    .where(eq(users.id, me.id))
    .returning();
  return NextResponse.json({ success: true, user: publicUser(updated) });
}
