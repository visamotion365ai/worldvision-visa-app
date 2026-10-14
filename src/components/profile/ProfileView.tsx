"use client";

import React, { useEffect, useState } from "react";
import { User, FileText, FolderLock, CreditCard, Bell, HelpCircle, LogOut, ChevronRight, Fingerprint, CheckCircle2, X, Smartphone, KeyRound, Download } from "lucide-react";

interface ProfileViewProps {
  user: { id: number; fullName: string; email: string; phone?: string | null; country?: string | null; role?: string };
  onOpenApplications: () => void;
  onOpenDocuments: () => void;
  onOpenNotifications: () => void;
  onOpenSupport: () => void;
  onOpenInstall: () => void;
  onLogout: () => void;
}

const Row: React.FC<{ icon: any; tone: string; label: string; hint?: string; onClick: () => void }> = ({ icon: Icon, tone, label, hint, onClick }) => (
  <button onClick={onClick} className="w-full p-3.5 flex items-center justify-between text-left ios-press">
    <div className="flex items-center gap-3">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${tone}`}><Icon className="w-[18px] h-[18px]" /></div>
      <span className="text-[13.5px] font-bold text-slate-800">{label}</span>
    </div>
    <div className="flex items-center gap-1.5">
      {hint && <span className="text-[12px] text-slate-500 font-semibold">{hint}</span>}
      <ChevronRight className="w-4 h-4 text-slate-400" />
    </div>
  </button>
);

const Modal: React.FC<{ title: string; onClose: () => void; children: React.ReactNode }> = ({ title, onClose, children }) => (
  <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center" onClick={onClose}>
    <div onClick={(e) => e.stopPropagation()} className="lg-strong w-full max-w-md rounded-t-[34px] sm:rounded-[34px] p-5 space-y-4 max-h-[90dvh] overflow-y-auto">
      <div className="flex items-center justify-between">
        <p className="text-[18px] font-extrabold text-slate-900">{title}</p>
        <button onClick={onClose} className="w-9 h-9 rounded-full lg flex items-center justify-center" aria-label="Close"><X className="w-4 h-4" /></button>
      </div>
      {children}
    </div>
  </div>
);
const input = "lg-input w-full px-4 py-3.5 rounded-2xl text-slate-900";

export const ProfileView: React.FC<ProfileViewProps> = ({ user, onOpenApplications, onOpenDocuments, onOpenNotifications, onOpenSupport, onOpenInstall, onLogout }) => {
  const [me, setMe] = useState<any>(user);
  const [stats, setStats] = useState({ applicationsCount: 0, countriesCount: 0, documentsCount: 0, verifiedDocsCount: 0 });
  const [apps, setApps] = useState<any[]>([]);
  const [modal, setModal] = useState<null | "info" | "pay" | "password">(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [pw, setPw] = useState({ currentPassword: "", newPassword: "" });

  const load = async () => {
    const [u, a] = await Promise.all([fetch("/api/user").then((r) => r.json()), fetch("/api/applications").then((r) => r.json())]);
    if (u.success) {
      setMe(u.user);
      setStats(u.stats);
    }
    if (a.success) setApps(a.applications);
  };
  useEffect(() => {
    load();
  }, []);

  const patch = async (body: any) => {
    const r = await fetch("/api/user", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    return r.json();
  };

  const saveInfo = async () => {
    const d = await patch({ fullName: me.fullName, phone: me.phone, country: me.country });
    setMsg(d.success ? "Profile updated" : d.error || "Failed");
    if (d.success) {
      setModal(null);
      load();
    }
  };
  const savePw = async () => {
    const d = await patch(pw);
    setMsg(d.success ? "Password changed" : d.error || "Failed");
    if (d.success) {
      setModal(null);
      setPw({ currentPassword: "", newPassword: "" });
    }
  };
  const toggleBio = async () => {
    const v = !me.biometricEnabled;
    setMe({ ...me, biometricEnabled: v });
    await patch({ biometricEnabled: v });
  };

  const initials = (me.fullName || "?").split(" ").map((s: string) => s[0]).slice(0, 2).join("").toUpperCase();

  return (
    <div className="space-y-4 pb-32 pt-3 px-4 max-w-md mx-auto">
      <div className="rounded-[32px] p-5 text-white lg-dark relative overflow-hidden">
        <div className="orb w-40 h-40 bg-cyan-400/40 -top-10 -right-8" />
        <div className="relative flex items-center gap-4">
          <div className="relative">
            <div className="w-[68px] h-[68px] rounded-full bg-gradient-to-br from-sky-400 to-violet-500 flex items-center justify-center text-[24px] font-black shadow-lg">{initials}</div>
            <span className="absolute bottom-0 right-0 w-6 h-6 bg-emerald-500 rounded-full ring-2 ring-white/70 flex items-center justify-center"><CheckCircle2 className="w-4 h-4" /></span>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-[20px] font-extrabold leading-tight truncate">{me.fullName}</h2>
            </div>
            <p className="text-[12.5px] text-blue-100 truncate">{me.email}</p>
            <p className="text-[11.5px] text-cyan-200 mt-0.5">{me.country || "—"} • {me.role === "applicant" ? "Client" : me.role}</p>
          </div>
        </div>
        <div className="relative grid grid-cols-3 gap-2 mt-5 pt-4 text-center bg-white/0">
          {[
            { n: stats.applicationsCount, l: "Applications", f: onOpenApplications },
            { n: stats.countriesCount, l: "Countries", f: undefined },
            { n: stats.documentsCount, l: "Documents", f: onOpenDocuments },
          ].map((s) => (
            <button key={s.l} onClick={s.f} className="py-2 rounded-2xl bg-white/10 ios-press">
              <span className="text-[22px] font-black block leading-tight">{s.n}</span>
              <span className="text-[11px] text-blue-100 font-medium">{s.l}</span>
            </button>
          ))}
        </div>
      </div>

      {msg && <div className="rounded-2xl bg-emerald-500/15 text-emerald-800 text-[12.5px] font-semibold px-4 py-2.5" onAnimationEnd={() => setTimeout(() => setMsg(null), 2500)}>{msg}</div>}

      <section className="space-y-1.5">
        <p className="text-[10.5px] font-extrabold uppercase tracking-wider text-slate-500 px-3">Account</p>
        <div className="rounded-[26px] bg-white overflow-hidden divide-y divide-slate-200/40">
          <Row icon={User} tone="bg-blue-500/15 text-blue-600" label="Personal Information" onClick={() => setModal("info")} />
          <Row icon={FileText} tone="bg-indigo-500/15 text-indigo-600" label="My Applications" hint={`${stats.applicationsCount}`} onClick={onOpenApplications} />
          <Row icon={FolderLock} tone="bg-teal-500/15 text-teal-600" label="My Documents" hint={`${stats.verifiedDocsCount}/${stats.documentsCount} verified`} onClick={onOpenDocuments} />
          <Row icon={CreditCard} tone="bg-purple-500/15 text-purple-600" label="Payment History" onClick={() => setModal("pay")} />
        </div>
      </section>

      <section className="space-y-1.5">
        <p className="text-[10.5px] font-extrabold uppercase tracking-wider text-slate-500 px-3">Security & App</p>
        <div className="rounded-[26px] bg-white overflow-hidden divide-y divide-slate-200/40">
          <div className="p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/15 text-cyan-600 flex items-center justify-center"><Fingerprint className="w-[18px] h-[18px]" /></div>
              <div>
                <p className="text-[13.5px] font-bold text-slate-800">Biometric unlock</p>
                <p className="text-[11px] text-slate-500">Preference saved — used by the native app</p>
              </div>
            </div>
            <button onClick={toggleBio} aria-label="Toggle biometric" className={`w-12 h-7 rounded-full p-0.5 transition-colors ${me.biometricEnabled ? "bg-emerald-500" : "bg-slate-300"}`}>
              <div className={`w-6 h-6 rounded-full bg-white shadow-md transition-transform ${me.biometricEnabled ? "translate-x-5" : ""}`} />
            </button>
          </div>
          <Row icon={KeyRound} tone="bg-amber-500/15 text-amber-600" label="Change Password" onClick={() => setModal("password")} />
          <Row icon={Bell} tone="bg-rose-500/15 text-rose-600" label="Notifications" onClick={onOpenNotifications} />
          <Row icon={HelpCircle} tone="bg-sky-500/15 text-sky-600" label="Support & Visa Desk" onClick={onOpenSupport} />
          <Row icon={Smartphone} tone="bg-slate-500/15 text-slate-600" label="Install on Home Screen" onClick={onOpenInstall} />
        </div>
      </section>

      <button onClick={onLogout} className="w-full py-4 rounded-[24px] bg-white text-rose-600 font-bold text-[14px] flex items-center justify-center gap-2 ios-press">
        <LogOut className="w-4 h-4" /> Sign Out
      </button>

      {modal === "info" && (
        <Modal title="Personal Information" onClose={() => setModal(null)}>
          <input className={input} value={me.fullName || ""} onChange={(e) => setMe({ ...me, fullName: e.target.value })} placeholder="Full name" />
          <input className={`${input} opacity-60`} value={me.email} disabled />
          <input className={input} value={me.phone || ""} onChange={(e) => setMe({ ...me, phone: e.target.value })} placeholder="Phone" />
          <input className={input} value={me.country || ""} onChange={(e) => setMe({ ...me, country: e.target.value })} placeholder="Home country" />
          <button onClick={saveInfo} className="w-full py-4 rounded-full lg-btn font-bold ios-press">Save changes</button>
        </Modal>
      )}

      {modal === "password" && (
        <Modal title="Change Password" onClose={() => setModal(null)}>
          <input type="password" className={input} value={pw.currentPassword} onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })} placeholder="Current password" />
          <input type="password" className={input} value={pw.newPassword} onChange={(e) => setPw({ ...pw, newPassword: e.target.value })} placeholder="New password (8+ characters)" />
          <button onClick={savePw} className="w-full py-4 rounded-full lg-btn font-bold ios-press">Update password</button>
        </Modal>
      )}

      {modal === "pay" && (
        <Modal title="Payment History" onClose={() => setModal(null)}>
          {apps.length === 0 && <p className="text-[13px] text-slate-500">No payments yet — they appear here once you submit an application.</p>}
          {apps.map((a) => (
            <div key={a.id} className="lg rounded-2xl p-3.5 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[13px] font-bold text-slate-900 truncate">{a.country} {a.visaType}</p>
                <p className="text-[11px] text-slate-500 font-mono">{a.applicationNumber} • {new Date(a.submissionDate).toLocaleDateString()}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-[14px] font-extrabold text-blue-600">${a.feeAmount}</p>
                <p className={`text-[10.5px] font-bold ${a.paymentStatus === "paid" ? "text-emerald-600" : "text-amber-600"}`}>{a.paymentStatus}</p>
              </div>
            </div>
          ))}
        </Modal>
      )}
    </div>
  );
};
