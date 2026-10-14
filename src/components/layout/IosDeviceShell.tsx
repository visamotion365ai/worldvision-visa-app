"use client";

import React, { useCallback, useEffect, useState } from "react";
import { MessageCircle, ShieldCheck } from "lucide-react";
import { BrandHeader } from "@/components/common/BrandHeader";
import { BottomTabBar, NavTab } from "@/components/common/BottomTabBar";
import { HomeView } from "@/components/home/HomeView";
import { CountriesDiscoveryView } from "@/components/country/CountriesDiscoveryView";
import { ServicesView } from "@/components/services/ServicesView";
import { ApplicationTrackingView } from "@/components/applications/ApplicationTrackingView";
import { ProfileView } from "@/components/profile/ProfileView";
import { CountryDetailView } from "@/components/country/CountryDetailView";
import { VisaApplicationWizard } from "@/components/application/VisaApplicationWizard";
import { RecruitmentView } from "@/components/recruitment/RecruitmentView";
import { DocumentCenterView } from "@/components/documents/DocumentCenterView";
import { LiveChatSheet } from "@/components/chat/LiveChatSheet";
import { NotificationSheet } from "@/components/notifications/NotificationSheet";
import { SearchSheet } from "@/components/search/SearchSheet";
import { PwaInstallSheet } from "@/components/common/PwaInstallSheet";
import { PRIMARY_COUNTRIES, CountryInfo } from "@/lib/countryData";
import type { AuthedUser } from "@/components/auth/AuthScreen";

interface Props {
  user: AuthedUser;
  onLogout: () => void;
  onOpenStaff?: () => void;
}

const SubHeader: React.FC<{ title: string; backLabel: string; onBack: () => void }> = ({ title, backLabel, onBack }) => (
  <div className="sticky top-0 z-20 px-4 py-3 lg flex items-center justify-between">
    <button onClick={onBack} className="text-[13px] font-bold text-blue-600 ios-press">← {backLabel}</button>
    <span className="text-[14px] font-extrabold text-slate-900">{title}</span>
    <div className="w-16" />
  </div>
);

