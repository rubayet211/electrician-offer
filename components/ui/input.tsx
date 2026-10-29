import React from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", hasError, "aria-invalid": ariaInvalid, ...props }, ref) => {
    const isInvalid = ariaInvalid === true || ariaInvalid === "true" || hasError;

    return (
      <input
        ref={ref}
        aria-invalid={isInvalid ? "true" : undefined}
        className={`w-full min-h-[44px] px-3.5 py-2.5 rounded-sm border bg-paper text-ink [data-tone=dark]_&:bg-steel-900 [data-tone=dark]_&:text-paper font-sans text-sm transition-colors duration-150 placeholder:text-steel-400 disabled:opacity-50 disabled:bg-steel-100 disabled:cursor-not-allowed ${
          isInvalid
            ? "border-danger focus-visible:outline-danger"
            : "border-steel-300 [data-tone=dark]_&:border-steel-700 hover:border-steel-400 focus-visible:border-signal-blue"
        } ${className}`.trim()}
        {...props}
      />
    );
  },
);

Input.displayName = "Input";
