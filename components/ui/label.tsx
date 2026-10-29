import React from "react";

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  htmlFor?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function Label({
  htmlFor,
  required = false,
  children,
  className = "",
  ...props
}: LabelProps) {
  return (
    <label
      htmlFor={htmlFor}
      className={`block font-mono text-xs uppercase tracking-wider font-semibold text-steel-700 [data-tone=dark]_&:text-steel-300 mb-1.5 ${className}`.trim()}
      {...props}
    >
      {children}
      {required && (
        <span className="text-danger ml-1" aria-hidden="true">
          *
        </span>
      )}
    </label>
  );
}
