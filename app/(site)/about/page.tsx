import React from "react";
import type { Metadata } from "next";
import { ShieldCheck, ArrowRight, Phone } from "lucide-react";
import { parsedClientConfig } from "@/config/client.config";
import { isDemo } from "@/lib/config/site";
import { Section, Container, SectionHeading, SpecList, Card, Badge, Notice } from "@/components/ui";
import { CallLink } from "@/components/site/CallLink";
import { EstimateCtaLink } from "@/components/site/EstimateCtaLink";
import { buildMetadata } from "@/lib/seo/metadata";
import { buildElectricianSchema } from "@/lib/seo/schema";
import { JsonLd } from "@/components/seo/JsonLd";

export function generateMetadata(): Metadata {
  return buildMetadata({
    title: "About & Credentials",
    description: `Review verified licenses, insurance, and professional electrical standards for ${parsedClientConfig.business.name}.`,
    path: "/about",
  });
}

export default function AboutPage() {
  const { business, credentials } = parsedClientConfig;
  const demo = isDemo();
  const electricianSchema = buildElectricianSchema();

  // Filter licenses to display: verified licenses, or sample licenses in demo mode
  const displayLicenses = credentials.licenses.filter(
    (l) => l.status === "verified" || (demo && l.isSample),
  );

  const licenseSpecItems = displayLicenses.map((lic) => ({
    label: lic.label,
    value: (
      <div className="flex items-center gap-2">
        <span>{lic.number}</span>
        {lic.isSample || demo ? (
          <Badge variant="sample">SAMPLE</Badge>
        ) : lic.status === "verified" ? (
          <Badge variant="verified">Verified</Badge>
        ) : (
          <Badge variant="neutral">Unverified</Badge>
        )}
      </div>
    ),
    note: `${lic.issuingAuthority} · ${lic.jurisdiction}${
      lic.verificationUrl ? ` · Verification on file` : ""
    }`,
  }));

  const insuranceSpecItems = [
    {
      label: "General Commercial Liability Insurance",
      value: (
        <div className="flex items-center gap-2">
          <span>{credentials.insurance.carrier || "Active Commercial Policy"}</span>
          {credentials.insurance.isSample || demo ? (
            <Badge variant="sample">SAMPLE</Badge>
          ) : credentials.insurance.status === "verified" ? (
            <Badge variant="verified">Verified</Badge>
          ) : (
            <Badge variant="neutral">Pending Verification</Badge>
          )}
        </div>
      ),
      note:
        credentials.insurance.coverage || "Property damage and bodily injury liability coverage",
    },
    ...(credentials.bonded !== undefined
      ? [
          {
            label: "Surety Bond",
            value: credentials.bonded ? "Bonded" : "Not Required",
            note: "State and municipal contractor bonding compliance",
          },
        ]
      : []),
  ];

  const concretePractices =
    parsedClientConfig.practices && parsedClientConfig.practices.length > 0
      ? parsedClientConfig.practices
      : [
          {
            title: "Written estimates before work starts",
            description:
              "We review project requirements and provide a written estimate before physical work begins.",
          },
          {
            title: "Clear arrival windows confirmed by phone",
            description:
              "We contact you in advance to confirm timing and project details so you are not left waiting.",
          },
          {
            title: "Photos optional — never open a panel",
            description:
              "If you have a clear photo of the room or label, send it along. Never open equipment or approach exposed wiring.",
          },
          {
            title: "We explain options in plain language",
            description:
              "We walk through your repair or installation options without technical jargon.",
          },
        ];

  return (
    <>
      <JsonLd data={electricianSchema} />
      {/* Header Banner */}
      <Section tone="dark" blueprint={true} className="py-14 sm:py-20">
        <Container>
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-sm bg-steel-900 border border-steel-700 text-xs font-mono text-amber">
              <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
              <span>CONTRACTOR VERIFICATION & CREDENTIALS</span>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-paper tracking-tight">
              About {business.name}
            </h1>
            <p className="text-base sm:text-lg text-steel-300 leading-relaxed font-sans">
              Dedicated electrical contracting built on technical rigor, clear communication, and
              uncompromising safety.
            </p>
          </div>
        </Container>
      </Section>

      {/* Story & Background Section */}
      <Section tone="light" borderBottom={true}>
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            <div className="lg:col-span-7 space-y-5">
              <SectionHeading
                eyebrow="BACKGROUND"
                eyebrowIndex="01 —"
                title="Company Background & Operations"
                lede="A local contractor focused on doing electrical work properly the first time."
              />

              <div className="text-steel-700 space-y-4 text-base font-sans leading-relaxed">
                <p>
                  {business.name} provides electrical services for residential and property manager
                  clients in {business.address.city}, {business.address.state}, and neighboring
                  municipalities.
                </p>
                <p>
                  Electrical work is not a cosmetic upgrade; it is critical physical infrastructure
                  that protects your structure from fire hazards, equipment failure, and power
                  interruptions. We prioritize disciplined load calculations, clean panel
                  organization, and verified grounding on every assignment.
                </p>
                {business.ownerName && (
                  <p className="pt-2 text-sm text-steel-600 font-mono">
                    Owner / Principal: <strong className="text-ink">{business.ownerName}</strong>
                  </p>
                )}
              </div>
            </div>

            {/* Quick Facts Card */}
            <div className="lg:col-span-5">
              <Card tone="paper" padding="lg" cornerTicks={true} className="space-y-4">
                <div className="border-b border-steel-200 pb-3">
                  <span className="font-mono text-xs uppercase tracking-wider text-steel-500 font-semibold">
                    CONTRACTOR METRICS
                  </span>
                </div>

                <div className="space-y-3 font-mono text-sm">
                  <div className="flex justify-between py-1 border-b border-steel-100">
                    <span className="text-steel-600">Company:</span>
                    <span className="font-semibold text-ink">{business.name}</span>
                  </div>
                  {business.yearsInBusiness && (
                    <div className="flex justify-between py-1 border-b border-steel-100">
                      <span className="text-steel-600">Years Active:</span>
                      <span className="font-semibold text-ink">
                        {business.yearsInBusiness} Years
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between py-1 border-b border-steel-100">
                    <span className="text-steel-600">Jurisdiction:</span>
                    <span className="font-semibold text-ink">
                      {business.address.city}, {business.address.state}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-steel-100">
                    <span className="text-steel-600">Status:</span>
                    <span className="font-semibold text-[#15803D]">
                      {demo ? "Active Demo Profile" : "Licensed & Active"}
                    </span>
                  </div>
                </div>

                <div className="pt-2">
                  <EstimateCtaLink
                    href="/contact"
                    className="w-full min-h-[44px] flex items-center justify-center gap-2 px-4 py-2 rounded-sm bg-amber text-ink font-semibold text-sm hover:bg-amber-strong"
                  >
                    <span>Request an Estimate</span>
                    <ArrowRight className="w-4 h-4" />
                  </EstimateCtaLink>
                </div>
              </Card>
            </div>
          </div>
        </Container>
      </Section>

      {/* Verified Credentials Section */}
      <Section tone="muted" borderBottom={true}>
        <Container>
          <SectionHeading
            eyebrow="VERIFICATION"
            eyebrowIndex="02 —"
            title="Licensing & Insurance Specifications"
            lede="Every active license and insurance certificate held by our contracting organization."
          />

          <div className="space-y-8">
            <div>
              <SpecList
                title="ELECTRICAL CONTRACTOR LICENSES"
                items={licenseSpecItems}
                className="mb-6"
              />
            </div>

            <div>
              <SpecList title="INSURANCE POLICIES & BONDING" items={insuranceSpecItems} />
            </div>

            {demo && (
              <Notice type="info" title="Sample Credentials Notice">
                This website is currently rendering in demonstration mode with illustrative sample
                license information for evaluation purposes.
              </Notice>
            )}
          </div>
        </Container>
      </Section>

      {/* Concrete Practices Section */}
      <Section tone="light" borderBottom={true}>
        <Container>
          <SectionHeading
            eyebrow="STANDARDS"
            eyebrowIndex="03 —"
            title="Our Concrete Operating Practices"
            lede="Clear commitments that define how we conduct business, prepare estimates, and execute physical electrical work."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {concretePractices.map((practice, idx) => (
              <Card key={idx} tone="paper" padding="lg" cornerTicks={true} className="space-y-3">
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-sm bg-steel-100 text-steel-700 font-mono text-xs font-semibold flex items-center justify-center">
                    0{idx + 1}
                  </span>
                  <h3 className="font-display text-base font-bold text-ink">{practice.title}</h3>
                </div>
                <p className="text-sm text-steel-600 leading-relaxed font-sans">
                  {practice.description}
                </p>
              </Card>
            ))}
          </div>
        </Container>
      </Section>

      {/* Bottom CTA Band */}
      <Section tone="dark" blueprint={true} className="py-14 sm:py-20">
        <Container size="narrow" className="text-center space-y-6">
          <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-paper tracking-tight">
            {parsedClientConfig.positioning?.closingHeadline ||
              "Have an electrical project in mind?"}
          </h2>
          <p className="text-steel-300 text-sm sm:text-base leading-relaxed max-w-xl mx-auto font-sans">
            Ready to discuss your project? Submit details online or call our office during business
            hours.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <EstimateCtaLink
              href="/contact"
              className="w-full sm:w-auto min-h-[48px] px-6 py-3 rounded-sm bg-amber text-ink font-semibold text-base hover:bg-amber-strong transition-colors duration-150 shadow-technical flex items-center justify-center gap-2"
            >
              <span>Request an Estimate</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </EstimateCtaLink>

            <CallLink
              phone={business.phone}
              className="w-full sm:w-auto min-h-[48px] px-6 py-3 rounded-sm bg-charcoal text-paper border border-steel-700 hover:border-steel-500 hover:bg-steel-800 transition-colors duration-150 flex items-center justify-center gap-2 text-base font-semibold"
            >
              <Phone className="w-4 h-4 text-amber" aria-hidden="true" />
              <span>Call {business.phoneDisplay}</span>
            </CallLink>
          </div>
        </Container>
      </Section>
    </>
  );
}
