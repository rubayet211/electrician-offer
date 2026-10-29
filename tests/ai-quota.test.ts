import { expect, it } from "vitest";
import { MemoryStore } from "@/lib/store/memory-store";
import {
  reserveConversation,
  settleConversation,
  sessionFromCookie,
  signSession,
} from "@/lib/ai/quota";

it("reserves only the allowance under concurrent new conversations", async () => {
  const store = new MemoryStore();
  const now = new Date();
  for (let i = 0; i < 30; i++)
    await store.aiSessions.create({
      id: String(i),
      visitorHash: String(i),
      month: "2026-10",
      startedAt: now.toISOString(),
      lastActivityAt: now.toISOString(),
      visitorMessages: 1,
      counted: false,
      reservationState: "none",
    });
  const results = await Promise.all(
    Array.from({ length: 30 }, (_, i) => reserveConversation(store, String(i), 10, now)),
  );
  expect(results.filter(Boolean)).toHaveLength(10);
  await settleConversation(store, "0", false);
  expect((await store.aiUsage.getMonth("2026-10"))?.reserved).toBe(9);
});

it("rejects forged session cookies", () => {
  const signed = signSession("test-session");
  expect(sessionFromCookie(signed)).toBe("test-session");
  expect(sessionFromCookie(signed + "forged")).toBeNull();
  expect(sessionFromCookie(undefined)).toBeNull();
});

it("atomically limits new sessions per visitor", async () => {
  const store = new MemoryStore();
  const now = new Date();
  const sessions = Array.from({ length: 10 }, (_, i) => ({
    id: String(i),
    visitorHash: "visitor",
    month: "2026-10",
    startedAt: now.toISOString(),
    lastActivityAt: now.toISOString(),
    visitorMessages: 0,
    counted: false,
    reservationState: "none" as const,
  }));
  const results = await Promise.all(
    sessions.map((session) =>
      store.aiSessions.createLimited(session, new Date(+now - 86400000), 4),
    ),
  );
  expect(results.filter(Boolean)).toHaveLength(4);
});

it("allows only the original confirmation key to replay a claimed draft", async () => {
  const store = new MemoryStore();
  const now = new Date();
  await store.aiSessions.create({
    id: "session",
    visitorHash: "visitor",
    month: "2026-10",
    startedAt: now.toISOString(),
    lastActivityAt: now.toISOString(),
    visitorMessages: 0,
    counted: false,
    reservationState: "none",
  });
  await store.aiDrafts.create({
    token: "token",
    sessionId: "session",
    payload: { name: "Alex" },
    expiresAt: new Date(+now + 60000).toISOString(),
  });
  expect(await store.aiDrafts.claim("token", "other", "key", now)).toBeNull();
  expect(await store.aiDrafts.claim("token", "session", "key", now)).toEqual({ name: "Alex" });
  expect(await store.aiDrafts.claim("token", "session", "different", now)).toBeNull();
  expect(await store.aiDrafts.claim("token", "session", "key", now)).toEqual({ name: "Alex" });
});

it("does not share an in-flight reservation between model calls", async () => {
  const store = new MemoryStore();
  const now = new Date().toISOString();
  await store.aiSessions.create({
    id: "one",
    visitorHash: "visitor",
    month: "2026-10",
    startedAt: now,
    lastActivityAt: now,
    visitorMessages: 0,
    counted: false,
    reservationState: "none",
  });
  const results = await Promise.all([
    store.aiSessions.reserve("one", 10),
    store.aiSessions.reserve("one", 10),
  ]);
  expect(results).toEqual([true, false]);
});

it("rolls inactive sessions into a new conversation", async () => {
  const { openSession } = await import("@/lib/ai/quota");
  const store = new MemoryStore();
  const now = new Date("2026-10-29T12:00:00Z");
  const first = await openSession(store, undefined, "visitor", now);
  expect(first).not.toBeNull();
  const cookie = signSession(first!.id);
  const same = await openSession(store, cookie, "visitor", new Date(+now + 29 * 60000));
  expect(same?.id).toBe(first!.id);
  const later = await openSession(store, cookie, "visitor", new Date(+now + 61 * 60000));
  expect(later?.id).not.toBe(first!.id);
});

it("assigns a hazard-only session's first reservation to the current business month", async () => {
  const store = new MemoryStore();
  const old = new Date("2026-10-31T23:30:00Z");
  const next = new Date("2026-11-01T12:00:00Z");
  await store.aiSessions.create({
    id: "boundary",
    visitorHash: "visitor",
    month: "2026-10",
    startedAt: old.toISOString(),
    lastActivityAt: old.toISOString(),
    visitorMessages: 1,
    counted: false,
    reservationState: "none",
  });
  expect(await reserveConversation(store, "boundary", 10, next)).toBe(true);
  expect((await store.aiSessions.get("boundary"))?.month).toBe("2026-11");
  expect((await store.aiUsage.getMonth("2026-11"))?.reserved).toBe(1);
});
