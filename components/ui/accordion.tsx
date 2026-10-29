import React from "react";
import { ChevronDown } from "lucide-react";

export interface AccordionItemProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
  id?: string;
}

export function AccordionItem({
  title,
  children,
  defaultOpen = false,
  className = "",
  id,
}: AccordionItemProps) {
  return (
    <details
      id={id}
      open={defaultOpen}
      className={`group border-b border-steel-200 [data-tone=dark]_&:border-white/10 last:border-b-0 py-1 transition-colors duration-150 ${className}`.trim()}
    >
      <summary className="flex items-center justify-between gap-4 py-4 px-2 cursor-pointer select-none list-none [&::-webkit-details-marker]:hidden font-display font-semibold text-ink [data-tone=dark]_&:text-paper hover:text-steel-700 [data-tone=dark]_&:hover:text-steel-200 transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-signal-blue rounded-sm">
        <span className="text-base sm:text-lg tracking-tight text-left">{title}</span>
        <ChevronDown
          className="w-5 h-5 shrink-0 text-steel-500 [data-tone=dark]_&:text-steel-400 transition-transform duration-200 ease-out group-open:rotate-180"
          aria-hidden="true"
        />
      </summary>
      <div className="px-2 pt-1 pb-5 font-sans text-steel-600 [data-tone=dark]_&:text-steel-300 text-sm sm:text-base leading-relaxed">
        {children}
      </div>
    </details>
  );
}

export interface AccordionProps {
  items: Array<{
    id?: string;
    title: string;
    content: React.ReactNode;
    defaultOpen?: boolean;
  }>;
  className?: string;
}

export function Accordion({ items, className = "" }: AccordionProps) {
  return (
    <div
      className={`rounded-md border border-steel-200 [data-tone=dark]_&:border-white/10 bg-paper [data-tone=dark]_&:bg-charcoal px-4 divide-y divide-steel-200 [data-tone=dark]_&:divide-white/10 shadow-technical ${className}`.trim()}
    >
      {items.map((item, index) => (
        <AccordionItem
          key={item.id ?? index}
          id={item.id}
          title={item.title}
          defaultOpen={item.defaultOpen}
        >
          {item.content}
        </AccordionItem>
      ))}
    </div>
  );
}
