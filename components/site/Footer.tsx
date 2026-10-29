import React from "react";
import Link from "next/link";
import { Zap, MapPin, Phone, Mail, Clock } from "lucide-react";
import { parsedClientConfig } from "@/config/client.config";
import { isDemo } from "@/lib/config/site";
import { CallLink } from "./CallLink";
import { Badge } from "@/components/ui";

export function Footer() {
  const { business, hours, serviceAreas, credentials, services } = parsedClientConfig;
  const demo = isDemo();

  const activeLicense = credentials.licenses.find(
    (l) => l.status === "verified" || (demo && l.isSample),
  );

  return (
    <footer
      role="contentinfo"
      className="bg-ink text-paper border-t border-white/10 pt-16 pb-20 md:pb-12"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8 mb-12">
          {/* Column 1: Company Info & NAP */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-sm bg-charcoal border border-steel-700 flex items-center justify-center text-amber">
                <Zap className="w-3.5 h-3.5 fill-amber/20" aria-hidden="true" />
              </span>
              <span className="font-display font-bold text-lg text-paper tracking-tight">
                {business.name}
              </span>
            </div>

            <p className="text-sm text-steel-400 leading-relaxed font-sans">
              Professional electrical installations, service upgrades, and diagnostic repairs for
              homeowners and property managers.
            </p>

            <div className="space-y-2 pt-2 text-sm text-steel-300">
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-amber shrink-0" aria-hidden="true" />
                <CallLink
                  phone={business.phone}
                  className="font-mono hover:text-paper transition-colors duration-150"
                >
                  {business.phoneDisplay}
                </CallLink>
              </div>

              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-steel-400 shrink-0" aria-hidden="true" />
                <a
                  href={`mailto:${business.email}`}
                  className="font-mono text-xs hover:text-paper transition-colors duration-150"
                >
                  {business.email}
                </a>
              </div>

              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-steel-400 shrink-0 mt-0.5" aria-hidden="true" />
                <span className="text-xs">
                  {business.address.showPublicly && business.address.street
                    ? `${business.address.street}, ${business.address.city}, ${business.address.state} ${business.address.zip}`
                    : `${business.address.city}, ${business.address.state}`}
                </span>
              </div>
            </div>
          </div>

          {/* Column 2: Offered Services */}
          <div>
            <h3 className="font-mono text-xs uppercase tracking-wider text-steel-400 mb-4 pb-2 border-b border-white/10 font-semibold">
              Electrical Services
            </h3>
            <ul className="space-y-2 text-sm list-none p-0 m-0">
              {services
                .filter((s) => s.offered)
                .slice(0, 6)
                .map((service) => (
                  <li key={service.slug}>
                    <Link
                      href={`/services/${service.slug}`}
                      className="text-steel-300 hover:text-paper hover:underline transition-colors duration-150 text-sm"
                    >
                      {service.title}
                    </Link>
                  </li>
                ))}
              <li>
                <Link
                  href="/services"
                  className="text-amber hover:text-amber-strong text-xs font-semibold inline-flex items-center gap-1 mt-1"
                >
                  View all services →
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Service Areas & Hours */}
          <div className="space-y-6">
            <div>
              <h3 className="font-mono text-xs uppercase tracking-wider text-steel-400 mb-4 pb-2 border-b border-white/10 font-semibold">
                Service Areas
              </h3>
              <ul className="space-y-1.5 text-sm list-none p-0 m-0">
                {serviceAreas.slice(0, 4).map((area) => (
                  <li key={area.name} className="text-steel-300 text-sm">
                    {area.name}
                  </li>
                ))}
              </ul>
              <Link
                href="/service-areas"
                className="text-amber hover:text-amber-strong text-xs font-semibold inline-flex items-center gap-1 mt-2"
              >
                All service areas →
              </Link>
            </div>

            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-steel-400 mb-2 font-semibold uppercase tracking-wider">
                <Clock className="w-3.5 h-3.5 text-amber" aria-hidden="true" />
                <span>Operating Hours</span>
              </div>
              <ul className="space-y-1 text-xs text-steel-300 font-mono list-none p-0 m-0">
                {hours.map((h, i) => (
                  <li key={i}>
                    {h.days.replace(/[\u2010-\u2015\u2212\x96–—]/g, " - ")}: {h.open} - {h.close}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Column 4: License & Credentials */}
          <div className="space-y-4">
            <h3 className="font-mono text-xs uppercase tracking-wider text-steel-400 mb-4 pb-2 border-b border-white/10 font-semibold">
              License & Verification
            </h3>

            {activeLicense ? (
              <div className="p-4 rounded-md bg-charcoal border border-steel-700 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs text-steel-300 font-semibold">
                    {activeLicense.label}
                  </span>
                  {activeLicense.isSample || demo ? (
                    <Badge variant="sample">SAMPLE</Badge>
                  ) : activeLicense.status === "verified" ? (
                    <Badge variant="verified">Verified</Badge>
                  ) : null}
                </div>
                <div className="font-mono text-sm text-paper font-semibold tracking-wider">
                  #{activeLicense.number}
                </div>
                <div className="text-xs text-steel-400">
                  {activeLicense.issuingAuthority} · {activeLicense.jurisdiction}
                </div>
              </div>
            ) : (
              <p className="text-xs text-steel-400">Residential electrical services.</p>
            )}

            <div className="pt-2 text-xs text-steel-400">
              <p className="leading-relaxed">
                Emergency safety notice: Sparks, smoke, or burning smell? Leave the area immediately
                and call 911.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-steel-400">
          <div>
            © {new Date().getFullYear()} {business.name}. All rights reserved.
          </div>

          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-paper transition-colors duration-150">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-paper transition-colors duration-150">
              Terms of Service
            </Link>
            <span className="text-steel-600" aria-hidden="true">
              ·
            </span>
            <span className="text-steel-500">Website by Axinofy</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
