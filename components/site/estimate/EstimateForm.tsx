"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { parsedClientConfig } from "@/config/client.config";
import { getService, offeredServices } from "@/lib/config/site";
import { trackEvent } from "@/components/site/analytics";
import { StepIndicator } from "./StepIndicator";
import { Step1Service } from "./Step1Service";
import { Step2Details } from "./Step2Details";
import { Step3Contact } from "./Step3Contact";
import { ConfirmationPanel } from "./ConfirmationPanel";
import type { ProcessedPhoto } from "./image-utils";
import type { FormState, FieldErrors, SubmissionResult } from "./types";

const DRAFT_STORAGE_KEY = "axinofy_electrician_estimate_draft";

function focusFirstInvalid(errorObj: FieldErrors) {
  const fieldOrder = [
    // Step 1
    { key: "serviceSlug", selector: 'input[name="serviceSlug"]' },
    { key: "urgency", selector: 'input[name="urgency"]' },
    // Step 2
    { key: "troubleStartedWhen", selector: "#trouble-started" },
    { key: "panelReason", selector: "#panel-reason" },
    { key: "panelPropertyType", selector: "#panel-property" },
    { key: "evPropertyType", selector: "#ev-property" },
    { key: "evOwnsCharger", selector: "#ev-owns-charger" },
    { key: "evInstallLocation", selector: "#ev-install-location" },
    { key: "lightingSetting", selector: "#lighting-setting" },
    { key: "lightingFixtureCount", selector: "#lighting-fixture-count" },
    { key: "lightingInstallType", selector: "#lighting-install-type" },
    { key: "generatorType", selector: "#generator-type" },
    { key: "generatorPropertyType", selector: "#generator-property" },
    { key: "description", selector: "#description" },
    // Server field mapping for details.*
    { key: "details.startedWhen", selector: "#trouble-started" },
    { key: "details.reason", selector: "#panel-reason" },
    {
      key: "details.propertyType",
      selector: "#panel-property, #ev-property, #generator-property",
    },
    { key: "details.ownsCharger", selector: "#ev-owns-charger" },
    { key: "details.installLocation", selector: "#ev-install-location" },
    { key: "details.setting", selector: "#lighting-setting" },
    { key: "details.fixtureCount", selector: "#lighting-fixture-count" },
    { key: "details.installType", selector: "#lighting-install-type" },
    { key: "details.generatorType", selector: "#generator-type" },
    // Step 3
    { key: "name", selector: "#contact-name" },
    { key: "phone", selector: "#contact-phone" },
    { key: "email", selector: "#contact-email" },
    { key: "zip", selector: "#contact-zip" },
    { key: "consent", selector: "#consent" },
  ];

  for (const field of fieldOrder) {
    if (errorObj[field.key]) {
      const el = document.querySelector<HTMLElement>(field.selector);
      if (el) {
        el.focus();
        return;
      }
    }
  }

  const fallback = document.querySelector<HTMLElement>(
    '[aria-invalid="true"], :invalid, [role="radiogroup"][aria-invalid="true"] input',
  );
  if (fallback) {
    fallback.focus();
  }
}

