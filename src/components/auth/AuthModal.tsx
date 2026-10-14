"use client";

import React, { useState } from "react";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowUpRight,
  ChevronLeft,
  Briefcase,
  GraduationCap,
  Plane,
  Users2,
} from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Form Fields
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSuccess();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#f4f7fc] overflow-y-auto flex flex-col justify-between">
      <div className="w-full max-w-md mx-auto min-h-screen flex flex-col justify-between px-6 pt-3 pb-6 relative">
        {/* Top Controls matching Screenshot 3 */}
        <div className="flex items-center justify-between">
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white shadow-xs border border-slate-200/80 flex items-center justify-center text-slate-800 hover:bg-slate-50 ios-press"
          >
            <ChevronLeft className="w-6 h-6 -ml-0.5" />
          </button>
        </div>

        {/* Hero Illustration: Clouds, Skyline & Airplane matching Screenshot 3 */}
        <div className="relative pt-1 pb-4 text-center flex flex-col items-center">
          {/* Subtle flying airplane over skyline backdrop */}
          <div className="w-full h-28 relative overflow-hidden mb-1 rounded-3xl">
            <img
              src="https://images.pexels.com/photos/32341623/pexels-photo-32341623.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=300&w=600"
              alt="City skyline with airplane"
              className="w-full h-full object-cover opacity-30"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#f4f7fc] via-transparent to-transparent" />
            <Plane className="w-7 h-7 text-blue-600 absolute top-3 right-10 rotate-[-15deg] animate-float drop-shadow-sm" />
          </div>

          {/* Logo Globe Icon matching Screenshot 3 */}
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-blue-600 via-blue-500 to-sky-400 p-0.5 shadow-md shadow-blue-500/20 relative -mt-12 flex items-center justify-center">
            <div className="w-full h-full rounded-full bg-blue-600 flex items-center justify-center overflow-hidden">
              <svg
                viewBox="0 0 24 24"
                className="w-9 h-9 text-white stroke-[1.8]"
                fill="none"
                stroke="currentColor"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                <path d="M2 12h20" />
              </svg>
            </div>
          </div>

          {/* Title & Brand matching Screenshot 3 */}
          <h2 className="text-[20px] font-black text-slate-900 mt-2.5 tracking-tight leading-snug">
            World Vision Consultancy
          </h2>
          <p className="text-[11.5px] text-blue-600 font-semibold leading-tight">
            ওয়ার্ল্ড ভিশন কনসালটেন্সী
          </p>
          <p className="text-[11.5px] text-slate-500 font-medium mt-0.5">
            Your Global Future, Our Priority
          </p>

          <h3 className="text-[22px] font-extrabold text-slate-900 mt-4 leading-tight">
            Welcome Back
          </h3>
          <p className="text-[12.5px] text-slate-500 mt-0.5">
            Sign in to continue your journey
          </p>

          {/* Segmented Control Pill matching Screenshot 3 */}
          <div className="w-full max-w-xs mt-4 p-1 rounded-full bg-slate-200/80 flex items-center">
            <button
              onClick={() => setAuthMode("signin")}
              className={`flex-1 py-2 rounded-full text-xs font-bold transition-all ${
                authMode === "signin"
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm"
                  : "text-slate-600"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setAuthMode("signup")}
              className={`flex-1 py-2 rounded-full text-xs font-bold transition-all ${
                authMode === "signup"
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm"
                  : "text-slate-600"
              }`}
            >
              Create Account
            </button>
          </div>
        </div>

        {/* Form Body matching Screenshot 3 */}
        <div className="space-y-3.5">
          <form onSubmit={handleSubmit} className="space-y-3">
            {authMode === "signup" && (
              <div>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Full Legal Name"
                  className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            )}

            {/* Email or Phone Input matching Screenshot 3 */}
            <div className="relative">
              <input
                type="text"
                required
                value={emailOrPhone}
                onChange={(e) => setEmailOrPhone(e.target.value)}
                placeholder="Email or Phone Number"
                className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-white border border-slate-200 text-xs font-medium placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 outline-none shadow-xs"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-4 top-4" />
            </div>

            {/* Password Input matching Screenshot 3 */}
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full pl-11 pr-11 py-3.5 rounded-2xl bg-white border border-slate-200 text-xs font-medium placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 outline-none shadow-xs"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-4 top-4" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="w-8 h-8 absolute right-2 top-2.5 flex items-center justify-center text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Remember Me & Forgot Password matching Screenshot 3 */}
            <div className="flex items-center justify-between text-xs pt-0.5">
              <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="text-[12px] font-medium">Remember me</span>
              </label>

              <button
                type="button"
                onClick={() => alert("Password reset link sent to your phone/email.")}
                className="text-[12px] text-blue-600 font-semibold hover:underline"
              >
                Forgot password?
              </button>
            </div>

            {/* Primary Action Button: "Sign In ↗" matching Screenshot 3 */}
            <button
              type="submit"
              className="w-full py-3.5 rounded-full bg-gradient-to-r from-[#6b38fb] via-[#4d55f5] to-[#2575fc] text-white font-bold text-sm shadow-md shadow-blue-500/25 flex items-center justify-center gap-2 hover:opacity-95 active:scale-95 transition-all ios-press mt-2"
            >
              <span>{authMode === "signin" ? "Sign In" : "Create Account"}</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </form>

          {/* Social Divider: "Or continue with" matching Screenshot 3 */}
          <div className="relative py-1 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <span className="relative px-3 bg-[#f4f7fc] text-[11px] text-slate-400 font-medium">
              Or continue with
            </span>
          </div>

          {/* Apple & Google Buttons matching Screenshot 3 */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={onSuccess}
              className="py-2.5 px-4 rounded-2xl bg-white border border-slate-200 text-xs font-bold text-slate-800 flex items-center justify-center gap-2 hover:bg-slate-50 shadow-xs ios-press"
            >
              <span className="text-base"></span>
              <span>Apple</span>
            </button>
            <button
              type="button"
              onClick={onSuccess}
              className="py-2.5 px-4 rounded-2xl bg-white border border-slate-200 text-xs font-bold text-slate-800 flex items-center justify-center gap-2 hover:bg-slate-50 shadow-xs ios-press"
            >
              <span className="text-base font-bold text-rose-500">G</span>
              <span>Google</span>
            </button>
          </div>
        </div>

        {/* Footer: Trusted by Global Dreamers + 4 icons matching Screenshot 3 */}
        <div className="mt-6 pt-4 text-center space-y-3 border-t border-slate-200/80">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
              Trusted by Global Dreamers
            </span>
            <div className="flex items-center justify-center gap-6 mt-2.5 text-slate-600 text-xs">
              <div className="flex flex-col items-center gap-1">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                  <Briefcase className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-medium">Work</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-medium">Study</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="w-8 h-8 rounded-full bg-sky-100 flex items-center justify-center text-sky-600">
                  <Plane className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-medium">Visit</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                  <Users2 className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-medium">Recruitment</span>
              </div>
            </div>
          </div>

          <p className="text-[10px] text-slate-400 tracking-wider">
            Secure • Fast • Global
          </p>
        </div>
      </div>
    </div>
  );
};
