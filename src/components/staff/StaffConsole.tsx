"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  LayoutDashboard, FileText, Users, Bot, Settings, Send, Search, X, Download, Check, XCircle, RefreshCw, LogOut, ExternalLink, Globe2,
  ShieldCheck, Sparkles, Eye, Plus, KeyRound, MessageSquare, ChevronRight, Smartphone, Loader2,
} from "lucide-react";
import { generateApplicationDossierPdf, generateClientProfilePdf } from "@/lib/pdfGenerator";
import type { AuthedUser } from "@/components/auth/AuthScreen";

type Tab = "dashboard" | "applications" | "clients" | "ava" | "settings";

const STATUSES = ["under_review", "documents_verified", "processing", "embassy_review", "approved", "completed", "rejected"];
const label = (s: string) => s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
const FLAGS: Record<string, string> = { Australia: "🇦🇺", Singapore: "🇸🇬", Serbia: "🇷🇸", Turkey: "🇹🇷", Malaysia: "🇲🇾", Russia: "🇷🇺" };
const statusTone = (s: string) =>
  s === "completed" || s === "approved" ? "bg-emerald-500/20 text-emerald-700" : s === "rejected" ? "bg-rose-500/20 text-rose-700" : s === "embassy_review" ? "bg-amber-500/20 text-amber-700" : "bg-blue-500/20 text-blue-700";

async function api(path: string, init?: RequestInit) {
  const res = await fetch(path, { ...init, headers: init?.body && !(init.body instanceof FormData) ? { "Content-Type": "application/json", ...(init?.headers || {}) } : init?.headers });
  let data: any = {};
  try {
    data = await res.json();
  } catch {}
  return { ok: res.ok && data.success !== false, status: res.status, data };
}
const post = (path: string, body: any, method = "POST") => api(path, { method, body: JSON.stringify(body) });
const ago = (d: string) => {
  const m = Math.round((Date.now() - new Date(d).getTime()) / 60000);
  return m < 1 ? "now" : m < 60 ? `${m}m` : m < 1440 ? `${Math.round(m / 60)}h` : `${Math.round(m / 1440)}d`;
};

/* ------------------------------ small UI ------------------------------ */
const Sheet: React.FC<{ onClose: () => void; title: string; subtitle?: string; children: React.ReactNode }> = ({ onClose, title, subtitle, children }) => (
  <div className="fixed inset-0 z-50 bg-black/40 flex items-end justify-center" onClick={onClose}>
    <div onClick={(e) => e.stopPropagation()} className="lg-strong w-full max-w-md max-h-[92dvh] rounded-t-[34px] flex flex-col overflow-hidden">
      <div className="px-5 pt-3 pb-3 flex-shrink-0">
        <div className="w-10 h-1.5 rounded-full bg-slate-400/40 mx-auto mb-3" />
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-[18px] font-extrabold text-slate-900 tracking-tight truncate">{title}</h3>
            {subtitle && <p className="text-[12px] text-slate-500 truncate">{subtitle}</p>}
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-full lg flex items-center justify-center flex-shrink-0 ios-press" aria-label="Close">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto smooth-scroll no-scrollbar px-5 pb-8 space-y-4">{children}</div>
    </div>
  </div>
);

const Stat: React.FC<{ label: string; value: React.ReactNode; hint?: string; tone?: string }> = ({ label: l, value, hint, tone = "text-slate-900" }) => (
  <div className="lg rounded-[24px] p-4">
    <p className="text-[10.5px] font-bold uppercase tracking-wider text-slate-500">{l}</p>
    <p className={`text-[26px] font-black leading-tight mt-1 ${tone}`}>{value}</p>
    {hint && <p className="text-[11px] text-slate-500 mt-0.5">{hint}</p>}
  </div>
);

