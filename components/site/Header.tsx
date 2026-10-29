"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Phone, Menu, X, ArrowRight, Zap } from "lucide-react";
import { parsedClientConfig } from "@/config/client.config";
import { CallLink } from "./CallLink";
import { EstimateCtaLink } from "./EstimateCtaLink";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const menuPanelRef = useRef<HTMLDivElement>(null);

  const { business } = parsedClientConfig;

  // Handle escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && mobileMenuOpen) {
        setMobileMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mobileMenuOpen]);

  // Trap focus or prevent background scroll when open on mobile
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  const navLinks = [
    { href: "/services", label: "Services" },
    { href: "/service-areas", label: "Service Areas" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <header className="sticky top-0 z-40 bg-ink border-b border-white/10 text-paper shadow-technical">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Logo / Wordmark */}
          <Link
            href="/"
            className="flex items-center gap-2.5 group focus-visible:outline-2 focus-visible:outline-signal-blue rounded-sm py-1"
            aria-label={`${business.name} home`}
          >
            <span
              className="w-8 h-8 rounded-sm bg-charcoal border border-steel-700 flex items-center justify-center text-amber group-hover:border-amber/60 transition-colors duration-150"
              aria-hidden="true"
            >
              <Zap className="w-4 h-4 fill-amber/20" />
            </span>
            <div className="flex flex-col">
              <span className="font-display font-bold text-xs min-[360px]:text-sm sm:text-lg tracking-tight text-paper group-hover:text-amber transition-colors duration-150 leading-tight line-clamp-2 max-w-[160px] min-[360px]:max-w-none">
                {business.name}
              </span>
              {parsedClientConfig.positioning?.tagline && (
                <span className="hidden min-[360px]:block font-mono text-[10px] uppercase tracking-widest text-steel-400">
                  {parsedClientConfig.positioning.tagline}
                </span>
              )}
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav aria-label="Main navigation" className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive =
                link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3.5 py-2 rounded-sm text-sm font-medium transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-signal-blue ${
                    isActive
                      ? "text-amber font-semibold bg-white/5"
                      : "text-steel-300 hover:text-paper hover:bg-white/5"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Desktop Right CTA Group */}
          <div className="hidden sm:flex items-center gap-3">
            <CallLink
              phone={business.phone}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-mono font-medium text-steel-200 hover:text-paper hover:bg-white/5 rounded-sm border border-steel-700 transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-signal-blue"
              aria-label={`Call ${business.phoneDisplay}`}
            >
              <Phone className="w-3.5 h-3.5 text-amber shrink-0" aria-hidden="true" />
              <span>{business.phoneDisplay}</span>
            </CallLink>

            <EstimateCtaLink
              href="/contact"
              className="inline-flex items-center gap-2 min-h-[44px] px-4 py-2 rounded-sm bg-amber text-ink font-semibold text-sm hover:bg-amber-strong active:bg-amber-strong transition-colors duration-150 shadow-technical focus-visible:outline-2 focus-visible:outline-signal-blue"
            >
              <span>Request Estimate</span>
              <ArrowRight className="w-4 h-4 shrink-0" aria-hidden="true" />
            </EstimateCtaLink>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex sm:hidden items-center gap-2">
            <CallLink
              phone={business.phone}
              className="w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center p-2 text-amber hover:text-amber-strong rounded-sm focus-visible:outline-2 focus-visible:outline-signal-blue"
              aria-label={`Call ${business.phoneDisplay}`}
            >
              <Phone className="w-5 h-5" aria-hidden="true" />
            </CallLink>

            <button
              ref={menuButtonRef}
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-nav-menu"
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              className="w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center p-2 text-steel-300 hover:text-paper hover:bg-white/5 rounded-sm focus-visible:outline-2 focus-visible:outline-signal-blue"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" aria-hidden="true" />
              ) : (
                <Menu className="w-6 h-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer / Dropdown */}
      {mobileMenuOpen && (
        <div
          id="mobile-nav-menu"
          ref={menuPanelRef}
          className="lg:hidden fixed inset-x-0 top-[73px] bottom-0 z-50 bg-ink/98 border-t border-white/10 px-6 py-6 overflow-y-auto flex flex-col justify-between"
        >
          <div className="space-y-4">
            <span className="font-mono text-xs uppercase tracking-wider text-steel-400 block pb-2 border-b border-white/10">
              Navigation
            </span>
            <nav aria-label="Mobile navigation" className="flex flex-col space-y-1">
              {navLinks.map((link) => {
                const isActive =
                  link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`py-3 px-3 text-base rounded-sm font-medium transition-colors ${
                      isActive
                        ? "text-amber font-semibold bg-white/5"
                        : "text-steel-200 hover:text-paper hover:bg-white/5"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="pt-6 border-t border-white/10 space-y-3 pb-8">
            <CallLink
              phone={business.phone}
              className="w-full min-h-[48px] flex items-center justify-center gap-2 px-4 py-3 rounded-sm border border-steel-700 bg-charcoal text-paper font-mono text-sm font-semibold hover:bg-steel-800"
            >
              <Phone className="w-4 h-4 text-amber" aria-hidden="true" />
              <span>{business.phoneDisplay}</span>
            </CallLink>

            <EstimateCtaLink
              href="/contact"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full min-h-[48px] flex items-center justify-center gap-2 px-4 py-3 rounded-sm bg-amber text-ink font-semibold text-base hover:bg-amber-strong shadow-technical"
            >
              <span>Request an Estimate</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </EstimateCtaLink>
          </div>
        </div>
      )}
    </header>
  );
}
