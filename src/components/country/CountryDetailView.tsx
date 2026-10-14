"use client";

import React, { useState } from "react";
import {
  ChevronLeft,
  Heart,
  Share2,
  CheckCircle2,
  Briefcase,
  Plane,
  TrendingUp,
  Building2,
  FileCheck2,
  ShieldAlert,
  ChevronRight,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  FileText,
  X,
  CreditCard,
} from "lucide-react";
import { CountryInfo } from "@/lib/countryData";

interface CountryDetailViewProps {
  country: CountryInfo;
  onBack: () => void;
  onStartApplication: (countryName: string, visaType?: string) => void;
  onSelectJob?: (countryName: string) => void;
}

export const CountryDetailView: React.FC<CountryDetailViewProps> = ({
  country,
  onBack,
  onStartApplication,
  onSelectJob,
}) => {
  const [isFavorited, setIsFavorited] = useState(false);
  const [selectedVisaCategory, setSelectedVisaCategory] = useState<any | null>(null);
  const [showEligibilityModal, setShowEligibilityModal] = useState(false);
  const [showAllDocsModal, setShowAllDocsModal] = useState(false);

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case "Briefcase":
        return Briefcase;
      case "Plane":
        return Plane;
      case "TrendingUp":
        return TrendingUp;
      case "Building2":
        return Building2;
      case "FileCheck2":
        return FileCheck2;
      case "ShieldAlert":
        return ShieldAlert;
      default:
        return Briefcase;
    }
  };

  const handleShare = () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      navigator
        .share({
          title: `${country.name} Visa & Recruitment | World Vision Consultancy`,
          text: `Explore verified visas and recruitment for ${country.name}.`,
          url: window.location.href,
        })
        .catch(() => {});
    } else {
      alert("Link copied to clipboard!");
    }
  };

  return (
    <div className="relative min-h-screen bg-[#f3f5f9] pb-28 pt-2 px-4 max-w-md mx-auto">
      {/* Top Floating Controls matching Screenshot 2 */}
      <div className="flex items-center justify-between py-2">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-full bg-white shadow-xs border border-slate-200/80 flex items-center justify-center text-slate-800 hover:bg-slate-50 ios-press"
          aria-label="Back"
        >
          <ChevronLeft className="w-6 h-6 -ml-0.5" />
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsFavorited(!isFavorited)}
            className={`w-10 h-10 rounded-full bg-white shadow-xs border border-slate-200/80 flex items-center justify-center transition-colors ios-press ${
              isFavorited ? "text-rose-500" : "text-slate-800 hover:bg-slate-50"
            }`}
            aria-label="Favorite"
          >
            <Heart className={`w-5 h-5 ${isFavorited ? "fill-rose-500 text-rose-500" : ""}`} />
          </button>
          <button
            onClick={handleShare}
            className="w-10 h-10 rounded-full bg-white shadow-xs border border-slate-200/80 flex items-center justify-center text-slate-800 hover:bg-slate-50 ios-press"
            aria-label="Share"
          >
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="space-y-5 pt-1">
        {/* Large Hero Card with Sydney Opera House landscape matching Screenshot 2 */}
        <div className="relative rounded-[26px] overflow-hidden shadow-sm h-48 border border-slate-200/60">
          <img
            src={country.heroImage}
            alt={country.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Country Title + Flag + Tagline row matching Screenshot 2 */}
        <div className="flex items-center gap-3 px-1">
          {/* Flag circular badge */}
          <div className="w-14 h-14 rounded-2xl bg-white p-1 shadow-xs border border-slate-200/80 flex items-center justify-center text-3xl flex-shrink-0">
            {country.flag}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-tight">
                {country.name}
              </h2>
              {country.badge && (
                <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-amber-950 font-bold text-[10px] tracking-wide shadow-xs flex items-center gap-1">
                  <Sparkles className="w-3 h-3 fill-amber-950 text-amber-950" />
                  {country.badge}
                </span>
              )}
            </div>
            <p className="text-[12px] text-slate-500 font-medium">
              {country.tagline}
            </p>
          </div>
        </div>

        {/* Visa Categories Section (6 colorful cards in 2 columns matching Screenshot 2) */}
        <div className="space-y-2.5">
          <div className="px-1">
            <h3 className="text-[16px] font-bold text-slate-900 tracking-tight">
              Visa Categories
            </h3>
            <p className="text-[12px] text-slate-500">
              Choose the right visa for your goals
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {country.visaCategories.map((cat) => {
              const Icon = getCategoryIcon(cat.icon);
              return (
                <div
                  key={cat.name}
                  onClick={() => setSelectedVisaCategory(cat)}
                  className="rounded-[22px] p-3.5 bg-white border border-slate-100 shadow-xs hover:shadow-md transition-all cursor-pointer group ios-press flex flex-col justify-between min-h-[105px]"
                >
                  <div
                    className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${cat.color} text-white flex items-center justify-center shadow-xs`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>

                  <div className="mt-2.5">
                    <h4 className="text-[13.5px] font-bold text-slate-900 leading-tight">
                      {cat.name}
                    </h4>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5 font-medium">
                      {cat.subtext}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Eligibility Overview matching Screenshot 2 */}
        <div className="space-y-2">
          <div className="px-1">
            <h3 className="text-[16px] font-bold text-slate-900 tracking-tight">
              Eligibility Overview
            </h3>
            <p className="text-[12px] text-slate-500">
              Key requirements (general guide)
            </p>
          </div>

          <div className="rounded-[22px] p-4 bg-white border border-slate-100 shadow-xs space-y-2.5">
            {[
              "Valid passport",
              "Proof of financial stability",
              "Relevant qualification / experience",
              "Clean health & character record",
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-2.5">
                <div className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <span className="text-[12.5px] text-slate-700 font-medium">
                  {item}
                </span>
              </div>
            ))}

            <div className="pt-1">
              <button
                onClick={() => setShowEligibilityModal(true)}
                className="text-[12px] font-semibold text-blue-600 flex items-center hover:underline"
              >
                <span>View Full Details</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Processing & Status Pipeline matching Screenshot 2 */}
        <div className="space-y-2">
          <div className="px-1">
            <h3 className="text-[16px] font-bold text-slate-900 tracking-tight">
              Processing & Status
            </h3>
          </div>

          <div className="rounded-[22px] p-4 bg-white border border-slate-100 shadow-xs">
            <div className="flex items-center justify-between relative px-2">
              {/* Connecting line */}
              <div className="absolute top-4 left-6 right-6 h-0.5 bg-gradient-to-r from-emerald-500 via-sky-400 to-slate-200 -z-0" />

              {/* Stage 1: Document Review */}
              <div className="flex flex-col items-center gap-1.5 z-10 text-center">
                <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xs text-xs font-bold ring-4 ring-white">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-bold text-slate-700">
                  Document Review
                </span>
              </div>

              {/* Stage 2: Application Processing */}
              <div className="flex flex-col items-center gap-1.5 z-10 text-center">
                <div className="w-8 h-8 rounded-full bg-sky-500 text-white flex items-center justify-center shadow-xs text-xs font-bold ring-4 ring-white">
                  <FileCheck2 className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-bold text-slate-700">
                  Application Processing
                </span>
              </div>

              {/* Stage 3: Decision */}
              <div className="flex flex-col items-center gap-1.5 z-10 text-center">
                <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 border border-slate-200 flex items-center justify-center shadow-xs text-xs font-bold ring-4 ring-white">
                  <FileText className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-bold text-slate-400">
                  Decision
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Start Application Primary Glowing CTA Button matching Screenshot 2 */}
        <div>
          <button
            onClick={() => onStartApplication(country.name)}
            className="w-full py-4 rounded-full bg-gradient-to-r from-[#00d2ff] via-[#3a7bd5] to-[#4a00e0] text-white font-bold text-[15px] shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 hover:opacity-95 active:scale-[0.98] transition-all ios-press"
          >
            <span>Start Application</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        {/* Required Documents matching Screenshot 2 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-[16px] font-bold text-slate-900 tracking-tight">
              Required Documents
            </h3>
            <button
              onClick={() => setShowAllDocsModal(true)}
              className="text-[12px] font-semibold text-blue-600 hover:underline"
            >
              View All
            </button>
          </div>

          <div className="rounded-[22px] bg-white border border-slate-100 shadow-xs divide-y divide-slate-100 overflow-hidden">
            {[
              "Passport (valid)",
              "Passport size photo",
              "Education / Experience certificate",
              "Financial statement",
              "Cover letter (if applicable)",
            ].map((docName, idx) => (
              <div
                key={idx}
                className="p-3.5 flex items-center justify-between gap-3 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <span className="text-[13px] font-medium text-slate-800 truncate">
                    {docName}
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
              </div>
            ))}
          </div>
        </div>

        {/* Recruitment Opportunities matching Screenshot 2 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-[16px] font-bold text-slate-900 tracking-tight">
              Recruitment Opportunities
            </h3>
            <button
              onClick={() => onSelectJob && onSelectJob(country.name)}
              className="text-[12px] font-semibold text-blue-600 hover:underline"
            >
              View All
            </button>
          </div>

          <div className="rounded-[24px] p-3.5 bg-white border border-slate-100 shadow-xs flex items-center gap-3.5">
            <div className="w-22 h-20 rounded-2xl overflow-hidden flex-shrink-0">
              <img
                src="https://images.pexels.com/photos/6285137/pexels-photo-6285137.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=200&w=200"
                alt="Skilled Worker Jobs"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-[14px] font-bold text-slate-900 truncate">
                Skilled Worker Jobs
              </h4>
              <p className="text-[11px] text-slate-500 truncate mt-0.5">
                Find verified job opportunities in {country.name}
              </p>
              <button
                onClick={() => onSelectJob && onSelectJob(country.name)}
                className="mt-2 px-3.5 py-1 rounded-full bg-blue-600 text-white text-[11px] font-semibold hover:bg-blue-700 active:scale-95 transition-all shadow-xs"
              >
                View Jobs
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Selected Visa Category Detail Modal */}
      {selectedVisaCategory && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="w-full max-w-md bg-white rounded-t-[32px] sm:rounded-[32px] p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-10 h-10 rounded-2xl bg-gradient-to-tr ${selectedVisaCategory.color} text-white flex items-center justify-center`}
                >
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {selectedVisaCategory.name}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {country.name} • {selectedVisaCategory.subtext}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedVisaCategory(null)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              {selectedVisaCategory.description}
            </p>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block text-[10px] font-semibold uppercase">
                  Processing Time
                </span>
                <span className="font-bold text-slate-800 text-sm">
                  {selectedVisaCategory.processingTime}
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block text-[10px] font-semibold uppercase">
                  Stay Period
                </span>
                <span className="font-bold text-slate-800 text-sm">
                  {selectedVisaCategory.stayPeriod}
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block text-[10px] font-semibold uppercase">
                  Government Fee
                </span>
                <span className="font-bold text-slate-800 text-sm">
                  {selectedVisaCategory.govFee}
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block text-[10px] font-semibold uppercase">
                  Success Rate
                </span>
                <span className="font-bold text-emerald-600 text-sm">
                  {country.successRate}
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                const visa = selectedVisaCategory.name;
                setSelectedVisaCategory(null);
                onStartApplication(country.name, visa);
              }}
              className="w-full py-3.5 rounded-full bg-blue-600 text-white font-bold text-xs shadow-md hover:bg-blue-700 transition-all ios-press"
            >
              Start {selectedVisaCategory.name} Application
            </button>
          </div>
        </div>
      )}

      {/* Full Eligibility Modal */}
      {showEligibilityModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="w-full max-w-md bg-white rounded-t-[32px] sm:rounded-[32px] p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {country.name} Eligibility Requirements
              </h3>
              <button
                onClick={() => setShowEligibilityModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5">
              {country.eligibility.map((crit, idx) => (
                <div key={idx} className="p-3 rounded-2xl bg-blue-50/60 flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-slate-700 leading-relaxed font-medium">
                    {crit}
                  </p>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowEligibilityModal(false)}
              className="w-full py-3 rounded-full bg-slate-100 text-slate-800 font-bold text-xs"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* All Documents Modal */}
      {showAllDocsModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="w-full max-w-md bg-white rounded-t-[32px] sm:rounded-[32px] p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                Required Documents for {country.name}
              </h3>
              <button
                onClick={() => setShowAllDocsModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              {country.requiredDocuments.map((doc, idx) => (
                <div key={idx} className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <h4 className="text-xs font-bold text-slate-900">{doc.title}</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">{doc.desc}</p>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowAllDocsModal(false)}
              className="w-full py-3 rounded-full bg-blue-600 text-white font-bold text-xs"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
