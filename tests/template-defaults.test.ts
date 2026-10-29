import { expect, it } from "vitest";
import template from "@/clients/_template/client.config";
import demo from "@/clients/demo/client.config";
import { validateStaticConfig } from "@/scripts/lib/prelaunch.mjs";
it("keeps new client defaults independent and rejects demo content", () => {
  expect(template.hours[0].days).toBe("__REQUIRED__");
  expect(template.faqs).toEqual([]);
  expect(template.reviews).toEqual([]);
  expect(template.projects).toEqual([]);
  expect(template.ai.enabled).toBe(false);
  for (const field of ["hours", "branding", "positioning"] as const) {
    const result = validateStaticConfig(
      { ...template, [field]: demo[field] },
      { NEXT_PUBLIC_SITE_ENV: "production" },
      { demoConfig: demo },
    );
    expect(result.problems).toContain(`${field} must not match the demo config`);
  }
});
