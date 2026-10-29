import { createHmac, timingSafeEqual } from "node:crypto";
import type { Store } from "@/lib/store/types";

function secret(): string {
  const value = process.env.AI_SESSION_SECRET;
  if (value) return value;
  if (
    process.env.NODE_ENV === "test" ||
    (process.env.NODE_ENV === "development" && parsedClientConfig.mode === "demo")
  )
    return "local-ai-session-secret";
  throw new Error("AI_SESSION_SECRET is required");
}

export function signSession(id: string, now = Date.now()): string {
  const payload = `${id}.${now}`;
  return `${payload}.${createHmac("sha256", secret()).update(payload).digest("base64url")}`;
}

export function sessionFromCookie(value: string | undefined, now = Date.now()): string | null {
  if (!value) return null;
  const parts = value.split(".");
  if (parts.length !== 3 || !/^[a-zA-Z0-9-]{1,80}$/.test(parts[0]) || !/^\d+$/.test(parts[1]))
    return null;
  const issuedAt = Number(parts[1]);
  if (!Number.isSafeInteger(issuedAt) || issuedAt > now || now - issuedAt >= 86400000) return null;
  const expected = Buffer.from(signSession(parts[0], issuedAt));
  const actual = Buffer.from(value);
  return expected.length === actual.length && timingSafeEqual(expected, actual) ? parts[0] : null;
}

export async function reserveConversation(
  store: Store,
  id: string,
  allowance: number,
  now = new Date(),
): Promise<boolean> {
  return store.aiSessions.reserve(id, allowance, undefined, undefined, now, monthKey(now));
}

export function settleConversation(store: Store, id: string, success: boolean): Promise<boolean> {
  return store.aiSessions.settle(id, success);
}
import { randomUUID } from "node:crypto";
import { parsedClientConfig } from "@/config/client.config";
import { getAIConfig, monthKey } from "./config";

function dayStart(now: Date): Date {
  const zone = parsedClientConfig.business.timezone;
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: zone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  });
  const parts = Object.fromEntries(
    formatter.formatToParts(now).map((part) => [part.type, Number(part.value)]),
  );
  const localMidnight = Date.UTC(parts.year, parts.month - 1, parts.day);
  let result = localMidnight;
  for (let i = 0; i < 3; i++) {
    const at = Object.fromEntries(
      formatter.formatToParts(new Date(result)).map((part) => [part.type, Number(part.value)]),
    );
    const represented = Date.UTC(at.year, at.month - 1, at.day, at.hour, at.minute, at.second);
    result += localMidnight - represented;
  }
  return new Date(result);
}

export async function openSession(
  store: Store,
  cookie: string | undefined,
  visitorHash: string,
  now = new Date(),
) {
  const config = getAIConfig();
  const id = sessionFromCookie(cookie, +now);
  const existing = id ? await store.aiSessions.get(id) : null;
  if (
    existing &&
    +now - +new Date(existing.lastActivityAt) <= config.sessionInactivityMinutes * 60000
  ) {
    await store.aiSessions.touch(existing.id, now);
    return existing;
  }
  const session = {
    id: randomUUID(),
    visitorHash,
    month: monthKey(now),
    startedAt: now.toISOString(),
    lastActivityAt: now.toISOString(),
    visitorMessages: 0,
    counted: false,
    reservationState: "none" as const,
  };
  return (await store.aiSessions.createLimited(
    session,
    dayStart(now),
    config.newConversationsPerVisitorPerDay,
  ))
    ? session
    : null;
}