export const IosDeviceShell: React.FC<Props> = ({ user, onLogout, onOpenStaff }) => {
  const [currentTab, setCurrentTab] = useState<NavTab>("today");
  const [selectedCountry, setSelectedCountry] = useState<CountryInfo | null>(null);
  const [wizard, setWizard] = useState<{ country: string; visa: string } | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isInstallGuideOpen, setIsInstallGuideOpen] = useState(false);
  const [showRecruitment, setShowRecruitment] = useState(false);
  const [showDocs, setShowDocs] = useState(false);
  const [unread, setUnread] = useState(0);
  const [activeApps, setActiveApps] = useState(0);
  const [appsVersion, setAppsVersion] = useState(0);

  // Deep links from the PWA manifest shortcuts (?tab=applications)
  useEffect(() => {
    const t = new URLSearchParams(window.location.search).get("tab");
    if (t && ["today", "countries", "services", "applications", "profile"].includes(t)) setCurrentTab(t as NavTab);
  }, []);

  const refreshCounters = useCallback(async () => {
    try {
      const [n, a] = await Promise.all([fetch("/api/notifications").then((r) => r.json()), fetch("/api/applications").then((r) => r.json())]);
      if (n.success) setUnread(n.unread || 0);
      if (a.success) setActiveApps(a.applications.filter((x: any) => !["completed", "rejected"].includes(x.status)).length);
    } catch {}
  }, []);
  useEffect(() => {
    refreshCounters();
    const t = setInterval(refreshCounters, 30000);
    return () => clearInterval(t);
  }, [refreshCounters, isNotificationsOpen, appsVersion]);

  const startApplication = (country?: string, visa?: string) => {
    setSelectedCountry(null);
    setWizard({ country: country || "Australia", visa: visa || "Work Visa" });
  };

  const onSubPage = !!selectedCountry || showRecruitment || showDocs;
  const view = selectedCountry ? `c-${selectedCountry.id}` : showRecruitment ? "rec" : showDocs ? "docs" : currentTab;

  return (
    <div className="app-height w-full max-w-md md:max-w-xl mx-auto relative flex flex-col overflow-hidden">
      <div className="pt-safe flex-shrink-0 z-30">
        {!onSubPage && (
          <>
            {onOpenStaff && (
              <button onClick={onOpenStaff} className="w-full lg-btn py-2 text-[12px] font-bold flex items-center justify-center gap-1.5 ios-press">
                <ShieldCheck className="w-3.5 h-3.5" /> Back to {user.role === "admin" ? "Admin" : "Visa Desk"} console
              </button>
            )}
            <BrandHeader onOpenNotifications={() => setIsNotificationsOpen(true)} unreadCount={unread} />
          </>
        )}
      </div>

      <main key={view} className="flex-1 overflow-y-auto smooth-scroll no-scrollbar relative page-enter">
        {selectedCountry ? (
          <CountryDetailView country={selectedCountry} onBack={() => setSelectedCountry(null)} onStartApplication={(c, v) => startApplication(c, v)} onSelectJob={() => { setSelectedCountry(null); setShowRecruitment(true); }} />
        ) : showRecruitment ? (
          <>
            <SubHeader title="Global Recruitment" backLabel="Back" onBack={() => setShowRecruitment(false)} />
            <RecruitmentView user={user} onApplySuccess={refreshCounters} />
          </>
        ) : showDocs ? (
          <>
            <SubHeader title="Document Vault" backLabel="Profile" onBack={() => setShowDocs(false)} />
            <DocumentCenterView />
          </>
        ) : (
          <>
            {currentTab === "today" && (
              <HomeView
                onSelectCountry={(c) => setSelectedCountry(c)}
                onSelectService={() => setCurrentTab("services")}
                onStartApplication={startApplication}
                onOpenRecruitment={() => setShowRecruitment(true)}
                onOpenApplications={() => setCurrentTab("applications")}
                onOpenInstallGuide={() => setIsInstallGuideOpen(true)}
                onOpenSearch={() => setIsSearchOpen(true)}
              />
            )}
            {currentTab === "countries" && (
              <CountriesDiscoveryView onSelectCountry={(c) => setSelectedCountry(c)} onSelectService={() => setCurrentTab("services")} onOpenRecruitment={() => setShowRecruitment(true)} onOpenApplications={() => setCurrentTab("applications")} />
            )}
            {currentTab === "services" && <ServicesView onStartApplication={startApplication} onOpenRecruitment={() => setShowRecruitment(true)} />}
            {currentTab === "applications" && <ApplicationTrackingView key={appsVersion} user={user} onStartNewApplication={() => startApplication()} />}
            {currentTab === "profile" && (
              <ProfileView
                user={user}
                onOpenApplications={() => setCurrentTab("applications")}
                onOpenDocuments={() => setShowDocs(true)}
                onOpenNotifications={() => setIsNotificationsOpen(true)}
                onOpenSupport={() => setIsChatOpen(true)}
                onOpenInstall={() => setIsInstallGuideOpen(true)}
                onLogout={onLogout}
              />
            )}
          </>
        )}
      </main>

      {!selectedCountry && !wizard && (
        <button
          onClick={() => setIsChatOpen(true)}
          className="absolute bottom-[104px] right-4 z-30 w-14 h-14 rounded-full lg-btn flex items-center justify-center ios-press"
          aria-label="Chat with World Vision support"
        >
          <MessageCircle className="w-6 h-6" />
          <span className="absolute top-0.5 right-0.5 w-3.5 h-3.5 bg-emerald-400 rounded-full ring-2 ring-white" />
        </button>
      )}

      <BottomTabBar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setSelectedCountry(null);
          setShowRecruitment(false);
          setShowDocs(false);
          setCurrentTab(tab);
        }}
        applicationsBadge={activeApps}
      />

      {wizard && (
        <VisaApplicationWizard
          initialCountry={wizard.country}
          initialVisaType={wizard.visa}
          user={user}
          onClose={() => setWizard(null)}
          onApplicationCreated={() => setAppsVersion((v) => v + 1)}
          onViewApplications={() => setCurrentTab("applications")}
        />
      )}

      <LiveChatSheet
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        onSelectCountry={(name) => {
          setIsChatOpen(false);
          const f = PRIMARY_COUNTRIES.find((c) => c.name.toLowerCase() === name.toLowerCase());
          if (f) setSelectedCountry(f);
        }}
      />
      <NotificationSheet
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        onSelectApplication={() => { setIsNotificationsOpen(false); setCurrentTab("applications"); }}
        onSelectDocument={() => { setIsNotificationsOpen(false); setShowDocs(true); }}
      />
      <SearchSheet
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectCountry={(c) => setSelectedCountry(c)}
        onSelectService={() => setCurrentTab("services")}
        onSelectRecruitment={() => setShowRecruitment(true)}
      />
      <PwaInstallSheet isOpen={isInstallGuideOpen} onClose={() => setIsInstallGuideOpen(false)} />
    </div>
  );
};
