import { db } from "@/db";
import { sql } from "drizzle-orm";
import { ensureDbInitialized } from "@/db/init";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await db.execute(sql`select 1`);
    await ensureDbInitialized();
    return Response.json({ ok: true, status: "healthy", service: "World Vision Consultancy" });
  } catch (error) {
    console.error("Health check error:", error);
    return Response.json({ ok: false, error: String(error) }, { status: 500 });
  }
}
