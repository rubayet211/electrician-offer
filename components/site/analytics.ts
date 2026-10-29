import { parsedClientConfig } from "@/config/client.config";

export type AnalyticsEventType = "phone_click" | "estimate_cta_click" | "form_start" | "ai_open";

export interface AnalyticsEventPayload {
  type: AnalyticsEventType;
  page: string;
  serviceSlug?: string;
}

export function trackEvent(type: AnalyticsEventType, page?: string, serviceSlug?: string): void {
  if (!parsedClientConfig.analytics.enabled || typeof window === "undefined") return;

  const currentPath = page || window.location.pathname || "/";
  // Strip any query strings or trailing hashes from page path
  const cleanPath = currentPath.split("?")[0].split("#")[0] || "/";

  const payload: AnalyticsEventPayload = {
    type,
    page: cleanPath,
    ...(serviceSlug ? { serviceSlug } : {}),
  };

  const body = JSON.stringify(payload);

  if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
    try {
      const blob = new Blob([body], { type: "application/json" });
      const sent = navigator.sendBeacon("/api/analytics/event", blob);
      if (sent) return;
    } catch {
      // Fall through to fetch
    }
  }

  try {
    fetch("/api/analytics/event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    }).catch(() => {
      // Fire-and-forget
    });
  } catch {
    // Non-blocking fire-and-forget
  }
}
