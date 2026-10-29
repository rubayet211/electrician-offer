import { beforeEach, expect, it, vi } from "vitest";
import { MemoryStore } from "@/lib/store/memory-store";
import { signSession } from "@/lib/ai/quota";
import { prepareEstimateRequest } from "@/lib/ai/tools";
let store = new MemoryStore();
vi.mock("@/lib/store", () => ({ getStore: () => store }));
import { POST } from "@/app/api/ai-chat/confirm/route";
const key = "7dc62e56-ccf5-4b1f-a0df-5439723df052";
function request(body: unknown, sid = "session") {
  return new Request("http://localhost/api/ai-chat/confirm", {
    method: "POST",
    headers: {
      origin: "http://localhost",
      cookie: `ai_sid=${signSession(sid)}`,
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
  });
}
beforeEach(async () => {
  store = new MemoryStore();
  const now = new Date("2026-10-29T12:00:00Z").toISOString();
  await store.aiSessions.create({
    id: "session",
    visitorHash: "hash",
    month: "2026-10",
    startedAt: now,
    lastActivityAt: now,
    visitorMessages: 0,
    counted: false,
    reservationState: "none",
  });
});
it("requires consent, enforces session binding and replays the same reference", async () => {
  const draft = await prepareEstimateRequest(
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
  );
  if (draft.status !== "awaiting_visitor_confirmation") throw Error("invalid draft");
  const body = { draftToken: draft.draftToken, consent: true, idempotencyKey: key };
  expect((await POST(request({ ...body, consent: false }))).status).toBe(400);
  expect((await POST(request(body, "other"))).status).toBe(404);
  const first = await (await POST(request(body))).json();
  const second = await (await POST(request(body))).json();
  expect(first.reference).toBeTruthy();
  expect(second.reference).toBe(first.reference);
  expect(await store.leads.list()).toHaveLength(1);
  expect((await store.leads.list())[0].source).toBe("ai_chat");
});

it("reports no notification on failed confirmation", async () => {
  const response = await POST(request({ consent: false }));
  expect(response.status).toBe(400);
  expect(await response.json()).toMatchObject({ notification: "none" });
});

it("revokes an edited draft and adds an optional confirmation note to the lead", async () => {
  const fields = {
    name: "Alex Smith",
    phone: "5550100142",
    zip: "12345",
    serviceSlug: "panel-upgrades",
    description: "Planning an upgrade",
    urgency: "routine",
  };
  const first = await prepareEstimateRequest(fields, "session", store);
  if (first.status !== "awaiting_visitor_confirmation") throw Error("invalid draft");
  expect((await POST(request({ action: "revoke", draftToken: first.draftToken }))).status).toBe(
    200,
  );
  expect(
    (await POST(request({ draftToken: first.draftToken, consent: true, idempotencyKey: key })))
      .status,
  ).toBe(404);
  const second = await prepareEstimateRequest(fields, "session", store);
  if (second.status !== "awaiting_visitor_confirmation") throw Error("invalid draft");
  expect(
    (
      await POST(
        request({
          draftToken: second.draftToken,
          consent: true,
          idempotencyKey: key,
          note: "Please call after work",
        }),
      )
    ).status,
  ).toBe(201);
  expect((await store.leads.list())[0].description).toContain("Please call after work");
});

it("replays a confirmed lead after its draft expires", async () => {
  const fields = {
    name: "Alex Smith",
    phone: "5550100142",
    zip: "12345",
    serviceSlug: "panel-upgrades",
    description: "Planning an upgrade",
    urgency: "routine",
  };
  const draft = await prepareEstimateRequest(fields, "session", store);
  if (draft.status !== "awaiting_visitor_confirmation") throw Error("invalid draft");
  const body = { draftToken: draft.draftToken, consent: true, idempotencyKey: key };
  const first = await (await POST(request(body))).json();
  vi.useFakeTimers();
  vi.setSystemTime(Date.now() + 16 * 60000);
  try {
    await store.aiDrafts.purgeExpired(new Date());
    const replay = await POST(request(body));
    expect(replay.status).toBe(200);
    expect((await replay.json()).reference).toBe(first.reference);
  } finally {
    vi.useRealTimers();
  }
});
