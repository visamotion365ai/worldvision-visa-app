import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { applications, users, notifications } from "@/db/schema";
import { ensureDbInitialized } from "@/db/init";
import { desc, eq } from "drizzle-orm";
import { forbidden, getSessionUser, isStaff, logActivity, unauthorized } from "@/lib/auth";
import { autoReviewApplication } from "@/lib/agent";

export const dynamic = "force-dynamic";

const STATUS_PROGRESS: Record<string, number> = {
  under_review: 20,
  documents_verified: 40,
  processing: 60,
  embassy_review: 80,
  approved: 90,
  completed: 100,
  rejected: 100,
};

export async function GET(req: NextRequest) {
  try {
    await ensureDbInitialized();
    const me = await getSessionUser();
    if (!me) return unauthorized();

    const url = new URL(req.url);
    const status = url.searchParams.get("status");

    const rows = await db
      .select({ app: applications, clientName: users.fullName, clientEmail: users.email, clientPhone: users.phone })
      .from(applications)
      .leftJoin(users, eq(applications.userId, users.id))
      .orderBy(desc(applications.submissionDate));

    let list = rows
      .filter((r) => isStaff(me) || r.app.userId === me.id)
      .map((r) => ({ ...r.app, clientName: r.clientName, clientEmail: r.clientEmail, clientPhone: r.clientPhone }));

    if (status && status !== "all") {
      list = list.filter((a) => {
        if (status === "in_progress") return ["under_review", "documents_verified", "processing"].includes(a.status);
        if (status === "submitted") return a.status === "under_review";
        if (status === "approved") return ["embassy_review", "approved"].includes(a.status);
        if (status === "completed") return a.status === "completed";
        return a.status === status;
      });
    }
    return NextResponse.json({ success: true, applications: list });
  } catch (error) {
    console.error("GET /api/applications", error);
    return NextResponse.json({ success: false, error: "Failed to fetch applications" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await ensureDbInitialized();
    const me = await getSessionUser();
    if (!me) return unauthorized();
    const body = await req.json();

    const countries = ["Australia", "Singapore", "Serbia", "Turkey", "Malaysia", "Russia"];
    if (!countries.includes(body.country)) {
      return NextResponse.json({ success: false, error: "Unsupported destination country" }, { status: 400 });
    }
    if (!body.visaType) {
      return NextResponse.json({ success: false, error: "Select a visa type" }, { status: 400 });
    }

    // Staff may lodge on behalf of a client.
    const ownerId = isStaff(me) && body.userId ? Number(body.userId) : me.id;
    const code = { Australia: "AU", Singapore: "SG", Serbia: "RS", Turkey: "TR", Malaysia: "MY", Russia: "RU" }[
      body.country as string
    ];
    const appNumber = `WV-${code}-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const [created] = await db
      .insert(applications)
      .values({
        applicationNumber: appNumber,
        userId: ownerId,
        country: body.country,
        visaType: body.visaType,
        status: "under_review",
        progressPct: STATUS_PROGRESS.under_review,
        feeAmount: Number(body.feeAmount) || 0,
        paymentStatus: body.paymentStatus || "pending",
        currentStep: 10,
        details: {
          personal: body.personal || {},
          passport: body.passport || {},
          employment: body.employment || {},
          travel: body.travel || {},
          payment: body.payment || {},
        },
        nextAction: "Our team is checking your documents against the embassy checklist",
      })
      .returning();

    await db.insert(notifications).values({
      userId: ownerId,
      title: "Application received",
      message: `${created.country} ${created.visaType} (${created.applicationNumber}) was submitted. We will review your documents shortly.`,
      type: "application",
    });
    await logActivity({ id: me.id, name: me.fullName, role: me.role || "applicant" }, "submitted_application", "application", created.id, `${created.country} ${created.visaType}`);

    // The AI operations admin reviews new applications in the background (only if an AI key is configured).
    autoReviewApplication(created.id).catch(() => {});

    return NextResponse.json({ success: true, application: created });
  } catch (error) {
    console.error("POST /api/applications", error);
    return NextResponse.json({ success: false, error: "Failed to create application" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await ensureDbInitialized();
    const me = await getSessionUser();
    if (!me) return unauthorized();
    if (!isStaff(me)) return forbidden("Only the visa desk can change application status");

    const { id, status, progressPct, nextAction } = await req.json();
    if (!id) return NextResponse.json({ success: false, error: "Missing application ID" }, { status: 400 });

    const [updated] = await db
      .update(applications)
      .set({
        ...(status ? { status, progressPct: progressPct ?? STATUS_PROGRESS[status] ?? 50 } : {}),
        ...(progressPct !== undefined && !status ? { progressPct } : {}),
        ...(nextAction ? { nextAction } : {}),
        updatedAt: new Date(),
      })
      .where(eq(applications.id, id))
      .returning();

    if (updated && status) {
      await db.insert(notifications).values({
        userId: updated.userId,
        title: "Application update",
        message: `${updated.country} ${updated.visaType} is now: ${String(status).replace(/_/g, " ")}.`,
        type: "application",
      });
      await logActivity({ id: me.id, name: me.fullName, role: me.role || "agent" }, "updated_status", "application", updated.id, String(status));
    }
    return NextResponse.json({ success: true, application: updated });
  } catch (error) {
    console.error("PATCH /api/applications", error);
    return NextResponse.json({ success: false, error: "Failed to update application" }, { status: 500 });
  }
}
