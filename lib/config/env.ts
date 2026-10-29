import { z } from "zod";
import { adminPasswordHash } from "@/lib/security/admin-password";
import { parsedClientConfig } from "@/config/client.config";
import type { ClientConfig } from "@/types/client-config";
const envSchema = z.object({
  DATABASE_URL: z.string().optional(),
  DATABASE_CA_CERT: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),
  IP_HASH_SECRET: z.string().optional(),
  ADMIN_PASSWORD_HASH: z.string().optional(),
  ADMIN_PASSWORD_HASH_B64: z.string().optional(),
  ADMIN_SESSION_SECRET: z.string().optional(),
  AI_SESSION_SECRET: z.string().optional(),
  OPENROUTER_API_KEY: z.string().optional(),
  CRON_SECRET: z.string().optional(),
  DEMO_AI_LIVE: z.enum(["true", "false"]).optional(),
  NEXT_PUBLIC_SITE_ENV: z.enum(["demo", "staging", "production"]).optional(),
});
export function allowsDemoMemory(
  config: unknown,
  env: Record<string, string | undefined>,
): boolean {
  return (config as Partial<ClientConfig>).mode === "demo" && env.DEMO_AI_LIVE !== "true";
}
export function assertProductionReady(
  config: unknown = parsedClientConfig,
  env: Record<string, string | undefined> = process.env,
): string[] {
  const problems: string[] = [];
  if (JSON.stringify(config).includes("__REQUIRED__"))
    problems.push("Client config contains required placeholders");
  for (const key of ["IP_HASH_SECRET", "ADMIN_SESSION_SECRET", "AI_SESSION_SECRET", "CRON_SECRET"])
    if (!env[key]) problems.push(`${key} is required`);
  if (!adminPasswordHash(env)) problems.push("ADMIN_PASSWORD_HASH is required");
  if (!env.DATABASE_URL && !allowsDemoMemory(config, env))
    problems.push("DATABASE_URL is required");
  const client = config as Partial<ClientConfig>;
  if (client.mode !== "demo" && !env.RESEND_API_KEY) problems.push("RESEND_API_KEY is required");
  if (env.NEXT_PUBLIC_SITE_ENV === "production") {
    if (client.mode !== "production") problems.push("Client config mode must be production");
    if (
      !client.business?.domain ||
      !/^(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/i.test(
        client.business.domain,
      )
    )
      problems.push("Business domain must be a hostname");
    if (
      !client.notifications?.recipients?.length ||
      client.notifications.recipients.some(
        (address) =>
          !z.email().safeParse(address).success ||
          /@(?:[^@]*\.)?(?:example\.com|test|invalid)$/i.test(address),
      )
    )
      problems.push("Production notification recipients must be valid non-example addresses");
  }
  const ai = (config as Partial<ClientConfig>).ai;
  if (
    ai?.enabled &&
    ((config as Partial<ClientConfig>).mode !== "demo" || env.DEMO_AI_LIVE === "true") &&
    !env.OPENROUTER_API_KEY
  )
    problems.push("OPENROUTER_API_KEY is required");
  return problems;
}
export function getServerEnv() {
  const env = envSchema.parse(process.env);
  if (process.env.NODE_ENV === "production") {
    const problems = assertProductionReady(parsedClientConfig, env).filter(
      (problem) =>
        problem !== "ADMIN_PASSWORD_HASH is required" &&
        problem !== "ADMIN_SESSION_SECRET is required",
    );
    if (problems.length) throw new Error(problems.join("; "));
  }
  return env;
}
