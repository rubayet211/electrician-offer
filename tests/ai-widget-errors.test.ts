import { expect, it } from "vitest";
import { assistantErrorMessage } from "@/components/ai/error-message";
it.each(["message_limit", "rate_limited", "in_flight", "quota_exhausted"])(
  "explains %s",
  (reason) => {
    expect(assistantErrorMessage(new Error(JSON.stringify({ reason })))).not.toBe(
      "Assistant unavailable. Please call or request an estimate.",
    );
  },
);
