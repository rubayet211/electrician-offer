import React from "react";

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: React.ReactNode;
  description?: React.ReactNode;
  hasError?: boolean;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  (
    { className = "", label, description, id, hasError, "aria-invalid": ariaInvalid, ...props },
    ref,
  ) => {
    const isInvalid = ariaInvalid === true || ariaInvalid === "true" || hasError;
    const fallbackId = React.useId();
    const generatedId = id ?? fallbackId;
    const descId = description ? `${generatedId}-desc` : undefined;

    return (
      <div
        className={`relative flex items-start gap-3 py-1 cursor-pointer select-none ${className}`.trim()}
      >
        <div className="flex items-center min-h-[24px]">
          <input
            id={generatedId}
            ref={ref}
            type="checkbox"
            aria-invalid={isInvalid ? "true" : undefined}
            aria-describedby={descId}
            className={`w-4 h-4 rounded-xs border transition-colors duration-150 cursor-pointer accent-ink focus-visible:outline-2 focus-visible:outline-signal-blue focus-visible:outline-offset-2 ${
              isInvalid
                ? "border-danger text-danger"
                : "border-steel-300 [data-tone=dark]_&:border-steel-600 [data-tone=dark]_&:accent-amber"
            }`}
            {...props}
          />
        </div>
        <div className="text-sm leading-snug">
          <label
            htmlFor={generatedId}
            className="font-medium text-ink [data-tone=dark]_&:text-paper cursor-pointer"
          >
            {label}
          </label>
          {description && (
            <p
              id={descId}
              className="text-xs text-steel-500 [data-tone=dark]_&:text-steel-400 mt-0.5 leading-normal"
            >
              {description}
            </p>
          )}
        </div>
      </div>
    );
  },
);

Checkbox.displayName = "Checkbox";
