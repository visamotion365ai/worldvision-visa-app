"use client";

import React, { useState } from "react";
import {
  Globe2,
  ChevronRight,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Briefcase,
  Plane,
  TrendingUp,
  Building2,
  Star,
  Users2,
} from "lucide-react";
import { PRIMARY_COUNTRIES, CountryInfo } from "@/lib/countryData";

interface CountriesDiscoveryViewProps {
  onSelectCountry: (country: CountryInfo) => void;
  onSelectService: (serviceName: string) => void;
  onOpenRecruitment: () => void;
  onOpenApplications: () => void;
}

export const CountriesDiscoveryView: React.FC<CountriesDiscoveryViewProps> = ({
  onSelectCountry,
  onSelectService,
  onOpenRecruitment,
  onOpenApplications,
}) => {
  const [activeSegment, setActiveSegment] = useState<"all" | "work" | "pr" | "invest">("all");

  return (
    <div className="space-y-6 pb-28 pt-2">
      {/* Editorial Title */}
      <div className="px-4 space-y-1">
        <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-cyan-400">
          Editorial Curation
        </span>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          Explore the World
        </h2>
        <p className="text-xs text-slate-500">
          Discover sovereign visa programs & skilled worker sponsorships across 6 licensed jurisdictions.
        </p>
      </div>

      {/* Featured Destination Large Editorial Hero Card */}
      <div className="px-4">
        <div
          onClick={() => onSelectCountry(PRIMARY_COUNTRIES[0])}
          className="rounded-[32px] overflow-hidden bg-slate-900 text-white relative shadow-xl cursor-pointer group ios-press border border-white/40 dark:border-slate-800"
        >
          <div className="h-64 sm:h-72 w-full relative">
            <img
              src={PRIMARY_COUNTRIES[0].heroImage}
              alt="Australia"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/10" />

            {/* Badges */}
            <div className="absolute top-4 left-4 flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-blue-600/90 backdrop-blur-md text-white font-bold text-[11px] shadow-sm flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Featured Country
              </span>
              <span className="px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-[11px] font-semibold">
                PR Pathway
              </span>
            </div>

            {/* Country flag and title */}
            <div className="absolute bottom-5 left-5 right-5 space-y-2">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{PRIMARY_COUNTRIES[0].flag}</span>
                <div>
                  <h3 className="text-2xl font-black text-white leading-none drop-shadow-sm">
                    {PRIMARY_COUNTRIES[0].name}
                  </h3>
                  <p className="text-xs text-white/80 font-medium mt-0.5">
                    {PRIMARY_COUNTRIES[0].tagline}
                  </p>
                </div>
              </div>

              <p className="text-xs text-slate-200 line-clamp-2 leading-relaxed">
                {PRIMARY_COUNTRIES[0].overview}
              </p>

              <div className="pt-1 flex items-center justify-between text-cyan-300 font-bold text-xs">
                <span>Explore Australia Visas & Jobs</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recommended for You Grid (All 6 Primary Countries) */}
      <div className="px-4 space-y-3">
        <div className="flex items-center justify-between px-1">
          <div>
            <h3 className="text-[17px] font-bold text-slate-900 dark:text-white tracking-tight">
              Recommended for You
            </h3>
            <p className="text-[11px] text-slate-500">Based on global high-acceptance rates</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {PRIMARY_COUNTRIES.map((c) => (
            <div
              key={c.id}
              onClick={() => onSelectCountry(c)}
              className="rounded-[26px] p-4 bg-white dark:bg-slate-900 border border-white/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all cursor-pointer group ios-press space-y-3"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/80 text-2xl flex items-center justify-center border border-blue-100 dark:border-blue-900/40">
                    {c.flag}
                  </div>
                  <div>
                    <h4 className="font-bold text-[15px] text-slate-900 dark:text-white leading-tight">
                      {c.name}
                    </h4>
                    <p className="text-xs text-slate-500 font-medium">{c.tagline}</p>
                  </div>
                </div>

                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  {c.successRate} Success
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  <span className="text-[10px] text-slate-400 block font-semibold">Processing</span>
                  <span className="font-bold">{c.processingTime}</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  <span className="text-[10px] text-slate-400 block font-semibold">Avg Package</span>
                  <span className="font-bold text-blue-600 dark:text-cyan-400 truncate block">
                    {c.recruitment.averageSalary}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-blue-600 dark:text-cyan-400 font-semibold pt-1 border-t border-slate-100 dark:border-slate-800">
                <span>View 6 Visa Categories</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Recruitment Opportunities Spotlight */}
      <div className="px-4 space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-[17px] font-bold text-slate-900 dark:text-white tracking-tight">
            Top Recruitment Opportunities
          </h3>
          <button
            onClick={onOpenRecruitment}
            className="text-[13px] font-semibold text-blue-600 dark:text-cyan-400 hover:underline"
          >
            See All
          </button>
        </div>

        <div
          onClick={onOpenRecruitment}
          className="rounded-[28px] overflow-hidden bg-gradient-to-r from-blue-700 via-indigo-700 to-cyan-600 text-white p-5 cursor-pointer shadow-lg ios-press flex items-center justify-between gap-4"
        >
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-white/20">
              Immediate Openings
            </span>
            <h4 className="text-base font-extrabold leading-tight">
              Serbia European Work Permits & Australian Civil Engineers
            </h4>
            <p className="text-xs text-blue-100 leading-relaxed">
              Verified tier-1 companies offering guaranteed employer sponsorship.
            </p>
          </div>
          <ArrowRight className="w-6 h-6 flex-shrink-0" />
        </div>
      </div>
    </div>
  );
};
