import React from "react";
import Link from "next/link";

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost-on-dark";
export type ButtonSize = "md" | "lg";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  href?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-amber text-ink hover:bg-amber-strong active:bg-amber-strong font-semibold shadow-technical border border-transparent",
  secondary:
    "bg-ink text-paper hover:bg-charcoal active:bg-charcoal font-semibold border border-steel-700 shadow-technical",
  outline:
    "bg-transparent text-ink hover:bg-steel-100 active:bg-steel-200 font-medium border border-steel-300",
  "ghost-on-dark":
    "bg-transparent text-paper hover:bg-white/10 active:bg-white/15 font-medium border border-white/20 hover:border-white/40",
};

const sizeStyles: Record<ButtonSize, string> = {
  md: "min-h-[44px] px-4 py-2.5 text-sm gap-2",
  lg: "min-h-[48px] px-6 py-3 text-base gap-2.5",
};

export function Button({
  variant = "primary",
  size = "md",
  href,
  icon,
  children,
  className = "",
  disabled,
  ...rest
}: ButtonProps) {
  const baseClasses =
    "inline-flex flex-row flex-nowrap items-center justify-center whitespace-nowrap rounded-sm font-sans tracking-tight cursor-pointer select-none text-center transition-colors duration-150 ease-out disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-signal-blue focus-visible:outline-offset-2";
  const combinedClasses =
    `${baseClasses} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`.trim();

  const content = (
    <span className="inline-flex flex-row flex-nowrap items-center justify-center gap-2 whitespace-nowrap">
      {icon && (
        <span className="inline-flex shrink-0 items-center justify-center" aria-hidden="true">
          {icon}
        </span>
      )}
      <span className="inline-flex flex-row flex-nowrap items-center justify-center gap-2 whitespace-nowrap">
        {children}
      </span>
    </span>
  );

  if (href) {
    return (
      <Link href={href} className={combinedClasses} aria-disabled={disabled}>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" className={combinedClasses} disabled={disabled} {...rest}>
      {content}
    </button>
  );
}
