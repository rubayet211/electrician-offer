import { expect, it } from "vitest";
import { MemoryStore } from "@/lib/store/memory-store";
it("blocks the sixth hit in a window", async () => {
  const store = new MemoryStore();
  const hits = await Promise.all(
    Array.from({ length: 6 }, () => store.rateLimit.hit("visitor", 5, 600000)),
  );
  expect(hits.filter((hit) => hit.allowed)).toHaveLength(5);
});
it("limits concurrent reservations", async () => {
  const store = new MemoryStore();
  const reservations = await Promise.all(
    Array.from({ length: 50 }, () => store.aiUsage.reserve("2026-10", 10)),
  );
  expect(reservations.filter(Boolean)).toHaveLength(10);
});
