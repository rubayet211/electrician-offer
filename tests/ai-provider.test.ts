import { expect, it } from "vitest";
import { openRouterSettings } from "@/lib/ai/provider";

it("requires private routing and usage accounting without model fallbacks", () => {
  expect(openRouterSettings({ prompt: 0.5, completion: 2 })).toEqual({
    provider: {
      zdr: true,
      data_collection: "deny",
      require_parameters: true,
      max_price: { prompt: 0.5, completion: 2 },
    },
    usage: { include: true },
  });
});
