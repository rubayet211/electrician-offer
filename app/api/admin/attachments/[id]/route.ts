import { assertAdminApi } from "@/lib/security/admin-session";
import { getStore } from "@/lib/store";
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const failure = assertAdminApi(req);
  if (failure) return failure;
  const attachment = await getStore().attachments.get((await params).id);
  if (!attachment) return new Response(null, { status: 404 });
  return new Response(Buffer.from(attachment.data), {
    headers: {
      "Content-Type": attachment.contentType,
      "Content-Disposition": "inline",
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "private, no-store",
    },
  });
}
