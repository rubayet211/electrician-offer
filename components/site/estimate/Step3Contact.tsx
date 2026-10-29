import React from "react";
import { ArrowLeft, Send } from "lucide-react";
import { parsedClientConfig } from "@/config/client.config";
import { Button, Label, Input, Checkbox, Hint, FieldError } from "@/components/ui";
import type { FormState, FieldErrors } from "./types";

export interface Step3Props {
  formState: FormState;
  errors: FieldErrors;
  isSubmitting: boolean;
  submitError: string | null;
  onChange: (updates: Partial<FormState>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onBack: () => void;
}

export function Step3Contact({
  formState,
  errors,
  isSubmitting,
  submitError,
  onChange,
  onSubmit,
  onBack,
}: Step3Props) {
  const { business } = parsedClientConfig;

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-8">
      <div>
        <h2
          id="step-heading"
          className="font-display text-xl sm:text-2xl font-bold text-ink mb-1.5 tracking-tight"
        >
          How can we reach you?
        </h2>
        <p className="text-sm text-steel-600">
          We will review your project details and contact you to confirm the scope.
        </p>
      </div>

      <div className="space-y-4">
        {/* Name */}
        <div>
          <Label htmlFor="contact-name" required>
            Your Name
          </Label>
          <Input
            id="contact-name"
            type="text"
            required
            autoComplete="name"
            value={formState.name}
            onChange={(e) => onChange({ name: e.target.value })}
            hasError={!!errors.name}
            aria-describedby={errors.name ? "name-error" : undefined}
          />
          {errors.name && <FieldError id="name-error">{errors.name}</FieldError>}
        </div>

        {/* Phone & Email */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="contact-phone" required>
              Phone Number
            </Label>
            <Input
              id="contact-phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              required
              placeholder="(555) 000-0000"
              value={formState.phone}
              onChange={(e) => onChange({ phone: e.target.value })}
              hasError={!!errors.phone}
              aria-describedby={errors.phone ? "phone-error" : "phone-hint"}
            />
            <Hint id="phone-hint">10-digit US phone number for call or text.</Hint>
            {errors.phone && <FieldError id="phone-error">{errors.phone}</FieldError>}
          </div>

          <div>
            <Label htmlFor="contact-email">Email Address (optional)</Label>
            <Input
              id="contact-email"
              type="email"
              autoComplete="email"
              placeholder="name@example.com"
              value={formState.email || ""}
              onChange={(e) => onChange({ email: e.target.value })}
              hasError={!!errors.email}
              aria-describedby={errors.email ? "email-error" : undefined}
            />
            {errors.email && <FieldError id="email-error">{errors.email}</FieldError>}
          </div>
        </div>

        {/* ZIP code */}
        <div>
          <Label htmlFor="contact-zip" required>
            Service Location ZIP Code
          </Label>
          <Input
            id="contact-zip"
            type="text"
            inputMode="numeric"
            autoComplete="postal-code"
            maxLength={5}
            required
            placeholder="5-digit ZIP"
            className="sm:w-48 font-mono"
            value={formState.zip}
            onChange={(e) => onChange({ zip: e.target.value })}
            hasError={!!errors.zip}
            aria-describedby={errors.zip ? "zip-error" : "zip-hint"}
          />
          <Hint id="zip-hint">Used to verify that you are within our service area.</Hint>
          {errors.zip && <FieldError id="zip-error">{errors.zip}</FieldError>}
        </div>

        {/* Honeypot field - invisible to genuine users and screen readers */}
        <div
          className="opacity-0 absolute -z-50 h-0 w-0 overflow-hidden pointer-events-none"
          aria-hidden="true"
        >
          <label htmlFor="company_website">Leave blank</label>
          <input
            id="company_website"
            name="company_website"
            type="text"
            tabIndex={-1}
            value={formState.company_website || ""}
            onChange={(e) => onChange({ company_website: e.target.value })}
            autoComplete="off"
          />
        </div>

        {/* Consent Checkbox */}
        <div className="pt-2">
          <Checkbox
            id="consent"
            checked={formState.consent}
            onChange={(e) => onChange({ consent: e.target.checked })}
            hasError={!!errors.consent}
            label={`I agree to be contacted by ${business.name} at the phone number provided regarding this electrical service request.`}
          />
          {errors.consent && <FieldError id="consent-error">{errors.consent}</FieldError>}
        </div>
      </div>

      {/* Global submission error */}
      {submitError && (
        <div
          className="p-4 rounded-md bg-red-50 border border-danger/40 text-danger text-sm leading-relaxed"
          role="alert"
        >
          {submitError}
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="pt-4 flex items-center justify-between gap-4">
        <Button type="button" variant="outline" size="md" onClick={onBack} disabled={isSubmitting}>
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          <span>Back</span>
        </Button>

        <Button type="submit" variant="primary" size="lg" disabled={isSubmitting}>
          {isSubmitting ? (
            <span>Sending…</span>
          ) : (
            <>
              <span>Send estimate request</span>
              <Send className="w-4 h-4" aria-hidden="true" />
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
