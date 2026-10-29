import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
import { expect, it } from "vitest";
import { PgStore } from "@/lib/store/pg-store";

it("atomically reserves and releases session quota in PostgreSQL", async () => {
  const db = new PGlite();
  await db.exec(await readFile("lib/db/migrations/001_init.sql", "utf8"));
  const store = new PgStore(db);
  const now = new Date().toISOString();
  for (let i = 0; i < 12; i++)
    await store.aiSessions.create({
      id: String(i),
      visitorHash: String(i),
      month: "2026-10",
      startedAt: now,
      lastActivityAt: now,
      visitorMessages: 0,
      counted: false,
      reservationState: "none",
    });
  const result = await Promise.all(
    Array.from({ length: 12 }, (_, i) => store.aiSessions.reserve(String(i), 4)),
  );
  expect(result.filter(Boolean)).toHaveLength(4);
  expect(await store.aiSessions.settle("0", true)).toBe(true);
  expect(await store.aiSessions.settle("0", true)).toBe(false);
  expect(await store.aiUsage.getMonth("2026-10")).toMatchObject({ reserved: 3, used: 1 });
  await db.close();
});

it("serializes the per-visitor reservation limit in PostgreSQL", async () => {
  const db = new PGlite();
  await db.exec(await readFile("lib/db/migrations/001_init.sql", "utf8"));
  const store = new PgStore(db);
  const now = new Date();
  for (let i = 0; i < 10; i++)
    await store.aiSessions.create({
      id: `visitor-${i}`,
      visitorHash: "same",
      month: "2026-10",
      startedAt: now.toISOString(),
      lastActivityAt: now.toISOString(),
      visitorMessages: 0,
      counted: false,
      reservationState: "none",
    });
  const reservations = await Promise.all(
    Array.from({ length: 10 }, (_, i) =>
      store.aiSessions.reserve(`visitor-${i}`, 100, new Date(+now - 60000), 4),
    ),
  );
  expect(reservations.filter(Boolean)).toHaveLength(4);
  await db.close();
});
