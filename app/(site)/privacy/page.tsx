import React from "react";
import type { Metadata } from "next";
import { ShieldCheck, Mail } from "lucide-react";
import { parsedClientConfig } from "@/config/client.config";
import { Section, Container } from "@/components/ui";
import { buildMetadata } from "@/lib/seo/metadata";

export function generateMetadata(): Metadata {
  return buildMetadata({
    title: "Privacy Policy",
    description: `Plain-language privacy policy explaining data collection, non-retention policies, and security practices for ${parsedClientConfig.business.name}.`,
    path: "/privacy",
  });
}

export default function PrivacyPage() {
  const { business, uploads } = parsedClientConfig;

  return (
    <>
      <Section tone="dark" blueprint={true} className="py-12 sm:py-16">
        <Container size="narrow">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-sm bg-steel-900 border border-steel-700 text-xs font-mono text-amber">
              <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
              <span>DATA TRANSPARENCY & PRIVACY</span>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-paper tracking-tight">
              Privacy Policy
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
            <div className="p-4 rounded-md bg-steel-50 border border-steel-200 text-sm text-steel-600">
              <strong className="text-ink">Overview:</strong> We collect only the information
              required to evaluate electrical service requests and communicate with you about your
              project. We do not sell your personal information or share it with third-party
              marketing networks.
            </div>

            <section className="space-y-3">
              <h2 className="font-display text-xl font-bold text-ink tracking-tight">
                1. Information We Collect
              </h2>
              <p>
                When you submit an estimate request or interact with our website, we may collect:
              </p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>
                  <strong>Contact Information:</strong> Name, telephone number, service ZIP code or
                  location, and optional email address.
                </li>
                <li>
                  <strong>Project Information:</strong> The service category selected, project
                  descriptions, property type, and equipment specifications.
                </li>
                <li>
                  <strong>Optional Photographs:</strong> Project photos you choose to upload.
                  Uploaded images are stripped of GPS and EXIF metadata on your device prior to
                  transmission.
                </li>
                <li>
                  <strong>Abuse Prevention Data:</strong> A cryptographic hash (HMAC) of your IP
                  address used solely for rate limiting and spam prevention. Your raw IP address is
                  not permanently logged.
                </li>
                <li>
                  <strong>Non-PII Interaction Metrics:</strong> Aggregated, non-personal click
                  events (such as button clicks on phone numbers or estimate links) to monitor
                  website reliability.
                </li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="font-display text-xl font-bold text-ink tracking-tight">
                2. AI Assistant & Messaging
              </h2>
              <p>
                Our interactive assistant routes messages through OpenRouter with strict
                zero-data-retention (ZDR) endpoints. Chat transcripts are not retained, trained
                upon, or stored in our database. The assistant operates under deterministic safety
                guidelines and will instruct you to call emergency services if potential hazards are
                detected.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-display text-xl font-bold text-ink tracking-tight">
                3. Data Retention & Deletion
              </h2>
              <p>
                Inquiry contact records are maintained for contractor communication and warranty
                records. Project photograph attachments are automatically purged from our servers
                after <strong>{uploads.retentionDays} days</strong>.
              </p>
              <p>To request the deletion of your inquiry details, contact us directly at:</p>
              <div className="p-4 rounded-md bg-steel-50 border border-steel-200 font-mono text-sm text-ink flex items-center gap-2">
                <Mail className="w-4 h-4 text-steel-500" />
                <a href={`mailto:${business.email}`} className="underline font-semibold">
                  {business.email}
                </a>
              </div>
            </section>

            <section className="space-y-3">
              <h2 className="font-display text-xl font-bold text-ink tracking-tight">
                4. Third-Party Service Providers
              </h2>
              <p>
                We utilize trusted operational infrastructure providers, including email dispatch
                services and secure hosting environments, solely to operate our communication
                pipeline. All providers are bound by strict data confidentiality agreements.
              </p>
            </section>
          </div>
        </Container>
      </Section>
    </>
  );
}
