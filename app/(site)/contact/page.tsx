import React, { Suspense } from "react";
import type { Metadata } from "next";
import { Phone, Mail, Clock, MapPin } from "lucide-react";
import { parsedClientConfig } from "@/config/client.config";
import { Section, Container, Card, Notice } from "@/components/ui";
import { CallLink } from "@/components/site/CallLink";
import { EstimateForm } from "@/components/site/estimate/EstimateForm";
import { buildMetadata } from "@/lib/seo/metadata";

export function generateMetadata(): Metadata {
  return buildMetadata({
    title: "Request an Estimate & Contact",
    description: `Submit an online electrical service estimate request or call ${parsedClientConfig.business.name}. Written estimates and direct communication.`,
    path: "/contact",
  });
}

export default function ContactPage() {
  const { business, hours, serviceAreas } = parsedClientConfig;

  return (
    <>
      {/* Header Banner */}
      <Section tone="dark" blueprint={true} className="py-12 sm:py-16">
        <Container>
          <div className="max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-sm bg-steel-900 border border-steel-700 text-xs font-mono text-amber">
              <Phone className="w-3.5 h-3.5" aria-hidden="true" />
              <span>DIRECT ESTIMATES & COMMUNICATION</span>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-paper tracking-tight">
              Request an Estimate
            </h1>
            <p className="text-base sm:text-lg text-steel-300 leading-relaxed font-sans">
              Provide project details below for an estimate, or call our office directly to discuss
              your project.
            </p>
          </div>
        </Container>
      </Section>

      {/* Safety Notice */}
      <div className="bg-steel-50 border-b border-steel-200 py-4">
        <Container>
          <Notice type="safety" title="Immediate Safety Warning">
            If you smell burning, see smoke, or witness active sparks, stop immediately: leave the
            area and dial 911.
          </Notice>
        </Container>
      </div>

      {/* Form & Contact Details Grid */}
      <Section tone="light" borderBottom={true} className="py-12 sm:py-16">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            {/* Form Column (Left / Main) */}
            <div className="lg:col-span-8">
              <Suspense
                fallback={
                  <div className="p-8 rounded-md border border-steel-200 bg-paper animate-pulse space-y-4">
                    <div className="h-6 w-1/3 bg-steel-200 rounded" />
                    <div className="h-4 w-2/3 bg-steel-100 rounded" />
                    <div className="h-40 bg-steel-50 rounded" />
                  </div>
                }
              >
                <EstimateForm />
              </Suspense>
            </div>

            {/* Sidebar Column (Right) */}
            <div className="lg:col-span-4 space-y-6">
              {/* Direct Phone Call Card */}
              <Card tone="dark" padding="lg" cornerTicks={true} className="space-y-4">
                <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-amber font-semibold">
                  <Phone className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>DIRECT OFFICE LINE</span>
                </div>

                <div className="space-y-1">
                  <CallLink
                    phone={business.phone}
                    className="font-mono text-2xl font-bold text-paper hover:text-amber transition-colors block select-all"
                  >
                    {business.phoneDisplay}
                  </CallLink>
                  <p className="text-xs text-steel-300 font-sans leading-relaxed">
                    Call to discuss urgent issues, review project scopes, or ask questions.
                  </p>
                </div>

                <div className="pt-2 border-t border-white/10 text-xs text-steel-400 font-mono">
                  <div className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-steel-500" aria-hidden="true" />
                    <a href={`mailto:${business.email}`} className="hover:text-paper">
                      {business.email}
                    </a>
                  </div>
                </div>
              </Card>

              {/* Business Hours */}
              <Card tone="paper" padding="md" className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-steel-700 font-semibold border-b border-steel-100 pb-2">
                  <Clock className="w-4 h-4 text-steel-500" aria-hidden="true" />
                  <span>Operating Hours</span>
                </div>

                <ul className="space-y-2 text-xs font-mono text-steel-600 list-none p-0 m-0">
                  {hours.map((h, idx) => (
                    <li key={idx} className="flex justify-between">
                      <span className="font-semibold text-ink">
                        {h.days.replace(/[\u2010-\u2015\u2212\x96–—]/g, " - ")}
                      </span>
                      <span>
                        {h.open} - {h.close}
                      </span>
                    </li>
                  ))}
                </ul>
              </Card>

              {/* Service Areas Note */}
              <Card tone="paper" padding="md" className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-steel-700 font-semibold border-b border-steel-100 pb-2">
                  <MapPin className="w-4 h-4 text-steel-500" aria-hidden="true" />
                  <span>Service Area Coverage</span>
                </div>

                <p className="text-xs text-steel-600 leading-relaxed font-sans">
                  Service areas include {serviceAreas.map((a) => a.name).join(", ")}. If your ZIP
                  code is in a neighboring district, send your details and we will check
                  availability.
                </p>
              </Card>

              {/* What Happens Next Summary */}
              <Card tone="subtle" padding="md" className="space-y-3">
                <span className="font-mono text-xs uppercase tracking-wider text-steel-600 font-semibold block border-b border-steel-200 pb-2">
                  WHAT HAPPENS NEXT
                </span>

                <ol className="space-y-2 text-xs font-sans text-steel-700 list-none p-0 m-0">
                  <li className="flex items-start gap-2">
                    <span className="font-mono font-bold text-ink shrink-0">1.</span>
                    <span>An electrician reviews your submitted project scope.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-mono font-bold text-ink shrink-0">2.</span>
                    <span>We call you to confirm technical details and scheduling.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-mono font-bold text-ink shrink-0">3.</span>
                    <span>
                      You receive an itemized written estimate before physical work starts.
                    </span>
                  </li>
                </ol>
              </Card>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
