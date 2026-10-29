import { expect, it } from "vitest";
import { submitInquiry } from "@/lib/inquiries/service";
import { MemoryStore } from "@/lib/store/memory-store";

it("accepts AI inquiries without a form timer but retains the honeypot", async () => {
  const store = new MemoryStore();
  const raw = {
    name: "Alex",
    phone: "5550100142",
    zip: "12345",
    serviceSlug: "panel-upgrades",
    description: "Planning an upgrade",
    urgency: "routine",
    consent: true,
    idempotencyKey: "7dc62e56-ccf5-4b1f-a0df-5439723df052",
    details: { formType: "panel", reason: "adding_load", propertyType: "single_family" },
  };
  const ctx = { ipHash: "hash", source: "ai_chat" as const, store };
  expect((await submitInquiry({ ...raw, company_website: "bot" }, ctx)).status).toBe(400);
  expect((await submitInquiry(raw, ctx)).status).toBe(201);
});
