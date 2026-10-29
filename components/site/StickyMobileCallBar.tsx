"use client";

import React from "react";
import { Phone, ArrowRight, MessageSquare } from "lucide-react";
import { parsedClientConfig } from "@/config/client.config";
import { CallLink } from "./CallLink";
import { EstimateCtaLink } from "./EstimateCtaLink";

export function StickyMobileCallBar() {
  const { phone, phoneDisplay } = parsedClientConfig.business;
  const isAiEnabled = Boolean(parsedClientConfig.ai?.enabled);

  return (
    <aside
      aria-label="Quick contact actions"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-ink/95 backdrop-blur-md border-t border-white/10 px-3 py-2 pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))] shadow-technical"
    >
      <div
        className={`grid gap-2 max-w-md mx-auto ${
          isAiEnabled ? "grid-cols-[1fr_1.4fr_auto]" : "grid-cols-2"
        }`}
      >
        <CallLink
          phone={phone}
          className="h-[52px] min-h-[48px] inline-flex items-center justify-center gap-1.5 px-2.5 sm:px-3 rounded-sm border border-steel-700 bg-charcoal text-paper font-sans font-semibold text-xs min-[360px]:text-sm hover:bg-steel-800 active:bg-steel-800 transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-signal-blue"
          aria-label={`Call ${phoneDisplay}`}
        >
          <Phone className="w-4 h-4 text-amber shrink-0" aria-hidden="true" />
          <span>Call</span>
        </CallLink>

        <EstimateCtaLink
          href="/contact"
          className="h-[52px] min-h-[48px] inline-flex items-center justify-center gap-1 px-2 min-[360px]:px-3 rounded-sm bg-amber text-ink font-sans font-semibold text-xs min-[360px]:text-sm hover:bg-amber-strong active:bg-amber-strong transition-colors duration-150 shadow-technical focus-visible:outline-2 focus-visible:outline-signal-blue whitespace-nowrap"
        >
          <span>Request Estimate</span>
          <ArrowRight className="w-4 h-4 shrink-0" aria-hidden="true" />
        </EstimateCtaLink>

        {isAiEnabled && (
          <button
            type="button"
            onClick={() => {
              if (typeof window !== "undefined") {
                window.dispatchEvent(new Event("assistant:open"));
              }
            }}
            aria-label="Ask a question with the AI assistant"
            className="h-[52px] min-h-[48px] inline-flex items-center justify-center gap-1.5 px-2.5 min-[360px]:px-3 rounded-sm border border-steel-700 bg-charcoal text-paper font-sans font-semibold text-xs min-[360px]:text-sm hover:bg-steel-800 active:bg-steel-800 transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-signal-blue shrink-0"
          >
            <MessageSquare className="w-4 h-4 text-amber shrink-0" aria-hidden="true" />
            <span>Ask</span>
          </button>
        )}
      </div>
    </aside>
  );
}
