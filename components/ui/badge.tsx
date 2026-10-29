import React from "react";
import { ShieldCheck, Clock, AlertCircle } from "lucide-react";

export type BadgeVariant = "verified" | "sample" | "pending" | "neutral";

export interface BadgeProps {
  variant?: BadgeVariant;
  children?: React.ReactNode;
  icon?: boolean | React.ReactNode;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  verified:
    "bg-green-50 text-[#15803D] border-[#15803D]/30 [data-tone=dark]_&:bg-green-950/40 [data-tone=dark]_&:text-green-300 [data-tone=dark]_&:border-green-800",
  sample:
    "bg-amber/15 text-amber-strong border-amber/50 font-bold tracking-wider [data-tone=dark]_&:bg-amber/20 [data-tone=dark]_&:text-amber [data-tone=dark]_&:border-amber/40",
  pending:
    "bg-steel-100 text-steel-700 border-steel-300 [data-tone=dark]_&:bg-steel-800 [data-tone=dark]_&:text-steel-300 [data-tone=dark]_&:border-steel-700",
  neutral:
    "bg-steel-50 text-steel-700 border-steel-200 [data-tone=dark]_&:bg-steel-800/60 [data-tone=dark]_&:text-steel-300 [data-tone=dark]_&:border-steel-700",
};

export function Badge({ variant = "neutral", children, icon = true, className = "" }: BadgeProps) {
  let defaultIcon: React.ReactNode = null;
  if (icon === true) {
    if (variant === "verified") {
      defaultIcon = <ShieldCheck className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />;
    } else if (variant === "pending") {
      defaultIcon = <Clock className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />;
    } else if (variant === "sample") {
      defaultIcon = <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />;
    }
  } else if (typeof icon === "object") {
    defaultIcon = icon;
  }

  const defaultText =
    variant === "sample"
      ? "SAMPLE"
      : variant === "verified"
        ? "Verified"
        : variant === "pending"
          ? "Pending"
          : null;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-sm border text-xs font-mono font-medium select-none ${variantStyles[variant]} ${className}`.trim()}
    >
      {defaultIcon}
      <span>{children ?? defaultText}</span>
    </span>
  );
}
