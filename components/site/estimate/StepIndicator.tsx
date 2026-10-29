import React from "react";

export interface StepIndicatorProps {
  currentStep: 1 | 2 | 3;
}

const STEP_LABELS = {
  1: "Service & Urgency",
  2: "Project Details",
  3: "Contact & Location",
};

export function StepIndicator({ currentStep }: StepIndicatorProps) {
  return (
    <div className="mb-8" aria-label={`Step ${currentStep} of 3: ${STEP_LABELS[currentStep]}`}>
      {/* Perceivable live announcement for assistive tech */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        Step {currentStep} of 3: {STEP_LABELS[currentStep]}
      </div>

      <div className="flex items-center justify-between text-xs font-mono mb-2.5">
        <span className="font-semibold text-steel-700 [data-tone=dark]_&:text-steel-300">
          Step {currentStep} of 3
        </span>
        <span className="text-steel-500 uppercase tracking-wider">{STEP_LABELS[currentStep]}</span>
      </div>

      <div className="grid grid-cols-3 gap-2" aria-hidden="true">
        {[1, 2, 3].map((step) => {
          const isComplete = step < currentStep;
          const isCurrent = step === currentStep;

          return (
            <div
              key={step}
              className={`h-1.5 rounded-sm transition-colors duration-200 ${
                isCurrent
                  ? "bg-amber"
                  : isComplete
                    ? "bg-steel-700 [data-tone=dark]_&:bg-steel-400"
                    : "bg-steel-200 [data-tone=dark]_&:bg-steel-800"
              }`}
            />
          );
        })}
      </div>
    </div>
  );
}
