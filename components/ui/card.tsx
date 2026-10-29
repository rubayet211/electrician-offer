import React from "react";

export type CardTone = "paper" | "subtle" | "dark";
export type CardPadding = "none" | "sm" | "md" | "lg";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  cornerTicks?: boolean;
  tone?: CardTone;
  padding?: CardPadding;
  children: React.ReactNode;
  className?: string;
}

const toneStyles: Record<CardTone, string> = {
  paper: "bg-paper text-ink border-steel-200",
  subtle: "bg-paper-subtle text-ink border-steel-200",
  dark: "bg-charcoal text-paper border-white/10 [data-tone=dark]",
};

const paddingStyles: Record<CardPadding, string> = {
  none: "p-0",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

export function Card({
  cornerTicks = false,
  tone = "paper",
  padding = "md",
  children,
  className = "",
  ...props
}: CardProps) {
  return (
    <div
      className={`relative rounded-md border shadow-technical ${toneStyles[tone]} ${paddingStyles[padding]} ${
        cornerTicks ? "corner-ticks" : ""
      } ${className}`.trim()}
      {...props}
    >
      {cornerTicks && (
        <>
          {/* Top-right tick */}
          <span
            className="absolute top-[-1px] right-[-1px] w-1.5 h-1.5 border-t-[1.5px] border-r-[1.5px] border-steel-400 [data-tone=dark]_&:border-steel-500 pointer-events-none"
            aria-hidden="true"
          />
          {/* Bottom-left tick */}
          <span
            className="absolute bottom-[-1px] left-[-1px] w-1.5 h-1.5 border-b-[1.5px] border-l-[1.5px] border-steel-400 [data-tone=dark]_&:border-steel-500 pointer-events-none"
            aria-hidden="true"
          />
        </>
      )}
      {children}
    </div>
  );
}
