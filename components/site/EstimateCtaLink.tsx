"use client";

import React from "react";
import Link from "next/link";
import { trackEvent } from "./analytics";

export interface EstimateCtaLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href?: string;
  serviceSlug?: string;
  children: React.ReactNode;
  className?: string;
}

export function EstimateCtaLink({
  href = "/contact",
  serviceSlug,
  children,
  className = "",
  onClick,
  ...rest
}: EstimateCtaLinkProps) {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    trackEvent("estimate_cta_click", undefined, serviceSlug);
    if (onClick) {
      onClick(e);
    }
  };

  return (
    <Link href={href} className={className} onClick={handleClick} {...rest}>
      {children}
    </Link>
  );
}
