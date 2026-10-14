"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, CheckCircle2, ArrowRight, X, Upload, Lock, Briefcase, Plane, Building2, FileCheck2, ShieldAlert, TrendingUp, FileText, Download, Save } from "lucide-react";
import confetti from "canvas-confetti";
import { PRIMARY_COUNTRIES } from "@/lib/countryData";

interface Props {
  initialCountry?: string;
  initialVisaType?: string;
  user?: { id: number; fullName: string; email: string; phone?: string | null };
  onClose: () => void;
  onApplicationCreated: (app: any) => void;
  onViewApplications?: () => void;
}

const STEPS = ["Country", "Visa Type", "Personal", "Passport", "Employment", "Travel", "Documents", "Review", "Payment", "Submit"];

const VISA_TYPES = [
  { name: "Work Visa", desc: "Skilled employment & residency pathways", icon: Briefcase, fee: 1450 },
  { name: "Visitor Visa", desc: "Tourism, family visits, short stays", icon: Plane, fee: 350 },
  { name: "Business Visa", desc: "Trade, meetings, investment visits", icon: TrendingUp, fee: 850 },
  { name: "Business Registration", desc: "Company formation & investor status", icon: Building2, fee: 1650 },
  { name: "eVisa", desc: "Fast electronic authorisation", icon: FileCheck2, fee: 180 },
  { name: "Sticker Visa", desc: "Embassy passport sticker", icon: ShieldAlert, fee: 490 },
];

const docTypeFor = (title: string) => {
  const t = title.toLowerCase();
  if (t.includes("passport") && !t.includes("photo")) return "passport";
  if (t.includes("photo")) return "photo";
  if (t.includes("police")) return "police_clearance";
  if (t.includes("bank") || t.includes("financial")) return "bank_statement";
  if (t.includes("medical") || t.includes("hiv")) return "medical";
  if (t.includes("experience") || t.includes("employment") || t.includes("resume") || t.includes("sponsorship") || t.includes("offer")) return "experience";
  if (t.includes("education") || t.includes("degree") || t.includes("certificate") || t.includes("diploma") || t.includes("academic")) return "education";
  return "other";
};

const Field: React.FC<{ label: string; error?: string; children: React.ReactNode }> = ({ label, error, children }) => (
  <div>
    <label className="text-[12px] font-bold text-slate-700 block mb-1.5 px-1">{label}</label>
    {children}
    {error && <p className="text-[11.5px] font-semibold text-rose-600 mt-1 px-1">{error}</p>}
  </div>
);
const inputCls = "lg-input w-full px-4 py-3.5 rounded-2xl text-slate-900 placeholder:text-slate-400";

