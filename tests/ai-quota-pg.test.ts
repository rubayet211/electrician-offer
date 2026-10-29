import { runMigrations } from "./helpers/migrations";
import { PGlite } from "@electric-sql/pglite";
import { expect, it } from "vitest";
import { PgStore } from "@/lib/store/pg-store";

it("atomically reserves and releases session quota in PostgreSQL", async () => {
  const db = new PGlite();
  await runMigrations((sql) => db.exec(sql));
  const store = new PgStore(db);
  const now = new Date("2026-10-29T12:00:00Z").toISOString();
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
  await runMigrations((sql) => db.exec(sql));
  const store = new PgStore(db);
  const now = new Date("2026-10-29T12:00:00Z");
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

it("binds draft claims to the session and key and rejects expiry", async () => {
  const db = new PGlite();
  await runMigrations((sql) => db.exec(sql));
  const store = new PgStore(db);
  const now = new Date("2026-10-29T12:00:00Z");
  await store.aiSessions.create({
    id: "s",
    visitorHash: "v",
    month: "2026-10",
    startedAt: now.toISOString(),
    lastActivityAt: now.toISOString(),
    visitorMessages: 0,
    counted: false,
    reservationState: "none",
  });
  await store.aiDrafts.create({
    token: "d",
    sessionId: "s",
    payload: { name: "Alex" },
    expiresAt: new Date(+now + 60000).toISOString(),
  });
  const key = "7dc62e56-ccf5-4b1f-a0df-5439723df052";
  expect(await store.aiDrafts.claim("d", "wrong", key, now)).toBeNull();
  expect(await store.aiDrafts.claim("d", "s", key, now)).toEqual({ name: "Alex" });
  expect(
    await store.aiDrafts.claim("d", "s", "00000000-0000-4000-8000-000000000000", now),
  ).toBeNull();
  expect(await store.aiDrafts.claim("d", "s", key, now)).toEqual({ name: "Alex" });
  expect(await store.aiDrafts.claim("d", "s", key, new Date(+now + 60000))).toBeNull();
  await db.close();
});
