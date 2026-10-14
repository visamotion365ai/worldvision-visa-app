"use client";

import React, { useEffect, useState } from "react";
import {
  Plane,
  Briefcase,
  Building2,
  FileCheck2,
  ShieldAlert,
  ChevronRight,
  TrendingUp,
  Smartphone,
  CheckCircle2,
  Users2,
  ArrowRight,
  Mail,
} from "lucide-react";
import { PRIMARY_COUNTRIES, CountryInfo } from "@/lib/countryData";

interface HomeViewProps {
  onSelectCountry: (country: CountryInfo) => void;
  onSelectService: (serviceName: string) => void;
  onStartApplication: (countryName?: string, visaType?: string) => void;
  onOpenRecruitment: () => void;
  onOpenApplications: () => void;
  onOpenInstallGuide: () => void;
  onOpenSearch?: () => void;
  activeApplication?: any;
}

export const HomeView: React.FC<HomeViewProps> = ({
  onSelectCountry,
  onSelectService,
  onStartApplication,
  onOpenRecruitment,
  onOpenApplications,
  onOpenInstallGuide,
  activeApplication,
}) => {
  const [latest, setLatest] = useState<any | null | undefined>(undefined);
  useEffect(() => {
    fetch("/api/applications")
      .then((r) => r.json())
      .then((d) => setLatest(d.success && d.applications.length ? d.applications[0] : null))
      .catch(() => setLatest(null));
  }, [activeApplication]);

  const visaServices = [
    {
      id: "work-visa",
      name: "Work Visa",
      subtitle: "Build Your Career",
      icon: Briefcase,
      iconBg: "bg-blue-500 text-white",
      cardBg: "bg-gradient-to-br from-blue-50/90 to-sky-50/70 border-blue-100",
    },
    {
      id: "visitor-visa",
      name: "Visitor Visa",
      subtitle: "Explore the World",
      icon: Plane,
      iconBg: "bg-teal-500 text-white",
      cardBg: "bg-gradient-to-br from-teal-50/90 to-emerald-50/70 border-teal-100",
    },
    {
      id: "business-visa",
      name: "Business Visa",
      subtitle: "Grow Your Business",
      icon: Mail,
      iconBg: "bg-orange-500 text-white",
      cardBg: "bg-gradient-to-br from-orange-50/90 to-amber-50/70 border-orange-100",
    },
    {
      id: "business-registration",
      name: "Business Registration",
      subtitle: "Start Your Company",
      icon: Building2,
      iconBg: "bg-emerald-500 text-white",
      cardBg: "bg-gradient-to-br from-emerald-50/90 to-green-50/70 border-emerald-100",
    },
    {
      id: "evisa",
      name: "eVisa",
      subtitle: "Fast & Easy",
      icon: FileCheck2,
      iconBg: "bg-sky-500 text-white",
      cardBg: "bg-gradient-to-br from-sky-50/90 to-blue-50/70 border-sky-100",
    },
    {
      id: "sticker-visa",
      name: "Sticker Visa",
      subtitle: "For Long Stay",
      icon: ShieldAlert,
      iconBg: "bg-purple-500 text-white",
      cardBg: "bg-gradient-to-br from-purple-50/90 to-fuchsia-50/70 border-purple-100",
    },
  ];

  const featuredCampaigns = [
    {
      country: PRIMARY_COUNTRIES[0], // Australia
      tag: "Hot",
      tagBg: "bg-rose-500 text-white",
      name: "Australia",
      subline: "Work & Study Visa",
      image: "https://images.pexels.com/photos/2193300/pexels-photo-2193300.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=500&w=700",
    },
    {
      country: PRIMARY_COUNTRIES[1], // Singapore
      tag: "Popular",
      tagBg: "bg-purple-600 text-white",
      name: "Singapore",
      subline: "Employment Visa",
      image: "https://images.pexels.com/photos/15480459/pexels-photo-15480459.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=500&w=700",
    },
    {
      country: PRIMARY_COUNTRIES[2], // Serbia
      tag: "Fast PR",
      tagBg: "bg-emerald-600 text-white",
      name: "Serbia",
      subline: "Work Visa (EU)",
      image: "https://images.pexels.com/photos/17853059/pexels-photo-17853059.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=500&w=700",
    },
    {
      country: PRIMARY_COUNTRIES[3], // Turkey
      tag: "Trending",
      tagBg: "bg-amber-500 text-white",
      name: "Turkey",
      subline: "Trade & Ikamet",
      image: "https://images.pexels.com/photos/28142008/pexels-photo-28142008.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=500&w=700",
    },
    {
      country: PRIMARY_COUNTRIES[4], // Malaysia
      tag: "Tech Hub",
      tagBg: "bg-indigo-600 text-white",
      name: "Malaysia",
      subline: "MDEC Tech Pass",
      image: "https://images.pexels.com/photos/11719269/pexels-photo-11719269.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=500&w=700",
    },
    {
      country: PRIMARY_COUNTRIES[5], // Russia
      tag: "High Quota",
      tagBg: "bg-blue-600 text-white",
      name: "Russia",
      subline: "HQS Energy Permit",
      image: "https://images.pexels.com/photos/6214466/pexels-photo-6214466.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=500&w=700",
    },
  ];

  return (
    <div className="space-y-5 pb-28 pt-2 px-4 max-w-md mx-auto">
      {/* 1. HERO BANNER MATCHING SCREENSHOT 1 */}
      <section>
        <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#2a66e4] via-[#1a4dc4] to-[#123696] p-5 text-white shadow-lg shadow-blue-500/15">
          {/* Background travel photo with traveler & airplane */}
          <div className="absolute inset-0 z-0 opacity-45 mix-blend-overlay">
            <img
              src="https://images.pexels.com/photos/32341623/pexels-photo-32341623.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=800&w=1200"
              alt="World travel skyline"
              className="w-full h-full object-cover object-right"
            />
          </div>

          {/* Airplane flying to upper right */}
          <div className="absolute top-4 right-5 opacity-90 animate-float pointer-events-none">
            <Plane className="w-11 h-11 text-white drop-shadow-md rotate-[-22deg]" />
          </div>

          <div className="relative z-10 space-y-2.5 max-w-[240px]">
            <h2 className="text-[26px] font-extrabold tracking-tight leading-[1.12] text-white">
              Your Journey <br />
              Starts Here
            </h2>

            <p className="text-[12.5px] text-blue-100 font-normal leading-snug">
              Work. Study. Visit. Build Your Global Future.
            </p>

            <div className="pt-2">
              <button
                onClick={() => onSelectCountry(PRIMARY_COUNTRIES[0])}
                className="px-4 py-2.5 rounded-full bg-gradient-to-r from-blue-700 via-indigo-600 to-blue-800 text-white font-bold text-[13px] shadow-md shadow-black/20 flex items-center gap-2 hover:opacity-95 active:scale-95 transition-all ios-press border border-white/20"
              >
                <span>Explore Visas</span>
                <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                  <ArrowRight className="w-3 h-3 text-white" />
                </span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. ADD TO HOME SCREEN PROMO CARD MATCHING SCREENSHOT 1 */}
      <section>
        <div className="rounded-[22px] p-3.5 bg-white border border-slate-100 shadow-sm flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center flex-shrink-0 text-blue-600">
              <Smartphone className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h4 className="text-[13px] font-bold text-slate-900 leading-tight">
                Add to Home Screen
              </h4>
              <p className="text-[11px] text-slate-500 truncate mt-0.5">
                Get quick access to World Vision for a faster experience.
              </p>
            </div>
          </div>
          <button
            onClick={onOpenInstallGuide}
            className="flex-shrink-0 px-4 py-1.5 rounded-full bg-blue-600 text-white text-[12px] font-semibold hover:bg-blue-700 active:scale-95 transition-all shadow-xs"
          >
            Add
          </button>
        </div>
      </section>

      {/* 3. FEATURED VISA CAMPAIGNS (HORIZONTAL SCROLL) MATCHING SCREENSHOT 1 */}
      <section className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-[16px] font-bold text-slate-900 tracking-tight">
            Featured Visa Campaigns
          </h3>
          <button
            onClick={() => onSelectCountry(PRIMARY_COUNTRIES[0])}
            className="text-[12px] font-semibold text-blue-600 flex items-center gap-0.5 hover:underline"
          >
            <span>See All</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex gap-3 overflow-x-auto no-scrollbar -mx-4 px-4 pb-1 pt-1 snap-x">
          {featuredCampaigns.map((camp) => (
            <div
              key={camp.name}
              onClick={() => onSelectCountry(camp.country)}
              className="snap-start flex-shrink-0 w-[160px] rounded-[22px] overflow-hidden bg-white border border-slate-100 shadow-sm hover:shadow-md cursor-pointer group ios-press relative flex flex-col justify-between"
            >
              <div className="h-26 w-full relative overflow-hidden">
                <img
                  src={camp.image}
                  alt={camp.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />

                {/* Country Flag Circle on Top Left */}
                <div className="absolute top-2 left-2 w-7 h-7 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-sm shadow-xs border border-white">
                  {camp.country.flag}
                </div>

                {/* Tag on Top Right */}
                <span
                  className={`absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs ${camp.tagBg}`}
                >
                  {camp.tag}
                </span>
              </div>

              <div className="p-3">
                <h4 className="text-[14px] font-bold text-slate-900 leading-tight truncate">
                  {camp.name}
                </h4>
                <p className="text-[11px] text-slate-500 truncate mt-0.5">
                  {camp.subline}
                </p>

                <div className="mt-2.5">
                  <button className="px-3 py-1 rounded-full bg-slate-900 text-white text-[11px] font-semibold flex items-center gap-1 group-hover:bg-blue-600 transition-colors">
                    <span>Explore</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. POPULAR VISA DESTINATIONS (6 CIRCULAR ICONS MATCHING SCREENSHOT 1) */}
      <section className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-[16px] font-bold text-slate-900 tracking-tight">
            Popular Visa Destinations
          </h3>
          <button
            onClick={() => onSelectCountry(PRIMARY_COUNTRIES[0])}
            className="text-[12px] font-semibold text-blue-600 hover:underline"
          >
            See All
          </button>
        </div>

        <div className="grid grid-cols-6 gap-2 py-1">
          {PRIMARY_COUNTRIES.map((country) => (
            <button
              key={country.id}
              onClick={() => onSelectCountry(country)}
              className="flex flex-col items-center gap-1.5 group ios-press focus:outline-none"
            >
              <div className="w-12 h-12 rounded-full bg-white border border-slate-200/80 shadow-xs flex items-center justify-center text-2xl group-hover:scale-105 group-hover:border-blue-500 transition-all">
                <span>{country.flag}</span>
              </div>
              <span className="text-[10.5px] font-medium text-slate-700 text-center tracking-tight truncate w-full">
                {country.name}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* 5. ESSENTIAL VISA SERVICES (2-COLUMN GRID MATCHING SCREENSHOT 1) */}
      <section className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-[16px] font-bold text-slate-900 tracking-tight">
            Essential Visa Services
          </h3>
          <button
            onClick={() => onSelectService("All Services")}
            className="text-[12px] font-semibold text-blue-600 hover:underline"
          >
            See All
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {visaServices.map((svc) => {
            const Icon = svc.icon;
            return (
              <div
                key={svc.id}
                onClick={() => onSelectService(svc.name)}
                className={`p-3.5 rounded-[22px] ${svc.cardBg} border shadow-xs hover:shadow-md transition-all cursor-pointer group ios-press flex flex-col justify-between min-h-[96px]`}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${svc.iconBg} shadow-xs`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="mt-2">
                  <h4 className="text-[13px] font-bold text-slate-900 leading-tight">
                    {svc.name}
                  </h4>
                  <p className="text-[11px] text-slate-500 truncate mt-0.5">
                    {svc.subtitle}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Recruitment Horizontal Banner Pill Card */}
        <div
          onClick={onOpenRecruitment}
          className="rounded-[22px] p-3.5 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-100 shadow-xs flex items-center justify-between cursor-pointer ios-press group mt-1"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-xs">
              <Users2 className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-[13px] font-bold text-slate-900">
                Recruitment
              </h4>
              <p className="text-[11px] text-purple-700">
                Find Your Dream Job Abroad
              </p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-purple-600 group-hover:translate-x-1 transition-transform" />
        </div>
      </section>

      {/* 6. RECRUITMENT OPPORTUNITIES CARD MATCHING SCREENSHOT 1 */}
      <section className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-[16px] font-bold text-slate-900 tracking-tight">
            Recruitment Opportunities
          </h3>
          <button
            onClick={onOpenRecruitment}
            className="text-[12px] font-semibold text-blue-600 hover:underline"
          >
            See All
          </button>
        </div>

        <div className="rounded-[24px] overflow-hidden bg-white border border-slate-100 shadow-sm p-3.5 flex items-center gap-3.5">
          <div className="w-22 h-20 rounded-2xl overflow-hidden flex-shrink-0 relative">
            <img
              src="https://images.pexels.com/photos/6285147/pexels-photo-6285147.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=200&w=200"
              alt="Engineers and skilled workers in yellow hard hats"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex-1 min-w-0 space-y-1">
            <h4 className="text-[14px] font-bold text-slate-900 leading-snug truncate">
              Global Job Opportunities
            </h4>
            <p className="text-[11px] text-slate-500 line-clamp-1">
              Trusted employers. Better future.
            </p>
            <div>
              <button
                onClick={onOpenRecruitment}
                className="mt-1 px-4 py-1.5 rounded-full bg-blue-600 text-white text-[11px] font-semibold hover:bg-blue-700 active:scale-95 transition-all shadow-xs"
              >
                View Jobs
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 7. APPLICATION STATUS CARD MATCHING SCREENSHOT 1 */}
      <section className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-[16px] font-bold text-slate-900 tracking-tight">
            Application Status
          </h3>
          <button
            onClick={onOpenApplications}
            className="text-[12px] font-semibold text-blue-600 hover:underline"
          >
            View All
          </button>
        </div>

        <div
          onClick={onOpenApplications}
          className="rounded-[22px] p-3.5 bg-white border border-slate-100 shadow-sm flex items-center justify-between gap-3 cursor-pointer ios-press group"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-full bg-emerald-500 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h4 className="text-[13px] font-bold text-slate-900 truncate">
                {latest
                  ? `${latest.country} ${latest.visaType} — ${String(latest.status).replace(/_/g, " ")}`
                  : latest === null
                  ? "No applications yet"
                  : "Checking your applications…"}
              </h4>
              <p className="text-[11px] text-slate-500 truncate mt-0.5">
                {latest ? latest.nextAction || "We'll notify you once there's an update." : "Pick a destination to start your first application."}
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-emerald-500 group-hover:translate-x-1 transition-all flex-shrink-0" />
        </div>
      </section>
    </div>
  );
};
