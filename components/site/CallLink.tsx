"use client";

import React from "react";
import { trackEvent } from "./analytics";

export interface CallLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  phone: string;
  serviceSlug?: string;
  children: React.ReactNode;
  className?: string;
}

export function CallLink({
  phone,
  serviceSlug,
  children,
  className = "",
  onClick,
  ...rest
}: CallLinkProps) {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    trackEvent("phone_click", undefined, serviceSlug);
    if (onClick) {
      onClick(e);
    }
  };

  const telHref = phone.startsWith("tel:") ? phone : `tel:${phone}`;

  return (
    <a href={telHref} className={className} onClick={handleClick} {...rest}>
      {children}
    </a>
  );
}
