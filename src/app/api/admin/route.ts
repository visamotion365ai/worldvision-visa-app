import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { applications, users, documents, jobs, notifications } from "@/db/schema";
import { ensureDbInitialized } from "@/db/init";
import { desc, eq } from "drizzle-orm";
import { forbidden, getSessionUser, hashPassword, isStaff, logActivity, publicUser, unauthorized } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await ensureDbInitialized();
    const me = await getSessionUser();
    if (!me) return unauthorized();
    if (!isStaff(me)) return forbidden();

    const apps = await db.select().from(applications).orderBy(desc(applications.submissionDate));
    const allUsers = await db.select().from(users).orderBy(desc(users.createdAt));
    const docs = await db.select({ id: documents.id, status: documents.status, userId: documents.userId }).from(documents);
    const allJobs = await db.select({ id: jobs.id }).from(jobs);

    const byStatus: Record<string, number> = {};
    apps.forEach((a) => (byStatus[a.status] = (byStatus[a.status] || 0) + 1));
    const byCountry: Record<string, number> = {};
    apps.forEach((a) => (byCountry[a.country] = (byCountry[a.country] || 0) + 1));

    return NextResponse.json({
      success: true,
      stats: {
        totalApplications: apps.length,
        totalClients: allUsers.filter((u) => u.role === "applicant").length,
        totalDocuments: docs.length,
        pendingDocuments: docs.filter((d) => d.status === "under_review" || d.status === "uploaded").length,
        totalJobs: allJobs.length,
        revenue: apps.filter((a) => a.paymentStatus === "paid").reduce((s, a) => s + (a.feeAmount || 0), 0),
        byStatus,
        byCountry,
      },
      users: allUsers.map((u) => {
        const mine = apps.filter((a) => a.userId === u.id);
        return { ...publicUser(u), applicationsCount: mine.length, documentsCount: docs.filter((d) => d.userId === u.id).length };
      }),
      me: publicUser(me),
    });
  } catch (error) {
    console.error("GET /api/admin", error);
    return NextResponse.json({ success: false, error: "Failed to load admin data" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await ensureDbInitialized();
    const me = await getSessionUser();
    if (!me) return unauthorized();
    if (me.role !== "admin") return forbidden("Admins only");
    const body = await req.json();
    const actor = { id: me.id, name: me.fullName, role: "admin" };

    if (body.action === "set_role") {
      if (!["applicant", "agent", "admin"].includes(body.role)) return NextResponse.json({ success: false, error: "Invalid role" }, { status: 400 });
      if (body.userId === me.id && body.role !== "admin") return NextResponse.json({ success: false, error: "You cannot remove your own admin access" }, { status: 400 });
      await db.update(users).set({ role: body.role }).where(eq(users.id, Number(body.userId)));
      await logActivity(actor, "changed_role", "user", Number(body.userId), body.role);
      return NextResponse.json({ success: true });
    }

    if (body.action === "set_password") {
      if (String(body.password || "").length < 8) return NextResponse.json({ success: false, error: "Password must be at least 8 characters" }, { status: 400 });
      await db.update(users).set({ passwordHash: hashPassword(body.password) }).where(eq(users.id, Number(body.userId)));
      await db.insert(notifications).values({ userId: Number(body.userId), title: "Password changed", message: "Your password was reset by the World Vision desk.", type: "system" });
      await logActivity(actor, "reset_password", "user", Number(body.userId));
      return NextResponse.json({ success: true });
    }

    if (body.action === "create_user") {
      const email = String(body.email || "").trim().toLowerCase();
      if (!/^\S+@\S+\.\S+$/.test(email) || String(body.password || "").length < 8 || String(body.fullName || "").trim().length < 2) {
        return NextResponse.json({ success: false, error: "Name, valid email and 8+ character password are required" }, { status: 400 });
      }
      const [exists] = await db.select().from(users).where(eq(users.email, email)).limit(1);
      if (exists) return NextResponse.json({ success: false, error: "Email already registered" }, { status: 409 });
      const role = ["applicant", "agent", "admin"].includes(body.role) ? body.role : "agent";
      const [u] = await db.insert(users).values({ fullName: body.fullName.trim(), email, phone: body.phone || null, role, passwordHash: hashPassword(body.password) }).returning();
      await logActivity(actor, "created_user", "user", u.id, `${role}: ${email}`);
      return NextResponse.json({ success: true, user: publicUser(u) });
    }

    return NextResponse.json({ success: false, error: "Invalid admin action" }, { status: 400 });
  } catch (error) {
    console.error("POST /api/admin", error);
    return NextResponse.json({ success: false, error: "Admin action failed" }, { status: 500 });
  }
}