export const VisaApplicationWizard: React.FC<Props> = ({ initialCountry = "Australia", initialVisaType = "Work Visa", user, onClose, onApplicationCreated, onViewApplications }) => {
  const draftKey = `wv_visa_draft_${user?.id ?? "guest"}`;
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [created, setCreated] = useState<any>(null);
  const [files, setFiles] = useState<Record<string, File>>({});
  const [resumed, setResumed] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [savedNote, setSavedNote] = useState<string | null>(null);

  const [form, setForm] = useState({
    country: initialCountry,
    visaType: initialVisaType,
    personal: { fullName: user?.fullName || "", email: user?.email || "", phone: user?.phone || "", dob: "", gender: "Male", nationality: "", currentAddress: "" },
    passport: { passportNumber: "", issueDate: "", expiryDate: "", issuingCountry: "", placeOfBirth: "" },
    employment: { occupation: "", employer: "", annualIncome: "", experienceYears: "", fieldOfWork: "" },
    travel: { intendedDate: "", duration: "", purpose: "", emergencyContact: "" },
    payment: { method: "bank_transfer" },
  });

  // Resume an unfinished application
  useEffect(() => {
    try {
      const raw = localStorage.getItem(draftKey);
      if (raw) {
        const d = JSON.parse(raw);
        if (d?.form) {
          setForm((p) => ({ ...p, ...d.form, country: initialCountry || d.form.country, visaType: initialVisaType || d.form.visaType }));
          setStep(Math.min(Math.max(d.step || 1, 1), 9));
          setResumed(true);
        }
      }
    } catch {}
  }, [draftKey, initialCountry, initialVisaType]);

  const persist = (s = step) => {
    try {
      localStorage.setItem(draftKey, JSON.stringify({ form, step: s }));
    } catch {}
  };

  const country = PRIMARY_COUNTRIES.find((c) => c.name === form.country) || PRIMARY_COUNTRIES[0];
  const fee = VISA_TYPES.find((v) => v.name === form.visaType)?.fee ?? 0;
  const set = (section: "personal" | "passport" | "employment" | "travel" | "payment", key: string, value: string) =>
    setForm((f) => ({ ...f, [section]: { ...(f as any)[section], [key]: value } }));

  const validate = (s: number) => {
    const e: Record<string, string> = {};
    const p = form.personal, pp = form.passport, em = form.employment, tr = form.travel;
    if (s === 3) {
      if (p.fullName.trim().length < 2) e.fullName = "Enter your full legal name";
      if (!/^\S+@\S+\.\S+$/.test(p.email)) e.email = "Enter a valid email";
      if (p.phone.replace(/\D/g, "").length < 7) e.phone = "Enter a valid phone number";
      if (!p.dob) e.dob = "Date of birth is required";
      else if (new Date(p.dob) > new Date(Date.now() - 16 * 365 * 864e5)) e.dob = "Applicant must be at least 16";
      if (!p.nationality.trim()) e.nationality = "Nationality is required";
      if (p.currentAddress.trim().length < 6) e.currentAddress = "Enter your current address";
    }
    if (s === 4) {
      if (!/^[A-Za-z0-9]{6,12}$/.test(pp.passportNumber.trim())) e.passportNumber = "Passport number should be 6–12 letters/digits";
      if (!pp.issueDate) e.issueDate = "Required";
      if (!pp.expiryDate) e.expiryDate = "Required";
      else if (pp.issueDate && pp.expiryDate <= pp.issueDate) e.expiryDate = "Expiry must be after issue date";
      else if (new Date(pp.expiryDate) < new Date(Date.now() + 180 * 864e5)) e.expiryDate = "Passport must be valid for at least 6 more months";
      if (!pp.issuingCountry.trim()) e.issuingCountry = "Required";
    }
    if (s === 5) {
      if (!em.occupation.trim()) e.occupation = "Occupation is required";
      if (!em.experienceYears.trim()) e.experienceYears = "Tell us your years of experience";
    }
    if (s === 6) {
      if (!tr.intendedDate) e.intendedDate = "Choose a date";
      else if (new Date(tr.intendedDate) < new Date()) e.intendedDate = "Date must be in the future";
      if (!tr.duration.trim()) e.duration = "Required";
      if (!tr.purpose.trim()) e.purpose = "Required";
      if (tr.emergencyContact.trim().length < 5) e.emergencyContact = "Name and phone of an emergency contact";
    }
    if (s === 7) {
      if (!files.passport) e.passport = "Passport scan is required";
      if (!files.photo) e.photo = "Passport photo is required";
    }
    if (s === 8 && !confirm) e.confirm = "Please confirm the information is correct";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => {
    if (!validate(step)) return;
    const n = Math.min(step + 1, 9);
    setStep(n);
    persist(n);
  };
  const back = () => (step > 1 ? setStep(step - 1) : onClose());

  const submit = async () => {
    if (!validate(8)) return;
    setBusy(true);
    setSubmitError(null);
    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          country: form.country,
          visaType: form.visaType,
          feeAmount: fee,
          paymentStatus: "pending",
          personal: form.personal,
          passport: form.passport,
          employment: form.employment,
          travel: form.travel,
          payment: { method: form.payment.method, amount: fee, currency: "USD" },
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Could not submit");
      const app = data.application;

      // Upload every chosen file against the new application.
      for (const [docType, file] of Object.entries(files)) {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("docType", docType);
        fd.append("title", (country.requiredDocuments.find((d) => docTypeFor(d.title) === docType)?.title) || file.name);
        fd.append("applicationId", String(app.id));
        await fetch("/api/documents", { method: "POST", body: fd });
      }
      setCreated(app);
      setStep(10);
      localStorage.removeItem(draftKey);
      onApplicationCreated(app);
      try {
        confetti({ particleCount: 90, spread: 75, origin: { y: 0.65 } });
      } catch {}
    } catch (e: any) {
      setSubmitError(e.message || "Submission failed. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const fileInputs = useRef<Record<string, HTMLInputElement | null>>({});
  const docRows = useMemo(
    () => country.requiredDocuments.map((d) => ({ ...d, type: docTypeFor(d.title) })).filter((d, i, a) => a.findIndex((x) => x.type === d.type) === i),
    [country]
  );

  const ErrP = ({ k }: { k: string }) => (errors[k] ? <p className="text-[11.5px] font-semibold text-rose-600 mt-1 px-1">{errors[k]}</p> : null);

  return (
    <div className="fixed inset-0 z-50 bg-black/30 flex justify-center">
      <div className="lg-strong w-full max-w-xl app-height flex flex-col sm:my-0 sm:rounded-none overflow-hidden page-enter">
        <div className="px-4 pt-safe flex-shrink-0">
          <div className="py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={step === 10 ? onClose : back} className="w-10 h-10 rounded-full lg flex items-center justify-center ios-press" aria-label="Back">
                <ChevronLeft className="w-5 h-5 -ml-0.5" />
              </button>
              <div>
                <p className="text-[10.5px] font-extrabold uppercase tracking-wider text-blue-600">Step {step} of 10</p>
                <p className="text-[16px] font-extrabold text-slate-900 leading-tight">{STEPS[step - 1]}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {step < 10 && (
                <button
                  onClick={() => {
                    persist();
                    setSavedNote("Draft saved — resume anytime");
                    setTimeout(() => setSavedNote(null), 2200);
                  }}
                  className="px-3 h-9 rounded-full lg text-[11.5px] font-bold text-slate-700 flex items-center gap-1.5 ios-press"
                >
                  <Save className="w-3.5 h-3.5" /> Save
                </button>
              )}
              <button onClick={onClose} className="w-10 h-10 rounded-full lg flex items-center justify-center ios-press" aria-label="Close">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="h-1.5 rounded-full bg-slate-400/20 overflow-hidden mb-2">
            <div className="h-full rounded-full bg-gradient-to-r from-sky-400 via-blue-500 to-violet-500 transition-all duration-500" style={{ width: `${(step / 10) * 100}%` }} />
          </div>
          {(savedNote || resumed) && step < 10 && (
            <p className="text-[11.5px] font-semibold text-emerald-700 text-center pb-1">{savedNote || "Resumed your saved draft"}</p>
          )}
        </div>

        <div key={step} className="flex-1 overflow-y-auto smooth-scroll no-scrollbar px-5 py-4 space-y-4 page-enter">
          {step === 1 && (
            <>
              <p className="text-[13px] text-slate-600">Choose your destination. We process applications for these six countries only.</p>
              <div className="grid grid-cols-2 gap-3">
                {PRIMARY_COUNTRIES.map((c) => (
                  <button key={c.id} onClick={() => setForm({ ...form, country: c.name })} className={`p-4 rounded-[24px] text-left ios-press flex flex-col gap-2 ${form.country === c.name ? "lg-btn" : "lg"}`}>
                    <span className="text-3xl">{c.flag}</span>
                    <div>
                      <p className="text-[14px] font-extrabold">{c.name}</p>
                      <p className={`text-[11px] ${form.country === c.name ? "text-white/80" : "text-slate-500"}`}>{c.processingTime}</p>
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}

          {step === 2 && (
            <div className="space-y-2.5">
              <p className="text-[13px] text-slate-600">Visa category for {country.flag} {form.country}</p>
              {VISA_TYPES.map((v) => {
                const Icon = v.icon;
                const on = form.visaType === v.name;
                return (
                  <button key={v.name} onClick={() => setForm({ ...form, visaType: v.name })} className={`w-full p-4 rounded-[22px] flex items-center gap-3 text-left ios-press ${on ? "lg-btn" : "lg"}`}>
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${on ? "bg-white/25" : "bg-blue-500/15 text-blue-600"}`}><Icon className="w-5 h-5" /></div>
                    <div className="flex-1">
                      <p className="text-[14px] font-extrabold">{v.name}</p>
                      <p className={`text-[11.5px] ${on ? "text-white/80" : "text-slate-500"}`}>{v.desc}</p>
                    </div>
                    <span className="text-[12px] font-extrabold">${v.fee}</span>
                  </button>
                );
              })}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-3.5">
              <p className="text-[12.5px] text-slate-500">Enter details exactly as they appear on your passport.</p>
              <Field label="Full legal name" error={errors.fullName}><input className={inputCls} value={form.personal.fullName} onChange={(e) => set("personal", "fullName", e.target.value)} autoComplete="name" /></Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Date of birth" error={errors.dob}><input type="date" className={inputCls} value={form.personal.dob} onChange={(e) => set("personal", "dob", e.target.value)} /></Field>
                <Field label="Gender"><select className={inputCls} value={form.personal.gender} onChange={(e) => set("personal", "gender", e.target.value)}><option>Male</option><option>Female</option><option>Other</option></select></Field>
              </div>
              <Field label="Nationality" error={errors.nationality}><input className={inputCls} value={form.personal.nationality} onChange={(e) => set("personal", "nationality", e.target.value)} placeholder="e.g. Bangladeshi" /></Field>
              <Field label="Email" error={errors.email}><input type="email" className={inputCls} value={form.personal.email} onChange={(e) => set("personal", "email", e.target.value)} /></Field>
              <Field label="Phone" error={errors.phone}><input type="tel" className={inputCls} value={form.personal.phone} onChange={(e) => set("personal", "phone", e.target.value)} placeholder="+880…" /></Field>
              <Field label="Current address" error={errors.currentAddress}><input className={inputCls} value={form.personal.currentAddress} onChange={(e) => set("personal", "currentAddress", e.target.value)} /></Field>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-3.5">
              <p className="text-[12.5px] text-slate-500">Your passport must be valid for at least 6 months.</p>
              <Field label="Passport number" error={errors.passportNumber}><input className={`${inputCls} uppercase tracking-wider`} value={form.passport.passportNumber} onChange={(e) => set("passport", "passportNumber", e.target.value.toUpperCase())} /></Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Issue date" error={errors.issueDate}><input type="date" className={inputCls} value={form.passport.issueDate} onChange={(e) => set("passport", "issueDate", e.target.value)} /></Field>
                <Field label="Expiry date" error={errors.expiryDate}><input type="date" className={inputCls} value={form.passport.expiryDate} onChange={(e) => set("passport", "expiryDate", e.target.value)} /></Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Issuing country" error={errors.issuingCountry}><input className={inputCls} value={form.passport.issuingCountry} onChange={(e) => set("passport", "issuingCountry", e.target.value)} /></Field>
                <Field label="Place of birth"><input className={inputCls} value={form.passport.placeOfBirth} onChange={(e) => set("passport", "placeOfBirth", e.target.value)} /></Field>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-3.5">
              <p className="text-[12.5px] text-slate-500">Your current profession or business.</p>
              <Field label="Occupation / job title" error={errors.occupation}><input className={inputCls} value={form.employment.occupation} onChange={(e) => set("employment", "occupation", e.target.value)} /></Field>
              <Field label="Employer / company"><input className={inputCls} value={form.employment.employer} onChange={(e) => set("employment", "employer", e.target.value)} /></Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Years of experience" error={errors.experienceYears}><input className={inputCls} value={form.employment.experienceYears} onChange={(e) => set("employment", "experienceYears", e.target.value)} placeholder="e.g. 6" /></Field>
                <Field label="Annual income (USD)"><input className={inputCls} value={form.employment.annualIncome} onChange={(e) => set("employment", "annualIncome", e.target.value)} /></Field>
              </div>
              <Field label="Field / industry"><input className={inputCls} value={form.employment.fieldOfWork} onChange={(e) => set("employment", "fieldOfWork", e.target.value)} /></Field>
            </div>
          )}

          {step === 6 && (
            <div className="space-y-3.5">
              <Field label="Intended travel date" error={errors.intendedDate}><input type="date" className={inputCls} value={form.travel.intendedDate} onChange={(e) => set("travel", "intendedDate", e.target.value)} /></Field>
              <Field label="Duration of stay" error={errors.duration}><input className={inputCls} value={form.travel.duration} onChange={(e) => set("travel", "duration", e.target.value)} placeholder="e.g. 24 months" /></Field>
              <Field label="Purpose" error={errors.purpose}><input className={inputCls} value={form.travel.purpose} onChange={(e) => set("travel", "purpose", e.target.value)} placeholder="e.g. Skilled employment" /></Field>
              <Field label="Emergency contact (name & phone)" error={errors.emergencyContact}><input className={inputCls} value={form.travel.emergencyContact} onChange={(e) => set("travel", "emergencyContact", e.target.value)} /></Field>
            </div>
          )}

          {step === 7 && (
            <div className="space-y-3">
              <p className="text-[12.5px] text-slate-500">Upload clear PDF/JPG/PNG files (max 6 MB each) for {country.flag} {form.country}. Passport and photo are required now — you can add the rest later from Documents.</p>
              {docRows.map((d) => {
                const f = files[d.type];
                const mandatory = d.type === "passport" || d.type === "photo";
                return (
                  <div key={d.type} className="lg rounded-[22px] p-3.5">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 ${f ? "bg-emerald-500/20 text-emerald-700" : "bg-blue-500/15 text-blue-600"}`}>{f ? <CheckCircle2 className="w-5 h-5" /> : <FileText className="w-5 h-5" />}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-bold text-slate-900 truncate">{d.title}{mandatory && <span className="text-rose-500"> *</span>}</p>
                        <p className="text-[11px] text-slate-500 truncate">{f ? `${f.name} • ${(f.size / 1024).toFixed(0)} KB` : d.desc}</p>
                      </div>
                      <button onClick={() => fileInputs.current[d.type]?.click()} className="px-3.5 py-2 rounded-full lg-btn text-[11.5px] font-bold flex items-center gap-1.5 ios-press">
                        <Upload className="w-3.5 h-3.5" /> {f ? "Change" : "Choose"}
                      </button>
                      <input
                        ref={(el) => { fileInputs.current[d.type] = el; }}
                        type="file"
                        accept="application/pdf,image/jpeg,image/png,image/webp"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          if (file.size > 6 * 1024 * 1024) return setErrors({ ...errors, [d.type]: "File is larger than 6 MB" });
                          setErrors((er) => { const n = { ...er }; delete n[d.type]; return n; });
                          setFiles((fs) => ({ ...fs, [d.type]: file }));
                        }}
                      />
                    </div>
                    <ErrP k={d.type} />
                  </div>
                );
              })}
            </div>
          )}

          {step === 8 && (
            <div className="space-y-3">
              {[
                { t: "Destination", s: 1, rows: [["Country", form.country], ["Visa", form.visaType]] },
                { t: "Applicant", s: 3, rows: [["Name", form.personal.fullName], ["Email", form.personal.email], ["Phone", form.personal.phone], ["DOB", form.personal.dob]] },
                { t: "Passport", s: 4, rows: [["Number", form.passport.passportNumber], ["Expires", form.passport.expiryDate]] },
                { t: "Work & travel", s: 5, rows: [["Occupation", form.employment.occupation], ["Travel date", form.travel.intendedDate], ["Purpose", form.travel.purpose]] },
                { t: "Documents", s: 7, rows: Object.entries(files).map(([k, f]) => [k.replace(/_/g, " "), f.name]) },
              ].map((blk) => (
                <div key={blk.t} className="lg rounded-[22px] p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[13px] font-extrabold text-slate-900">{blk.t}</p>
                    <button onClick={() => setStep(blk.s)} className="text-[12px] font-bold text-blue-600">Edit</button>
                  </div>
                  <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
                    {blk.rows.map(([k, v]) => (
                      <div key={k}><p className="text-[10px] uppercase font-bold text-slate-400">{k}</p><p className="text-[12.5px] font-semibold text-slate-800 truncate">{v || "—"}</p></div>
                    ))}
                  </div>
                </div>
              ))}
              <label className="lg rounded-[22px] p-4 flex items-start gap-3 text-[12.5px] text-slate-700">
                <input type="checkbox" checked={confirm} onChange={(e) => setConfirm(e.target.checked)} className="w-5 h-5 mt-0.5 accent-blue-600" />
                I confirm that the information and documents are true and complete.
              </label>
              <ErrP k="confirm" />
            </div>
          )}

          {step === 9 && (
            <div className="space-y-4">
              <div className="rounded-[28px] p-5 text-white lg-btn">
                <p className="text-[12px] font-semibold opacity-80">Service & lodgement fee</p>
                <p className="text-[38px] font-black leading-tight">${fee} <span className="text-[14px] font-semibold opacity-80">USD</span></p>
                <p className="text-[11.5px] opacity-80 flex items-center gap-1.5 mt-1"><Lock className="w-3.5 h-3.5" /> Government/embassy fees may be charged separately.</p>
              </div>
              <p className="text-[12.5px] text-slate-600">Choose how you'd like to pay. Your application is lodged now as <b>payment pending</b>; our desk sends the payment instructions and confirms once received.</p>
              {[
                { id: "bank_transfer", n: "Bank transfer" },
                { id: "mobile_banking", n: "bKash / Nagad / mobile banking" },
                { id: "card_link", n: "Card payment link" },
                { id: "office", n: "Pay at our office" },
              ].map((m) => (
                <button key={m.id} onClick={() => set("payment", "method", m.id)} className={`w-full p-4 rounded-[20px] flex items-center justify-between ios-press ${form.payment.method === m.id ? "lg-btn" : "lg"}`}>
                  <span className="text-[13.5px] font-bold">{m.n}</span>
                  {form.payment.method === m.id && <CheckCircle2 className="w-5 h-5" />}
                </button>
              ))}
              {submitError && <div className="rounded-2xl bg-rose-500/15 text-rose-800 text-[12.5px] font-semibold px-4 py-3">{submitError}</div>}
            </div>
          )}

          {step === 10 && created && (
            <div className="text-center py-6 space-y-5">
              <div className="w-20 h-20 rounded-full bg-emerald-500/20 text-emerald-600 flex items-center justify-center mx-auto"><CheckCircle2 className="w-11 h-11" /></div>
              <div>
                <h3 className="text-[24px] font-extrabold text-slate-900">Application submitted</h3>
                <p className="text-[13px] text-slate-600 mt-1">Our team is reviewing your documents. You'll get a notification at every step.</p>
              </div>
              <div className="lg rounded-[24px] p-5 text-left space-y-2.5 text-[13px]">
                {[["Reference", created.applicationNumber], ["Destination", `${country.flag} ${created.country}`], ["Visa", created.visaType], ["Status", "Under review"], ["Payment", `$${fee} • pending`]].map(([k, v]) => (
                  <div key={k} className="flex justify-between"><span className="text-slate-500">{k}</span><b className="text-slate-900 font-mono">{v}</b></div>
                ))}
              </div>
              <div className="space-y-2.5">
                <button onClick={() => { onViewApplications?.(); onClose(); }} className="w-full py-4 rounded-full lg-btn font-bold ios-press">Track my application</button>
              </div>
            </div>
          )}
        </div>

        {step < 10 && (
          <div className="px-4 pt-3 pb-safe flex-shrink-0">
            <div className="flex gap-3 pb-3">
              <button onClick={back} className="px-6 py-4 rounded-full lg font-bold text-[13.5px] text-slate-700 ios-press">Back</button>
              {step === 9 ? (
                <button onClick={submit} disabled={busy} className="flex-1 py-4 rounded-full lg-btn font-bold text-[14px] flex items-center justify-center gap-2 disabled:opacity-60 ios-press">
                  {busy ? "Submitting & uploading…" : <>Submit application <ArrowRight className="w-4 h-4" /></>}
                </button>
              ) : (
                <button onClick={step === 8 ? () => { if (validate(8)) { setStep(9); persist(9); } } : next} className="flex-1 py-4 rounded-full lg-btn font-bold text-[14px] flex items-center justify-center gap-2 ios-press">
                  Save &amp; Continue <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
