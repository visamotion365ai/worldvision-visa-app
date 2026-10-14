"use client";

import React from "react";
import { Bell } from "lucide-react";

interface BrandHeaderProps {
  onOpenNotifications: () => void;
  onOpenSearch?: () => void;
  onOpenProfile?: () => void;
  unreadCount?: number;
}

export const BrandHeader: React.FC<BrandHeaderProps> = ({
  onOpenNotifications,
  unreadCount = 1,
}) => {
  return (
    <header className="sticky top-0 z-30 w-full px-4 pt-3 pb-2.5 bg-white/95 backdrop-blur-xl border-b border-slate-100/90 transition-all">
      <div className="flex items-center justify-between">
        {/* Brand identity: Globe logo + titles matching screenshot 1 */}
        <div className="flex items-center gap-2.5">
          {/* Blue Globe Icon matching screenshot */}
          <div className="relative w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 via-blue-500 to-sky-400 p-0.5 shadow-sm flex-shrink-0 flex items-center justify-center">
            <div className="w-full h-full rounded-full bg-blue-600 flex items-center justify-center relative overflow-hidden">
              <svg
                viewBox="0 0 24 24"
                className="w-6 h-6 text-white stroke-[1.8]"
                fill="none"
                stroke="currentColor"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                <path d="M2 12h20" />
              </svg>
            </div>
          </div>

          <div className="flex flex-col">
            <h1 className="text-[17px] font-bold text-slate-900 tracking-tight leading-snug">
              World Vision Consultancy
            </h1>
            <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium leading-none">
              <span className="text-blue-600 font-semibold">ওয়ার্ল্ড ভিশন</span>
              <span>•</span>
              <span>Visa</span>
              <span>•</span>
              <span>Recruitment</span>
              <span>•</span>
              <span>Global Opportunities</span>
            </div>
          </div>
        </div>

        {/* Notification Bell with red badge '1' matching screenshot */}
        <button
          onClick={onOpenNotifications}
          className="relative w-9 h-9 rounded-full bg-slate-50 border border-slate-200/70 flex items-center justify-center text-slate-700 hover:bg-slate-100 active:scale-95 transition-all ios-press"
          aria-label="Notifications"
        >
          <Bell className="w-[18px] h-[18px]" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center ring-2 ring-white">
              {unreadCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
};
