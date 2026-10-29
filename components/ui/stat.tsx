import React from "react";

export interface StatProps {
  value: React.ReactNode;
  label: string;
  caption?: string;
  className?: string;
}

export function Stat({ value, label, caption, className = "" }: StatProps) {
  return (
    <div
      className={`flex flex-col p-5 rounded-md border border-steel-200 [data-tone=dark]_&:border-white/10 bg-paper [data-tone=dark]_&:bg-charcoal shadow-technical ${className}`.trim()}
    >
      <div className="font-display font-extrabold text-3xl sm:text-4xl tracking-tight text-ink [data-tone=dark]_&:text-paper mb-1">
        {value}
      </div>
      <div className="font-sans font-medium text-sm text-steel-700 [data-tone=dark]_&:text-steel-300">
        {label}
      </div>
      {caption && (
        <div className="mt-2 pt-2 border-t border-steel-100 [data-tone=dark]_&:border-white/10 font-mono text-xs text-steel-500 [data-tone=dark]_&:text-steel-400">
          {caption}
        </div>
      )}
    </div>
  );
}
