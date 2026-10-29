import React from "react";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  hasError?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className = "", hasError, "aria-invalid": ariaInvalid, ...props }, ref) => {
    const isInvalid = ariaInvalid === true || ariaInvalid === "true" || hasError;

    return (
      <textarea
        ref={ref}
        aria-invalid={isInvalid ? "true" : undefined}
        className={`w-full min-h-[100px] px-3.5 py-2.5 rounded-sm border bg-paper text-ink [data-tone=dark]_&:bg-steel-900 [data-tone=dark]_&:text-paper font-sans text-sm transition-colors duration-150 placeholder:text-steel-400 disabled:opacity-50 disabled:bg-steel-100 disabled:cursor-not-allowed ${
          isInvalid
            ? "border-danger focus-visible:outline-danger"
            : "border-steel-300 [data-tone=dark]_&:border-steel-700 hover:border-steel-400 focus-visible:border-signal-blue"
        } ${className}`.trim()}
        {...props}
      />
    );
  },
);

Textarea.displayName = "Textarea";
