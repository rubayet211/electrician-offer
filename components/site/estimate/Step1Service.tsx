import React from "react";
import { ArrowRight, Clock, AlertTriangle, Calendar } from "lucide-react";
import { offeredServices } from "@/lib/config/site";
import { RadioCards, FieldError, Button } from "@/components/ui";
import { ServiceIcon } from "@/components/site/icons";
import type { FormState, FieldErrors, UrgencyType } from "./types";

export interface Step1Props {
  formState: FormState;
  errors: FieldErrors;
  onChange: (updates: Partial<FormState>) => void;
  onNext: () => void;
}

export function Step1Service({ formState, errors, onChange, onNext }: Step1Props) {
  const services = offeredServices();

  const serviceOptions = services.map((service) => {
    return {
      value: service.slug,
      label: service.title,
      description: service.shortDescription || undefined,
      icon: (
        <ServiceIcon
          name={service.icon || service.title}
          className="w-5 h-5 text-steel-700"
        />
      ),
    };
  });

  const urgencyOptions = [
    {
      value: "routine",
      label: "Routine",
      description: "Standard scheduling; flexible timing.",
      icon: <Calendar className="w-4 h-4 text-steel-600" />,
    },
    {
      value: "soon",
      label: "Within a few days",
      description: "Needs attention this week.",
      icon: <Clock className="w-4 h-4 text-amber-strong" />,
    },
    {
      value: "urgent",
      label: "Urgent (not emergency)",
      description: "Needs evaluation within 24 hours.",
      icon: <AlertTriangle className="w-4 h-4 text-danger" />,
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2
          id="step-heading"
          className="font-display text-xl sm:text-2xl font-bold text-ink mb-1.5 tracking-tight"
        >
          What do you need help with?
        </h2>
        <p className="text-sm text-steel-600">
          Select the service that best matches your project or issue.
        </p>
      </div>

      {/* Services Grid */}
      <div className="space-y-3">
        <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-steel-700">
          Select an electrical service <span className="text-danger">*</span>
        </label>

        <RadioCards
          name="serviceSlug"
          columns={2}
          options={serviceOptions}
          value={formState.serviceSlug}
          onChange={(e) => onChange({ serviceSlug: e.target.value })}
          hasError={!!errors.serviceSlug}
          aria-describedby={errors.serviceSlug ? "serviceSlug-error" : undefined}
        />

        {errors.serviceSlug && <FieldError id="serviceSlug-error">{errors.serviceSlug}</FieldError>}
      </div>

      {/* Urgency */}
      <div className="space-y-3 pt-4 border-t border-steel-200">
        <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-steel-700">
          Timeline & Urgency <span className="text-danger">*</span>
        </label>

        <RadioCards
          name="urgency"
          columns={3}
          options={urgencyOptions}
          value={formState.urgency}
          onChange={(e) => onChange({ urgency: e.target.value as UrgencyType })}
          hasError={!!errors.urgency}
          aria-describedby={errors.urgency ? "urgency-error" : undefined}
        />

        {errors.urgency && <FieldError id="urgency-error">{errors.urgency}</FieldError>}
      </div>

      {/* Action */}
      <div className="pt-4 flex justify-end">
        <Button
          type="button"
          variant="primary"
          size="lg"
          onClick={onNext}
          className="w-full sm:w-auto"
        >
          <span>Continue to details</span>
          <ArrowRight className="w-4 h-4" aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}
