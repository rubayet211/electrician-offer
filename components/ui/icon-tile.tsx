import React from "react";

export type IconTileSize = "sm" | "md" | "lg";
export type IconTileTone = "steel" | "ink" | "amber" | "outline";

export interface IconTileProps {
  icon: React.ReactNode;
  size?: IconTileSize;
  tone?: IconTileTone;
  className?: string;
  "aria-hidden"?: boolean;
}

const sizeStyles: Record<IconTileSize, { container: string; iconSize: string }> = {
  sm: { container: "w-9 h-9 rounded-sm", iconSize: "[&>svg]:w-4 [&>svg]:h-4" },
  md: { container: "w-11 h-11 rounded-md", iconSize: "[&>svg]:w-5 [&>svg]:h-5" },
  lg: { container: "w-14 h-14 rounded-md", iconSize: "[&>svg]:w-7 [&>svg]:h-7" },
};

const toneStyles: Record<IconTileTone, string> = {
  steel:
    "bg-steel-100 text-steel-700 border border-steel-200 [data-tone=dark]_&:bg-steel-800 [data-tone=dark]_&:text-steel-200 [data-tone=dark]_&:border-steel-700",
  ink: "bg-ink text-paper border border-steel-700 [data-tone=dark]_&:bg-charcoal [data-tone=dark]_&:border-white/20",
  amber:
    "bg-amber/15 text-amber-strong border border-amber/40 [data-tone=dark]_&:bg-amber/20 [data-tone=dark]_&:text-amber",
  outline:
    "bg-transparent text-steel-700 border border-steel-300 [data-tone=dark]_&:text-steel-300 [data-tone=dark]_&:border-white/20",
};

export function IconTile({
  icon,
  size = "md",
  tone = "steel",
  className = "",
  "aria-hidden": ariaHidden = true,
}: IconTileProps) {
  const { container, iconSize } = sizeStyles[size];

  return (
    <div
      aria-hidden={ariaHidden}
      className={`inline-flex items-center justify-center shrink-0 shadow-technical select-none ${container} ${toneStyles[tone]} ${iconSize} ${className}`.trim()}
    >
      {icon}
    </div>
  );
}
