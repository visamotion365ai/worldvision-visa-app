import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "@fontsource-variable/inter";
import "./globals.css";
import { ServiceWorkerRegister } from "@/components/common/ServiceWorkerRegister";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#dbe7ff",
};

export const metadata: Metadata = {
  applicationName: "World Vision Consultancy",
  title: "World Vision Consultancy | ওয়ার্ল্ড ভিশন কনসালটেন্সী",
  description: "Global Worker Recruiter & Visa Agency — Australia, Singapore, Serbia, Turkey, Malaysia, Russia.",
  manifest: "/manifest.json",
  icons: { icon: "/pwa-icon/192", apple: "/pwa-icon/180" },
  appleWebApp: { capable: true, statusBarStyle: "default", title: "World Vision" },
  formatDetection: { telephone: false },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
