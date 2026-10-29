import React from "react";
import { isDemo } from "@/lib/config/site";
import { DemoBanner } from "@/components/site/DemoBanner";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { StickyMobileCallBar } from "@/components/site/StickyMobileCallBar";
import { AssistantMount } from "@/components/site/AssistantMount";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  const showDemoBanner = isDemo();

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:bg-amber focus:text-ink focus:font-mono focus:text-sm focus:rounded-sm focus:shadow-technical focus:outline-2 focus:outline-signal-blue"
      >
        Skip to main content
      </a>

      {showDemoBanner && <DemoBanner />}
      <Header />

      <main
        id="main-content"
        tabIndex={-1}
        className="flex-1 pb-28 md:pb-0 focus:outline-none"
      >
        {children}
      </main>

      <Footer />
      <StickyMobileCallBar />
      <AssistantMount />
    </>
  );
}
