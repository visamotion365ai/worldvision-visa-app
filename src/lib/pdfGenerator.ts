import { jsPDF } from "jspdf";
import { PRIMARY_COUNTRIES } from "@/lib/countryData";

export interface PdfApplication {
  applicationNumber: string;
  country: string;
  visaType: string;
  status: string;
  progressPct?: number;
  submissionDate?: string | Date;
  feeAmount?: number | null;
  paymentStatus?: string | null;
  nextAction?: string | null;
  details?: Record<string, any> | null;
}
export interface PdfClient {
  fullName: string;
  email?: string | null;
  phone?: string | null;
  country?: string | null;
}
export interface PdfDocument {
  docType: string;
  title: string;
  fileName?: string;
  status: string;
  applicationId?: number | null;
}

const BLUE: [number, number, number] = [27, 77, 196];
const INK: [number, number, number] = [15, 23, 42];
const GREY: [number, number, number] = [100, 116, 139];

const KEYWORDS: Record<string, string[]> = {
  passport: ["passport"],
  photo: ["photo"],
  education: ["education", "degree", "diploma", "certificate", "academic", "trade"],
  experience: ["experience", "employment", "resume", "cv", "sponsorship", "offer"],
  bank_statement: ["bank", "financial"],
  police_clearance: ["police"],
  medical: ["medical", "hiv", "health"],
};

function matchDoc(requiredTitle: string, docs: PdfDocument[]) {
  const t = requiredTitle.toLowerCase();
  for (const [type, words] of Object.entries(KEYWORDS)) {
    if (words.some((w) => t.includes(w))) {
      const hit = docs.find((d) => d.docType === type);
      if (hit) return hit;
    }
  }
  return undefined;
}

const fmtDate = (d?: string | Date) => (d ? new Date(d).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10));
const label = (s: string) => s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

function header(doc: jsPDF, title: string, subtitle: string) {
  const w = doc.internal.pageSize.getWidth();
  doc.setFillColor(...BLUE);
  doc.rect(0, 0, w, 30, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("WORLD VISION CONSULTANCY", 14, 13);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("Global Worker Recruiter & Visa Agency", 14, 19);
  doc.text(title, 14, 25);
  doc.setFontSize(8);
  doc.text(subtitle, w - 14, 25, { align: "right" });
}

function section(doc: jsPDF, y: number, text: string) {
  const w = doc.internal.pageSize.getWidth();
  doc.setTextColor(...INK);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text(text, 14, y);
  doc.setDrawColor(226, 232, 240);
  doc.line(14, y + 2.5, w - 14, y + 2.5);
  return y + 9;
}

function ensure(doc: jsPDF, y: number, need = 20) {
  if (y + need > 280) {
    doc.addPage();
    return 18;
  }
  return y;
}

function kv(doc: jsPDF, y: number, pairs: [string, string][]) {
  doc.setFontSize(9);
  for (let i = 0; i < pairs.length; i += 2) {
    y = ensure(doc, y, 8);
    [pairs[i], pairs[i + 1]].forEach((p, col) => {
      if (!p) return;
      const x = col === 0 ? 14 : 108;
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...GREY);
      doc.text(p[0], x, y);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...INK);
      doc.text(doc.splitTextToSize(p[1] || "—", 56)[0] as string, x + 38, y);
    });
    y += 6.5;
  }
  return y;
}

function statusColor(s: string): [number, number, number] {
  if (s === "verified") return [22, 163, 74];
  if (s === "rejected" || s === "missing") return [220, 38, 38];
  return [217, 119, 6];
}

function footer(doc: jsPDF) {
  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setFontSize(7.5);
    doc.setTextColor(...GREY);
    doc.setFont("helvetica", "normal");
    doc.text(`World Vision Consultancy • Generated ${new Date().toUTCString()} • Page ${i}/${pages}`, 14, 289);
    doc.text("Information is based on records held in the World Vision system at the time of generation. Not a visa decision.", 14, 293);
  }
}

function checklist(doc: jsPDF, y: number, country: string, docs: PdfDocument[]) {
  const info = PRIMARY_COUNTRIES.find((c) => c.name === country);
  if (!info) return y;
  y = section(doc, y, `${country.toUpperCase()} DOCUMENT CHECKLIST`);
  doc.setFontSize(9);
  info.requiredDocuments.forEach((req) => {
    y = ensure(doc, y, 12);
    const hit = matchDoc(req.title, docs);
    const st = hit ? hit.status : "missing";
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...INK);
    doc.text(`${req.title}${req.required ? "" : " (optional)"}`, 14, y);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...statusColor(st));
    doc.text(label(st).toUpperCase(), 196, y, { align: "right" });
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...GREY);
    doc.setFontSize(8);
    doc.text(doc.splitTextToSize(req.desc, 150)[0] as string, 14, y + 4.5);
    doc.setFontSize(9);
    y += 10.5;
  });
  return y + 2;
}

