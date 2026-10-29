import { parsedClientConfig } from "@/config/client.config";
import { getStore } from "@/lib/store";

function positiveNumber(value: string | undefined, fallback: number): number {
  if (!value) return fallback;
  const result = Number(value);
  return Number.isFinite(result) && result > 0 ? result : fallback;
}

export function getAIConfig() {
  return {
    ...parsedClientConfig.ai,
    model: process.env.AI_MODEL || parsedClientConfig.ai.model,
    maxPrice: {
      prompt: positiveNumber(process.env.AI_MAX_PROMPT_PRICE, 0.5),
      completion: positiveNumber(process.env.AI_MAX_COMPLETION_PRICE, 2),
    },
    timeoutMs: 20000,
    temperature: 0.2,
    simulated: parsedClientConfig.mode === "demo" && process.env.DEMO_AI_LIVE !== "true",
  };
}

export function monthKey(date = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: parsedClientConfig.business.timezone,
    year: "numeric",
    month: "2-digit",
  }).formatToParts(date);
  return `${parts.find((part) => part.type === "year")!.value}-${parts.find((part) => part.type === "month")!.value}`;
}

export async function getAIStatus(): Promise<{
  available: boolean;
  reason?: "disabled" | "missing_key" | "quota_exhausted" | "demo_simulated";
}> {
  const config = getAIConfig();
  if (!config.enabled) return { available: false, reason: "disabled" };
  if (!config.simulated && !process.env.OPENROUTER_API_KEY)
    return { available: false, reason: "missing_key" };
  const store = getStore();
  const usage = await store.aiUsage.getMonth(monthKey());
  if (
    (usage?.costUsd ?? 0) >= config.monthlyCostCapUsd ||
    (usage?.used ?? 0) + (usage?.reserved ?? 0) >= config.monthlyConversationAllowance
  )
    return { available: false, reason: "quota_exhausted" };
  return config.simulated ? { available: true, reason: "demo_simulated" } : { available: true };
}
