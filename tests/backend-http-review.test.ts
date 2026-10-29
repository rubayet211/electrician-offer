import { expect, it } from "vitest";
import { POST as analytics } from "@/app/api/analytics/event/route";
import { POST as leads } from "@/app/api/leads/route";
import { validateUploads } from "@/lib/uploads/validate";
import { inquirySchema } from "@/lib/inquiries/schema";
function streamRequest(url: string, size: number, headers: Record<string, string> = {}) {
  let count = 0;
  const body = new ReadableStream<Uint8Array>({
    pull(controller) {
      if (count++ < size) controller.enqueue(new Uint8Array(1024));
      else controller.close();
    },
  });
  return new Request(url, {
    method: "POST",
    headers: { origin: "http://localhost", "content-type": "application/json", ...headers },
    body,
    duplex: "half",
  } as RequestInit);
}
it.each<Record<string, string>>([{}, { "content-length": "1" }])(
  "cuts off oversized chunked analytics bodies %s",
  async (headers) => {
    expect(
      (await analytics(streamRequest("http://localhost/api/analytics/event", 6, headers))).status,
    ).toBe(413);
  },
);
it("returns 400 for malformed analytics JSON", async () => {
  expect(
    (
      await analytics(
        new Request("http://localhost", {
          method: "POST",
          headers: { origin: "http://localhost" },
          body: "{",
        }),
      )
    ).status,
  ).toBe(400);
});
it("limits lead requests before reading their bodies", async () => {
  const headers = { "x-real-ip": "198.51.100.77" };
  for (let i = 0; i < 20; i++) await leads(streamRequest("http://localhost/api/leads", 0, headers));
  const response = await leads(streamRequest("http://localhost/api/leads", 0, headers));
  expect(response.status).toBe(429);
  expect(response.headers.get("retry-after")).toBeTruthy();
});
it("sanitizes attachment names", async () => {
  const upload = await validateUploads([
    new File([new Uint8Array([255, 216, 255])], "../evil name.jpg"),
  ]);
  expect(upload.files[0].name).toMatch(/^[A-Za-z0-9._-]{1,80}$/);
});
it("restricts source pages and utm values", () => {
  const raw = {
    name: "Alex",
    phone: "5550100142",
    zip: "12345",
    serviceSlug: "panel-upgrades",
    description: "Planning an upgrade",
    urgency: "routine",
    consent: true,
    idempotencyKey: "7dc62e56-ccf5-4b1f-a0df-5439723df052",
    details: { formType: "panel", reason: "adding_load", propertyType: "single_family" },
  };
  expect(inquirySchema.safeParse({ ...raw, sourcePage: "https://evil.test/" }).success).toBe(false);
  expect(inquirySchema.safeParse({ ...raw, utm: { "BAD-KEY": "x" } }).success).toBe(false);
  expect(inquirySchema.safeParse({ ...raw, utm: { source: "x".repeat(121) } }).success).toBe(false);
});

it.each<Record<string, string>>([{}, { "content-length": "1" }])(
  "cuts off oversized chunked lead bodies %s",
  async (headers) => {
    const response = await leads(
      streamRequest("http://localhost/api/leads", 15361, {
        ...headers,
        "x-real-ip": "198.51.100.90",
      }),
    );
    expect(response.status).toBe(413);
  },
);
it("accepts case-insensitive JSON content types", async () => {
  const response = await leads(
    new Request("http://localhost/api/leads", {
      method: "POST",
      headers: {
        origin: "http://localhost",
        "x-real-ip": "198.51.100.91",
        "content-type": "Application/JSON",
      },
      body: "{}",
    }),
  );
  expect(response.status).toBe(400);
  expect(await response.json()).toHaveProperty("fieldErrors");
});
