import React from "react";
import { AlertCircle } from "lucide-react";

export function DemoBanner() {
  return (
    <div
      role="status"
      className="bg-ink border-b border-amber/40 text-paper px-4 py-1.5 text-xs font-mono flex items-center justify-center gap-2 select-none relative z-50"
    >
      <AlertCircle className="w-3.5 h-3.5 text-amber shrink-0" aria-hidden="true" />
      <span className="text-steel-200">
        <strong className="text-amber font-semibold">Demo site</strong> — sample business, not a
        real contractor. Submissions are not sent to anyone.
      </span>
    </div>
  );
}
