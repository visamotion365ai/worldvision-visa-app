import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { documents, notifications } from "@/db/schema";
import { ensureDbInitialized } from "@/db/init";
import { and, desc, eq } from "drizzle-orm";
import { getSessionUser, isStaff, logActivity, unauthorized, forbidden } from "@/lib/auth";

export const dynamic = "force-dynamic";

const MAX_BYTES = 6 * 1024 * 1024;
const ALLOWED = ["application/pdf", "image/jpeg", "image/png", "image/webp", "image/heic"];

const cols = {
  id: documents.id,
  userId: documents.userId,
  applicationId: documents.applicationId,
  docType: documents.docType,
  title: documents.title,
  fileName: documents.fileName,
  fileSize: documents.fileSize,
  fileUrl: documents.fileUrl,
  mimeType: documents.mimeType,
  status: documents.status,
  rejectionReason: documents.rejectionReason,
  uploadedAt: documents.uploadedAt,
  verifiedAt: documents.verifiedAt,
};

export async function GET(req: NextRequest) {
  try {
    await ensureDbInitialized();
    const me = await getSessionUser();
    if (!me) return unauthorized();
    const url = new URL(req.url);
    const category = url.searchParams.get("category");
    const applicationId = url.searchParams.get("applicationId");
    const userId = url.searchParams.get("userId");

    let docs = await db.select(cols).from(documents).orderBy(desc(documents.uploadedAt));
    docs = docs.filter((d) => (isStaff(me) ? true : d.userId === me.id));
    if (isStaff(me) && userId) docs = docs.filter((d) => d.userId === Number(userId));
    if (applicationId) docs = docs.filter((d) => d.applicationId === Number(applicationId));
    if (category && category !== "all") docs = docs.filter((d) => d.docType === category);
    return NextResponse.json({ success: true, documents: docs });
  } catch (error) {
    console.error("GET /api/documents", error);
    return NextResponse.json({ success: false, error: "Failed to fetch documents" }, { status: 500 });
  }
}

// multipart/form-data: file, docType, title, applicationId?, replaceId?
export async function POST(req: NextRequest) {
  try {
    await ensureDbInitialized();
    const me = await getSessionUser();
    if (!me) return unauthorized();

    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json({ success: false, error: "Choose a file to upload" }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ success: false, error: "File is too large (max 6 MB)" }, { status: 413 });
    }
    if (!ALLOWED.includes(file.type)) {
      return NextResponse.json({ success: false, error: "Only PDF, JPG, PNG or WebP files are accepted" }, { status: 415 });
    }

    const buf = Buffer.from(await file.arrayBuffer());
    const docType = String(form.get("docType") || "other");
    const title = String(form.get("title") || file.name);
    const applicationId = form.get("applicationId") ? Number(form.get("applicationId")) : null;
    const replaceId = form.get("replaceId") ? Number(form.get("replaceId")) : null;
    const ownerId = isStaff(me) && form.get("userId") ? Number(form.get("userId")) : me.id;
    const size = buf.length > 1024 * 1024 ? `${(buf.length / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(buf.length / 1024))} KB`;

    const values = {
      userId: ownerId,
      applicationId,
      docType,
      title,
      fileName: file.name,
      fileSize: size,
      fileData: buf.toString("base64"),
      mimeType: file.type,
      status: "under_review",
      rejectionReason: null,
      verifiedAt: null,
    };

    let saved;
    if (replaceId) {
      const [existing] = await db.select({ userId: documents.userId }).from(documents).where(eq(documents.id, replaceId)).limit(1);
      if (!existing || (!isStaff(me) && existing.userId !== me.id)) return forbidden();
      [saved] = await db.update(documents).set({ ...values, uploadedAt: new Date() }).where(eq(documents.id, replaceId)).returning(cols);
    } else {
      [saved] = await db.insert(documents).values(values).returning(cols);
    }
    await db.update(documents).set({ fileUrl: `/api/documents/file/${saved.id}` }).where(eq(documents.id, saved.id));
    saved.fileUrl = `/api/documents/file/${saved.id}`;

    await logActivity({ id: me.id, name: me.fullName, role: me.role || "applicant" }, replaceId ? "replaced_document" : "uploaded_document", "document", saved.id, title);
    return NextResponse.json({ success: true, document: saved });
  } catch (error) {
    console.error("POST /api/documents", error);
    return NextResponse.json({ success: false, error: "Upload failed" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await ensureDbInitialized();
    const me = await getSessionUser();
    if (!me) return unauthorized();
    if (!isStaff(me)) return forbidden("Only the visa desk can verify documents");
    const { id, status, rejectionReason } = await req.json();
    if (!id || !["verified", "rejected", "under_review"].includes(status)) {
      return NextResponse.json({ success: false, error: "Invalid request" }, { status: 400 });
    }
    const [updated] = await db
      .update(documents)
      .set({ status, rejectionReason: status === "rejected" ? rejectionReason || "Please upload a clearer copy" : null, verifiedAt: status === "verified" ? new Date() : null })
      .where(eq(documents.id, id))
      .returning(cols);
    if (updated) {
      await db.insert(notifications).values({
        userId: updated.userId,
        title: status === "verified" ? "Document verified" : status === "rejected" ? "Document needs attention" : "Document under review",
        message: status === "rejected" ? `${updated.title}: ${updated.rejectionReason}` : `${updated.title} is now ${status.replace("_", " ")}.`,
        type: "document",
      });
      await logActivity({ id: me.id, name: me.fullName, role: me.role || "agent" }, `document_${status}`, "document", updated.id, updated.title);
    }
    return NextResponse.json({ success: true, document: updated });
  } catch (error) {
    console.error("PATCH /api/documents", error);
    return NextResponse.json({ success: false, error: "Failed to update document" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await ensureDbInitialized();
    const me = await getSessionUser();
    if (!me) return unauthorized();
    const id = Number(new URL(req.url).searchParams.get("id"));
    if (!id) return NextResponse.json({ success: false, error: "Missing document ID" }, { status: 400 });
    const where = isStaff(me) ? eq(documents.id, id) : and(eq(documents.id, id), eq(documents.userId, me.id));
    await db.delete(documents).where(where);
    await logActivity({ id: me.id, name: me.fullName, role: me.role || "applicant" }, "deleted_document", "document", id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/documents", error);
    return NextResponse.json({ success: false, error: "Failed to delete document" }, { status: 500 });
  }
}
