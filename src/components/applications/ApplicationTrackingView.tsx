"use client";

import React, { useState, useEffect } from "react";
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  Sparkles,
  Download,
  Calendar,
  Building,
  RefreshCw,
  Plus,
} from "lucide-react";

interface ApplicationItem {
  id: number;
  applicationNumber: string;
  country: string;
  visaType: string;
  status: string;
  progressPct: number;
  submissionDate: string;
  feeAmount: number;
  paymentStatus: string;
  nextAction?: string;
}

interface ApplicationTrackingViewProps {
  onStartNewApplication: () => void;
  user?: { fullName: string; email: string; phone?: string | null };
}

export const ApplicationTrackingView: React.FC<ApplicationTrackingViewProps> = ({
  onStartNewApplication,
  user,
}) => {
  const downloadDossier = async (app: any) => {
    let docs: any[] = [];
    try {
      const d = await (await fetch(`/api/documents?applicationId=${app.id}`)).json();
      const all = await (await fetch("/api/documents")).json();
      docs = d.success ? d.documents : [];
      // include the client's other uploads so the checklist reflects everything on file
      if (all.success) docs = [...docs, ...all.documents.filter((x: any) => !docs.some((y) => y.id === x.id))];
    } catch {}
    const { generateApplicationDossierPdf } = await import("@/lib/pdfGenerator");
    generateApplicationDossierPdf(app, { fullName: user?.fullName || "Applicant", email: user?.email, phone: user?.phone }, docs);
  };
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [expandedAppId, setExpandedAppId] = useState<number | null>(null);

  const countryFlags: Record<string, string> = {
    Australia: "🇦🇺",
    Singapore: "🇸🇬",
    Serbia: "🇷🇸",
    Turkey: "🇹🇷",
    Malaysia: "🇲🇾",
    Russia: "🇷🇺",
  };

  const timelineStages = [
    { id: "submitted", title: "Application Submitted" },
    { id: "verified", title: "Documents Verified" },
    { id: "processing", title: "Processing" },
    { id: "embassy", title: "Embassy Review" },
    { id: "decision", title: "Decision" },
    { id: "completed", title: "Completed" },
  ];

  const fetchApps = async () => {
    setIsLoading(true);
    try {
      const url =
        selectedFilter === "all"
          ? "/api/applications"
          : `/api/applications?status=${selectedFilter}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success && data.applications) {
        setApplications(data.applications);
        if (data.applications.length > 0 && expandedAppId === null) {
          setExpandedAppId(data.applications[0].id);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApps();
  }, [selectedFilter]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "under_review":
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300 text-[11px] font-bold">
            Under Review
          </span>
        );
      case "documents_verified":
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300 text-[11px] font-bold">
            Documents Verified
          </span>
        );
      case "processing":
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300 text-[11px] font-bold">
            Processing
          </span>
        );
      case "embassy_review":
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300 text-[11px] font-bold">
            Embassy Review
          </span>
        );
      case "approved":
      case "completed":
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300 text-[11px] font-bold">
            Approved
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-bold">
            {status}
          </span>
        );
    }
  };

  const filters = [
    { id: "all", label: "All" },
    { id: "in_progress", label: "In Progress" },
    { id: "submitted", label: "Submitted" },
    { id: "approved", label: "Approved" },
    { id: "completed", label: "Completed" },
  ];

  return (
    <div className="space-y-4 pb-28 pt-2">
      {/* Top Header */}
      <div className="px-4 space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-cyan-400">
              Real-time Consular Sync
            </span>
            <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
              My Applications
            </h2>
          </div>
          <button
            onClick={onStartNewApplication}
            className="px-3.5 py-1.5 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm hover:bg-blue-700 active:scale-95 transition-all ios-press"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New App</span>
          </button>
        </div>
        <p className="text-xs text-slate-500">
          Live stage tracking connected to Australian Department of Home Affairs, Serbian MUP, and Singapore MOM portals.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="px-4">
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-1">
          {filters.map((f) => (
            <button
              key={f.id}
              onClick={() => setSelectedFilter(f.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ios-press ${
                selectedFilter === f.id
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Applications List */}
      <div className="px-4 space-y-3.5">
        {isLoading ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            Syncing consular records...
          </div>
        ) : applications.length === 0 ? (
          <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 text-center space-y-3">
            <FileText className="w-9 h-9 text-slate-400 mx-auto" />
            <h4 className="font-bold text-sm">No applications found</h4>
            <p className="text-xs text-slate-500">
              Start your visa or recruitment application now to begin tracking.
            </p>
            <button
              onClick={onStartNewApplication}
              className="px-4 py-2 rounded-full bg-blue-600 text-white text-xs font-bold"
            >
              Start Visa Application
            </button>
          </div>
        ) : (
          applications.map((app) => {
            const flag = countryFlags[app.country] || "🌐";
            const isExpanded = expandedAppId === app.id;

            return (
              <div
                key={app.id}
                className="rounded-[28px] p-4 bg-white dark:bg-slate-900 border border-white/80 dark:border-slate-800 shadow-sm space-y-3.5 transition-all"
              >
                {/* Header row */}
                <div
                  className="flex items-start justify-between cursor-pointer"
                  onClick={() => setExpandedAppId(isExpanded ? null : app.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/80 text-2xl flex items-center justify-center border border-blue-100 dark:border-blue-900/40">
                      {flag}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-[14px] font-bold text-slate-900 dark:text-white leading-tight">
                          {app.country} {app.visaType}
                        </h4>
                      </div>
                      <p className="text-xs font-mono text-slate-500 dark:text-slate-400 mt-0.5">
                        {app.applicationNumber}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    {getStatusBadge(app.status)}
                    <span className="text-[10px] text-slate-400">
                      {new Date(app.submissionDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-semibold">
                    <span className="text-slate-500">Progress</span>
                    <span className="text-blue-600 dark:text-cyan-400 font-bold">
                      {app.progressPct}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full transition-all duration-500"
                      style={{ width: `${app.progressPct}%` }}
                    />
                  </div>
                </div>

                {/* Next Action Box */}
                {app.nextAction && (
                  <div className="p-3 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/50 dark:border-blue-800/40 flex items-start gap-2.5">
                    <Clock className="w-4 h-4 text-blue-600 dark:text-cyan-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[10px] uppercase font-bold text-blue-600 dark:text-cyan-400 block">
                        Next Action
                      </span>
                      <p className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-snug">
                        {app.nextAction}
                      </p>
                    </div>
                  </div>
                )}

                {/* Detailed Timeline (Toggleable) */}
                {isExpanded && (
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-3">
                    <h5 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                      Consular Roadmap
                    </h5>

                    <div className="relative pl-6 space-y-3 text-xs before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-700">
                      {timelineStages.map((st, i) => {
                        const stepThreshold = ((i + 1) / 6) * 100;
                        const isDone = app.progressPct >= stepThreshold;
                        const isCurrent =
                          app.progressPct < stepThreshold &&
                          app.progressPct >= (i / 6) * 100;

                        return (
                          <div key={st.id} className="relative flex items-center justify-between">
                            <span
                              className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] ring-4 ring-white dark:ring-slate-900 ${
                                isDone
                                  ? "bg-emerald-500 text-white"
                                  : isCurrent
                                  ? "bg-blue-600 text-white animate-pulse"
                                  : "bg-slate-200 dark:bg-slate-700 text-slate-500"
                              }`}
                            >
                              {isDone ? "✓" : i + 1}
                            </span>
                            <span
                              className={`font-semibold ${
                                isDone
                                  ? "text-slate-900 dark:text-white"
                                  : isCurrent
                                  ? "text-blue-600 dark:text-cyan-400 font-bold"
                                  : "text-slate-400"
                              }`}
                            >
                              {st.title}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {isDone ? "Completed" : isCurrent ? "Active" : "Pending"}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    <div className="pt-2 flex items-center justify-between">
                      <button
                        onClick={() => downloadDossier(app)}
                        className="text-xs font-semibold text-blue-600 dark:text-cyan-400 flex items-center gap-1"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download Dossier</span>
                      </button>

                      <button
                        onClick={() => setExpandedAppId(null)}
                        className="text-xs text-slate-400 hover:text-slate-600"
                      >
                        Collapse
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
