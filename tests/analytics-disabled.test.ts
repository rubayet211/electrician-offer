import { afterEach, expect, it, vi } from "vitest";
import { parsedClientConfig } from "@/config/client.config";
import { POST } from "@/app/api/analytics/event/route";
import { trackEvent } from "@/components/site/analytics";
const original = parsedClientConfig.analytics.enabled;
afterEach(() => {
  parsedClientConfig.analytics.enabled = original;
  vi.unstubAllGlobals();
});
it("does not send or record analytics when disabled", async () => {
  parsedClientConfig.analytics.enabled = false;
  const fetchMock = vi.fn();
  vi.stubGlobal("fetch", fetchMock);
  vi.stubGlobal("window", { location: { pathname: "/" } });
  trackEvent("phone_click");
  expect(fetchMock).not.toHaveBeenCalled();
  expect(
    (await POST(new Request("http://localhost/api/analytics/event", { method: "POST" }))).status,
  ).toBe(204);
});
