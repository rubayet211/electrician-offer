import { expect, it } from "vitest";
import { MemoryStore } from "@/lib/store/memory-store";
import { prepareEstimateRequest } from "@/lib/ai/tools";

it("validates and creates a session-bound draft without creating a lead", async () => {
  const store = new MemoryStore();
  const now = new Date();
  await store.aiSessions.create({
    id: "session",
    visitorHash: "hash",
    month: "2026-10",
    startedAt: now.toISOString(),
    lastActivityAt: now.toISOString(),
    visitorMessages: 0,
    counted: false,
    reservationState: "none",
  });
  const result = await prepareEstimateRequest(
    {
      name: "Alex",
      phone: "5550100142",
      zip: "12345",
      serviceSlug: "panel-upgrades",
      description: "Planning an upgrade",
      urgency: "routine",
    },
    "session",
    store,
    now,
  );
  expect(result.status).toBe("awaiting_visitor_confirmation");
  expect(await store.leads.list()).toHaveLength(0);
});
