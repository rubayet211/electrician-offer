import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Phone } from "lucide-react";
import { parsedClientConfig } from "@/config/client.config";
import { canonicalUrl, offeredServices } from "@/lib/config/site";
import { Section, Container, Card, Notice } from "@/components/ui";
import { CallLink } from "@/components/site/CallLink";
import { EstimateCtaLink } from "@/components/site/EstimateCtaLink";
import { ServiceIcon } from "@/components/site/icons";

export function generateMetadata(): Metadata {
  return {
    title: `Electrical Services | ${parsedClientConfig.business.name}`,
    description: `Comprehensive electrical contractor services in ${parsedClientConfig.business.address.city}, ${parsedClientConfig.business.address.state}. Repairs, panel upgrades, EV chargers, lighting, and inspections.`,
    alternates: {
      canonical: canonicalUrl("/services"),
    },
  };
}

export default function ServicesPage() {
  const { business } = parsedClientConfig;
  const services = offeredServices();

  // Categorize offered services
  const repairServices = services.filter((s) =>
    ["repair-troubleshooting", "outlets-switches"].includes(s.slug),
  );

  const upgradeServices = services.filter((s) =>
    [
      "panel-upgrades",
      "ev-charger-installation",
      "lighting-installation",
      "generator-installation",
      "surge-protection",
    ].includes(s.slug),
  );

  const safetyServices = services.filter((s) => ["electrical-inspections"].includes(s.slug));

  // Any remaining offered services not in the above explicit buckets
  const otherServices = services.filter(
    (s) =>
      !repairServices.includes(s) && !upgradeServices.includes(s) && !safetyServices.includes(s),
  );

  const groups = [
    {
      title: "Diagnostic Repairs & Troubleshooting",
      description:
        "Tracing circuit faults, restoring failed outlets, and addressing breaker trips.",
      items: repairServices,
    },
    {
      title: "Upgrades & Equipment Installations",
      description:
        "Modernizing service capacity, installing vehicle chargers, and expanding power systems.",
      items: upgradeServices,
    },
    {
      title: "Safety Assessments & Inspections",
      description:
        "Comprehensive panel reviews, pre-purchase evaluations, and system condition assessments.",
      items: safetyServices,
    },
    ...(otherServices.length > 0
      ? [
          {
            title: "Additional Services",
            description: "Specialized electrical services provided by our team.",
            items: otherServices,
          },
        ]
      : []),
  ].filter((g) => g.items.length > 0);

  return (
    <>
      {/* Header Banner */}
      <Section tone="dark" blueprint={true} className="py-14 sm:py-20">
        <Container>
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-sm bg-steel-900 border border-steel-700 text-xs font-mono text-amber">
              <span>ELECTRICAL SERVICE DIRECTORY</span>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-paper tracking-tight">
              Electrical Services & Solutions
            </h1>
            <p className="text-base sm:text-lg text-steel-300 leading-relaxed font-sans">
              Explore our offered electrical installations, updates, and diagnostic repair services.
            </p>
          </div>
        </Container>
      </Section>

      {/* Safety Notice */}
      <div className="bg-steel-50 border-b border-steel-200 py-6">
        <Container>
          <Notice type="safety" title="Electrical Safety Notice">
            If you are experiencing active sparking, smoke, or a burning odor, leave the area
            immediately and dial 911.
          </Notice>
        </Container>
      </div>

      {/* Grouped Services */}
      <Section tone="light" borderBottom={true}>
        <Container>
          <div className="space-y-16">
            {groups.map((group, gIdx) => (
              <div key={gIdx} className="space-y-6">
                <div className="border-b border-steel-200 pb-4">
                  <h2 className="font-display text-2xl font-bold text-ink tracking-tight">
                    {group.title}
                  </h2>
                  <p className="text-sm text-steel-600 mt-1">{group.description}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {group.items.map((service) => {
                    return (
                      <Card
                        key={service.slug}
                        tone="paper"
                        padding="md"
                        cornerTicks={true}
                        className="flex flex-col justify-between hover:border-steel-400 transition-colors duration-150"
                      >
                        <div className="space-y-4">
                          <div className="w-10 h-10 rounded-sm bg-steel-50 border border-steel-200 flex items-center justify-center text-ink">
                            <ServiceIcon
                              name={service.icon || service.title}
                              className="w-5 h-5 text-steel-700"
                            />
                          </div>

                          <div>
                            <h3 className="font-display text-lg font-bold text-ink mb-1 tracking-tight">
                              {service.title}
                            </h3>
                            <p className="text-sm text-steel-600 leading-relaxed font-sans line-clamp-3">
                              {service.shortDescription}
                            </p>
                          </div>
                        </div>

                        <div className="pt-6 border-t border-steel-100 flex items-center justify-between mt-4">
                          <Link
                            href={`/services/${service.slug}`}
                            className="font-mono text-xs font-semibold uppercase tracking-wider text-ink hover:text-signal-blue inline-flex items-center gap-1.5 focus-visible:outline-2 focus-visible:outline-signal-blue rounded-sm py-1"
                          >
                            <span>Learn more</span>
                            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                          </Link>

                          <EstimateCtaLink
                            href={`/contact?service=${service.slug}`}
                            serviceSlug={service.slug}
                            className="font-mono text-xs text-amber-strong hover:underline font-semibold"
                          >
                            Request estimate →
                          </EstimateCtaLink>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* Call to Action Band */}
      <Section tone="dark" blueprint={true} className="py-14">
        <Container size="narrow" className="text-center space-y-6">
          <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-paper tracking-tight">
            {parsedClientConfig.positioning?.closingHeadline ||
              "Have an electrical project in mind?"}
          </h2>
          <p className="text-steel-300 text-sm sm:text-base max-w-xl mx-auto font-sans leading-relaxed">
            Speak directly with our team or submit a request online with project details and photos.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <CallLink
              phone={business.phone}
              className="w-full sm:w-auto min-h-[48px] px-6 py-3 rounded-sm bg-amber text-ink font-semibold text-base hover:bg-amber-strong transition-colors duration-150 shadow-technical flex items-center justify-center gap-2"
            >
              <Phone className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>Call {business.phoneDisplay}</span>
            </CallLink>

            <EstimateCtaLink
              href="/contact"
              className="w-full sm:w-auto min-h-[48px] px-6 py-3 rounded-sm bg-charcoal text-paper border border-steel-700 hover:border-steel-500 hover:bg-steel-800 transition-colors duration-150 flex items-center justify-center gap-2 text-base font-semibold"
            >
              <span>Request an Estimate</span>
              <ArrowRight className="w-4 h-4 text-amber" aria-hidden="true" />
            </EstimateCtaLink>
          </div>
        </Container>
      </Section>
    </>
  );
}
