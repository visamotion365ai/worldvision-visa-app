"use client";

import React, { useState } from "react";
import { Mail, Lock, Eye, EyeOff, ArrowUpRight, ChevronLeft, Briefcase, GraduationCap, Plane, Users2, User, Phone, Globe2, ShieldCheck, Sparkles } from "lucide-react";

export interface AuthedUser {
  id: number;
  fullName: string;
  email: string;
  phone?: string | null;
  country?: string | null;
  role: "applicant" | "agent" | "admin" | string;
  [k: string]: any;
}

interface Props {
  onAuthed: (user: AuthedUser) => void;
  initialMode?: "welcome" | "signin" | "signup";
}

const Logo = ({ size = 64 }: { size?: number }) => (
  <div
    className="rounded-full lg flex items-center justify-center"
    style={{ width: size, height: size, background: "linear-gradient(145deg,#60a5fa,#2563eb 55%,#7c3aed)" }}
  >
    <svg viewBox="0 0 24 24" style={{ width: size * 0.58, height: size * 0.58 }} className="text-white" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      <path d="M2 12h20" />
    </svg>
  </div>
);

export const AuthScreen: React.FC<Props> = ({ onAuthed, initialMode = "welcome" }) => {
  const [mode, setMode] = useState<"welcome" | "signin" | "signup" | "forgot">(initialMode);
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("Bangladesh");
  const [terms, setTerms] = useState(false);

  const go = (m: typeof mode) => {
    setMode(m);
    setError(null);
    setInfo(null);
  };

  const call = async (payload: any) => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/auth", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (!data.success) {
        setError(data.error || "Something went wrong");
        return null;
      }
      return data;
    } catch {
      setError("Network problem. Check your connection and try again.");
      return null;
    } finally {
      setBusy(false);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "signin") {
      const d = await call({ action: "login", identifier, password, remember });
      if (d?.user) onAuthed(d.user);
    } else if (mode === "signup") {
      if (!terms) return setError("Please accept the Terms & Privacy Policy");
      const d = await call({ action: "signup", fullName, email, phone, password, country, remember });
      if (d?.user) onAuthed(d.user);
    } else if (mode === "forgot") {
      const d = await call({ action: "forgot", email: identifier });
      if (d) setInfo(d.message);
    }
  };

  const social = (name: string) => setInfo(`${name} sign-in needs ${name} developer credentials on the server. Please use email for now.`);

  /* -------------------- WELCOME / GET STARTED -------------------- */
  if (mode === "welcome") {
    return (
      <div className="app-height w-full max-w-md mx-auto relative overflow-hidden flex flex-col page-enter">
        <img
          src="https://images.pexels.com/photos/32341623/pexels-photo-32341623.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1400&w=900"
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-sky-200/30 via-white/50 to-[#e9eefb]" />
        <div className="orb w-56 h-56 bg-cyan-300/60 -top-10 -left-10" />
        <div className="orb w-64 h-64 bg-fuchsia-300/50 top-1/3 -right-20" style={{ animationDelay: "2s" }} />

        <div className="relative z-10 flex-1 flex flex-col justify-between px-6 pt-safe pb-safe">
          <div className="pt-10 flex flex-col items-center text-center">
            <Logo size={84} />
            <h1 className="mt-5 text-[30px] font-extrabold tracking-tight text-slate-900 leading-tight">World Vision Consultancy</h1>
            <p className="text-[13px] font-semibold text-blue-600 mt-1">ওয়ার্ল্ড ভিশন কনসালটেন্সী</p>
            <p className="text-[13px] text-slate-600 mt-1">Global Worker Recruiter &amp; Visa Agency</p>
          </div>

          <div className="space-y-3 my-6">
            {[
              { icon: Globe2, t: "Six licensed destinations", d: "Australia • Singapore • Serbia • Turkey • Malaysia • Russia" },
              { icon: ShieldCheck, t: "Track every step", d: "Live application status and verified documents" },
              { icon: Sparkles, t: "Real consultants + AI", d: "Get answers and updates around the clock" },
            ].map((f) => (
              <div key={f.t} className="lg rounded-[22px] p-3.5 flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-2xl lg-btn flex items-center justify-center flex-shrink-0">
                  <f.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[14px] font-bold text-slate-900 leading-tight">{f.t}</p>
                  <p className="text-[11.5px] text-slate-600 mt-0.5">{f.d}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-2.5 pb-6">
            <button onClick={() => go("signup")} className="w-full py-4 rounded-full lg-btn font-bold text-[15px] flex items-center justify-center gap-2 ios-press">
              Get Started <ArrowUpRight className="w-4 h-4" />
            </button>
            <button onClick={() => go("signin")} className="w-full py-3.5 rounded-full lg text-slate-800 font-bold text-[14px] ios-press">
              I already have an account
            </button>
            <p className="text-center text-[10.5px] text-slate-500 pt-1">Secure • Fast • Global</p>
          </div>
        </div>
      </div>
    );
  }

  /* -------------------- SIGN IN / SIGN UP / FORGOT -------------------- */
  return (
    <div className="app-height w-full max-w-md mx-auto overflow-y-auto smooth-scroll no-scrollbar relative page-enter">
      <div className="orb w-52 h-52 bg-sky-300/60 -top-12 -right-10" />
      <div className="orb w-48 h-48 bg-violet-300/50 bottom-20 -left-16" style={{ animationDelay: "3s" }} />
      <div className="relative z-10 px-6 pt-safe pb-safe min-h-full flex flex-col">
        <div className="pt-4">
          <button onClick={() => (mode === "forgot" ? go("signin") : go("welcome"))} className="w-10 h-10 rounded-full lg flex items-center justify-center ios-press" aria-label="Back">
            <ChevronLeft className="w-6 h-6 -ml-0.5 text-slate-800" />
          </button>
        </div>

        <div className="flex flex-col items-center text-center mt-2">
          <Logo size={64} />
          <h2 className="text-[20px] font-extrabold text-slate-900 mt-3 tracking-tight">World Vision Consultancy</h2>
          <p className="text-[11.5px] text-blue-600 font-semibold">ওয়ার্ল্ড ভিশন কনসালটেন্সী</p>
          <p className="text-[11.5px] text-slate-500">Your Global Future, Our Priority</p>
          <h3 className="text-[26px] font-extrabold text-slate-900 mt-4 leading-tight">
            {mode === "signin" ? "Welcome Back" : mode === "signup" ? "Create Account" : "Reset Password"}
          </h3>
          <p className="text-[13px] text-slate-500 mt-0.5">
            {mode === "signin" ? "Sign in to continue your journey" : mode === "signup" ? "Start your global journey in a minute" : "Enter your email and our desk will help you"}
          </p>

          {mode !== "forgot" && (
            <div className="w-full max-w-xs mt-4 p-1 rounded-full lg flex">
              {(["signin", "signup"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => go(m)}
                  className={`flex-1 py-2.5 rounded-full text-[13px] font-bold transition-all ${mode === m ? "lg-btn" : "text-slate-600"}`}
                >
                  {m === "signin" ? "Sign In" : "Create Account"}
                </button>
              ))}
            </div>
          )}
        </div>

        <form onSubmit={submit} className="mt-5 space-y-3">
          {mode === "signup" && (
            <>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-4 top-[17px]" />
                <input required value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Full name" autoComplete="name" className="lg-input w-full pl-11 pr-4 py-3.5 rounded-2xl text-slate-900 placeholder:text-slate-400" />
              </div>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-4 top-[17px]" />
                <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" autoComplete="email" className="lg-input w-full pl-11 pr-4 py-3.5 rounded-2xl text-slate-900 placeholder:text-slate-400" />
              </div>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-4 top-[17px]" />
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone (with country code)" autoComplete="tel" className="lg-input w-full pl-11 pr-4 py-3.5 rounded-2xl text-slate-900 placeholder:text-slate-400" />
              </div>
              <div className="relative">
                <Globe2 className="w-4 h-4 text-slate-400 absolute left-4 top-[17px]" />
                <select value={country} onChange={(e) => setCountry(e.target.value)} className="lg-input w-full pl-11 pr-4 py-3.5 rounded-2xl text-slate-900 appearance-none">
                  {["Bangladesh", "India", "Nepal", "Sri Lanka", "Pakistan", "Philippines", "Indonesia", "Other"].map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>
            </>
          )}

          {(mode === "signin" || mode === "forgot") && (
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-4 top-[17px]" />
              <input required value={identifier} onChange={(e) => setIdentifier(e.target.value)} placeholder={mode === "signin" ? "Email or Phone Number" : "Your account email"} autoComplete="username" className="lg-input w-full pl-11 pr-4 py-3.5 rounded-2xl text-slate-900 placeholder:text-slate-400" />
            </div>
          )}

          {mode !== "forgot" && (
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-4 top-[17px]" />
              <input
                required
                type={showPw ? "text" : "password"}
                minLength={mode === "signup" ? 8 : undefined}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === "signup" ? "Password (8+ characters)" : "Password"}
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
                className="lg-input w-full pl-11 pr-12 py-3.5 rounded-2xl text-slate-900 placeholder:text-slate-400"
              />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-2 top-2 w-9 h-9 flex items-center justify-center text-slate-400" aria-label="Toggle password">
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          )}

          {mode === "signin" && (
            <div className="flex items-center justify-between pt-0.5">
              <label className="flex items-center gap-2 text-[12.5px] font-medium text-slate-600 select-none">
                <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="w-4 h-4 accent-blue-600" />
                Remember me
              </label>
              <button type="button" onClick={() => go("forgot")} className="text-[12.5px] text-blue-600 font-semibold">
                Forgot password?
              </button>
            </div>
          )}

          {mode === "signup" && (
            <label className="flex items-start gap-2 text-[12px] text-slate-600 select-none">
              <input type="checkbox" checked={terms} onChange={(e) => setTerms(e.target.checked)} className="w-4 h-4 mt-0.5 accent-blue-600" />
              <span>
                I agree to the <b className="text-blue-600">Terms</b> &amp; <b className="text-blue-600">Privacy Policy</b>
              </span>
            </label>
          )}

          {error && <div className="rounded-2xl bg-rose-500/15 text-rose-700 text-[12.5px] font-semibold px-4 py-3">{error}</div>}
          {info && <div className="rounded-2xl bg-sky-500/15 text-sky-800 text-[12.5px] font-semibold px-4 py-3">{info}</div>}

          <button type="submit" disabled={busy} className="w-full py-4 rounded-full lg-btn font-bold text-[15px] flex items-center justify-center gap-2 ios-press disabled:opacity-60">
            <span>{busy ? "Please wait…" : mode === "signin" ? "Sign In" : mode === "signup" ? "Create Account" : "Send Request"}</span>
            {!busy && <ArrowUpRight className="w-4 h-4" />}
          </button>
        </form>

        {mode !== "forgot" && (
          <>
            <div className="relative my-4 text-center">
              <div className="absolute inset-x-0 top-1/2 h-px bg-slate-300/50" />
              <span className="relative px-3 text-[11.5px] text-slate-500 font-medium rounded-full lg">Or continue with</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button type="button" onClick={() => social("Apple")} className="py-3 rounded-2xl lg text-[13.5px] font-bold text-slate-800 flex items-center justify-center gap-2 ios-press">
                <span className="text-lg leading-none"></span> Apple
              </button>
              <button type="button" onClick={() => social("Google")} className="py-3 rounded-2xl lg text-[13.5px] font-bold text-slate-800 flex items-center justify-center gap-2 ios-press">
                <span className="text-lg leading-none font-black text-rose-500">G</span> Google
              </button>
            </div>
          </>
        )}

        <div className="mt-auto pt-7 pb-5 text-center">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Trusted by Global Dreamers</p>
          <div className="flex items-center justify-center gap-6 mt-3">
            {[
              { i: Briefcase, l: "Work" },
              { i: GraduationCap, l: "Study" },
              { i: Plane, l: "Visit" },
              { i: Users2, l: "Recruitment" },
            ].map(({ i: Icon, l }) => (
              <div key={l} className="flex flex-col items-center gap-1">
                <div className="w-9 h-9 rounded-full lg flex items-center justify-center text-blue-600">
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-medium text-slate-600">{l}</span>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-slate-400 tracking-wider mt-3">Secure • Fast • Global</p>
        </div>
      </div>
    </div>
  );
};
