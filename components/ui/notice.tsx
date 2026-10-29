import React from "react";
import { AlertTriangle, Info } from "lucide-react";

export type NoticeType = "info" | "safety";

export interface NoticeProps {
  type?: NoticeType;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function Notice({ type = "info", title, children, className = "" }: NoticeProps) {
  const isSafety = type === "safety";

  return (
    <div
      role={isSafety ? "alert" : "note"}
      className={`rounded-md border p-4.5 text-sm ${
        isSafety
          ? "bg-red-50/70 border-danger/30 text-ink [data-tone=dark]_&:bg-red-950/40 [data-tone=dark]_&:border-danger/40 [data-tone=dark]_&:text-paper"
          : "bg-steel-50 border-steel-200 text-ink [data-tone=dark]_&:bg-steel-900/40 [data-tone=dark]_&:border-white/10 [data-tone=dark]_&:text-paper"
      } ${className}`.trim()}
    >
      <div className="flex items-start gap-3">
        <div className="shrink-0 mt-0.5">
          {isSafety ? (
            <AlertTriangle className="w-5 h-5 text-danger" aria-hidden="true" />
          ) : (
            <Info className="w-5 h-5 text-signal-blue" aria-hidden="true" />
          )}
        </div>

        <div className="flex-1 space-y-1">
          {title && (
            <div
              className={`font-semibold tracking-tight text-sm ${
                isSafety
                  ? "text-danger [data-tone=dark]_&:text-red-300 font-display"
                  : "text-ink [data-tone=dark]_&:text-paper font-sans"
              }`}
            >
              {title}
            </div>
          )}
          <div className="text-steel-700 [data-tone=dark]_&:text-steel-300 leading-relaxed text-sm">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
