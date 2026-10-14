"use client";

import React, { useCallback, useEffect, useState } from "react";
import { AuthScreen, AuthedUser } from "@/components/auth/AuthScreen";
import { IosDeviceShell } from "@/components/layout/IosDeviceShell";
import { StaffConsole } from "@/components/staff/StaffConsole";

export const AppRoot: React.FC = () => {
  const [user, setUser] = useState<AuthedUser | null | undefined>(undefined);
  const [staffView, setStaffView] = useState(true);

  useEffect(() => {
    fetch("/api/auth")
      .then((r) => r.json())
      .then((d) => setUser(d.user ?? null))
      .catch(() => setUser(null));
  }, []);

  const logout = useCallback(async () => {
    await fetch("/api/auth", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "logout" }) });
    setUser(null);
    setStaffView(true);
  }, []);

  if (user === undefined) {
    return (
      <div className="app-height w-full flex items-center justify-center">
        <div className="w-16 h-16 rounded-full lg flex items-center justify-center animate-pulse-gentle">
          <svg viewBox="0 0 24 24" className="w-9 h-9 text-blue-600" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            <path d="M2 12h20" />
          </svg>
        </div>
      </div>
    );
  }

  if (!user) return <AuthScreen onAuthed={(u) => { setUser(u); setStaffView(true); }} />;

  const isStaff = user.role === "admin" || user.role === "agent";
  if (isStaff && staffView) return <StaffConsole user={user} onLogout={logout} onOpenClientApp={() => setStaffView(false)} />;
  return <IosDeviceShell user={user} onLogout={logout} onOpenStaff={isStaff ? () => setStaffView(true) : undefined} />;
};