export function EstimateForm() {
  const searchParams = useSearchParams();
  const initialService = searchParams.get("service") || "";

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [formState, setFormState] = useState<FormState>(() => {
    const validOffered = offeredServices();
    const match = validOffered.find((s) => s.slug === initialService);
    const defaultSlug = match ? match.slug : validOffered[0]?.slug || "";

    const baseState: FormState = {
      serviceSlug: defaultSlug,
      urgency: "routine",
      description: "",
      name: "",
      phone: "",
      email: "",
      zip: "",
      consent: false,
      company_website: "",
    };

    if (typeof window !== "undefined") {
      try {
        const saved = sessionStorage.getItem(DRAFT_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && typeof parsed === "object") {
            return {
              ...baseState,
              ...parsed,
              ...(initialService && getService(initialService)
                ? { serviceSlug: initialService }
                : {}),
            };
          }
        }
      } catch {
        // sessionStorage unavailable
      }
    }

    return baseState;
  });

  const [photos, setPhotos] = useState<ProcessedPhoto[]>([]);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submissionResult, setSubmissionResult] = useState<SubmissionResult | null>(null);

  const idempotencyKeyRef = useRef<string>("");
  const formStartedAtRef = useRef<number>(0);
  const hasTrackedStartRef = useRef<boolean>(false);
  const formContainerRef = useRef<HTMLDivElement>(null);
  const isFirstMountRef = useRef(true);
  const pendingErrorFocusRef = useRef<FieldErrors | null>(null);

  // Initialize idempotency key and mount timestamp
  useEffect(() => {
    if (!idempotencyKeyRef.current) {
      idempotencyKeyRef.current =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `idemp-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    }
    formStartedAtRef.current = Date.now();
  }, []);

  // Persist draft to sessionStorage (excluding photos)
  useEffect(() => {
    try {
      sessionStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(formState));
    } catch {
      // Ignore storage errors
    }
  }, [formState]);

  // Track form_start on first interaction
  const recordFirstInteraction = () => {
    if (!hasTrackedStartRef.current) {
      hasTrackedStartRef.current = true;
      trackEvent("form_start", undefined, formState.serviceSlug);
    }
  };

  const updateFormState = (updates: Partial<FormState>) => {
    recordFirstInteraction();
    setFormState((prev) => ({ ...prev, ...updates }));
    // Clear field-specific errors
    setErrors((prev) => {
      const next = { ...prev };
      for (const key of Object.keys(updates)) {
        delete next[key];
      }
      return next;
    });
  };

  // Focus the new step heading on currentStep changes (not synchronously after setState)
  useEffect(() => {
    if (isFirstMountRef.current) {
      isFirstMountRef.current = false;
      return;
    }
    if (pendingErrorFocusRef.current) {
      focusFirstInvalid(pendingErrorFocusRef.current);
      pendingErrorFocusRef.current = null;
      return;
    }
    const heading = document.getElementById("step-heading");
    if (heading) {
      heading.focus();
    }
  }, [currentStep]);

  // Focus confirmation panel heading after submit
  useEffect(() => {
    if (submissionResult) {
      const confirmHeading = document.getElementById("confirmation-heading");
      if (confirmHeading) {
        confirmHeading.focus();
      }
    }
  }, [submissionResult]);

  const scrollToTop = () => {
    if (formContainerRef.current) {
      const prefersReducedMotion =
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      formContainerRef.current.scrollIntoView({
        behavior: prefersReducedMotion ? "auto" : "smooth",
        block: "start",
      });
    }
  };

  // Step 1 Validation
  const validateStep1 = (): boolean => {
    const newErrors: FieldErrors = {};
    if (!formState.serviceSlug) {
      newErrors.serviceSlug = "Please select a service";
    } else if (!getService(formState.serviceSlug)) {
      newErrors.serviceSlug = "Please select a valid offered service";
    }

    if (!formState.urgency) {
      newErrors.urgency = "Please select an urgency timeline";
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      focusFirstInvalid(newErrors);
      return false;
    }
    return true;
  };

  // Step 2 Validation
  const validateStep2 = (): boolean => {
    const newErrors: FieldErrors = {};
    const service = getService(formState.serviceSlug);
    const formType = service?.formType || "general";

    if (!formState.description || formState.description.trim().length < 10) {
      newErrors.description = "Please describe your project in at least 10 characters";
    } else if (formState.description.length > 2000) {
      newErrors.description = "Description cannot exceed 2000 characters";
    }

    if (formType === "panel") {
      if (!formState.panelReason) newErrors.panelReason = "Select a reason for the panel work";
      if (!formState.panelPropertyType) newErrors.panelPropertyType = "Select the property type";
    } else if (formType === "ev_charger") {
      if (!formState.evPropertyType) newErrors.evPropertyType = "Select the property type";
      if (!formState.evOwnsCharger) newErrors.evOwnsCharger = "Select whether you have a charger";
      if (!formState.evInstallLocation)
        newErrors.evInstallLocation = "Select the installation location";
    } else if (formType === "troubleshooting") {
      if (!formState.troubleStartedWhen)
        newErrors.troubleStartedWhen = "Select when the issue began";
    } else if (formType === "lighting") {
      if (!formState.lightingSetting) newErrors.lightingSetting = "Select indoor or outdoor";
      if (!formState.lightingFixtureCount) newErrors.lightingFixtureCount = "Select fixture count";
      if (!formState.lightingInstallType)
        newErrors.lightingInstallType = "Select installation type";
    } else if (formType === "generator") {
      if (!formState.generatorType) newErrors.generatorType = "Select generator configuration";
      if (!formState.generatorPropertyType)
        newErrors.generatorPropertyType = "Select property type";
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      focusFirstInvalid(newErrors);
      return false;
    }
    return true;
  };

  // Step 3 Validation
  const validateStep3 = (): boolean => {
    const newErrors: FieldErrors = {};

    if (!formState.name || formState.name.trim().length < 2) {
      newErrors.name = "Enter your full name";
    }

    const rawPhone = formState.phone.replace(/\D/g, "");
    const nationalPhone =
      rawPhone.length === 11 && rawPhone.startsWith("1") ? rawPhone.slice(1) : rawPhone;
    if (nationalPhone.length !== 10) {
      newErrors.phone = "Enter a 10-digit US phone number";
    }

    if (formState.email && formState.email.trim().length > 0) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formState.email.trim())) {
        newErrors.email = "Enter a valid email address";
      }
    }

    if (!formState.zip || !/^\d{5}$/.test(formState.zip.trim())) {
      newErrors.zip = "Enter a 5-digit US ZIP code";
    }

    if (!formState.consent) {
      newErrors.consent = "You must agree to be contacted to proceed";
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      focusFirstInvalid(newErrors);
      return false;
    }
    return true;
  };

  const handleNextFromStep1 = () => {
    if (validateStep1()) {
      setCurrentStep(2);
      scrollToTop();
    }
  };

  const handleNextFromStep2 = () => {
    if (validateStep2()) {
      setCurrentStep(3);
      scrollToTop();
    }
  };

  const handleBackToStep1 = () => {
    setCurrentStep(1);
    scrollToTop();
  };

  const handleBackToStep2 = () => {
    setCurrentStep(2);
    scrollToTop();
  };

  // Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    recordFirstInteraction();

    if (!validateStep3()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    // Anti-spam requirement: formStartedAt must be >= 3000ms ago
    const timeSinceMount = Date.now() - formStartedAtRef.current;
    if (timeSinceMount < 3200) {
      await new Promise((res) => setTimeout(res, 3200 - timeSinceMount));
    }

    const service = getService(formState.serviceSlug);
    const formType = service?.formType || "general";

    // Build details payload per schema
    let details: Record<string, unknown> = { formType };
    if (formType === "panel") {
      details = {
        formType: "panel",
        reason: formState.panelReason,
        propertyType: formState.panelPropertyType,
        ...(formState.panelInfoKnown?.trim()
          ? { panelInfoKnown: formState.panelInfoKnown.trim() }
          : {}),
      };
    } else if (formType === "ev_charger") {
      details = {
        formType: "ev_charger",
        propertyType: formState.evPropertyType,
        ownsCharger: formState.evOwnsCharger,
        installLocation: formState.evInstallLocation,
        ...(formState.evVehicleOrCharger?.trim()
          ? { vehicleOrCharger: formState.evVehicleOrCharger.trim() }
          : {}),
      };
    } else if (formType === "troubleshooting") {
      details = {
        formType: "troubleshooting",
        startedWhen: formState.troubleStartedWhen,
      };
    } else if (formType === "lighting") {
      details = {
        formType: "lighting",
        setting: formState.lightingSetting,
        fixtureCount: formState.lightingFixtureCount,
        installType: formState.lightingInstallType,
      };
    } else if (formType === "generator") {
      details = {
        formType: "generator",
        generatorType: formState.generatorType,
        propertyType: formState.generatorPropertyType,
        ...(formState.generatorRequirements?.trim()
          ? { requirements: formState.generatorRequirements.trim() }
          : {}),
      };
    }

    try {
      const formData = new FormData();
      formData.append("name", formState.name.trim());
      formData.append("phone", formState.phone.trim());
      if (formState.email?.trim()) {
        formData.append("email", formState.email.trim());
      }
      formData.append("zip", formState.zip.trim());
      formData.append("serviceSlug", formState.serviceSlug);
      formData.append("description", formState.description.trim());
      formData.append("urgency", formState.urgency);
      formData.append("consent", "true");
      formData.append("idempotencyKey", idempotencyKeyRef.current);
      formData.append("formStartedAt", String(formStartedAtRef.current));
      formData.append("details", JSON.stringify(details));
      formData.append(
        "sourcePage",
        typeof window !== "undefined" ? window.location.pathname : "/contact",
      );
      formData.append("company_website", formState.company_website || "");

      for (const photo of photos) {
        formData.append("photos", photo.file);
      }

      const response = await fetch("/api/leads", {
        method: "POST",
        body: formData,
      });

      const data = await response.json().catch(() => ({}));

      if (response.status === 201 || (response.status === 200 && data.ok)) {
        // Success
        try {
          sessionStorage.removeItem(DRAFT_STORAGE_KEY);
        } catch {
          // Ignore
        }

        setSubmissionResult({
          ok: true,
          reference: data.reference,
          duplicate: data.duplicate,
          notification:
            data.notification || (parsedClientConfig.mode === "demo" ? "demo" : "queued"),
          warnings: data.warnings || [],
        });
        scrollToTop();
      } else if (response.status === 400 && data.fieldErrors) {
        // Map server errors back to steps
        const serverErrors: FieldErrors = {};
        let targetStep: 1 | 2 | 3 = 3;

        for (const [key, msgs] of Object.entries(data.fieldErrors as Record<string, string[]>)) {
          serverErrors[key] = msgs[0] || "Invalid entry";

          if (key === "serviceSlug" || key === "urgency") {
            targetStep = 1;
          } else if (key.startsWith("details") || key === "description") {
            if (targetStep !== 1) targetStep = 2;
          }
        }

        setErrors(serverErrors);
        if (targetStep === currentStep) {
          focusFirstInvalid(serverErrors);
        } else {
          pendingErrorFocusRef.current = serverErrors;
          setCurrentStep(targetStep);
        }
        setSubmitError("Please review the highlighted fields and correct any errors.");
        scrollToTop();
      } else if (response.status === 429) {
        setSubmitError(
          `Too many requests — please call us directly at ${parsedClientConfig.business.phoneDisplay}.`,
        );
      } else {
        setSubmitError(
          `Your request was not sent. Please try again or call ${parsedClientConfig.business.phoneDisplay}.`,
        );
      }
    } catch {
      setSubmitError(
        `Your request was not sent due to a network connection issue. Please try again or call ${parsedClientConfig.business.phoneDisplay}.`,
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    idempotencyKeyRef.current =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `idemp-${Date.now()}`;
    formStartedAtRef.current = Date.now();
    setPhotos([]);
    setErrors({});
    setSubmissionResult(null);
    setSubmitError(null);
    setCurrentStep(1);
    setFormState({
      serviceSlug: offeredServices()[0]?.slug || "",
      urgency: "routine",
      description: "",
      name: "",
      phone: "",
      email: "",
      zip: "",
      consent: false,
      company_website: "",
    });
    scrollToTop();
  };

  return (
    <div
      ref={formContainerRef}
      className="bg-paper border border-steel-200 rounded-md p-4 sm:p-8 shadow-technical"
    >
      {submissionResult ? (
        <ConfirmationPanel result={submissionResult} onReset={handleReset} />
      ) : (
        <>
          <StepIndicator currentStep={currentStep} />

          {currentStep === 1 && (
            <Step1Service
              formState={formState}
              errors={errors}
              onChange={updateFormState}
              onNext={handleNextFromStep1}
            />
          )}

          {currentStep === 2 && (
            <Step2Details
              formState={formState}
              errors={errors}
              photos={photos}
              onPhotosChange={setPhotos}
              onChange={updateFormState}
              onNext={handleNextFromStep2}
              onBack={handleBackToStep1}
            />
          )}

          {currentStep === 3 && (
            <Step3Contact
              formState={formState}
              errors={errors}
              isSubmitting={isSubmitting}
              submitError={submitError}
              onChange={updateFormState}
              onSubmit={handleSubmit}
              onBack={handleBackToStep2}
            />
          )}
        </>
      )}
    </div>
  );
}
