import { createElement } from "react";

export function InvalidFields({ fields }: { fields: string[] }) {
  const labels: Record<string, string> = {
    serviceSlug: "service",
    zip: "ZIP code",
    form: "request",
  };
  return createElement(
    "p",
    null,
    `Please correct these fields: ${fields.map((field) => labels[field] ?? field).join(", ")}.`,
  );
}
