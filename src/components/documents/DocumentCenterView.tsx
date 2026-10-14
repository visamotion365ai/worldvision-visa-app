"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { FileText, Upload, CheckCircle2, AlertTriangle, Clock, Eye, Download, Trash2, RefreshCw, Plus, ShieldCheck, X, FileImage } from "lucide-react";

interface DocItem {
  id: number;
  docType: string;
  title: string;
  fileName: string;
  fileSize: string;
  mimeType?: string | null;
  status: string;
  rejectionReason?: string | null;
  uploadedAt?: string;
}

const CATEGORIES = [
  { id: "passport", name: "Passport" },
  { id: "photo", name: "Photo" },
  { id: "education", name: "Education Certificate" },
  { id: "experience", name: "Experience Letter" },
  { id: "bank_statement", name: "Bank Statement" },
  { id: "medical", name: "Medical Certificate" },
  { id: "police_clearance", name: "Police Clearance" },
  { id: "other", name: "Other Documents" },
];

const badge = (s: string) => {
  const map: Record<string, { c: string; i: any; t: string }> = {
    verified: { c: "bg-emerald-500/20 text-emerald-700", i: CheckCircle2, t: "Verified" },
    under_review: { c: "bg-blue-500/20 text-blue-700", i: Clock, t: "Under Review" },
    uploaded: { c: "bg-amber-500/20 text-amber-700", i: RefreshCw, t: "Uploaded" },
    rejected: { c: "bg-rose-500/20 text-rose-700", i: AlertTriangle, t: "Rejected" },
  };
  const m = map[s] || map.under_review;
  const I = m.i;
  return (
    <span className={`inline-flex items-center gap-1 text-[10.5px] font-bold px-2.5 py-1 rounded-full ${m.c}`}>
      <I className="w-3 h-3" /> {m.t}
    </span>
  );
};

