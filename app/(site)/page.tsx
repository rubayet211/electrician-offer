import React from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Phone, ArrowRight, ShieldCheck, CheckCircle2, Clock, Calendar } from "lucide-react";
import { parsedClientConfig } from "@/config/client.config";
import { offeredServices, isDemo } from "@/lib/config/site";
import {
  Section,
  Container,
  SectionHeading,
  Card,
  StepList,
  Accordion,
  Badge,
  Notice,
} from "@/components/ui";
import { CallLink } from "@/components/site/CallLink";
import { EstimateCtaLink } from "@/components/site/EstimateCtaLink";
import { ServiceIcon } from "@/components/site/icons";
import { buildMetadata } from "@/lib/seo/metadata";
import { buildElectricianSchema, buildFaqSchema } from "@/lib/seo/schema";
import { JsonLd } from "@/components/seo/JsonLd";

export function generateMetadata(): Metadata {
  const tagline = parsedClientConfig.positioning?.tagline;
  return buildMetadata({
    title: tagline || "Electrical Contractor",
    description: parsedClientConfig.seo.defaultDescription,
    path: "/",
  });
}

export default function HomePage() {
  const { business, credentials, serviceAreas, projects, faqs, reviews, positioning, practices } =
    parsedClientConfig;
  const services = offeredServices();
  const demo = isDemo();

  const electricianSchema = buildElectricianSchema();
  const faqSchema = faqs && faqs.length > 0 ? buildFaqSchema(faqs) : null;

  // Find hero project image
  const heroProject = projects.find((p) => p.title.toLowerCase().includes("hero")) || projects[0];

  // Gallery projects (excluding hero if possible)
  const galleryProjects = projects.filter((p) => p !== heroProject).slice(0, 4);

  // Trust items: verified credentials, insurance, years in business
  const activeLicenses = credentials.licenses.filter(
    (l) => l.status === "verified" || (demo && l.isSample),
  );
  const isInsured =
    credentials.insurance.status === "verified" || (demo && credentials.insurance.isSample);

  // Verified reviews only (omit section if none)
  const verifiedReviews = (reviews || []).filter((r) => r.verified);

  // How it works steps - config-driven or neutral defaults (no promised calls, visits or timeframes)
  const defaultWorkflowSteps = [
    {
      step: 1,
      title: "Submit project request",
      description:
        "Select your service, describe what is happening or what you need installed, and optionally attach photos.",
    },
    {
      step: 2,
      title: "Scope review",
      description: `${business.name} reviews your request.`,
    },
    {
      step: 3,
      title: "Follow-up",
      description: `${business.name} contacts you using the details you provided.`,
    },
    {
      step: 4,
      title: "Clear written estimate",
      description:
        "You receive a written estimate detailing scope and materials before work begins.",
    },
  ];

  const workflowSteps =
    positioning?.nextSteps && positioning.nextSteps.length > 0
      ? positioning.nextSteps.map((stepText, idx) => ({
          step: idx + 1,
          title: `Step ${idx + 1}`,
          description: stepText,
        }))
      : defaultWorkflowSteps;

  const displayFaqs = faqs || [];

  const serviceAreaLine = `Serving ${serviceAreas.map((a) => a.name).join(", ")} and surrounding communities.`;

  return (
    <>
      <JsonLd data={faqSchema ? [electricianSchema, faqSchema] : electricianSchema} />
      {/* Hero Section */}
      <Section tone="dark" blueprint={true} className="pt-16 pb-20 sm:pt-24 sm:pb-28">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            <div className="lg:col-span-7 space-y-6">
              {/* Eyebrow / Service Area Line */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-sm bg-steel-900 border border-steel-700 text-xs font-mono text-steel-300">
                <span className="w-2 h-2 rounded-full bg-amber" aria-hidden="true" />
                <span>{serviceAreaLine}</span>
              </div>

              {/* Main Headline */}
              <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-paper tracking-tight leading-[1.1]">
                {positioning?.heroHeadline ||
                  "Electrical Work Done Right. A Clear Way to Get Started."}
              </h1>

              {/* Intro Lede */}
              <p className="text-base sm:text-lg text-steel-300 leading-relaxed max-w-2xl font-sans">
                {positioning?.heroSubhead ||
                  "Residential electrical repairs, panel updates, and equipment installations. Straightforward estimates and direct communication."}
              </p>

              {/* CTAs */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <CallLink
                  phone={business.phone}
                  className="min-h-[48px] px-6 py-3 rounded-sm bg-amber text-ink font-semibold text-base hover:bg-amber-strong active:bg-amber-strong transition-colors duration-150 shadow-technical flex items-center justify-center gap-2.5 focus-visible:outline-2 focus-visible:outline-signal-blue"
                  aria-label={`Call ${business.phoneDisplay}`}
                >
                  <Phone className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>Call {business.phoneDisplay}</span>
                </CallLink>

                <EstimateCtaLink
                  href="/contact"
                  className="min-h-[48px] px-6 py-3 rounded-sm bg-charcoal text-paper border border-steel-700 hover:border-steel-500 hover:bg-steel-800 transition-colors duration-150 flex items-center justify-center gap-2 text-base font-semibold focus-visible:outline-2 focus-visible:outline-signal-blue"
                >
                  <span>Request an Estimate</span>
                  <ArrowRight className="w-4 h-4 text-amber" aria-hidden="true" />
                </EstimateCtaLink>
              </div>

              {/* Trust Subtext */}
              <div className="pt-2 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-mono text-steel-400">
                {(practices && practices.length > 0
                  ? practices.slice(0, 2)
                  : [
                      { title: "Written estimates before work starts" },
                      { title: "Photos optional — never open a panel" },
                    ]
                ).map((practice, idx) => (
                  <div key={idx} className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-amber shrink-0" aria-hidden="true" />
                    <span>{practice.title}</span>
                  </div>
                ))}
                {business.yearsInBusiness && (
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-amber shrink-0" aria-hidden="true" />
                    <span>{business.yearsInBusiness} years in business</span>
                  </div>
                )}
              </div>
            </div>

            {/* Hero Image Tile */}
            {heroProject && (
              <div className="lg:col-span-5">
                <div className="relative rounded-md border border-white/10 bg-charcoal p-2 shadow-technical overflow-hidden corner-ticks">
                  <div className="relative aspect-[4/3] w-full rounded-sm overflow-hidden bg-steel-900">
                    <Image
                      src={heroProject.image}
                      alt={heroProject.alt}
                      fill
                      priority
                      sizes="(max-width: 1024px) 100vw, 42vw"
                      className="object-cover"
                    />
                    {heroProject.isSample && (
                      <div className="absolute top-3 right-3 z-10">
                        <Badge variant="sample">Sample photo</Badge>
                      </div>
                    )}
                  </div>
                  <div className="p-3 bg-charcoal text-xs font-mono text-steel-400 flex items-center justify-between border-t border-white/10 mt-2">
                    <span>{heroProject.title}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Container>
      </Section>

      {/* Trust Strip */}
      <section
        className="bg-steel-50 border-y border-steel-200 py-6"
        aria-label="Trust credentials"
      >
        <Container>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 items-center">
            {activeLicenses.length > 0 && (
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-sm bg-paper border border-steel-300 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5 text-[#15803D]" aria-hidden="true" />
                </div>
                <div>
                  <div className="text-xs font-mono uppercase tracking-wider text-steel-500 flex items-center gap-1.5">
                    <span>State License</span>
                    {demo && <Badge variant="sample">SAMPLE</Badge>}
                  </div>
                  <div className="font-mono text-xs font-semibold text-ink">
                    #{activeLicenses[0].number}
                  </div>
                </div>
              </div>
            )}

            {isInsured && (
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-sm bg-paper border border-steel-300 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5 text-signal-blue" aria-hidden="true" />
                </div>
                <div>
                  <div className="text-xs font-mono uppercase tracking-wider text-steel-500 flex items-center gap-1.5">
                    <span>Liability Insurance</span>
                    {demo && <Badge variant="sample">SAMPLE</Badge>}
                  </div>
                  <div className="font-mono text-xs font-semibold text-ink">Active Coverage</div>
                </div>
              </div>
            )}

            {business.yearsInBusiness && (
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-sm bg-paper border border-steel-300 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5 text-steel-700" aria-hidden="true" />
                </div>
                <div>
                  <div className="text-xs font-mono uppercase tracking-wider text-steel-500">
                    Experience
                  </div>
                  <div className="font-mono text-xs font-semibold text-ink">
                    {business.yearsInBusiness} Years Established
                  </div>
                </div>
              </div>
            )}

            {practices && practices.length > 0 ? (
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-sm bg-paper border border-steel-300 flex items-center justify-center shrink-0">
                  <Calendar className="w-5 h-5 text-amber-strong" aria-hidden="true" />
                </div>
                <div>
                  <div className="text-xs font-mono uppercase tracking-wider text-steel-500">
                    Practice
                  </div>
                  <div className="font-mono text-xs font-semibold text-ink">
                    {practices[0].title}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-sm bg-paper border border-steel-300 flex items-center justify-center shrink-0">
                  <Calendar className="w-5 h-5 text-amber-strong" aria-hidden="true" />
                </div>
                <div>
                  <div className="text-xs font-mono uppercase tracking-wider text-steel-500">
                    Estimates
                  </div>
                  <div className="font-mono text-xs font-semibold text-ink">Written Estimates</div>
                </div>
              </div>
            )}
          </div>
        </Container>
      </section>

      {/* Services Grid Section */}
      <Section tone="light" borderBottom={true}>
        <Container>
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <SectionHeading
                eyebrow="SERVICES"
                eyebrowIndex="01 —"
                title="Offered Electrical Services"
                lede="Specialized residential and commercial electrical contracting tailored to code and safety."
              />
            </div>
            <Link
              href="/services"
              className="font-mono text-xs font-semibold uppercase tracking-wider text-ink hover:text-signal-blue inline-flex items-center gap-1 pb-1"
            >
              <span>View all services</span>
              <span>→</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => {
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
                      <span>Specifications</span>
                      <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                    </Link>

                    <EstimateCtaLink
                      href={`/contact?service=${service.slug}`}
                      serviceSlug={service.slug}
                      className="font-mono text-xs text-amber-strong hover:underline font-semibold"
                    >
                      Estimate →
                    </EstimateCtaLink>
                  </div>
                </Card>
              );
            })}
          </div>
        </Container>
      </Section>

      {/* How It Works Section */}
      <Section tone="muted" borderBottom={true}>
        <Container>
          <SectionHeading
            eyebrow="PROCESS"
            eyebrowIndex="02 —"
            title="How Our Estimate Process Works"
            lede="A structured four-step procedure designed to give you clarity and precision before any circuit is touched."
          />

          <StepList steps={workflowSteps} columns={4} />
        </Container>
      </Section>

      {/* Project & Installation Gallery */}
      {galleryProjects.length > 0 && (
        <Section tone="light" borderBottom={true}>
          <Container>
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
              <div>
                <SectionHeading
                  eyebrow="EQUIPMENT & INSTALLATIONS"
                  eyebrowIndex="03 —"
                  title="Project & Installation Photos"
                  lede={
                    galleryProjects.some((p) => p.isSample)
                      ? "Sample photos show the kinds of work this template supports. Client sites use their own project photos."
                      : "Recent electrical installation and equipment project photos."
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {galleryProjects.map((project, idx) => (
                <div
                  key={idx}
                  className="group rounded-md border border-steel-200 bg-paper overflow-hidden shadow-technical flex flex-col"
                >
                  <div className="relative aspect-[4/3] w-full bg-steel-100 overflow-hidden">
                    <Image
                      src={project.image}
                      alt={project.alt}
                      fill
                      loading="eager"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                    {project.isSample && (
                      <div className="absolute top-2.5 right-2.5 z-10">
                        <Badge variant="sample">Sample photo</Badge>
                      </div>
                    )}
                  </div>
                  <div className="p-4 flex-1 flex flex-col justify-between border-t border-steel-100 bg-paper">
                    <div>
                      <h3 className="font-display text-sm font-semibold text-ink mb-1">
                        {project.title}
                      </h3>
                      <p className="text-xs text-steel-500 leading-relaxed font-sans">
                        {project.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Container>
        </Section>
      )}

      {/* Verified Reviews Section (ONLY rendered if verified reviews exist) */}
      {verifiedReviews.length > 0 && (
        <Section tone="muted" borderBottom={true}>
          <Container>
            <SectionHeading
              eyebrow="TESTIMONIALS"
              eyebrowIndex="04 —"
              title="Verified Customer Feedback"
              lede="Feedback from homeowners and property owners."
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {verifiedReviews.map((review, idx) => (
                <Card key={idx} tone="paper" padding="md" className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm text-ink">{review.author}</span>
                    <Badge variant="verified">Verified</Badge>
                  </div>
                  <p className="text-sm text-steel-600 leading-relaxed italic font-sans">
                    &ldquo;{review.text}&rdquo;
                  </p>
                  <div className="font-mono text-xs text-steel-400">Source: {review.source}</div>
                </Card>
              ))}
            </div>
          </Container>
        </Section>
      )}

      {/* FAQs Section */}
      {displayFaqs.length > 0 && (
        <Section tone="light" borderBottom={true}>
          <Container size="narrow">
            <SectionHeading
              eyebrow="QUESTIONS"
              eyebrowIndex="05 —"
              title="Frequently Asked Questions"
              lede="Clear answers to common questions about electrical scopes, estimates, and safety."
            />

            <Accordion
              items={displayFaqs.map((faq, i) => ({
                id: `faq-${i}`,
                title: faq.question,
                content: faq.answer,
                defaultOpen: i === 0,
              }))}
            />
          </Container>
        </Section>
      )}

      {/* Safety Notice Callout */}
      <Section tone="muted" borderBottom={true} className="py-10">
        <Container size="narrow">
          <Notice type="safety" title="Immediate Electrical Hazard Safety Warning">
            Sparks, smoke, or a burning smell? Leave the area immediately and call 911. Do not
            attempt to reset tripped breakers or approach exposed wiring during an active hazard.
          </Notice>
        </Container>
      </Section>

      {/* Closing CTA Band */}
      <Section tone="dark" blueprint={true} className="py-16 sm:py-20">
        <Container size="narrow" className="text-center space-y-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-sm bg-steel-900 border border-steel-700 text-xs font-mono text-amber">
            <span>READY TO DISCUSS YOUR PROJECT?</span>
          </div>

          <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold text-paper tracking-tight">
            {positioning?.closingHeadline || "Have an electrical project in mind?"}
          </h2>

          <p className="text-steel-300 text-sm sm:text-base leading-relaxed max-w-xl mx-auto font-sans">
            Submit your project details online in minutes or contact us directly using the details
            below.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <CallLink
              phone={business.phone}
              className="w-full sm:w-auto min-h-[48px] px-6 py-3 rounded-sm bg-amber text-ink font-semibold text-base hover:bg-amber-strong transition-colors duration-150 shadow-technical flex items-center justify-center gap-2 focus-visible:outline-2 focus-visible:outline-signal-blue"
            >
              <Phone className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>Call {business.phoneDisplay}</span>
            </CallLink>

            <EstimateCtaLink
              href="/contact"
              className="w-full sm:w-auto min-h-[48px] px-6 py-3 rounded-sm bg-charcoal text-paper border border-steel-700 hover:border-steel-500 hover:bg-steel-800 transition-colors duration-150 flex items-center justify-center gap-2 text-base font-semibold focus-visible:outline-2 focus-visible:outline-signal-blue"
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
