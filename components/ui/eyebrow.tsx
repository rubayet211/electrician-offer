import React from "react";

export interface EyebrowProps {
  index?: string | number;
  children: React.ReactNode;
  className?: string;
  tone?: "default" | "muted" | "amber";
}

const toneClasses: Record<"default" | "muted" | "amber", string> = {
  default: "text-steel-600 dark:text-steel-400 [data-tone=dark]_&:text-steel-400",
  muted: "text-steel-500 dark:text-steel-400 [data-tone=dark]_&:text-steel-400",
  amber: "text-amber-strong dark:text-amber [data-tone=dark]_&:text-amber",
};

export function Eyebrow({ index, children, className = "", tone = "default" }: EyebrowProps) {
  const formattedIndex =
    typeof index === "number" ? `${String(index).padStart(2, "0")} —` : index ? `${index} —` : null;

  return (
    <div
      className={`font-mono text-xs uppercase tracking-widest font-semibold flex items-center gap-2 ${toneClasses[tone]} ${className}`.trim()}
    >
      {formattedIndex && (
        <span className="font-mono text-steel-500 [data-tone=dark]_&:text-steel-400 select-none">
          {formattedIndex}
        </span>
      )}
      <span>{children}</span>
    </div>
  );
}
