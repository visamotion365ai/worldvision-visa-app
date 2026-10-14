"use client";

import React, { useState } from "react";
import {
  Briefcase,
  Plane,
  TrendingUp,
  Building2,
  FileCheck2,
  ShieldAlert,
  ArrowRight,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  X,
} from "lucide-react";
import { PRIMARY_COUNTRIES } from "@/lib/countryData";

interface ServicesViewProps {
  onStartApplication: (countryName?: string, visaType?: string) => void;
  onOpenRecruitment: () => void;
}

export const ServicesView: React.FC<ServicesViewProps> = ({
  onStartApplication,
  onOpenRecruitment,
}) => {
  const [selectedService, setSelectedService] = useState<any | null>(null);

  const services = [
    {
      id: "work-visa",
      name: "WORK VISA",
      badge: "Highest Demand",
      subtitle: "Professional Employment & PR Pathway",
      description:
        "Comprehensive employer-sponsored work permits, skills assessments, and permanent residency pipelines across Australia (TSS 482 / 186), Singapore (EP / S-Pass), Serbia (Single Permit), Turkey, Malaysia, and Russia.",
      icon: Briefcase,
      color: "from-blue-600 to-indigo-600",
      gradient: "linear-gradient(135deg, #0284c7 0%, #2563eb 50%, #4338ca 100%)",
      image: "https://images.pexels.com/photos/6285147/pexels-photo-6285147.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=500&w=700",
      stats: { success: "98.8%", time: "3-6 Weeks", feeFrom: "$950 USD" },
      supportedCountries: ["Australia", "Singapore", "Serbia", "Turkey", "Malaysia", "Russia"],
      keyFeatures: [
        "Government-approved employer nomination",
        "Direct permanent residency pathway",
        "Assistance with CV, apostille & skills evaluation",
        "Family dependent visas included",
      ],
    },
    {
      id: "visitor-visa",
      name: "Visitor Visa",
      badge: "Fast Turnaround",
      subtitle: "Tourism, Family & Cultural Travel",
      description:
        "Single and multiple entry tourist visas with maximum stay validity. Complete invitation letter drafting, hotel bookings, flight reservations, and financial solvency verification.",
      icon: Plane,
      color: "from-teal-500 to-cyan-600",
      gradient: "linear-gradient(135deg, #0d9488 0%, #0891b2 50%, #0284c7 100%)",
      image: "https://images.pexels.com/photos/32341623/pexels-photo-32341623.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=500&w=700",
      stats: { success: "99.2%", time: "3-15 Days", feeFrom: "$190 USD" },
      supportedCountries: ["Australia", "Singapore", "Serbia", "Turkey", "Malaysia", "Russia"],
      keyFeatures: [
        "Consular cover letter drafting",
        "Verified flight & hotel itinerary vouchers",
        "Multiple entry endorsements",
        "Biometric appointment booking",
      ],
    },
    {
      id: "business-visa",
      name: "Business Visa",
      badge: "Commercial Trade",
      subtitle: "Corporate Missions & Investor Permits",
      description:
        "Facilitating international trade missions, corporate negotiations, equipment inspection delegates, and investor entry passes across our 6 accredited jurisdictions.",
      icon: TrendingUp,
      color: "from-amber-500 to-orange-600",
      gradient: "linear-gradient(135deg, #d97706 0%, #ea580c 50%, #c2410c 100%)",
      image: "https://images.pexels.com/photos/15480459/pexels-photo-15480459.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=500&w=700",
      stats: { success: "98.5%", time: "2-4 Weeks", feeFrom: "$450 USD" },
      supportedCountries: ["Australia", "Singapore", "Serbia", "Turkey", "Malaysia", "Russia"],
      keyFeatures: [
        "Official chamber of commerce invitation endorsement",
        "Priority expedited embassy submission",
        "Multi-year multiple entry validity",
        "Corporate group applications",
      ],
    },
    {
      id: "business-registration",
      name: "Business Registration",
      badge: "Offshore Setup",
      subtitle: "Company Formation & Foreign Ownership",
      description:
        "Full incorporation of offshore corporations (Australia Pty Ltd, Singapore Pte Ltd, Serbian D.O.O., Turkish LLC, Malaysia Sdn Bhd, Russia OOO) with corporate bank accounts and direct investor residency.",
      icon: Building2,
      color: "from-emerald-500 to-green-600",
      gradient: "linear-gradient(135deg, #059669 0%, #16a34a 50%, #15803d 100%)",
      image: "https://images.pexels.com/photos/11719269/pexels-photo-11719269.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=500&w=700",
      stats: { success: "100%", time: "5-14 Days", feeFrom: "$1,200 USD" },
      supportedCountries: ["Australia", "Singapore", "Serbia", "Turkey", "Malaysia", "Russia"],
      keyFeatures: [
        "100% foreign legal ownership structure",
        "Corporate multi-currency bank account setup",
        "Registered legal address & nominee director services",
        "Automatic investor residence permit eligibility",
      ],
    },
    {
      id: "evisa",
      name: "eVisa",
      badge: "Digital Express",
      subtitle: "Electronic Travel Authorization",
      description:
        "Instant digital e-Visas issued with 2D barcode verification. Submitted directly via official ministerial APIs for Turkey, Australia (eVisitor), Singapore SAVE, and Malaysia.",
      icon: FileCheck2,
      color: "from-sky-500 to-blue-600",
      gradient: "linear-gradient(135deg, #0284c7 0%, #2563eb 50%, #3b82f6 100%)",
      image: "https://images.pexels.com/photos/28142008/pexels-photo-28142008.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=500&w=700",
      stats: { success: "99.8%", time: "24-48 Hours", feeFrom: "$95 USD" },
      supportedCountries: ["Australia", "Singapore", "Serbia", "Turkey", "Malaysia", "Russia"],
      keyFeatures: [
        "Fast electronic passport linkage",
        "No passport physical dispatch required",
        "Instant PDF delivery to phone & email",
        "Automated border e-Gate clearance",
      ],
    },
    {
      id: "sticker-visa",
      name: "Sticker Visa",
      badge: "Consular Foil",
      subtitle: "High Security Consular Endorsement",
      description:
        "Physical biometric sticker affixed to passport booklet by embassies in Dhaka, New Delhi, or Sydney for long-term residency, diplomat, or specialized technical employment.",
      icon: ShieldAlert,
      color: "from-fuchsia-500 to-pink-600",
      gradient: "linear-gradient(135deg, #c026d3 0%, #db2777 50%, #e11d48 100%)",
      image: "https://images.pexels.com/photos/17853059/pexels-photo-17853059.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=500&w=700",
      stats: { success: "97.9%", time: "2-4 Weeks", feeFrom: "$350 USD" },
      supportedCountries: ["Australia", "Singapore", "Serbia", "Turkey", "Malaysia", "Russia"],
      keyFeatures: [
        "In-person biometric VIP escort",
        "Ministry foreign affairs authentication",
        "Apostille & certified legal translation",
        "Physical passport tracking via secure courier",
      ],
    },
  ];

  return (
    <div className="space-y-6 pb-28 pt-2">
      {/* Header */}
      <div className="px-4 space-y-1">
        <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-cyan-400">
          Global Visa Solutions
        </span>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          Visa Services
        </h2>
        <p className="text-xs text-slate-500">
          Government-accredited immigration and consular advisory across Australia, Singapore, Serbia, Turkey, Malaysia, and Russia.
        </p>
      </div>

      {/* Recruitment Promo Banner */}
      <div className="px-4">
        <div
          onClick={onOpenRecruitment}
          className="rounded-[28px] p-4 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white shadow-lg flex items-center justify-between cursor-pointer ios-press group"
        >
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
              <Briefcase className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-white/20">
                Overseas Careers
              </span>
              <h4 className="font-bold text-sm leading-tight mt-0.5">
                Explore Global Worker Recruitment
              </h4>
              <p className="text-[11px] text-blue-100">
                High-paying vacancies with visa sponsorship.
              </p>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
        </div>
      </div>

      {/* 6 Beautiful Animated Service Cards */}
      <div className="px-4 space-y-4">
        {services.map((svc) => {
          const Icon = svc.icon;
          return (
            <div
              key={svc.id}
              onClick={() => setSelectedService(svc)}
              className="rounded-[30px] overflow-hidden bg-white dark:bg-slate-900 border border-white/80 dark:border-slate-800 shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer group ios-press relative"
            >
              {/* Card visual background */}
              <div className="h-36 w-full relative overflow-hidden">
                <img
                  src={svc.image}
                  alt={svc.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-transparent" />

                {/* Badge */}
                <span className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full bg-white/25 backdrop-blur-md text-white text-[10px] font-bold border border-white/30">
                  {svc.badge}
                </span>

                {/* Icon & Title Overlay */}
                <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-11 h-11 rounded-2xl bg-gradient-to-tr ${svc.color} text-white flex items-center justify-center shadow-md`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-white leading-tight">
                        {svc.name}
                      </h3>
                      <p className="text-xs text-blue-200 font-medium">{svc.subtitle}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Content */}
              <div className="p-4 space-y-3">
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-2">
                  {svc.description}
                </p>

                {/* Statistics Bar */}
                <div className="grid grid-cols-3 gap-2 py-1 text-center text-xs">
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800">
                    <span className="text-[10px] text-slate-400 block font-semibold">Success</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      {svc.stats.success}
                    </span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800">
                    <span className="text-[10px] text-slate-400 block font-semibold">Timeline</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {svc.stats.time}
                    </span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800">
                    <span className="text-[10px] text-slate-400 block font-semibold">Fees From</span>
                    <span className="font-bold text-blue-600 dark:text-cyan-400">
                      {svc.stats.feeFrom}
                    </span>
                  </div>
                </div>

                {/* Action button */}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] font-medium text-slate-400">
                    Available for 6 Primary Countries
                  </span>

                  <button className="px-4 py-1.5 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center gap-1.5 group-hover:bg-blue-700 transition-colors shadow-xs">
                    <span>Explore</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* SERVICE DETAILS MODAL */}
      {selectedService && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-t-[32px] sm:rounded-[32px] p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-2xl bg-gradient-to-tr ${selectedService.color} text-white flex items-center justify-center`}
                >
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    {selectedService.name}
                  </h3>
                  <p className="text-xs text-slate-500">{selectedService.subtitle}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedService(null)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {selectedService.description}
            </p>

            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2">
                What We Handle
              </h4>
              <ul className="space-y-1.5">
                {selectedService.keyFeatures.map((kf: string, i: number) => (
                  <li key={i} className="text-xs text-slate-600 dark:text-slate-300 flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span>{kf}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2">
                Available Jurisdictions
              </h4>
              <div className="flex flex-wrap gap-2">
                {selectedService.supportedCountries.map((cName: string) => (
                  <span
                    key={cName}
                    className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300"
                  >
                    {cName}
                  </span>
                ))}
              </div>
            </div>

            <button
              onClick={() => {
                const sName = selectedService.name;
                setSelectedService(null);
                onStartApplication(undefined, sName);
              }}
              className="w-full py-3.5 rounded-full bg-blue-600 text-white font-bold text-xs shadow-md hover:bg-blue-700 transition-all ios-press"
            >
              Start {selectedService.name} Application
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
