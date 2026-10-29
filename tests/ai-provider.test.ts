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

it("sends privacy routing and price limits on the outgoing request", async () => {
  const { vi } = await import("vitest");
  const { generateText } = await import("ai");
  const { createAIModel } = await import("@/lib/ai/provider");
  let body: Record<string, unknown> = {};
  vi.stubEnv("OPENROUTER_API_KEY", "test");
  vi.stubGlobal("fetch", async (_url: unknown, options: RequestInit) => {
    body = JSON.parse(String(options.body));
    return Response.json({
      id: "test",
      model: "test",
      object: "chat.completion",
      choices: [
        { index: 0, message: { role: "assistant", content: "Hello" }, finish_reason: "stop" },
      ],
      usage: { prompt_tokens: 1, completion_tokens: 1, total_tokens: 2 },
    });
  });
  try {
    await generateText({ model: createAIModel(), prompt: "hello" });
    expect(body.provider).toMatchObject({
      zdr: true,
      data_collection: "deny",
      max_price: { prompt: 0.5, completion: 2 },
    });
    expect(body).not.toHaveProperty("models");
    expect(body.provider).not.toHaveProperty("allow_fallbacks");
  } finally {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  }
});
