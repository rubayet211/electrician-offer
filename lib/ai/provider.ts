import { createOpenRouter, type OpenRouterChatSettings } from "@openrouter/ai-sdk-provider";
import { getAIConfig } from "./config";

export function openRouterSettings(maxPrice: {
  prompt: number;
  completion: number;
}): OpenRouterChatSettings {
  return {
    provider: { zdr: true, data_collection: "deny", require_parameters: true, max_price: maxPrice },
    usage: { include: true },
  };
}

export function createAIModel() {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) throw new Error("Missing OpenRouter API key");
  const config = getAIConfig();
  return createOpenRouter({ apiKey: key }).chat(config.model, openRouterSettings(config.maxPrice));
}
