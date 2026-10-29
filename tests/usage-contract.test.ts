import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
import { expect, it } from "vitest";
import { PgStore } from "@/lib/store/pg-store";
import { MemoryStore } from "@/lib/store/memory-store";
for (const kind of ["memory", "postgres"] as const)
  it(`${kind} tracks usage and releases stale reservations`, async () => {
    const db = kind === "postgres" ? new PGlite() : null;
    if (db) await db.exec(await readFile("lib/db/migrations/001_init.sql", "utf8"));
    const store = db ? new PgStore(db) : new MemoryStore();
    const old = new Date(Date.now() - 1200000).toISOString();
    expect(await store.aiUsage.reserve("2026-10", 10)).toBe(true);
    await store.aiSessions.create({
      id: "stale",
      visitorHash: "visitor",
      month: "2026-10",
      startedAt: old,
      lastActivityAt: old,
      visitorMessages: 0,
      counted: false,
      reservationState: "reserved",
    });
    expect(
      await store.aiSessions.countNewByVisitorSince("visitor", new Date(Date.now() - 3600000)),
    ).toBe(1);
    expect(await store.aiUsage.releaseStale(new Date(Date.now() - 600000))).toBe(1);
    expect((await store.aiUsage.getMonth("2026-10"))?.reserved).toBe(0);
    expect(await store.aiUsage.reserve("2026-10", 10)).toBe(true);
    expect(await store.aiUsage.commit("2026-10")).toBe(true);
    await store.aiUsage.addUsage("2026-10", 100, 20, 0.01);
    expect(await store.aiUsage.getMonth("2026-10")).toMatchObject({
      used: 1,
      inputTokens: 100,
      outputTokens: 20,
      costUsd: 0.01,
    });
    await db?.close();
  });
