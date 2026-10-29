import { authorizedCron } from "@/lib/security/cron";
import { getStore } from "@/lib/store";
import { parsedClientConfig } from "@/config/client.config";
export async function GET(req: Request) {
  if (!authorizedCron(req)) return new Response(null, { status: 401 });
  try {
    const store = getStore(),
      now = new Date();
    const attachments = await store.attachments.purgeOlderThan(
      new Date(+now - parsedClientConfig.uploads.retentionDays * 86400000),
    );
    const drafts = await store.aiDrafts.purgeExpired(now);
    const released = await store.aiUsage.releaseStale(new Date(+now - 600000));
    const sessions = await store.aiSessions.purgeOlderThan(new Date(+now - 86400000));
    return Response.json({ ok: true, attachments, drafts, released, sessions });
  } catch {
    return Response.json({ ok: false }, { status: 503 });
  }
}
export const POST = GET;
