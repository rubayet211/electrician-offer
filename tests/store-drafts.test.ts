import { expect, it } from "vitest";
import { MemoryStore } from "@/lib/store/memory-store";
it("consumes a draft only once concurrently", async () => {
  const store = new MemoryStore();
  await store.aiSessions.create({
    id: "session",
    visitorHash: "hash",
    month: "2026-10",
    startedAt: new Date().toISOString(),
    lastActivityAt: new Date().toISOString(),
    visitorMessages: 0,
    counted: false,
    reservationState: "none",
  });
  await store.aiDrafts.create({
    token: "draft",
    sessionId: "session",
    payload: { value: 1 },
    expiresAt: new Date(Date.now() + 60000).toISOString(),
  });
  const results = await Promise.all(
    Array.from({ length: 10 }, () => store.aiDrafts.consume("draft", "session")),
  );
  expect(results.filter(Boolean)).toHaveLength(1);
});
