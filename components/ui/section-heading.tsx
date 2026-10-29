import React from "react";
import { Eyebrow } from "./eyebrow";

export interface SectionHeadingProps {
  eyebrow?: string;
  eyebrowIndex?: string | number;
  title: React.ReactNode;
  lede?: React.ReactNode;
  align?: "left" | "center";
  className?: string;
}

export function SectionHeading({
  eyebrow,
  eyebrowIndex,
  title,
  lede,
  align = "left",
  className = "",
}: SectionHeadingProps) {
  const isCenter = align === "center";

  return (
    <div
      className={`space-y-3.5 mb-8 sm:mb-12 ${
        isCenter ? "text-center mx-auto items-center flex flex-col" : "text-left"
      } ${className}`.trim()}
    >
      {eyebrow && (
        <Eyebrow index={eyebrowIndex} className={isCenter ? "justify-center" : ""}>
          {eyebrow}
        </Eyebrow>
      )}

      <h2 className="font-display font-bold text-ink [data-tone=dark]_&:text-paper text-2xl sm:text-3xl md:text-4xl tracking-tight leading-tight">
        {title}
      </h2>

      {lede && (
        <p className="font-sans text-steel-600 [data-tone=dark]_&:text-steel-300 text-base sm:text-lg leading-relaxed max-w-[65ch]">
          {lede}
        </p>
      )}
    </div>
  );
}
