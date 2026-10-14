"use client";

import React, { useState, useEffect } from "react";
import {
  Bell,
  CheckCircle2,
  FileCheck2,
  Briefcase,
  CreditCard,
  Calendar,
  X,
  CheckCheck,
} from "lucide-react";

interface NotificationItem {
  id: number;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

interface NotificationSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectApplication?: () => void;
  onSelectDocument?: () => void;
}

export const NotificationSheet: React.FC<NotificationSheetProps> = ({
  isOpen,
  onClose,
  onSelectApplication,
  onSelectDocument,
}) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const fetchNotifs = async () => {
    try {
      const res = await fetch("/api/notifications");
      const data = await res.json();
      if (data.success && data.notifications) {
        setNotifications(data.notifications);
      }
    } catch (e) {}
  };

  useEffect(() => {
    if (isOpen) fetchNotifs();
  }, [isOpen]);

  if (!isOpen) return null;

  const markAllRead = async () => {
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAllRead: true }),
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (e) {}
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "application":
        return { icon: FileCheck2, color: "bg-blue-500 text-white" };
      case "document":
        return { icon: CheckCircle2, color: "bg-emerald-500 text-white" };
      case "job":
        return { icon: Briefcase, color: "bg-purple-500 text-white" };
      case "consultation":
        return { icon: Calendar, color: "bg-amber-500 text-white" };
      case "payment":
        return { icon: CreditCard, color: "bg-indigo-500 text-white" };
      default:
        return { icon: Bell, color: "bg-blue-500 text-white" };
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-t-[32px] sm:rounded-[32px] p-5 shadow-2xl space-y-4 max-h-[85vh] flex flex-col border border-white/60 dark:border-slate-800">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800 flex-shrink-0">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Notifications
            </h3>
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">
              {notifications.filter((n) => !n.isRead).length} New
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={markAllRead}
              className="text-xs font-semibold text-blue-600 dark:text-cyan-400 flex items-center gap-1 hover:underline"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Mark all read</span>
            </button>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
          {notifications.map((n) => {
            const { icon: Icon, color } = getIcon(n.type);
            return (
              <div
                key={n.id}
                onClick={() => {
                  if (n.type === "application" && onSelectApplication) onSelectApplication();
                  if (n.type === "document" && onSelectDocument) onSelectDocument();
                }}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                  !n.isRead
                    ? "bg-blue-50/50 dark:bg-blue-950/20 border-blue-200/60 dark:border-blue-900/40"
                    : "bg-slate-50/60 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${color} shadow-xs`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                        {n.title}
                      </h4>
                      {!n.isRead && (
                        <span className="w-2 h-2 rounded-full bg-blue-600 flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                      {n.message}
                    </p>
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      {new Date(n.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
