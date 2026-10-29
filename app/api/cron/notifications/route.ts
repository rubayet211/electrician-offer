import { authorizedCron } from "@/lib/security/cron";
import { retryPendingNotifications } from "@/lib/notifications/email";
export async function GET(req: Request) {
  if (!authorizedCron(req)) return new Response(null, { status: 401 });
  try {
    return Response.json({ ok: true, attempted: await retryPendingNotifications(100) });
  } catch {
    return Response.json({ ok: false }, { status: 503 });
  }
}
export const POST = GET;
