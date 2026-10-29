import React from "react";

export type SectionTone = "light" | "muted" | "dark";

export interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  tone?: SectionTone;
  blueprint?: boolean;
  borderTop?: boolean;
  borderBottom?: boolean;
  children: React.ReactNode;
  className?: string;
  id?: string;
}

const toneStyles: Record<SectionTone, string> = {
  light: "bg-paper text-ink",
  muted: "bg-paper-subtle text-ink",
  dark: "bg-ink text-paper dark-tone",
};

export function Section({
  tone = "light",
  blueprint = false,
  borderTop = false,
  borderBottom = false,
  children,
  className = "",
  ...props
}: SectionProps) {
  const isDark = tone === "dark";
  const borderClasses = [
    borderTop ? (isDark ? "border-t border-white/10" : "border-t border-steel-200") : "",
    borderBottom ? (isDark ? "border-b border-white/10" : "border-b border-steel-200") : "",
  ]
    .filter(Boolean)
    .join(" ");

  const blueprintClass = blueprint ? "bg-blueprint" : "";

  return (
    <section
      data-tone={tone}
      className={`relative py-14 sm:py-20 ${toneStyles[tone]} ${blueprintClass} ${borderClasses} ${className}`.trim()}
      {...props}
    >
      {children}
    </section>
  );
}