/* ------------------------------ main ------------------------------ */
export const StaffConsole: React.FC<{ user: AuthedUser; onLogout: () => void; onOpenClientApp: () => void }> = ({ user, onLogout, onOpenClientApp }) => {
  const isAdmin = user.role === "admin";
  const [tab, setTab] = useState<Tab>("dashboard");
  const [admin, setAdmin] = useState<any>(null);
  const [apps, setApps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [avaSeed, setAvaSeed] = useState<string | null>(null);
  const [openApp, setOpenApp] = useState<any | null>(null);
  const [openClient, setOpenClient] = useState<any | null>(null);

  const refresh = useCallback(async () => {
    const [a, b] = await Promise.all([api("/api/admin"), api("/api/applications")]);
    if (a.ok) setAdmin(a.data);
    if (b.ok) setApps(b.data.applications);
    setLoading(false);
  }, []);
  useEffect(() => {
    refresh();
  }, [refresh, tab]);

  const tabs: { id: Tab; label: string; icon: any }[] = [
    { id: "dashboard", label: "Home", icon: LayoutDashboard },
    { id: "applications", label: "Cases", icon: FileText },
    { id: "clients", label: "Clients", icon: Users },
    { id: "ava", label: "Ava AI", icon: Bot },
    ...(isAdmin ? [{ id: "settings" as Tab, label: "Settings", icon: Settings }] : []),
  ];

  return (
    <div className="app-height w-full max-w-md md:max-w-xl mx-auto relative flex flex-col overflow-hidden">
      <header className="lg px-4 pt-safe flex-shrink-0 z-20">
        <div className="py-3 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl lg-btn flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[16px] font-extrabold tracking-tight text-slate-900 leading-tight truncate">World Vision {isAdmin ? "Admin" : "Visa Desk"}</p>
              <p className="text-[11.5px] text-slate-500 truncate">
                {user.fullName} • {isAdmin ? "Administrator" : "Agent"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onOpenClientApp} className="h-9 px-3 rounded-full lg text-[11.5px] font-bold text-slate-700 flex items-center gap-1.5 ios-press">
              <Smartphone className="w-3.5 h-3.5" /> Client app
            </button>
            <button onClick={onLogout} className="w-9 h-9 rounded-full lg flex items-center justify-center text-slate-700 ios-press" aria-label="Sign out">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <main key={tab} className="flex-1 overflow-y-auto smooth-scroll no-scrollbar px-4 pt-4 pb-32 page-enter">
        {loading ? (
          <div className="space-y-3">{[0, 1, 2].map((i) => <div key={i} className="skeleton h-24" />)}</div>
        ) : (
          <>
            {tab === "dashboard" && <Dashboard admin={admin} apps={apps} openApp={setOpenApp} goTab={setTab} />}
            {tab === "applications" && <Cases apps={apps} openApp={setOpenApp} />}
            {tab === "clients" && <Clients users={(admin?.users || []).filter((u: any) => u.role === "applicant")} openClient={setOpenClient} />}
            {tab === "ava" && <Ava seed={avaSeed} clearSeed={() => setAvaSeed(null)} isAdmin={isAdmin} goSettings={() => setTab("settings")} />}
            {tab === "settings" && isAdmin && <SettingsPanel me={user} users={admin?.users || []} reload={refresh} />}
          </>
        )}
      </main>

      {/* Liquid glass tab bar */}
      <nav className="absolute bottom-0 inset-x-0 px-4 pb-safe z-30 pointer-events-none">
        <div className="lg-strong rounded-[30px] mb-3 px-2 py-2 flex items-center justify-around pointer-events-auto">
          {tabs.map((t) => {
            const Icon = t.icon;
            const on = tab === t.id;
            return (
              <button key={t.id} onClick={() => setTab(t.id)} className={`relative flex-1 flex flex-col items-center py-1.5 rounded-[22px] ios-press transition-colors ${on ? "bg-blue-500/15 text-blue-600" : "text-slate-500"}`}>
                <Icon className={`w-[21px] h-[21px] ${on ? "stroke-[2.4]" : "stroke-[1.8]"}`} />
                <span className="text-[10px] font-semibold mt-0.5">{t.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {openApp && (
        <ApplicationSheet
          app={openApp}
          onClose={() => setOpenApp(null)}
          onChanged={refresh}
          askAva={(q: string) => {
            setOpenApp(null);
            setAvaSeed(q);
            setTab("ava");
          }}
        />
      )}
      {openClient && <ClientSheet client={openClient} apps={apps.filter((a) => a.userId === openClient.id)} onClose={() => setOpenClient(null)} openApp={(a: any) => { setOpenClient(null); setOpenApp(a); }} />}
    </div>
  );
};

/* ------------------------------ dashboard ------------------------------ */
const Dashboard = ({ admin, apps, openApp, goTab }: any) => {
  const s = admin?.stats;
  const pipeline = STATUSES.map((st) => ({ st, n: s?.byStatus?.[st] || 0 }));
  const max = Math.max(1, ...pipeline.map((p) => p.n));
  const [activity, setActivity] = useState<any[]>([]);
  useEffect(() => {
    api("/api/ai-agent").then((r) => r.ok && setActivity(r.data.activity || []));
  }, []);
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Stat label="Cases" value={s?.totalApplications ?? 0} hint={`${s?.byStatus?.under_review || 0} awaiting review`} tone="text-blue-600" />
        <Stat label="Clients" value={s?.totalClients ?? 0} hint="Registered applicants" />
        <Stat label="Docs to review" value={s?.pendingDocuments ?? 0} hint={`${s?.totalDocuments ?? 0} files on record`} tone={s?.pendingDocuments ? "text-amber-600" : "text-slate-900"} />
        <Stat label="Revenue (paid)" value={`$${(s?.revenue ?? 0).toLocaleString()}`} hint="USD, fees collected" tone="text-emerald-600" />
      </div>

      <section className="lg rounded-[28px] p-5">
        <p className="text-[13px] font-extrabold text-slate-900 mb-3">Pipeline</p>
        <div className="space-y-2.5">
          {pipeline.map((p) => (
            <div key={p.st} className="flex items-center gap-3">
              <span className="w-32 text-[11.5px] font-semibold text-slate-600 flex-shrink-0">{label(p.st)}</span>
              <div className="flex-1 h-2.5 rounded-full bg-slate-400/15 overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-sky-400 to-indigo-500 transition-all duration-700" style={{ width: `${(p.n / max) * 100}%` }} />
              </div>
              <span className="w-5 text-right text-[12px] font-bold text-slate-800">{p.n}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="lg rounded-[28px] p-5">
        <p className="text-[13px] font-extrabold text-slate-900 mb-3">By country</p>
        <div className="flex flex-wrap gap-2">
          {Object.keys(FLAGS).map((c) => (
            <span key={c} className="px-3 py-1.5 rounded-full bg-white/60 text-[12px] font-semibold text-slate-700">
              {FLAGS[c]} {c} <b className="text-blue-600">{s?.byCountry?.[c] || 0}</b>
            </span>
          ))}
        </div>
      </section>

      <section className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <p className="text-[15px] font-extrabold text-slate-900">Needs attention</p>
          <button onClick={() => goTab("applications")} className="text-[12px] font-semibold text-blue-600">See all</button>
        </div>
        {apps.filter((a: any) => a.status === "under_review").slice(0, 4).map((a: any) => (
          <button key={a.id} onClick={() => openApp(a)} className="lg rounded-[22px] p-3.5 w-full flex items-center gap-3 text-left ios-press">
            <span className="text-2xl">{FLAGS[a.country] || "🌐"}</span>
            <div className="flex-1 min-w-0">
              <p className="text-[13.5px] font-bold text-slate-900 truncate">{a.clientName} • {a.visaType}</p>
              <p className="text-[11.5px] text-slate-500 truncate">{a.applicationNumber} • {a.nextAction}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>
        ))}
        {!apps.some((a: any) => a.status === "under_review") && <p className="text-[12.5px] text-slate-500 px-1">All caught up — nothing is waiting for review.</p>}
      </section>

      <section className="space-y-2">
        <p className="text-[15px] font-extrabold text-slate-900 px-1">Recent activity</p>
        <div className="lg rounded-[26px] p-2">
          {activity.slice(0, 8).map((a) => (
            <div key={a.id} className="flex items-start gap-3 p-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${a.actorRole === "ai" ? "bg-violet-500/20 text-violet-700" : "bg-blue-500/15 text-blue-700"}`}>
                {a.actorRole === "ai" ? <Bot className="w-4 h-4" /> : <Users className="w-4 h-4" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[12.5px] text-slate-800"><b>{a.actorName}</b> {label(a.action).toLowerCase()}</p>
                {a.detail && <p className="text-[11.5px] text-slate-500 truncate">{a.detail}</p>}
              </div>
              <span className="text-[10.5px] text-slate-400">{ago(a.createdAt)}</span>
            </div>
          ))}
          {!activity.length && <p className="text-[12.5px] text-slate-500 p-3">No activity yet.</p>}
        </div>
      </section>
    </div>
  );
};

/* ------------------------------ cases ------------------------------ */
const Cases = ({ apps, openApp }: any) => {
  const [q, setQ] = useState("");
  const [f, setF] = useState("all");
  const list = useMemo(
    () =>
      apps.filter((a: any) => (f === "all" ? true : a.status === f)).filter((a: any) =>
        !q || [a.clientName, a.applicationNumber, a.country, a.visaType, a.clientEmail].some((v) => String(v || "").toLowerCase().includes(q.toLowerCase()))
      ),
    [apps, q, f]
  );
  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-4 top-[15px]" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search client, reference, country…" className="lg-input w-full pl-11 pr-4 py-3 rounded-2xl text-slate-900 placeholder:text-slate-400" />
      </div>
      <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4">
        {["all", ...STATUSES].map((s) => (
          <button key={s} onClick={() => setF(s)} className={`px-3.5 py-2 rounded-full text-[12px] font-bold whitespace-nowrap ios-press ${f === s ? "lg-btn" : "lg text-slate-600"}`}>
            {s === "all" ? `All (${apps.length})` : label(s)}
          </button>
        ))}
      </div>
      {list.map((a: any) => (
        <button key={a.id} onClick={() => openApp(a)} className="lg rounded-[26px] p-4 w-full text-left space-y-2.5 ios-press">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <span className="text-3xl">{FLAGS[a.country] || "🌐"}</span>
              <div className="min-w-0">
                <p className="text-[14.5px] font-extrabold text-slate-900 truncate">{a.clientName || "Client"}</p>
                <p className="text-[12px] text-slate-500 truncate">{a.country} • {a.visaType}</p>
              </div>
            </div>
            <span className={`px-2.5 py-1 rounded-full text-[10.5px] font-bold whitespace-nowrap ${statusTone(a.status)}`}>{label(a.status)}</span>
          </div>
          <div className="h-2 rounded-full bg-slate-400/15 overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-sky-400 to-indigo-500" style={{ width: `${a.progressPct}%` }} />
          </div>
          <p className="text-[11.5px] text-slate-500 font-mono">{a.applicationNumber} • {a.progressPct}%</p>
        </button>
      ))}
      {!list.length && <p className="text-center text-[13px] text-slate-500 py-10">No cases match.</p>}
    </div>
  );
};

/* ------------------------------ application sheet ------------------------------ */
const ApplicationSheet = ({ app, onClose, onChanged, askAva }: any) => {
  const [docs, setDocs] = useState<any[]>([]);
  const [next, setNext] = useState(app.nextAction || "");
  const [status, setStatus] = useState(app.status);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const loadDocs = useCallback(async () => {
    const r = await api(`/api/documents?userId=${app.userId}`);
    if (r.ok) setDocs(r.data.documents);
  }, [app.userId]);
  useEffect(() => {
    loadDocs();
  }, [loadDocs]);

  const saveStatus = async (s: string) => {
    setBusy(true);
    const r = await post("/api/applications", { id: app.id, status: s, nextAction: next }, "PATCH");
    setBusy(false);
    if (r.ok) {
      setStatus(s);
      setMsg(`Status set to ${label(s)} — client notified`);
      onChanged();
    } else setMsg(r.data.error || "Failed");
  };
  const saveNext = async () => {
    setBusy(true);
    const r = await post("/api/applications", { id: app.id, nextAction: next }, "PATCH");
    setBusy(false);
    setMsg(r.ok ? "Next step saved" : r.data.error || "Failed");
    onChanged();
  };
  const review = async (id: number, st: string) => {
    let reason: string | undefined;
    if (st === "rejected") {
      reason = window.prompt("Reason for rejection (shown to the client):", "Image is unclear — please upload a clearer copy") || undefined;
      if (!reason) return;
    }
    await post("/api/documents", { id, status: st, rejectionReason: reason }, "PATCH");
    loadDocs();
    onChanged();
  };

  const d = app.details || {};
  return (
    <Sheet onClose={onClose} title={`${FLAGS[app.country] || ""} ${app.country} • ${app.visaType}`} subtitle={`${app.applicationNumber} • ${app.clientName}`}>
      <div className="grid grid-cols-2 gap-2.5">
        <div className="lg rounded-2xl p-3"><p className="text-[10px] font-bold uppercase text-slate-500">Client</p><p className="text-[13px] font-bold text-slate-900 truncate">{app.clientName}</p><p className="text-[11px] text-slate-500 truncate">{app.clientEmail}</p></div>
        <div className="lg rounded-2xl p-3"><p className="text-[10px] font-bold uppercase text-slate-500">Fee</p><p className="text-[13px] font-bold text-slate-900">${app.feeAmount} USD</p><p className="text-[11px] text-slate-500">{app.paymentStatus}</p></div>
        <div className="lg rounded-2xl p-3"><p className="text-[10px] font-bold uppercase text-slate-500">Passport</p><p className="text-[13px] font-bold text-slate-900">{d.passport?.passportNumber || "—"}</p><p className="text-[11px] text-slate-500">exp {d.passport?.expiryDate || "—"}</p></div>
        <div className="lg rounded-2xl p-3"><p className="text-[10px] font-bold uppercase text-slate-500">Occupation</p><p className="text-[13px] font-bold text-slate-900 truncate">{d.employment?.occupation || "—"}</p><p className="text-[11px] text-slate-500 truncate">{d.employment?.experienceYears || ""}</p></div>
      </div>

      <div>
        <p className="text-[12px] font-extrabold text-slate-900 mb-2">Status</p>
        <div className="flex flex-wrap gap-2">
          {STATUSES.map((s) => (
            <button key={s} disabled={busy} onClick={() => saveStatus(s)} className={`px-3 py-2 rounded-full text-[11.5px] font-bold ios-press ${status === s ? "lg-btn" : "lg text-slate-600"}`}>
              {label(s)}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-[12px] font-extrabold text-slate-900 mb-2">Next step shown to client</p>
        <textarea value={next} onChange={(e) => setNext(e.target.value)} rows={2} className="lg-input w-full p-3 rounded-2xl text-slate-900 resize-none" />
        <button onClick={saveNext} disabled={busy} className="mt-2 px-4 py-2 rounded-full lg text-[12px] font-bold text-blue-600 ios-press">Save next step</button>
      </div>
      {msg && <div className="rounded-2xl bg-emerald-500/15 text-emerald-800 text-[12.5px] font-semibold px-4 py-2.5">{msg}</div>}

      <div>
        <p className="text-[12px] font-extrabold text-slate-900 mb-2">Documents ({docs.length})</p>
        <div className="space-y-2">
          {docs.map((dc) => (
            <div key={dc.id} className="lg rounded-2xl p-3 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-[12.5px] font-bold text-slate-900 truncate">{dc.title}</p>
                <p className="text-[11px] text-slate-500 truncate">{dc.fileName} • {dc.fileSize} • <b className={dc.status === "verified" ? "text-emerald-600" : dc.status === "rejected" ? "text-rose-600" : "text-amber-600"}>{label(dc.status)}</b></p>
              </div>
              <a href={`/api/documents/file/${dc.id}`} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-blue-500/15 text-blue-700 flex items-center justify-center" aria-label="View"><Eye className="w-4 h-4" /></a>
              <button onClick={() => review(dc.id, "verified")} className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-700 flex items-center justify-center" aria-label="Verify"><Check className="w-4 h-4" /></button>
              <button onClick={() => review(dc.id, "rejected")} className="w-8 h-8 rounded-full bg-rose-500/20 text-rose-700 flex items-center justify-center" aria-label="Reject"><XCircle className="w-4 h-4" /></button>
            </div>
          ))}
          {!docs.length && <p className="text-[12.5px] text-slate-500">The client has not uploaded any documents yet.</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2.5 pt-1">
        <button
          onClick={() =>
            generateApplicationDossierPdf(app, { fullName: app.clientName, email: app.clientEmail, phone: app.clientPhone }, docs)
          }
          className="py-3.5 rounded-full lg-btn text-[13px] font-bold flex items-center justify-center gap-2 ios-press"
        >
          <Download className="w-4 h-4" /> Dossier PDF
        </button>
        <button
          onClick={() => askAva(`Review application #${app.id} (${app.applicationNumber}). Compare the uploaded documents with the ${app.country} checklist, tell me what's missing and what you recommend.`)}
          className="py-3.5 rounded-full lg text-[13px] font-bold text-violet-700 flex items-center justify-center gap-2 ios-press"
        >
          <Sparkles className="w-4 h-4" /> Ask Ava
        </button>
      </div>
    </Sheet>
  );
};

/* ------------------------------ clients ------------------------------ */
const Clients = ({ users, openClient }: any) => {
  const [q, setQ] = useState("");
  const list = users.filter((u: any) => !q || [u.fullName, u.email, u.phone].some((v) => String(v || "").toLowerCase().includes(q.toLowerCase())));
  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-4 top-[15px]" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search clients…" className="lg-input w-full pl-11 pr-4 py-3 rounded-2xl text-slate-900 placeholder:text-slate-400" />
      </div>
      {list.map((u: any) => (
        <button key={u.id} onClick={() => openClient(u)} className="lg rounded-[24px] p-4 w-full flex items-center gap-3 text-left ios-press">
          <div className="w-11 h-11 rounded-full lg-btn flex items-center justify-center font-extrabold flex-shrink-0">{u.fullName.slice(0, 1).toUpperCase()}</div>
          <div className="flex-1 min-w-0">
            <p className="text-[14px] font-bold text-slate-900 truncate">{u.fullName}</p>
            <p className="text-[11.5px] text-slate-500 truncate">{u.email}</p>
          </div>
          <div className="text-right">
            <p className="text-[12px] font-bold text-blue-600">{u.applicationsCount} cases</p>
            <p className="text-[10.5px] text-slate-500">{u.documentsCount} docs</p>
          </div>
        </button>
      ))}
      {!list.length && <p className="text-center text-[13px] text-slate-500 py-10">No clients yet.</p>}
    </div>
  );
};

const ClientSheet = ({ client, apps, onClose, openApp }: any) => {
  const [docs, setDocs] = useState<any[]>([]);
  const [thread, setThread] = useState<any[]>([]);
  const [text, setText] = useState("");
  const load = useCallback(async () => {
    const [d, c] = await Promise.all([api(`/api/documents?userId=${client.id}`), api(`/api/chat?userId=${client.id}`)]);
    if (d.ok) setDocs(d.data.documents);
    if (c.ok) setThread(c.data.messages);
  }, [client.id]);
  useEffect(() => {
    load();
  }, [load]);
  const send = async () => {
    if (!text.trim()) return;
    const t = text;
    setText("");
    await post("/api/chat", { message: t, toUserId: client.id });
    load();
  };
  return (
    <Sheet onClose={onClose} title={client.fullName} subtitle={`${client.email}${client.phone ? " • " + client.phone : ""}`}>
      <button
        onClick={() => generateClientProfilePdf(client, apps, docs)}
        className="w-full py-3.5 rounded-full lg-btn text-[13px] font-bold flex items-center justify-center gap-2 ios-press"
      >
        <Download className="w-4 h-4" /> Generate client profile PDF
      </button>
      <div>
        <p className="text-[12px] font-extrabold text-slate-900 mb-2">Applications ({apps.length})</p>
        <div className="space-y-2">
          {apps.map((a: any) => (
            <button key={a.id} onClick={() => openApp(a)} className="lg rounded-2xl p-3 w-full flex items-center gap-3 text-left ios-press">
              <span className="text-2xl">{FLAGS[a.country]}</span>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-bold text-slate-900 truncate">{a.country} • {a.visaType}</p>
                <p className="text-[11px] text-slate-500 font-mono">{a.applicationNumber}</p>
              </div>
              <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${statusTone(a.status)}`}>{label(a.status)}</span>
            </button>
          ))}
          {!apps.length && <p className="text-[12.5px] text-slate-500">No applications yet.</p>}
        </div>
      </div>
      <div>
        <p className="text-[12px] font-extrabold text-slate-900 mb-2">Documents ({docs.length})</p>
        <div className="flex flex-wrap gap-2">
          {docs.map((d) => (
            <a key={d.id} href={`/api/documents/file/${d.id}`} target="_blank" rel="noreferrer" className="px-3 py-1.5 rounded-full lg text-[11.5px] font-semibold text-slate-700">{d.title} • {label(d.status)}</a>
          ))}
          {!docs.length && <p className="text-[12.5px] text-slate-500">No documents uploaded.</p>}
        </div>
      </div>
      <div>
        <p className="text-[12px] font-extrabold text-slate-900 mb-2 flex items-center gap-1.5"><MessageSquare className="w-3.5 h-3.5" /> Conversation</p>
        <div className="space-y-1.5 max-h-52 overflow-y-auto no-scrollbar mb-2">
          {thread.slice(-12).map((m) => (
            <div key={m.id} className={`text-[12px] px-3 py-2 rounded-2xl max-w-[88%] ${m.sender === "user" ? "bg-white/70 text-slate-800" : "lg-btn ml-auto"}`}>
              <span className="block text-[10px] opacity-70 font-bold">{m.senderName}</span>
              {m.message}
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder="Reply to client…" className="lg-input flex-1 px-4 py-3 rounded-full text-slate-900" />
          <button onClick={send} className="w-11 h-11 rounded-full lg-btn flex items-center justify-center ios-press" aria-label="Send"><Send className="w-4 h-4" /></button>
        </div>
      </div>
    </Sheet>
  );
};

/* ------------------------------ Ava (AI admin) ------------------------------ */
const SUGGESTIONS = ["Give me today's summary", "Which applications are waiting for review?", "What documents does Serbia need?", "Show clients with missing documents"];

const Ava = ({ seed, clearSeed, isAdmin, goSettings }: any) => {
  const [mode, setMode] = useState<"chat" | "browser">("chat");
  const [msgs, setMsgs] = useState<{ role: "user" | "assistant"; content: string; actions?: any[] }[]>([
    { role: "assistant", content: `Hi, I'm Ava, your AI operations admin. I can look up cases, review documents, update statuses, message clients and check government portals in a real browser. What should I do first?` },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<any>(null);
  const end = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api("/api/ai-agent").then((r) => r.ok && setStatus(r.data.status));
  }, []);
  useEffect(() => {
    end.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, busy]);

  const send = useCallback(
    async (text: string) => {
      if (!text.trim() || busy) return;
      const next = [...msgs, { role: "user" as const, content: text }];
      setMsgs(next);
      setInput("");
      setBusy(true);
      const r = await post("/api/ai-agent", { messages: next.map((m) => ({ role: m.role, content: m.content })) });
      setBusy(false);
      if (r.ok) setMsgs((m) => [...m, { role: "assistant", content: r.data.reply, actions: r.data.actions }]);
      else setMsgs((m) => [...m, { role: "assistant", content: `I hit a problem: ${r.data.error || "request failed"}` }]);
    },
    [msgs, busy]
  );
  useEffect(() => {
    if (seed) {
      setMode("chat");
      send(seed);
      clearSeed();
    }
  }, [seed]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="space-y-3">
      <div className="p-1 rounded-full lg flex">
        {(["chat", "browser"] as const).map((m) => (
          <button key={m} onClick={() => setMode(m)} className={`flex-1 py-2.5 rounded-full text-[12.5px] font-bold ${mode === m ? "lg-btn" : "text-slate-600"}`}>
            {m === "chat" ? "Ava • Admin chat" : "Cloud browser"}
          </button>
        ))}
      </div>

      {status && !status.ai && (
        <div className="rounded-[22px] bg-amber-500/15 text-amber-900 p-4 text-[12.5px] font-medium">
          <b>AI model not connected.</b> Ava needs an API key to think and act. {isAdmin ? (
            <button onClick={goSettings} className="underline font-bold">Add it in Settings → Integrations.</button>
          ) : "Ask an admin to add it in Settings → Integrations."}
        </div>
      )}

      {mode === "chat" ? (
        <>
          <div className="space-y-3 min-h-[40vh]">
            {msgs.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"} gap-2`}>
                {m.role === "assistant" && <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white flex items-center justify-center flex-shrink-0 mt-1"><Bot className="w-4 h-4" /></div>}
                <div className="max-w-[84%] space-y-1.5">
                  <div className={`px-4 py-2.5 rounded-[22px] text-[13.5px] leading-relaxed whitespace-pre-line ${m.role === "user" ? "lg-btn rounded-br-md" : "lg rounded-bl-md text-slate-800"}`}>{m.content}</div>
                  {m.actions?.map((a, j) => (
                    <div key={j} className={`text-[11px] font-semibold px-3 py-1.5 rounded-full w-fit ${a.ok ? "bg-emerald-500/15 text-emerald-800" : "bg-rose-500/15 text-rose-800"}`}>
                      {a.ok ? "✓" : "✕"} {label(a.tool)} — {a.summary}
                    </div>
                  ))}
                </div>
              </div>
            ))}
            {busy && (
              <div className="flex gap-2 items-center text-[12.5px] text-slate-500 pl-10"><Loader2 className="w-4 h-4 animate-spin" /> Ava is working on it…</div>
            )}
            <div ref={end} />
          </div>
          <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4">
            {SUGGESTIONS.map((s) => (
              <button key={s} onClick={() => send(s)} className="px-3.5 py-2 rounded-full lg text-[11.5px] font-semibold text-slate-700 whitespace-nowrap ios-press">{s}</button>
            ))}
          </div>
          <div className="flex gap-2 sticky bottom-0">
            <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send(input)} placeholder="Ask Ava to do something…" className="lg-input flex-1 px-5 py-3.5 rounded-full text-slate-900 placeholder:text-slate-400" />
            <button onClick={() => send(input)} disabled={busy || !input.trim()} className="w-12 h-12 rounded-full lg-btn flex items-center justify-center disabled:opacity-50 ios-press" aria-label="Send"><Send className="w-4 h-4" /></button>
          </div>
        </>
      ) : (
        <BrowserPanel configured={!!status?.browser} isAdmin={isAdmin} goSettings={goSettings} />
      )}
    </div>
  );
};

const PORTALS: Record<string, string> = {
  Australia: "https://immi.homeaffairs.gov.au/visas/working-in-australia",
  Singapore: "https://www.mom.gov.sg/passes-and-permits/employment-pass",
  Serbia: "https://www.mup.gov.rs/wps/portal/en",
  Turkey: "https://www.csgb.gov.tr/en/",
  Malaysia: "https://esd.imi.gov.my/portal/",
  Russia: "https://evisa.kdmid.ru/en-US",
};

const BrowserPanel = ({ configured, isAdmin, goSettings }: any) => {
  const [country, setCountry] = useState("Australia");
  const [url, setUrl] = useState(PORTALS.Australia);
  const [goal, setGoal] = useState("What are the current requirements and processing times on this page?");
  const [busy, setBusy] = useState(false);
  const [res, setRes] = useState<any>(null);
  const [err, setErr] = useState<string | null>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const loadTasks = () => api("/api/ai-agent").then((r) => r.ok && setTasks(r.data.tasks || []));
  useEffect(() => {
    loadTasks();
  }, []);

  const run = async () => {
    setBusy(true);
    setErr(null);
    setRes(null);
    const r = await post("/api/ai-agent/browse", { url, goal, country });
    setBusy(false);
    if (r.ok) setRes(r.data);
    else setErr(r.data.error || "Browser session failed");
    loadTasks();
  };

  return (
    <div className="space-y-3">
      {!configured && (
        <div className="rounded-[22px] bg-amber-500/15 text-amber-900 p-4 text-[12.5px] font-medium">
          <b>Browserbase not connected.</b> {isAdmin ? <button onClick={goSettings} className="underline font-bold">Add the API key and project ID in Settings.</button> : "Ask an admin to add the Browserbase key."}
        </div>
      )}
      <div className="lg rounded-[28px] p-4 space-y-3">
        <div className="flex gap-2">
          <select value={country} onChange={(e) => { setCountry(e.target.value); setUrl(PORTALS[e.target.value]); }} className="lg-input px-3 py-3 rounded-2xl text-slate-900 flex-shrink-0">
            {Object.keys(PORTALS).map((c) => <option key={c}>{c}</option>)}
          </select>
          <input value={url} onChange={(e) => setUrl(e.target.value)} className="lg-input flex-1 min-w-0 px-4 py-3 rounded-2xl text-slate-900 font-mono text-[12px]" />
        </div>
        <textarea value={goal} onChange={(e) => setGoal(e.target.value)} rows={2} className="lg-input w-full p-3 rounded-2xl text-slate-900 resize-none" placeholder="What should Ava look for on this page?" />
        <button onClick={run} disabled={busy || !configured} className="w-full py-3.5 rounded-full lg-btn font-bold text-[13.5px] flex items-center justify-center gap-2 disabled:opacity-50 ios-press">
          {busy ? <><Loader2 className="w-4 h-4 animate-spin" /> Opening real browser…</> : <><Globe2 className="w-4 h-4" /> Open in cloud browser</>}
        </button>
      </div>
      {err && <div className="rounded-2xl bg-rose-500/15 text-rose-800 text-[12.5px] font-semibold px-4 py-3">{err}</div>}
      {res && (
        <div className="lg rounded-[28px] p-4 space-y-2.5">
          <p className="text-[14px] font-extrabold text-slate-900">{res.title || "Page loaded"}</p>
          {res.analysis && <p className="text-[13px] text-slate-800 whitespace-pre-line bg-violet-500/10 rounded-2xl p-3">{res.analysis}</p>}
          <p className="text-[11.5px] text-slate-500 line-clamp-6 whitespace-pre-line">{String(res.text || "").slice(0, 700)}…</p>
          <a href={res.replayUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-[12.5px] font-bold text-blue-600"><ExternalLink className="w-3.5 h-3.5" /> Open session replay</a>
        </div>
      )}
      {tasks.length > 0 && (
        <div className="space-y-2">
          <p className="text-[13px] font-extrabold text-slate-900 px-1">Recent browser sessions</p>
          {tasks.slice(0, 6).map((t) => (
            <div key={t.id} className="lg rounded-2xl p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[12px] font-bold text-slate-900 truncate">{t.targetUrl}</p>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${t.status === "completed" ? "bg-emerald-500/20 text-emerald-700" : "bg-rose-500/20 text-rose-700"}`}>{t.status}</span>
              </div>
              <p className="text-[11px] text-slate-500 truncate">{t.prompt}</p>
              {t.result?.replayUrl && <a href={t.result.replayUrl} target="_blank" rel="noreferrer" className="text-[11px] font-bold text-blue-600">Replay ↗</a>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/* ------------------------------ settings (admin) ------------------------------ */
const FIELDS: { key: string; label: string; hint: string; secret?: boolean }[] = [
  { key: "META_AI_KEY", label: "Meta Llama / LLM API key", hint: "Powers Ava. Get one at llama.developer.meta.com (any OpenAI-compatible key also works).", secret: true },
  { key: "AI_PROVIDER", label: "AI provider", hint: "meta or openai_compatible" },
  { key: "AI_BASE_URL", label: "AI base URL (optional)", hint: "Default: https://api.llama.com/compat/v1" },
  { key: "AI_MODEL", label: "AI model (optional)", hint: "Default: Llama-4-Maverick-17B-128E-Instruct-FP8" },
  { key: "BROWSERBASE_API_KEY", label: "Browserbase API key", hint: "browserbase.com → Settings → API keys", secret: true },
  { key: "BROWSERBASE_PROJECT_ID", label: "Browserbase project ID", hint: "browserbase.com → your project" },
  { key: "BASE44_API_KEY", label: "Base44 API key (optional)", hint: "Used only for the Base44 agent tool below", secret: true },
  { key: "BASE44_FUNCTION_URL", label: "Base44 function URL (optional)", hint: "A Base44 backend function / agent endpoint Ava may call" },
  { key: "AUTO_REVIEW_APPLICATIONS", label: "Auto-review new applications", hint: "true or false — Ava checks documents when a client submits" },
];

const SettingsPanel = ({ me, users, reload }: any) => {
  const [settings, setSettings] = useState<any>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const [msg, setMsg] = useState<string | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [nu, setNu] = useState({ fullName: "", email: "", password: "", role: "agent" });

  const load = async () => {
    const r = await api("/api/settings");
    if (r.ok) {
      setSettings(r.data.settings);
      const f: Record<string, string> = {};
      Object.entries(r.data.settings).forEach(([k, v]: any) => (f[k] = v.value));
      setForm(f);
    }
  };
  useEffect(() => {
    load();
  }, []);

  const save = async () => {
    const r = await post("/api/settings", { settings: form });
    setMsg(r.ok ? `Saved ${r.data.saved.length} setting(s)` : r.data.error || "Failed");
    if (r.ok) load();
    setTimeout(() => setMsg(null), 3500);
  };
  const setRole = async (userId: number, role: string) => {
    const r = await post("/api/admin", { action: "set_role", userId, role });
    if (!r.ok) alert(r.data.error);
    reload();
  };
  const resetPw = async (userId: number) => {
    const pw = window.prompt("New password (min 8 characters):");
    if (!pw) return;
    const r = await post("/api/admin", { action: "set_password", userId, password: pw });
    alert(r.ok ? "Password updated" : r.data.error);
  };
  const createUser = async () => {
    const r = await post("/api/admin", { action: "create_user", ...nu });
    if (r.ok) {
      setShowNew(false);
      setNu({ fullName: "", email: "", password: "", role: "agent" });
      reload();
    } else alert(r.data.error);
  };

  return (
    <div className="space-y-5">
      <section className="lg rounded-[28px] p-5 space-y-4">
        <div className="flex items-center gap-2"><KeyRound className="w-4 h-4 text-blue-600" /><p className="text-[15px] font-extrabold text-slate-900">Integrations</p></div>
        <p className="text-[12px] text-slate-500">Keys are stored on your server and never sent back to the browser in full.</p>
        {FIELDS.map((f) => (
          <div key={f.key}>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[12px] font-bold text-slate-700">{f.label}</label>
              {settings?.[f.key]?.configured && <span className="text-[10px] font-bold text-emerald-600">● connected</span>}
            </div>
            <input
              type={f.secret ? "password" : "text"}
              value={form[f.key] ?? ""}
              onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
              placeholder={f.secret ? "Paste new key to replace" : ""}
              autoComplete="off"
              className="lg-input w-full px-4 py-3 rounded-2xl text-slate-900 font-mono text-[12.5px]"
            />
            <p className="text-[10.5px] text-slate-500 mt-1">{f.hint}</p>
          </div>
        ))}
        {msg && <div className="rounded-2xl bg-emerald-500/15 text-emerald-800 text-[12.5px] font-semibold px-4 py-2.5">{msg}</div>}
        <button onClick={save} className="w-full py-3.5 rounded-full lg-btn font-bold text-[13.5px] ios-press">Save integrations</button>
      </section>

      <section className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <p className="text-[15px] font-extrabold text-slate-900">Team & accounts</p>
          <button onClick={() => setShowNew(true)} className="px-3 py-1.5 rounded-full lg text-[12px] font-bold text-blue-600 flex items-center gap-1 ios-press"><Plus className="w-3.5 h-3.5" /> Add</button>
        </div>
        {users.map((u: any) => (
          <div key={u.id} className="lg rounded-[22px] p-3.5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full lg-btn flex items-center justify-center font-extrabold flex-shrink-0">{u.fullName.slice(0, 1)}</div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-bold text-slate-900 truncate">{u.fullName}</p>
              <p className="text-[11px] text-slate-500 truncate">{u.email}</p>
            </div>
            <select value={u.role} disabled={u.id === me.id} onChange={(e) => setRole(u.id, e.target.value)} className="lg-input px-2 py-2 rounded-xl text-[11.5px] font-bold text-slate-800">
              <option value="applicant">Client</option>
              <option value="agent">Agent</option>
              <option value="admin">Admin</option>
            </select>
            <button onClick={() => resetPw(u.id)} className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-800 flex items-center justify-center" aria-label="Reset password"><KeyRound className="w-3.5 h-3.5" /></button>
          </div>
        ))}
      </section>

      {showNew && (
        <Sheet onClose={() => setShowNew(false)} title="Add team member">
          {(["fullName", "email", "password"] as const).map((k) => (
            <input key={k} type={k === "password" ? "password" : "text"} placeholder={k === "fullName" ? "Full name" : k === "email" ? "Email" : "Password (8+ characters)"} value={(nu as any)[k]} onChange={(e) => setNu({ ...nu, [k]: e.target.value })} className="lg-input w-full px-4 py-3.5 rounded-2xl text-slate-900" />
          ))}
          <select value={nu.role} onChange={(e) => setNu({ ...nu, role: e.target.value })} className="lg-input w-full px-4 py-3.5 rounded-2xl text-slate-900">
            <option value="agent">Agent (visa desk)</option>
            <option value="admin">Admin</option>
            <option value="applicant">Client</option>
          </select>
          <button onClick={createUser} className="w-full py-3.5 rounded-full lg-btn font-bold ios-press">Create account</button>
        </Sheet>
      )}
    </div>
  );
};
