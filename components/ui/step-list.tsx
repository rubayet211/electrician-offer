import React from "react";

export interface StepItem {
  number?: string | number;
  title: string;
  description: string;
  detail?: string;
}

export interface StepListProps {
  steps: StepItem[];
  columns?: 2 | 3 | 4;
  className?: string;
}

export function StepList({ steps, columns = 3, className = "" }: StepListProps) {
  const gridClasses: Record<2 | 3 | 4, string> = {
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  };

  return (
    <ol className={`grid gap-6 ${gridClasses[columns]} list-none p-0 m-0 ${className}`.trim()}>
      {steps.map((step, idx) => {
        const stepNum =
          step.number !== undefined
            ? typeof step.number === "number"
              ? String(step.number).padStart(2, "0")
              : step.number
            : String(idx + 1).padStart(2, "0");

        return (
          <li
            key={idx}
            className="relative flex flex-col p-6 rounded-md border border-steel-200 bg-paper [data-tone=dark]_&:bg-charcoal [data-tone=dark]_&:border-white/10 shadow-technical"
          >
            <div className="flex items-center justify-between gap-4 mb-4 pb-3 border-b border-steel-100 [data-tone=dark]_&:border-white/10">
              <span className="font-mono text-xs font-semibold tracking-wider px-2 py-0.5 rounded-sm bg-steel-100 text-steel-700 [data-tone=dark]_&:bg-steel-800 [data-tone=dark]_&:text-steel-200 border border-steel-200 [data-tone=dark]_&:border-steel-700">
                STEP {stepNum}
              </span>
              <span
                className="h-px flex-1 bg-steel-100 [data-tone=dark]_&:bg-white/10"
                aria-hidden="true"
              />
            </div>

            <h3 className="font-display text-lg font-semibold text-ink [data-tone=dark]_&:text-paper mb-2 tracking-tight">
              {step.title}
            </h3>

            <p className="font-sans text-sm text-steel-600 [data-tone=dark]_&:text-steel-300 leading-relaxed flex-1">
              {step.description}
            </p>

            {step.detail && (
              <div className="mt-4 pt-3 border-t border-steel-100 [data-tone=dark]_&:border-white/10 font-mono text-xs text-steel-500 [data-tone=dark]_&:text-steel-400">
                {step.detail}
              </div>
            )}
          </li>
        );
      })}
    </ol>
  );
}