export function generateApplicationDossierPdf(app: PdfApplication, client: PdfClient, docs: PdfDocument[]) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const w = doc.internal.pageSize.getWidth();
  header(doc, "Application Dossier", app.applicationNumber);

  let y = 40;
  doc.setFillColor(243, 245, 249);
  doc.roundedRect(14, y - 6, w - 28, 18, 3, 3, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(...INK);
  doc.text(`${app.country} • ${app.visaType}`, 18, y + 2);
  doc.setFontSize(9);
  doc.setTextColor(...GREY);
  doc.text(`Status: ${label(app.status)}   Progress: ${app.progressPct ?? 0}%`, 18, y + 8);
  y += 22;

  const p = app.details?.personal || {};
  const pp = app.details?.passport || {};
  const emp = app.details?.employment || {};
  const tr = app.details?.travel || {};

  y = section(doc, y, "1. APPLICANT");
  y = kv(doc, y, [
    ["Full name", p.fullName || client.fullName],
    ["Passport no.", pp.passportNumber || "—"],
    ["Email", p.email || client.email || "—"],
    ["Phone", p.phone || client.phone || "—"],
    ["Date of birth", p.dob || "—"],
    ["Nationality", p.nationality || "—"],
    ["Passport issued", pp.issueDate || "—"],
    ["Passport expiry", pp.expiryDate || "—"],
  ]);

  y = section(doc, y + 3, "2. EMPLOYMENT & TRAVEL");
  y = kv(doc, y, [
    ["Occupation", emp.occupation || "—"],
    ["Employer", emp.employer || "—"],
    ["Experience", emp.experienceYears || "—"],
    ["Annual income", emp.annualIncome || "—"],
    ["Travel date", tr.intendedDate || "—"],
    ["Duration", tr.duration || "—"],
    ["Purpose", tr.purpose || "—"],
    ["Emergency contact", tr.emergencyContact || "—"],
  ]);

  y = section(doc, y + 3, "3. FILE");
  y = kv(doc, y, [
    ["Lodged", fmtDate(app.submissionDate)],
    ["Fee", `$${app.feeAmount ?? 0} USD (${app.paymentStatus || "pending"})`],
    ["Next step", app.nextAction || "—"],
    ["Client email", client.email || "—"],
  ]);

  y = ensure(doc, y + 3, 40);
  y = checklist(doc, y + 3, app.country, docs);

  const info = PRIMARY_COUNTRIES.find((c) => c.name === app.country);
  if (info) {
    y = ensure(doc, y, 40);
    y = section(doc, y, `${app.country.toUpperCase()} PROCESSING ROADMAP`);
    doc.setFontSize(9);
    info.processingStages.forEach((s, i) => {
      y = ensure(doc, y, 10);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...INK);
      doc.text(`${i + 1}. ${s.title}`, 14, y);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...GREY);
      doc.text(s.days, 196, y, { align: "right" });
      doc.setFontSize(8);
      doc.text(doc.splitTextToSize(s.desc, 170)[0] as string, 18, y + 4.5);
      doc.setFontSize(9);
      y += 10;
    });
  }

  footer(doc);
  doc.save(`${app.applicationNumber}_${app.country}_Dossier.pdf`);
}

export function generateClientProfilePdf(client: PdfClient & { createdAt?: string | Date }, apps: PdfApplication[], docs: PdfDocument[]) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  header(doc, "Client Profile", fmtDate(new Date()));
  let y = 40;

  y = section(doc, y, "1. CLIENT");
  y = kv(doc, y, [
    ["Full name", client.fullName],
    ["Email", client.email || "—"],
    ["Phone", client.phone || "—"],
    ["Home country", client.country || "—"],
    ["Client since", fmtDate(client.createdAt)],
    ["Applications", String(apps.length)],
  ]);

  y = section(doc, y + 4, "2. APPLICATIONS");
  if (!apps.length) {
    doc.setFontSize(9);
    doc.setTextColor(...GREY);
    doc.text("No applications yet.", 14, y);
    y += 8;
  }
  apps.forEach((a) => {
    y = ensure(doc, y, 14);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(...INK);
    doc.text(`${a.applicationNumber} — ${a.country} ${a.visaType}`, 14, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...GREY);
    doc.setFontSize(8.5);
    doc.text(`${label(a.status)} • ${a.progressPct ?? 0}% • lodged ${fmtDate(a.submissionDate)}`, 14, y + 4.5);
    y += 11;
  });

  y = ensure(doc, y + 2, 30);
  y = section(doc, y + 2, "3. DOCUMENTS ON FILE");
  if (!docs.length) {
    doc.setFontSize(9);
    doc.setTextColor(...GREY);
    doc.text("No documents uploaded.", 14, y);
    y += 8;
  }
  docs.forEach((d) => {
    y = ensure(doc, y, 8);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...INK);
    doc.text(doc.splitTextToSize(d.title, 120)[0] as string, 14, y);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...statusColor(d.status));
    doc.text(label(d.status).toUpperCase(), 196, y, { align: "right" });
    y += 6;
  });

  // Country-wise gap analysis for each destination the client applied to.
  const countries = Array.from(new Set(apps.map((a) => a.country)));
  countries.forEach((c) => {
    y = ensure(doc, y + 4, 50);
    y = checklist(doc, y + 4, c, docs);
  });

  footer(doc);
  doc.save(`${client.fullName.replace(/\s+/g, "_")}_Client_Profile.pdf`);
}
