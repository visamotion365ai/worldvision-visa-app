"use client";

import React from "react";
import { Home, Globe2, Briefcase, FileText, User } from "lucide-react";

export type NavTab = "today" | "countries" | "services" | "applications" | "profile";

interface BottomTabBarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  applicationsBadge?: number;
}

export const BottomTabBar: React.FC<BottomTabBarProps> = ({
  currentTab,
  onSelectTab,
  applicationsBadge = 1,
}) => {
  const tabs = [
    {
      id: "today" as NavTab,
      label: "Today",
      icon: Home,
    },
    {
      id: "countries" as NavTab,
      label: "Countries",
      icon: Globe2,
    },
    {
      id: "services" as NavTab,
      label: "Services",
      icon: Briefcase,
    },
    {
      id: "applications" as NavTab,
      label: "Applications",
      icon: FileText,
      badge: applicationsBadge,
    },
    {
      id: "profile" as NavTab,
      label: "Profile",
      icon: User,
    },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 max-w-md mx-auto pointer-events-auto"
      style={{ paddingBottom: "max(8px, env(safe-area-inset-bottom))" }}
    >
      <div className="mx-4 mb-2 px-2 py-2 rounded-[28px] bg-white/95 backdrop-blur-2xl border border-slate-200/70 shadow-[0_10px_35px_-5px_rgba(15,34,70,0.12)] flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all duration-150 ios-press ${
                isActive
                  ? "text-blue-600 font-semibold"
                  : "text-slate-400 font-medium hover:text-slate-700"
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-[21px] h-[21px] transition-transform duration-150 ${
                    isActive ? "scale-105 stroke-[2.3]" : "stroke-[1.8]"
                  }`}
                />
                {tab.badge && tab.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2 min-w-[16px] h-[16px] px-1 bg-rose-500 text-white text-[9.5px] font-bold rounded-full flex items-center justify-center ring-2 ring-white">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight leading-none">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
