import React from "react";
import type { Metadata } from "next";
import { FileText } from "lucide-react";
import { parsedClientConfig } from "@/config/client.config";
import { Section, Container, Notice } from "@/components/ui";
import { buildMetadata } from "@/lib/seo/metadata";

export function generateMetadata(): Metadata {
  return buildMetadata({
    title: "Terms of Service",
    description: `Terms and conditions governing estimates, services, and online communication with ${parsedClientConfig.business.name}.`,
    path: "/terms",
  });
}

export default function TermsPage() {
  const { business } = parsedClientConfig;

  return (
    <>
      <Section tone="dark" blueprint={true} className="py-12 sm:py-16">
        <Container size="narrow">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-sm bg-steel-900 border border-steel-700 text-xs font-mono text-amber">
              <FileText className="w-3.5 h-3.5" aria-hidden="true" />
              <span>TERMS OF ENGAGEMENT</span>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-paper tracking-tight">
              Terms of Service
            </h1>
            <p className="text-sm sm:text-base text-steel-300 font-mono">
              Last updated: October 2026 · {business.name}
            </p>
          </div>
        </Container>
      </Section>

      <Section tone="light" borderBottom={true} className="py-12 sm:py-16">
        <Container size="narrow">
          <div className="prose prose-slate max-w-none space-y-8 text-steel-700 font-sans text-sm sm:text-base leading-relaxed">
            <Notice type="safety" title="Non-Emergency Service Agreement">
              This website and online request forms are intended strictly for routine, planned, and
              scheduled electrical work. For active electrical hazards, burning odors, smoke, or
              sparks, vacate the premises immediately and dial 911.
            </Notice>

            <section className="space-y-3">
              <h2 className="font-display text-xl font-bold text-ink tracking-tight">
                1. Estimates & Proposals
              </h2>
              <p>
                Online or preliminary estimates provided by {business.name} represent non-binding
                initial assessments based on customer-provided descriptions and photographs. A
                binding written proposal is issued only after an on-site physical inspection
                confirms existing wiring conditions, service panel capacity, and municipal permit
                requirements.
              </p>
              <p>
                No physical electrical work commences without your explicit approval of the written
                scope of work.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-display text-xl font-bold text-ink tracking-tight">
                2. Customer Responsibilities
              </h2>
              <p>
                Property owners or authorized managers agree to provide safe, unimpeded access to
                electrical service equipment, subpanels, and designated work areas. Customers must
                never remove electrical covers, open sealed enclosures, or approach exposed wiring
                to photograph equipment for estimates.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-display text-xl font-bold text-ink tracking-tight">
                3. Permits and Regulatory Scope
              </h2>
              <p>
                Permit requirements, utility approvals, and applicable municipal regulations vary by
                jurisdiction and project scope. Specific permit responsibilities, fees, and
                inspection requirements will be identified in each written contract proposal prior
                to physical work.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-display text-xl font-bold text-ink tracking-tight">
                4. Intellectual Property & Site Attribution
              </h2>
              <p>
                All content, branding, and technical materials presented on this website are the
                property of {business.name} or its licensors. The managed website platform is
                engineered by Axinofy.
              </p>
            </section>
          </div>
        </Container>
      </Section>
    </>
  );
}
