"use client";

import React, { useEffect, useState } from "react";
import { Share, PlusSquare, X, Globe, MoreVertical, Download } from "lucide-react";

interface PwaInstallSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PwaInstallSheet: React.FC<PwaInstallSheetProps> = ({ isOpen, onClose }) => {
  const [deferred, setDeferred] = useState<any>(null);
  const [installed, setInstalled] = useState(false);
  const [platform, setPlatform] = useState<"ios" | "android" | "other">("other");

  useEffect(() => {
    const ua = navigator.userAgent;
    setPlatform(/iphone|ipad|ipod/i.test(ua) ? "ios" : /android/i.test(ua) ? "android" : "other");
    setInstalled(window.matchMedia("(display-mode: standalone)").matches || (navigator as any).standalone === true);
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferred(e);
    };
    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", () => setInstalled(true));
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (!isOpen) return null;

  const install = async () => {
    if (!deferred) return;
    deferred.prompt();
    await deferred.userChoice;
    setDeferred(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="lg-strong w-full max-w-md rounded-t-[36px] sm:rounded-[36px] p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl lg-btn flex items-center justify-center"><Globe className="w-6 h-6" /></div>
            <div>
              <h3 className="font-extrabold text-[17px] text-slate-900 leading-tight">Add to Home Screen</h3>
              <p className="text-[11.5px] text-slate-500">World Vision runs full-screen like a native app</p>
            </div>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-full lg flex items-center justify-center" aria-label="Close"><X className="w-4 h-4" /></button>
        </div>

        {installed ? (
          <p className="text-[13px] font-semibold text-emerald-700 bg-emerald-500/15 rounded-2xl px-4 py-3">You're already running the installed app. 🎉</p>
        ) : deferred ? (
          <button onClick={install} className="w-full py-4 rounded-full lg-btn font-bold flex items-center justify-center gap-2 ios-press"><Download className="w-4 h-4" /> Install app</button>
        ) : platform === "ios" ? (
          <div className="space-y-2.5 text-[13px]">
            {[
              { n: 1, t: "Tap Share", d: <>Tap <Share className="w-3.5 h-3.5 inline text-blue-600" /> in Safari's toolbar.</> },
              { n: 2, t: "Add to Home Screen", d: <>Scroll and choose <PlusSquare className="w-3.5 h-3.5 inline text-slate-700" /> “Add to Home Screen”.</> },
              { n: 3, t: "Tap Add", d: "World Vision appears on your Home Screen and opens full-screen." },
            ].map((s) => (
              <div key={s.n} className="lg rounded-2xl p-3.5 flex items-start gap-3">
                <div className="w-7 h-7 rounded-full lg-btn flex items-center justify-center font-bold text-xs flex-shrink-0">{s.n}</div>
                <div><p className="font-bold text-slate-900">{s.t}</p><p className="text-slate-600 text-[12px] mt-0.5">{s.d}</p></div>
              </div>
            ))}
            <p className="text-[11px] text-slate-500 px-1">On iOS this must be done from Safari.</p>
          </div>
        ) : (
          <div className="space-y-2.5 text-[13px]">
            <div className="lg rounded-2xl p-3.5 flex items-start gap-3">
              <div className="w-7 h-7 rounded-full lg-btn flex items-center justify-center font-bold text-xs flex-shrink-0">1</div>
              <div><p className="font-bold text-slate-900">Open the browser menu</p><p className="text-slate-600 text-[12px] mt-0.5">Tap <MoreVertical className="w-3.5 h-3.5 inline" /> in Chrome.</p></div>
            </div>
            <div className="lg rounded-2xl p-3.5 flex items-start gap-3">
              <div className="w-7 h-7 rounded-full lg-btn flex items-center justify-center font-bold text-xs flex-shrink-0">2</div>
              <div><p className="font-bold text-slate-900">Install app / Add to Home screen</p><p className="text-slate-600 text-[12px] mt-0.5">Android installs it as a real app icon (WebAPK) with offline support.</p></div>
            </div>
          </div>
        )}
        <button onClick={onClose} className="w-full py-3.5 rounded-full lg font-bold text-[13.5px] text-slate-700 ios-press">Close</button>
      </div>
    </div>
  );
};
