import React from "react";
import { ChevronDown } from "lucide-react";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options?: SelectOption[];
  hasError?: boolean;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = "", hasError, options, children, "aria-invalid": ariaInvalid, ...props }, ref) => {
    const isInvalid = ariaInvalid === true || ariaInvalid === "true" || hasError;

    return (
      <div className="relative w-full">
        <select
          ref={ref}
          aria-invalid={isInvalid ? "true" : undefined}
          className={`w-full min-h-[44px] appearance-none px-3.5 py-2.5 pr-10 rounded-sm border bg-paper text-ink [data-tone=dark]_&:bg-steel-900 [data-tone=dark]_&:text-paper font-sans text-sm transition-colors duration-150 cursor-pointer disabled:opacity-50 disabled:bg-steel-100 disabled:cursor-not-allowed ${
            isInvalid
              ? "border-danger focus-visible:outline-danger"
              : "border-steel-300 [data-tone=dark]_&:border-steel-700 hover:border-steel-400 focus-visible:border-signal-blue"
          } ${className}`.trim()}
          {...props}
        >
          {options
            ? options.map((opt) => (
                <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                  {opt.label}
                </option>
              ))
            : children}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-steel-500">
          <ChevronDown className="w-4 h-4" aria-hidden="true" />
        </div>
      </div>
    );
  },
);

Select.displayName = "Select";
