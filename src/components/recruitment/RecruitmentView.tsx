"use client";

import React, { useState, useEffect } from "react";
import {
  Briefcase,
  MapPin,
  Clock,
  DollarSign,
  Search,
  Filter,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ChevronRight,
  Building2,
  Upload,
  X,
  Send,
  Award,
} from "lucide-react";
import { PRIMARY_COUNTRIES } from "@/lib/countryData";

interface JobItem {
  id: number;
  title: string;
  company: string;
  country: string;
  flag: string;
  location: string;
  salary: string;
  experience: string;
  jobType: string;
  category: string;
  vacancies: number;
  description: string;
  requirements?: string[];
  benefits?: string[];
  isFeatured?: boolean;
  imageUrl?: string;
  deadline?: string;
}

interface RecruitmentViewProps {
  initialCountry?: string;
  onApplySuccess?: () => void;
  user?: { fullName: string; email: string; phone?: string | null };
}

export const RecruitmentView: React.FC<RecruitmentViewProps> = ({
  initialCountry = "all",
  onApplySuccess,
  user,
}) => {
  const cvPicker = React.useRef<HTMLInputElement>(null);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [applyError, setApplyError] = useState<string | null>(null);
  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCountry, setSelectedCountry] = useState(initialCountry);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedJob, setSelectedJob] = useState<JobItem | null>(null);
  const [applyingJob, setApplyingJob] = useState<JobItem | null>(null);
  const [applySubmitted, setApplySubmitted] = useState(false);

  // Application form fields
  const [applicantName, setApplicantName] = useState(user?.fullName || "");
  const [applicantEmail, setApplicantEmail] = useState(user?.email || "");
  const [applicantPhone, setApplicantPhone] = useState(user?.phone || "");
  const [applicantExperience, setApplicantExperience] = useState("");
  const [applicantCover, setApplicantCover] = useState("");

  const categories = [
    { id: "all", name: "All Sectors" },
    { id: "Engineering", name: "Engineering" },
    { id: "IT", name: "IT & Tech" },
    { id: "Manufacturing", name: "Manufacturing" },
    { id: "Healthcare", name: "Healthcare" },
    { id: "Logistics", name: "Logistics" },
    { id: "Hospitality", name: "Hospitality" },
    { id: "Energy", name: "Energy" },
  ];

  const fetchJobs = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCountry !== "all") params.set("country", selectedCountry);
      if (selectedCategory !== "all") params.set("category", selectedCategory);
      if (searchQuery.trim()) params.set("search", searchQuery.trim());

      const res = await fetch(`/api/jobs?${params.toString()}`);
      const data = await res.json();
      if (data.success && data.jobs) {
        setJobs(data.jobs);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [selectedCountry, selectedCategory]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchJobs();
  };

  const handleApply = async () => {
    if (!applyingJob) return;
    setApplyError(null);
    if (!cvFile) return setApplyError("Please attach your CV (PDF, JPG or PNG)");
    if (!applicantName.trim() || !applicantEmail.trim() || !applicantPhone.trim()) return setApplyError("Name, email and phone are required");

    try {
      // 1) store the CV as a real file in the applicant's vault
      const fd = new FormData();
      fd.append("file", cvFile);
      fd.append("docType", "experience");
      fd.append("title", `CV — ${applyingJob.title}`);
      const up = await (await fetch("/api/documents", { method: "POST", body: fd })).json();
      if (!up.success) return setApplyError(up.error || "CV upload failed");

      // 2) send the application
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId: applyingJob.id,
          fullName: applicantName,
          email: applicantEmail,
          phone: applicantPhone,
          resumeName: cvFile.name,
          experienceYears: applicantExperience,
          coverNote: applicantCover,
        }),
      });
      const data = await res.json();
      if (!data.success) return setApplyError(data.error || "Could not submit application");
      setApplySubmitted(true);
      setCvFile(null);
      if (onApplySuccess) onApplySuccess();
    } catch (err) {
      console.error(err);
      setApplyError("Network problem — please try again");
    }
  };

  return (
    <div className="space-y-5 pb-28 pt-2">
      {/* Top Header & Search */}
      <div className="px-4 space-y-3">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-cyan-400">
            Global Worker Recruiter
          </span>
          <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
            Recruitment Marketplace
          </h2>
          <p className="text-xs text-slate-500">
            Verified employer sponsorships in Australia, Singapore, Serbia, Turkey, Malaysia, and Russia.
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search job title, company, skills..."
            className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs font-medium placeholder:text-slate-400 shadow-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
        </form>

        {/* Country Filter Carousel (Only 6 allowed) */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
          <button
            onClick={() => setSelectedCountry("all")}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ios-press ${
              selectedCountry === "all"
                ? "bg-blue-600 text-white shadow-xs"
                : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800"
            }`}
          >
            All Countries
          </button>
          {PRIMARY_COUNTRIES.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCountry(c.name)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-all ios-press ${
                selectedCountry === c.name
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800"
              }`}
            >
              <span>{c.flag}</span>
              <span>{c.name}</span>
            </button>
          ))}
        </div>

        {/* Category Pills */}
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-medium whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Featured Skilled Worker Programs Banner */}
      <div className="px-4">
        <div className="rounded-[28px] overflow-hidden bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-4 text-white relative shadow-lg">
          <div className="relative z-10 space-y-1.5 max-w-[260px]">
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-500/30 text-cyan-300 border border-blue-400/30">
              Government Endorsed Quotas
            </span>
            <h3 className="text-base font-bold leading-tight">
              Build Your Career Abroad with Work Permit Sponsorship
            </h3>
            <p className="text-[11px] text-blue-200">
              Free accommodation for Serbia, PR pathways for Australia, high tax-free packages in Singapore.
            </p>
          </div>
        </div>
      </div>

      {/* Jobs List */}
      <div className="px-4 space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Available Positions ({jobs.length})
          </h3>
          <span className="text-xs text-slate-500">Live Quotas</span>
        </div>

        {isLoading ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            Loading verified opportunities...
          </div>
        ) : jobs.length === 0 ? (
          <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 text-center space-y-2">
            <Briefcase className="w-8 h-8 text-slate-400 mx-auto" />
            <h4 className="font-bold text-sm">No vacancies found</h4>
            <p className="text-xs text-slate-500">
              Try selecting "All Countries" or clearing your filter keywords.
            </p>
          </div>
        ) : (
          jobs.map((job) => (
            <div
              key={job.id}
              className="rounded-[26px] p-4 bg-white dark:bg-slate-900 border border-white/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-blue-50 dark:bg-blue-950/80 text-2xl flex items-center justify-center border border-blue-100 dark:border-blue-900/40">
                    {job.flag}
                  </div>
                  <div>
                    <h4 className="text-[14px] font-bold text-slate-900 dark:text-white leading-tight">
                      {job.title}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                      {job.company} • {job.country}
                    </p>
                  </div>
                </div>

                {job.isFeatured && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 text-[10px] font-bold">
                    Featured
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1.5 rounded-xl">
                  <DollarSign className="w-3.5 h-3.5" />
                  <span className="truncate">{job.salary}</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 px-2.5 py-1.5 rounded-xl">
                  <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="truncate">{job.location}</span>
                </div>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                {job.description}
              </p>

              <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800">
                <span className="text-[11px] text-slate-400">
                  {job.vacancies} open spots • Exp: {job.experience}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedJob(job)}
                    className="px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-200 ios-press"
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => {
                      setApplyingJob(job);
                      setApplySubmitted(false);
                    }}
                    className="px-3.5 py-1.5 rounded-full bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 shadow-xs ios-press"
                  >
                    Apply Now
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* JOB DETAILS MODAL */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-t-[32px] sm:rounded-[32px] p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{selectedJob.flag}</span>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {selectedJob.title}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {selectedJob.company} • {selectedJob.location}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedJob(null)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-800/60 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-blue-600 dark:text-cyan-400 block">
                  Offered Salary
                </span>
                <span className="text-sm font-black text-slate-900 dark:text-white">
                  {selectedJob.salary}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block text-right">
                  Employment Stream
                </span>
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {selectedJob.jobType}
                </span>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-1">
                Job Overview
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {selectedJob.description}
              </p>
            </div>

            {selectedJob.requirements && (
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2">
                  Requirements & Eligibility
                </h4>
                <ul className="space-y-1.5">
                  {selectedJob.requirements.map((req, i) => (
                    <li key={i} className="text-xs text-slate-600 dark:text-slate-300 flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {selectedJob.benefits && (
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2">
                  Relocation & Benefits
                </h4>
                <ul className="space-y-1.5">
                  {selectedJob.benefits.map((ben, i) => (
                    <li key={i} className="text-xs text-slate-600 dark:text-slate-300 flex items-start gap-2">
                      <Sparkles className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                      <span>{ben}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <button
              onClick={() => {
                const j = selectedJob;
                setSelectedJob(null);
                setApplyingJob(j);
                setApplySubmitted(false);
              }}
              className="w-full py-3.5 rounded-full bg-blue-600 text-white font-bold text-sm shadow-md hover:bg-blue-700 transition-all ios-press"
            >
              Proceed to Quick Apply
            </button>
          </div>
        </div>
      )}

      {/* QUICK APPLY MODAL */}
      {applyingJob && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-t-[32px] sm:rounded-[32px] p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-[10px] font-bold uppercase text-blue-600 dark:text-cyan-400">
                  Candidate Application
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Apply for {applyingJob.title}
                </h3>
              </div>
              <button
                onClick={() => setApplyingJob(null)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {applySubmitted ? (
              <div className="py-6 text-center space-y-3">
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                  Application Submitted!
                </h4>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  Our overseas recruitment team will review your profile with {applyingJob.company} and schedule an initial video interview within 48 hours.
                </p>
                <button
                  onClick={() => setApplyingJob(null)}
                  className="px-6 py-2.5 rounded-full bg-blue-600 text-white font-bold text-xs"
                >
                  Done
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Candidate Full Name
                  </label>
                  <input
                    type="text"
                    value={applicantName}
                    onChange={(e) => setApplicantName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={applicantEmail}
                      onChange={(e) => setApplicantEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      Phone / WhatsApp
                    </label>
                    <input
                      type="tel"
                      value={applicantPhone}
                      onChange={(e) => setApplicantPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Attached Resume / CV
                  </label>
                  <button
                    type="button"
                    onClick={() => cvPicker.current?.click()}
                    className="w-full p-3 rounded-xl bg-blue-500/10 flex items-center justify-between ios-press"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <Upload className="w-4 h-4 text-blue-600 flex-shrink-0" />
                      <span className="text-xs font-semibold text-slate-800 truncate">
                        {cvFile ? cvFile.name : "Choose your CV file"}
                      </span>
                    </div>
                    <span className="text-[11px] text-blue-600 font-semibold">{cvFile ? "Change" : "Browse"}</span>
                  </button>
                  <input
                    ref={cvPicker}
                    type="file"
                    accept="application/pdf,image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={(e) => setCvFile(e.target.files?.[0] || null)}
                  />
                  {applyError && <p className="text-[11.5px] font-semibold text-rose-600 mt-1.5">{applyError}</p>}
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Statement of Interest / Relocation Readiness
                  </label>
                  <textarea
                    rows={2}
                    value={applicantCover}
                    onChange={(e) => setApplicantCover(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium outline-none resize-none"
                  />
                </div>

                <button
                  onClick={handleApply}
                  className="w-full py-3.5 rounded-full bg-blue-600 text-white font-bold text-xs shadow-md hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Submit Candidate Profile</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
