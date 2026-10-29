import React from "react";
import { CheckCircle2, AlertCircle, FileText } from "lucide-react";
import { parsedClientConfig } from "@/config/client.config";
import { StepList, Button } from "@/components/ui";
import { CallLink } from "@/components/site/CallLink";
import type { SubmissionResult } from "./types";

export interface ConfirmationPanelProps {
  result: SubmissionResult;
  onReset: () => void;
}

export function ConfirmationPanel({ result, onReset }: ConfirmationPanelProps) {
  const { business } = parsedClientConfig;
  const isDemo = result.notification === "demo";

  const nextSteps = [
    {
      step: 1,
      title: "Team review",
      description: `A licensed electrician from ${business.name} reviews your project scope and property details.`,
    },
    {
      step: 2,
      title: "Direct confirmation call",
      description:
        "We will call you to discuss specific equipment needs, site access, and schedule an on-site visit.",
    },
    {
      step: 3,
      title: "Written estimate",
      description:
        "You receive a clear, upfront written proposal before any physical electrical work begins.",
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in" role="status" aria-live="polite">
      {/* Header Banner */}
      <div className="p-6 rounded-md bg-paper border border-steel-200 shadow-technical space-y-4">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-green-50 border border-green-200 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6 text-[#15803D]" aria-hidden="true" />
          </div>

          <div className="space-y-1">
            <h2 className="font-display text-2xl font-bold text-ink tracking-tight">
              {result.duplicate ? "Duplicate Request Identified" : "Request Received"}
            </h2>
            <p className="text-steel-600 text-sm leading-relaxed">
              {result.duplicate
                ? `We already have this request on file for review.`
                : `${business.name} will review your request and contact you.`}
            </p>
          </div>
        </div>

        {/* Reference Number */}
        {result.reference && (
          <div className="p-4 rounded-sm bg-steel-50 border border-steel-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-steel-500" aria-hidden="true" />
              <span className="text-xs font-mono uppercase tracking-wider text-steel-600">
                Tracking Reference:
              </span>
            </div>
            <span className="font-mono text-base font-bold text-ink select-all">
              {result.reference}
            </span>
          </div>
        )}

        {/* Demo Mode Notice */}
        {isDemo && (
          <div className="p-3.5 rounded-sm bg-amber/10 border border-amber/30 text-amber-strong text-xs font-mono flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber mt-0.5" aria-hidden="true" />
            <div>
              <strong>Demo only:</strong> This estimate request was recorded in the demo database
              and was not transmitted to any commercial contractor.
            </div>
          </div>
        )}

        {/* Warnings */}
        {result.warnings && result.warnings.length > 0 && (
          <div className="p-3 rounded-sm bg-steel-100 border border-steel-200 text-xs text-steel-700 space-y-1">
            <div className="font-semibold text-steel-800">Note regarding uploads:</div>
            <ul className="list-disc list-inside">
              {result.warnings.map((w, idx) => (
                <li key={idx}>{w}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* What Happens Next */}
      <div className="space-y-4">
        <h3 className="font-display text-lg font-bold text-ink tracking-tight">
          What happens next
        </h3>
        <StepList steps={nextSteps} columns={3} />
      </div>

      {/* Call Fallback & Reset */}
      <div className="pt-4 border-t border-steel-200 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-xs text-steel-600 text-center sm:text-left">
          Need immediate assistance? Call us directly at{" "}
          <CallLink phone={business.phone} className="font-mono font-semibold text-ink underline">
            {business.phoneDisplay}
          </CallLink>
        </div>

        <Button type="button" variant="outline" size="md" onClick={onReset}>
          Submit another request
        </Button>
      </div>
    </div>
  );
}
