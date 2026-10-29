import { describe, expect, it, vi } from "vitest";
import { submitInquiry } from "@/lib/inquiries/service";
import { MemoryStore } from "@/lib/store/memory-store";
const raw = {
  name: "Alex",
  phone: "5550100142",
  zip: "12345",
  serviceSlug: "panel-upgrades",
  description: "Planning an upgrade",
  urgency: "routine",
  consent: true,
  idempotencyKey: "7dc62e56-ccf5-4b1f-a0df-5439723df052",
  formStartedAt: Date.now() - 5000,
  details: { formType: "panel", reason: "adding_load", propertyType: "single_family" },
};
describe("submission", () => {
  it("replays, deduplicates, and accepts a fresh request after the window", async () => {
    const store = new MemoryStore();
    const now = new Date();
    const ctx = { ipHash: "hash", source: "contact_form" as const, store, now };
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const first = await submitInquiry(raw, ctx);
    const replay = await submitInquiry(raw, ctx);
    const duplicate = await submitInquiry(
      { ...raw, idempotencyKey: "2fe705c5-8cf6-4f08-8e0b-71ad73c166de" },
      ctx,
    );
    const later = await submitInquiry(
      {
        ...raw,
        formStartedAt: +now + 15 * 60000,
        idempotencyKey: "6821288e-a4ba-405c-9c01-83f38732acb9",
      },
      { ...ctx, now: new Date(+now + 16 * 60000) },
    );
    expect(first.reference).toBeTruthy();
    expect(replay.reference).toBe(first.reference);
    expect(duplicate.reference).toBe(first.reference);
    expect(duplicate.duplicate).toBe(true);
    expect(later.status).toBe(201);
    expect(later.reference).not.toBe(first.reference);
    expect(first.notification).toBe("demo");
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(
      (await store.leads.get((await store.leads.findByIdempotencyKey(raw.idempotencyKey))!.id))
        ?.notificationStatus,
    ).toBe("skipped_demo");
    fetchSpy.mockRestore();
  });
  it("blocks the sixth request", async () => {
    const store = new MemoryStore();
    const ctx = { ipHash: "another", source: "contact_form" as const, store };
    for (let i = 0; i < 5; i++) expect((await submitInquiry(raw, ctx)).ok).toBe(true);
    expect((await submitInquiry(raw, ctx)).status).toBe(429);
  });
  it("keeps the lead when a photo fails validation", async () => {
    const store = new MemoryStore();
    const result = await submitInquiry(raw, {
      ipHash: "hash",
      source: "contact_form",
      store,
      files: [new File(["text"], "bad.jpg", { type: "image/jpeg" })],
    });
    expect(result.status).toBe(201);
    expect(result.warnings).toHaveLength(1);
    expect(await store.leads.findByIdempotencyKey(raw.idempotencyKey)).not.toBeNull();
  });
  it("rejects honeypot and too-fast forms", async () => {
    const store = new MemoryStore();
    const ctx = { ipHash: "hash", source: "contact_form" as const, store };
    expect((await submitInquiry({ ...raw, company_website: "bot" }, ctx)).status).toBe(400);
    expect((await submitInquiry({ ...raw, formStartedAt: Date.now() }, ctx)).status).toBe(400);
  });
  it("returns the saved reference when notification bookkeeping throws", async () => {
    const store = new MemoryStore();
    vi.spyOn(store.leads, "setNotification").mockRejectedValue(new Error("failure"));
    const result = await submitInquiry(raw, { ipHash: "hash", source: "contact_form", store });
    expect(result.status).toBe(201);
    expect(result.reference).toBeTruthy();
  });
  it("saves the lead when attachment persistence fails", async () => {
    const store = new MemoryStore();
    const create = store.leads.create.bind(store.leads);
    vi.spyOn(store.leads, "create").mockImplementation((lead, attachments) =>
      attachments.length ? Promise.reject(new Error("failure")) : create(lead, attachments),
    );
    const result = await submitInquiry(raw, {
      ipHash: "hash",
      source: "contact_form",
      store,
      files: [new File([new Uint8Array([255, 216, 255])], "photo.jpg")],
    });
    expect(result.status).toBe(201);
    expect(result.warnings).toContain("Photos could not be attached");
    expect((await store.leads.findByIdempotencyKey(raw.idempotencyKey))?.photoCount).toBe(0);
  });
  it("saves a lead if reading an uploaded file throws and warns on photo replay", async () => {
    const store = new MemoryStore();
    const file = new File([new Uint8Array([255, 216, 255])], "photo.jpg");
    vi.spyOn(file, "arrayBuffer").mockRejectedValue(new Error("read failed"));
    const ctx = { ipHash: "hash", source: "contact_form" as const, store, files: [file] };
    const first = await submitInquiry(raw, ctx);
    expect(first.status).toBe(201);
    expect(first.warnings).toContain("Photos could not be attached");
    const replay = await submitInquiry(raw, ctx);
    expect(replay.warnings).toContain("Photos could not be attached");
  });
});
