import React from "react";
import { AlertCircle } from "lucide-react";

export interface FieldErrorProps extends React.HTMLAttributes<HTMLParagraphElement> {
  id?: string;
  children?: React.ReactNode;
  className?: string;
}

export function FieldError({ id, children, className = "", ...props }: FieldErrorProps) {
  if (!children) return null;

  return (
    <p
      id={id}
      role="alert"
      className={`text-xs font-medium text-danger mt-1.5 flex items-center gap-1.5 ${className}`.trim()}
      {...props}
    >
      <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
      <span>{children}</span>
    </p>
  );
}
