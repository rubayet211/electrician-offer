import React from "react";

export interface SpecItem {
  label: string;
  value: React.ReactNode;
  note?: string;
}

export interface SpecListProps {
  items: SpecItem[];
  className?: string;
  title?: string;
}

export function SpecList({ items, className = "", title }: SpecListProps) {
  return (
    <div
      className={`rounded-md border border-steel-200 [data-tone=dark]_&:border-white/10 bg-paper [data-tone=dark]_&:bg-charcoal overflow-hidden shadow-technical ${className}`.trim()}
    >
      {title && (
        <div className="px-5 py-3 border-b border-steel-200 [data-tone=dark]_&:border-white/10 bg-steel-50 [data-tone=dark]_&:bg-steel-900/60 flex items-center justify-between">
          <span className="font-mono text-xs uppercase tracking-wider font-semibold text-steel-700 [data-tone=dark]_&:text-steel-300">
            {title}
          </span>
          <span className="font-mono text-xs text-steel-500 [data-tone=dark]_&:text-steel-400">
            SPECIFICATION
          </span>
        </div>
      )}

      <dl className="divide-y divide-steel-100 [data-tone=dark]_&:divide-white/10 m-0 p-0">
        {items.map((item, index) => (
          <div
            key={index}
            className="px-5 py-3.5 flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 sm:gap-4 hover:bg-steel-50/50 [data-tone=dark]_&:hover:bg-white/[0.02] transition-colors duration-150"
          >
            <dt className="text-sm font-medium text-steel-600 [data-tone=dark]_&:text-steel-400">
              {item.label}
              {item.note && (
                <span className="block text-xs font-normal text-steel-500 [data-tone=dark]_&:text-steel-500 mt-0.5">
                  {item.note}
                </span>
              )}
            </dt>
            <dd className="font-mono text-sm font-semibold text-ink [data-tone=dark]_&:text-paper text-left sm:text-right m-0">
              {item.value}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
