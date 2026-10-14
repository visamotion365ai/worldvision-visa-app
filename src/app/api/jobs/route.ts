import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { jobs, jobApplications, notifications } from "@/db/schema";
import { ensureDbInitialized } from "@/db/init";
import { desc } from "drizzle-orm";
import { getSessionUser, logActivity, unauthorized } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    await ensureDbInitialized();
    const url = new URL(req.url);
    const country = url.searchParams.get("country");
    const category = url.searchParams.get("category");
    const search = (url.searchParams.get("search") || "").toLowerCase().trim();

    let all = await db.select().from(jobs).orderBy(desc(jobs.createdAt));
    if (country && country !== "all") all = all.filter((j) => j.country.toLowerCase() === country.toLowerCase());
    if (category && category !== "all") all = all.filter((j) => j.category.toLowerCase() === category.toLowerCase());
    if (search) all = all.filter((j) => [j.title, j.company, j.country, j.description].some((v) => v.toLowerCase().includes(search)));
    return NextResponse.json({ success: true, jobs: all });
  } catch (error) {
    console.error("GET /api/jobs", error);
    return NextResponse.json({ success: false, error: "Failed to fetch jobs" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await ensureDbInitialized();
    const me = await getSessionUser();
    if (!me) return unauthorized("Sign in to apply for jobs");
    const b = await req.json();
    if (!b.jobId || !String(b.fullName || "").trim() || !String(b.email || "").trim() || !String(b.phone || "").trim()) {
      return NextResponse.json({ success: false, error: "Name, email and phone are required" }, { status: 400 });
    }
    const [created] = await db
      .insert(jobApplications)
      .values({
        userId: me.id,
        jobId: Number(b.jobId),
        fullName: b.fullName,
        email: b.email,
        phone: b.phone,
        resumeName: b.resumeName || null,
        experienceYears: b.experienceYears || null,
        coverNote: b.coverNote || null,
        status: "submitted",
      })
      .returning();
    await db.insert(notifications).values({ userId: me.id, title: "Job application sent", message: "Our recruitment team will contact you within 48 hours.", type: "job" });
    await logActivity({ id: me.id, name: me.fullName, role: me.role || "applicant" }, "applied_for_job", "job", Number(b.jobId));
    return NextResponse.json({ success: true, application: created });
  } catch (error) {
    console.error("POST /api/jobs", error);
    return NextResponse.json({ success: false, error: "Failed to apply for job" }, { status: 500 });
  }
}
