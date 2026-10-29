import React from "react";
import type { Metadata } from "next";
import { MapPin, Phone, ArrowRight } from "lucide-react";
import { parsedClientConfig } from "@/config/client.config";
import { Section, Container, SectionHeading, Card } from "@/components/ui";
import { CallLink } from "@/components/site/CallLink";
import { EstimateCtaLink } from "@/components/site/EstimateCtaLink";
import { buildMetadata } from "@/lib/seo/metadata";

export function generateMetadata(): Metadata {
  return buildMetadata({
    title: "Service Areas",
    description: `Communities and neighborhoods served by ${parsedClientConfig.business.name}. Review local coverage and ZIP codes for electrical contractor services.`,
    path: "/service-areas",
  });
}

export default function ServiceAreasPage() {
  const { business, serviceAreas } = parsedClientConfig;

  return (
    <>
      {/* Header Banner */}
      <Section tone="dark" blueprint={true} className="py-14 sm:py-20">
        <Container>
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-sm bg-steel-900 border border-steel-700 text-xs font-mono text-amber">
              <MapPin className="w-3.5 h-3.5" aria-hidden="true" />
              <span>REGIONAL COVERAGE</span>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-paper tracking-tight">
              Service Areas & Coverage
            </h1>
            <p className="text-base sm:text-lg text-steel-300 leading-relaxed font-sans">
              Electrical services provided throughout the following communities and surrounding
              areas.
            </p>
          </div>
        </Container>
      </Section>

      {/* Areas List Grid */}
      <Section tone="light" borderBottom={true}>
        <Container>
          <SectionHeading
            eyebrow="COVERAGE MAP"
            eyebrowIndex="01 —"
            title="Communities We Regularly Serve"
            lede="Review local service coverage and municipal boundaries for our service areas."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {serviceAreas.map((area) => (
              <Card
                key={area.name}
                tone="paper"
                padding="lg"
                cornerTicks={true}
                className="space-y-4"
              >
                <div className="flex items-center justify-between border-b border-steel-100 pb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded-sm bg-steel-50 border border-steel-200 flex items-center justify-center text-ink">
                      <MapPin className="w-4 h-4 text-steel-700" aria-hidden="true" />
                    </span>
                    <h2 className="font-display text-xl font-bold text-ink tracking-tight">
                      {area.name}
                    </h2>
                  </div>
                </div>

                <p className="text-sm text-steel-600 leading-relaxed font-sans">
                  {area.description}
                </p>

                {area.zipCodes && area.zipCodes.length > 0 && (
                  <div className="pt-2">
                    <span className="text-xs font-mono uppercase tracking-wider text-steel-500 block mb-1.5 font-semibold">
                      Covered ZIP Codes:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {area.zipCodes.map((zip) => (
                        <span
                          key={zip}
                          className="px-2 py-1 rounded-sm bg-steel-100 border border-steel-200 font-mono text-xs text-steel-700"
                        >
                          {zip}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>

          {/* Not Sure Banner */}
          <div className="mt-12 p-6 rounded-md bg-steel-50 border border-steel-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-1">
              <h3 className="font-display text-lg font-bold text-ink">
                Not sure if your address is covered?
              </h3>
              <p className="text-sm text-steel-600 leading-relaxed font-sans">
                Not sure if your address is covered? Call or include your ZIP in the estimate
                request.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0 w-full md:w-auto">
              <CallLink
                phone={business.phone}
                className="flex-1 md:flex-initial min-h-[44px] px-4 py-2 rounded-sm border border-steel-300 bg-paper text-ink font-semibold text-sm hover:bg-steel-100 flex items-center justify-center gap-2"
              >
                <Phone className="w-4 h-4 text-amber-strong" aria-hidden="true" />
                <span>Call Us</span>
              </CallLink>

              <EstimateCtaLink
                href="/contact"
                className="flex-1 md:flex-initial min-h-[44px] px-4 py-2 rounded-sm bg-amber text-ink font-semibold text-sm hover:bg-amber-strong flex items-center justify-center gap-2"
              >
                <span>Check Your ZIP</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </EstimateCtaLink>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
