import React from "react";

export interface RadioOption {
  value: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
  badge?: string;
}

export interface RadioCardsProps {
  name: string;
  options: RadioOption[];
  value?: string;
  defaultValue?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  hasError?: boolean;
  "aria-invalid"?: boolean | "true" | "false";
  "aria-describedby"?: string;
  "aria-labelledby"?: string;
  "aria-label"?: string;
  "aria-required"?: boolean | "true" | "false";
  className?: string;
  columns?: 1 | 2 | 3;
}

export function RadioCards({
  name,
  options,
  value,
  defaultValue,
  onChange,
  hasError,
  "aria-invalid": ariaInvalid,
  "aria-describedby": ariaDescribedBy,
  "aria-labelledby": ariaLabelledBy,
  "aria-label": ariaLabel,
  "aria-required": ariaRequired,
  className = "",
  columns = 2,
}: RadioCardsProps) {
  const isInvalid = ariaInvalid === true || ariaInvalid === "true" || hasError;
  const isRequired = ariaRequired === true || ariaRequired === "true";

  const colClasses = {
    1: "grid-cols-1",
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  };

  return (
    <div
      role="radiogroup"
      aria-labelledby={ariaLabelledBy}
      aria-label={ariaLabel}
      aria-required={isRequired ? "true" : undefined}
      aria-invalid={isInvalid ? "true" : undefined}
      aria-describedby={ariaDescribedBy}
      className={`grid gap-3 ${colClasses[columns]} ${className}`.trim()}
    >
      {options.map((option) => {
        const optionId = `${name}-${option.value}`;
        const isChecked = value !== undefined ? value === option.value : undefined;

        return (
          <label
            key={option.value}
            htmlFor={optionId}
            className={`group relative flex items-start gap-3.5 p-4 rounded-md border text-left cursor-pointer transition-colors duration-150 select-none min-h-[56px] shadow-technical ${
              isInvalid
                ? "border-danger/60 bg-red-50/20 [data-tone=dark]_&:border-danger/60"
                : "border-steel-200 [data-tone=dark]_&:border-white/10 bg-paper [data-tone=dark]_&:bg-charcoal hover:border-steel-400 [data-tone=dark]_&:hover:border-white/20 has-[:checked]:border-ink has-[:checked]:bg-steel-50/60 [data-tone=dark]_&:has-[:checked]:border-amber [data-tone=dark]_&:has-[:checked]:bg-white/[0.04]"
            }`}
          >
            <input
              type="radio"
              id={optionId}
              name={name}
              value={option.value}
              checked={isChecked}
              defaultChecked={defaultValue === option.value}
              onChange={onChange}
              required={isRequired}
              className="mt-1 w-4 h-4 text-ink accent-ink [data-tone=dark]_&:accent-amber border-steel-300 focus-visible:outline-2 focus-visible:outline-signal-blue"
            />

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="font-display font-semibold text-sm text-ink [data-tone=dark]_&:text-paper flex items-center gap-2">
                  {option.icon && (
                    <span
                      className="shrink-0 text-steel-500 [data-tone=dark]_&:text-steel-400 group-hover:text-ink [data-tone=dark]_&:group-hover:text-paper"
                      aria-hidden="true"
                    >
                      {option.icon}
                    </span>
                  )}
                  {option.label}
                </span>

                {option.badge && (
                  <span className="font-mono text-[10px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded-xs bg-steel-100 text-steel-700 [data-tone=dark]_&:bg-steel-800 [data-tone=dark]_&:text-steel-300 border border-steel-200 [data-tone=dark]_&:border-steel-700">
                    {option.badge}
                  </span>
                )}
              </div>

              {option.description && (
                <p className="font-sans text-xs text-steel-500 [data-tone=dark]_&:text-steel-400 mt-1 leading-normal">
                  {option.description}
                </p>
              )}
            </div>
          </label>
        );
      })}
    </div>
  );
}
