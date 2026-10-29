import { expect, it, vi } from "vitest";
vi.mock("next/headers", () => ({ cookies: async () => ({ get: () => undefined }) }));
vi.mock("next/navigation", () => ({
  redirect: (path: string) => {
    throw new Error(`redirect:${path}`);
  },
}));
import { requireAdmin } from "@/lib/security/admin-session";
it("redirects admin pages without a valid session", async () => {
  await expect(requireAdmin()).rejects.toThrow("redirect:/admin/login");
});
