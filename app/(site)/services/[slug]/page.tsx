import React from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Phone, CheckCircle2 } from "lucide-react";
import { parsedClientConfig } from "@/config/client.config";
import { canonicalUrl, getService, offeredServices } from "@/lib/config/site";
import {
  Section,
  Container,
  SectionHeading,
  StepList,
  Accordion,
  Badge,
  Notice,
  Card,
} from "@/components/ui";
import { CallLink } from "@/components/site/CallLink";
import { EstimateCtaLink } from "@/components/site/EstimateCtaLink";
import { ServiceIcon } from "@/components/site/icons";

interface ServicePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const services = offeredServices();
  return services.map((service) => ({
    slug: service.slug,
  }));
}

export async function generateMetadata({ params }: ServicePageProps): Promise<Metadata> {
  const { slug } = await params;
  const service = getService(slug);

  if (!service) {
    return {
      title: "Service Not Found",
    };
  }

  return {
    title: `${service.title} | ${parsedClientConfig.business.name}`,
    description:
      service.shortDescription || service.intro || parsedClientConfig.seo.defaultDescription,
    alternates: {
      canonical: canonicalUrl(`/services/${slug}`),
    },
  };
}

export default async function ServiceDetailPage({ params }: ServicePageProps) {
  const { slug } = await params;
  const service = getService(slug);

  if (!service || !service.offered) {
    notFound();
  }

  const { business, projects } = parsedClientConfig;

  // Match corresponding project image if available
  const baseSlugKeyword = slug
    .replace("-installation", "")
    .replace("-upgrades", "")
    .replace("repair-", "");

  const matchingProject = projects.find(
    (p) =>
      p.image.includes(baseSlugKeyword) ||
      p.title.toLowerCase().includes(baseSlugKeyword) ||
      p.title.toLowerCase().includes(service.title.toLowerCase()),
  );

  const isTroubleshooting = slug === "repair-troubleshooting";

  const processSteps = service.process.map((stepDesc, idx) => ({
    step: idx + 1,
    title: `Phase 0${idx + 1}`,
    description: stepDesc,
  }));

  return (
    <>
      {/* Prominent Safety Notice for Troubleshooting */}
      {isTroubleshooting && (
        <div className="bg-red-50 border-b border-danger/30 py-4">
          <Container>
            <Notice type="safety" title="Immediate Safety Warning">
              Sparks, smoke, or a burning smell? Leave the building immediately and dial 911. Do not
              use this site for active electrical fire emergencies.
            </Notice>
          </Container>
        </div>
      )}

      {/* Hero Section */}
      <Section tone="dark" blueprint={true} className="py-14 sm:py-20">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7 space-y-6">
              {/* Breadcrumbs */}
              <nav aria-label="Breadcrumb" className="font-mono text-xs text-steel-400">
                <ol className="flex items-center gap-2 list-none p-0 m-0">
                  <li>
                    <Link href="/" className="hover:text-paper transition-colors">
                      Home
                    </Link>
                  </li>
                  <li aria-hidden="true">/</li>
                  <li>
                    <Link href="/services" className="hover:text-paper transition-colors">
                      Services
                    </Link>
                  </li>
                  <li aria-hidden="true">/</li>
                  <li className="text-amber font-semibold">{service.title}</li>
                </ol>
              </nav>

              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-sm bg-steel-900 border border-steel-700 text-xs font-mono text-steel-300">
                <ServiceIcon
                  name={service.icon || service.title}
                  className="w-3.5 h-3.5 text-amber"
                />
                <span className="uppercase tracking-wider">
                  CODE-COMPLIANT ELECTRICAL CONTRACTING
                </span>
              </div>

              <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-paper tracking-tight">
                {service.headline || service.title}
              </h1>

              <p className="text-base sm:text-lg text-steel-300 leading-relaxed font-sans max-w-2xl">
                {service.intro || service.shortDescription}
              </p>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <EstimateCtaLink
                  href={`/contact?service=${service.slug}`}
                  serviceSlug={service.slug}
                  className="min-h-[48px] px-6 py-3 rounded-sm bg-amber text-ink font-semibold text-base hover:bg-amber-strong transition-colors duration-150 shadow-technical flex items-center justify-center gap-2 focus-visible:outline-2 focus-visible:outline-signal-blue"
                >
                  <span>Request an Estimate</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </EstimateCtaLink>

                <CallLink
                  phone={business.phone}
                  serviceSlug={service.slug}
                  className="min-h-[48px] px-6 py-3 rounded-sm bg-charcoal text-paper border border-steel-700 hover:border-steel-500 hover:bg-steel-800 transition-colors duration-150 flex items-center justify-center gap-2 text-base font-semibold focus-visible:outline-2 focus-visible:outline-signal-blue"
                >
                  <Phone className="w-4 h-4 text-amber" aria-hidden="true" />
                  <span>Call {business.phoneDisplay}</span>
                </CallLink>
              </div>

              <div className="pt-2 flex items-center gap-4 text-xs font-mono text-steel-400">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-amber" />
                  <span>Licensed & Insured</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-amber" />
                  <span>Upfront Written Estimates</span>
                </div>
              </div>
            </div>

            {/* Service Image / Spec Card */}
            <div className="lg:col-span-5">
              {matchingProject ? (
                <div className="rounded-md border border-white/10 bg-charcoal p-2 shadow-technical overflow-hidden corner-ticks">
                  <div className="relative aspect-[4/3] w-full rounded-sm overflow-hidden bg-steel-900">
                    <Image
                      src={matchingProject.image}
                      alt={matchingProject.alt}
                      fill
                      priority
                      sizes="(max-width: 1024px) 100vw, 40vw"
                      className="object-cover"
                    />
                    {matchingProject.isSample && (
                      <div className="absolute top-3 right-3 z-10">
                        <Badge variant="sample">Sample photo</Badge>
                      </div>
                    )}
                  </div>
                  <div className="p-3 bg-charcoal text-xs font-mono text-steel-400 flex items-center justify-between border-t border-white/10 mt-2">
                    <span>{service.title}</span>
                    <span className="text-steel-500">SPECIFICATION DISCLOSURE</span>
                  </div>
                </div>
              ) : (
                <Card tone="dark" padding="lg" cornerTicks={true} className="space-y-4">
                  <div className="w-12 h-12 rounded-sm bg-steel-900 border border-steel-700 flex items-center justify-center text-amber">
                    <ServiceIcon name={service.icon || service.title} className="w-6 h-6" />
                  </div>
                  <h3 className="font-display text-xl font-bold text-paper">
                    Work Scope & Technical Standard
                  </h3>
                  <p className="text-sm text-steel-300 font-sans leading-relaxed">
                    All work is completed by certified journeymen and master electricians following
                    jurisdictional codes and safety clearances.
                  </p>
                  <div className="pt-2 border-t border-white/10 text-xs font-mono text-steel-400">
                    SERVICE ID: {service.slug.toUpperCase()}
                  </div>
                </Card>
              )}
            </div>
          </div>
        </Container>
      </Section>

      {/* Signs you may need this */}
      {service.signs && service.signs.length > 0 && (
        <Section tone="light" borderBottom={true}>
          <Container>
            <SectionHeading
              eyebrow="SYMPTOMS & REQUIREMENTS"
              eyebrowIndex="01 —"
              title="Signs You May Need This Service"
              lede="Common technical indicators and property changes that warrant an electrical scope review."
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {service.signs.map((sign, idx) => (
                <Card key={idx} tone="paper" padding="md" className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-steel-100 text-steel-700 flex items-center justify-center text-xs font-mono font-semibold">
                      {idx + 1}
                    </span>
                    <span className="font-mono text-xs text-steel-500 uppercase tracking-wider font-semibold">
                      INDICATOR
                    </span>
                  </div>
                  <p className="text-sm font-medium text-ink leading-relaxed font-sans">{sign}</p>
                </Card>
              ))}
            </div>
          </Container>
        </Section>
      )}

      {/* Process Steps */}
      {service.process && service.process.length > 0 && (
        <Section tone="muted" borderBottom={true}>
          <Container>
            <SectionHeading
              eyebrow="PROCEDURE"
              eyebrowIndex="02 —"
              title="Execution & Assessment Procedure"
              lede="How our electrical contractors evaluate, plan, and deliver this scope."
            />

            <StepList steps={processSteps} columns={processSteps.length <= 3 ? 3 : 4} />
          </Container>
        </Section>
      )}

      {/* FAQs */}
      {service.faqs && service.faqs.length > 0 && (
        <Section tone="light" borderBottom={true}>
          <Container size="narrow">
            <SectionHeading
              eyebrow="QUESTIONS"
              eyebrowIndex="03 —"
              title={`Frequently Asked Questions: ${service.title}`}
              lede="Important considerations and homeowner questions regarding this electrical scope."
            />

            <Accordion
              items={service.faqs.map((faq, i) => ({
                id: `faq-${i}`,
                title: faq.question,
                content: faq.answer,
                defaultOpen: i === 0,
              }))}
            />
          </Container>
        </Section>
      )}

      {/* Bottom CTA Band */}
      <Section tone="dark" blueprint={true} className="py-14 sm:py-20">
        <Container size="narrow" className="text-center space-y-6">
          <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-paper tracking-tight">
            Ready to Plan Your {service.title}?
          </h2>
          <p className="text-steel-300 text-sm sm:text-base leading-relaxed max-w-xl mx-auto font-sans">
            Request an upfront written estimate online, or call our office to discuss project timing
            and scope.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <EstimateCtaLink
              href={`/contact?service=${service.slug}`}
              serviceSlug={service.slug}
              className="w-full sm:w-auto min-h-[48px] px-6 py-3 rounded-sm bg-amber text-ink font-semibold text-base hover:bg-amber-strong transition-colors duration-150 shadow-technical flex items-center justify-center gap-2"
            >
              <span>Request an Estimate</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </EstimateCtaLink>

            <CallLink
              phone={business.phone}
              serviceSlug={service.slug}
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
