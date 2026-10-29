import { expect, it } from "vitest";
import { parsedClientConfig } from "@/config/client.config";
import { buildSystemPrompt } from "@/lib/ai/system-prompt";

it("excludes unverified credentials and emergency claims", () => {
  const config = structuredClone(parsedClientConfig);
  config.credentials.licenses = [
    {
      label: "Secret license",
      number: "UNVERIFIED-123",
      issuingAuthority: "Office",
      jurisdiction: "State",
      status: "unverified",
      isSample: false,
    },
  ];
  config.emergency = { offered: true, verified: false, description: "UNVERIFIED EMERGENCY" };
  const prompt = buildSystemPrompt(config);
  expect(prompt).not.toContain("UNVERIFIED-123");
  expect(prompt).not.toContain("UNVERIFIED EMERGENCY");
  expect(prompt).toContain(config.business.name);
  expect(prompt).toContain(config.business.phone);
});

it("includes verified credentials and excludes unverified emergency knowledge", () => {
  const config = structuredClone(parsedClientConfig);
  config.credentials.licenses = [];
  config.credentials.insurance = {
    status: "verified",
    carrier: "Verified Carrier",
    isSample: false,
  };
  config.credentials.certifications = [
    { label: "Verified certification", status: "verified", isSample: false },
    { label: "Pending certification", status: "pending", isSample: false },
  ];
  config.emergency = { offered: true, verified: false, description: "secret emergency claim" };
  config.ai.approvedKnowledge = [{ topic: "Emergency", answer: "unverified emergency hours" }];
  const prompt = buildSystemPrompt(config);
  expect(prompt).toContain("Verified Carrier");
  expect(prompt).toContain("Verified certification");
  expect(prompt).not.toContain("Pending certification");
  expect(prompt).not.toContain("unverified emergency hours");
});

it("states the fixed emergency guidance when emergency service is unverified", () => {
  const config = structuredClone(parsedClientConfig);
  config.emergency.verified = false;
  expect(buildSystemPrompt(config)).toContain(
    "This business does not advertise emergency or same-day service. For fire, smoke, sparks or a shock, call 911.",
  );
});
