"use client";

import React, { useState } from "react";
import { Search, X, ChevronRight, Briefcase, Globe2, Sparkles, ArrowRight } from "lucide-react";
import { PRIMARY_COUNTRIES, CountryInfo } from "@/lib/countryData";

interface SearchSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCountry: (country: CountryInfo) => void;
  onSelectService: (serviceName: string) => void;
  onSelectRecruitment: () => void;
}

export const SearchSheet: React.FC<SearchSheetProps> = ({
  isOpen,
  onClose,
  onSelectCountry,
  onSelectService,
  onSelectRecruitment,
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  if (!isOpen) return null;

  const filteredCountries = PRIMARY_COUNTRIES.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.overview.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.tagline.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const visaTypes = [
    "Work Visa",
    "Visitor Visa",
    "Business Visa",
    "Business Registration",
    "eVisa",
    "Sticker Visa",
  ].filter((s) => s.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center p-3 sm:p-6">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-[32px] p-5 shadow-2xl space-y-4 max-h-[85vh] flex flex-col border border-white/60 dark:border-slate-800">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              autoFocus
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search Australia, Work Visa, Jobs, PR..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-medium outline-none"
            />
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 text-xs">
          {/* Countries Matches */}
          <div>
            <h4 className="font-bold text-slate-400 uppercase tracking-wider text-[10px] mb-2">
              Destinations ({filteredCountries.length})
            </h4>
            <div className="space-y-1.5">
              {filteredCountries.map((c) => (
                <div
                  key={c.id}
                  onClick={() => {
                    onClose();
                    onSelectCountry(c);
                  }}
                  className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-950/40"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl">{c.flag}</span>
                    <span className="font-bold text-slate-900 dark:text-white">{c.name}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>
              ))}
            </div>
          </div>

          {/* Visa Services Matches */}
          <div>
            <h4 className="font-bold text-slate-400 uppercase tracking-wider text-[10px] mb-2">
              Visa Streams ({visaTypes.length})
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {visaTypes.map((v) => (
                <div
                  key={v}
                  onClick={() => {
                    onClose();
                    onSelectService(v);
                  }}
                  className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between cursor-pointer hover:border-blue-500"
                >
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{v}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-blue-600" />
                </div>
              ))}
            </div>
          </div>

          {/* Recruitment shortcut */}
          <div
            onClick={() => {
              onClose();
              onSelectRecruitment();
            }}
            className="p-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Briefcase className="w-4 h-4" />
              <span className="font-bold">Browse Global Recruitment Vacancies</span>
            </div>
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </div>
    </div>
  );
};