export const DocumentCenterView: React.FC = () => {
  const [docs, setDocs] = useState<DocItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [cat, setCat] = useState("all");
  const [preview, setPreview] = useState<DocItem | null>(null);
  const [uploadFor, setUploadFor] = useState<{ category: string; replaceId?: number } | null>(null);
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const picker = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    const r = await fetch("/api/documents");
    const d = await r.json();
    if (d.success) setDocs(d.documents);
    setLoading(false);
  }, []);
  useEffect(() => {
    load();
  }, [load]);

  const openUpload = (category: string, replaceId?: number, presetTitle?: string) => {
    setUploadFor({ category, replaceId });
    setTitle(presetTitle || CATEGORIES.find((c) => c.id === category)?.name || "");
    setFile(null);
    setError(null);
  };

  const doUpload = async () => {
    if (!uploadFor || !file) return setError("Choose a file first");
    setBusy(true);
    setError(null);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("docType", uploadFor.category);
    fd.append("title", title || file.name);
    if (uploadFor.replaceId) fd.append("replaceId", String(uploadFor.replaceId));
    const r = await fetch("/api/documents", { method: "POST", body: fd });
    const d = await r.json();
    setBusy(false);
    if (!d.success) return setError(d.error || "Upload failed");
    setUploadFor(null);
    load();
  };

  const remove = async (id: number) => {
    if (!confirm("Delete this document?")) return;
    await fetch(`/api/documents?id=${id}`, { method: "DELETE" });
    load();
  };

  const shown = docs.filter((d) => cat === "all" || d.docType === cat);
  const missing = CATEGORIES.filter((c) => c.id !== "other" && !docs.some((d) => d.docType === c.id));
  const isImg = (d: DocItem) => (d.mimeType || "").startsWith("image/");

  return (
    <div className="space-y-4 pb-32 pt-3 px-4 max-w-md mx-auto">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-[11px] font-extrabold uppercase tracking-wider text-blue-600">Secure vault</p>
          <h2 className="text-[26px] font-extrabold text-slate-900 tracking-tight leading-tight">My Documents</h2>
        </div>
        <button onClick={() => openUpload("passport")} className="px-4 py-2.5 rounded-full lg-btn font-bold text-[12.5px] flex items-center gap-1.5 ios-press">
          <Plus className="w-4 h-4" /> Upload
        </button>
      </div>

      <div className="lg rounded-[22px] p-3.5 flex items-center gap-3 text-[12px] text-slate-700">
        <ShieldCheck className="w-5 h-5 text-blue-600 flex-shrink-0" />
        <span>Only you and the World Vision visa desk can open these files. They're private to your account.</span>
      </div>

      <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4">
        {[{ id: "all", name: `All (${docs.length})` }, ...CATEGORIES].map((c) => (
          <button key={c.id} onClick={() => setCat(c.id)} className={`px-3.5 py-2 rounded-full text-[12px] font-bold whitespace-nowrap ios-press ${cat === c.id ? "lg-btn" : "lg text-slate-600"}`}>
            {c.name}
          </button>
        ))}
      </div>

      {cat === "all" && missing.length > 0 && !loading && (
        <section className="space-y-2">
          <p className="text-[13px] font-extrabold text-slate-900 px-1">Required</p>
          {missing.map((m) => (
            <div key={m.id} className="lg rounded-[22px] p-3.5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-500/15 text-purple-700 flex items-center justify-center"><FileText className="w-5 h-5" /></div>
              <div className="flex-1">
                <p className="text-[13px] font-bold text-slate-900">{m.name}</p>
                <p className="text-[11px] text-purple-700 font-semibold">Required • not uploaded</p>
              </div>
              <button onClick={() => openUpload(m.id)} className="px-3.5 py-2 rounded-full lg text-[12px] font-bold text-blue-600 ios-press">Upload</button>
            </div>
          ))}
        </section>
      )}

      <section className="space-y-3">
        {loading && [0, 1].map((i) => <div key={i} className="skeleton h-24" />)}
        {!loading && shown.length === 0 && (
          <div className="lg rounded-[26px] p-8 text-center space-y-2">
            <FileText className="w-9 h-9 text-slate-400 mx-auto" />
            <p className="font-bold text-[14px] text-slate-800">No documents here yet</p>
            <p className="text-[12px] text-slate-500">Tap Upload to add a PDF or photo.</p>
          </div>
        )}
        {shown.map((d) => (
          <div key={d.id} className="lg rounded-[26px] p-4 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-11 h-11 rounded-2xl bg-blue-500/15 text-blue-600 flex items-center justify-center flex-shrink-0">
                  {isImg(d) ? <FileImage className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                </div>
                <div className="min-w-0">
                  <p className="text-[13.5px] font-bold text-slate-900 truncate">{d.title}</p>
                  <p className="text-[11px] text-slate-500 truncate">{d.fileName} • {d.fileSize}</p>
                </div>
              </div>
              {badge(d.status)}
            </div>
            {d.rejectionReason && <div className="rounded-2xl bg-rose-500/12 text-rose-700 text-[12px] font-medium px-3 py-2">Reason: {d.rejectionReason}</div>}
            <div className="flex items-center justify-between pt-1 text-[12px] font-bold">
              <button onClick={() => setPreview(d)} className="flex items-center gap-1.5 text-blue-600"><Eye className="w-4 h-4" /> Preview</button>
              <a href={`/api/documents/file/${d.id}?download=1`} className="flex items-center gap-1.5 text-slate-600"><Download className="w-4 h-4" /> Download</a>
              <button onClick={() => openUpload(d.docType, d.id, d.title)} className="flex items-center gap-1.5 text-slate-600"><RefreshCw className="w-4 h-4" /> Replace</button>
              <button onClick={() => remove(d.id)} className="text-rose-500" aria-label="Delete"><Trash2 className="w-4 h-4" /></button>
            </div>
          </div>
        ))}
      </section>

      {preview && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center" onClick={() => setPreview(null)}>
          <div onClick={(e) => e.stopPropagation()} className="lg-strong w-full max-w-md rounded-t-[34px] sm:rounded-[34px] p-5 space-y-3 max-h-[92dvh] flex flex-col">
            <div className="flex items-center justify-between">
              <div className="min-w-0"><p className="text-[16px] font-extrabold text-slate-900 truncate">{preview.title}</p><p className="text-[11.5px] text-slate-500 truncate">{preview.fileName}</p></div>
              <button onClick={() => setPreview(null)} className="w-9 h-9 rounded-full lg flex items-center justify-center" aria-label="Close"><X className="w-4 h-4" /></button>
            </div>
            <div className="flex-1 min-h-[50vh] rounded-2xl overflow-hidden bg-white/60">
              {isImg(preview) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={`/api/documents/file/${preview.id}`} alt={preview.title} className="w-full h-full object-contain" />
              ) : (
                <iframe src={`/api/documents/file/${preview.id}`} title={preview.title} className="w-full h-[60vh]" />
              )}
            </div>
            <div className="flex items-center justify-between">{badge(preview.status)}<a href={`/api/documents/file/${preview.id}?download=1`} className="px-4 py-2.5 rounded-full lg-btn text-[12.5px] font-bold">Download</a></div>
          </div>
        </div>
      )}

      {uploadFor && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center" onClick={() => setUploadFor(null)}>
          <div onClick={(e) => e.stopPropagation()} className="lg-strong w-full max-w-md rounded-t-[34px] sm:rounded-[34px] p-5 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-[18px] font-extrabold text-slate-900">{uploadFor.replaceId ? "Replace document" : "Upload document"}</p>
              <button onClick={() => setUploadFor(null)} className="w-9 h-9 rounded-full lg flex items-center justify-center" aria-label="Close"><X className="w-4 h-4" /></button>
            </div>
            <select value={uploadFor.category} disabled={!!uploadFor.replaceId} onChange={(e) => setUploadFor({ ...uploadFor, category: e.target.value })} className="lg-input w-full px-4 py-3.5 rounded-2xl text-slate-900">
              {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Document title" className="lg-input w-full px-4 py-3.5 rounded-2xl text-slate-900" />
            <button onClick={() => picker.current?.click()} className="w-full rounded-[22px] bg-blue-500/10 p-6 text-center ios-press">
              <Upload className="w-6 h-6 text-blue-600 mx-auto" />
              <p className="text-[13px] font-bold text-slate-800 mt-1.5">{file ? file.name : "Tap to choose a file"}</p>
              <p className="text-[11px] text-slate-500">PDF, JPG, PNG or WebP • up to 6 MB</p>
            </button>
            <input ref={picker} type="file" accept="application/pdf,image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
            {error && <div className="rounded-2xl bg-rose-500/15 text-rose-800 text-[12.5px] font-semibold px-4 py-2.5">{error}</div>}
            <button onClick={doUpload} disabled={busy} className="w-full py-4 rounded-full lg-btn font-bold disabled:opacity-60 ios-press">{busy ? "Uploading…" : "Upload securely"}</button>
          </div>
        </div>
      )}
    </div>
  );
};
