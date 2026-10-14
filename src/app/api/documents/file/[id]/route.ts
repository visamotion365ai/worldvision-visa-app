import { NextRequest } from "next/server";
import { db } from "@/db";
import { documents } from "@/db/schema";
import { ensureDbInitialized } from "@/db/init";
import { eq } from "drizzle-orm";
import { getSessionUser, isStaff } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  await ensureDbInitialized();
  const me = await getSessionUser();
  if (!me) return new Response("Unauthorized", { status: 401 });
  const { id } = await ctx.params;
  const [doc] = await db.select().from(documents).where(eq(documents.id, Number(id))).limit(1);
  if (!doc || !doc.fileData) return new Response("Not found", { status: 404 });
  if (!isStaff(me) && doc.userId !== me.id) return new Response("Forbidden", { status: 403 });

  const download = new URL(req.url).searchParams.get("download") === "1";
  const bytes = Buffer.from(doc.fileData, "base64");
  return new Response(bytes, {
    headers: {
      "Content-Type": doc.mimeType || "application/octet-stream",
      "Content-Length": String(bytes.length),
      "Content-Disposition": `${download ? "attachment" : "inline"}; filename="${encodeURIComponent(doc.fileName)}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
