import { NextResponse } from "next/server";
import {
  adminEnabled,
  adminPasswordHash,
  signAdminSession,
  verifyAdminPassword,
} from "@/lib/security/admin-session";
import { isAllowedOrigin } from "@/lib/security/origin";
import { clientIp } from "@/lib/security/client-ip";
import { hashIp } from "@/lib/security/hash";
import { getStore } from "@/lib/store";
import { readBody } from "@/lib/http/read-body";
export async function POST(req: Request) {
  if (!isAllowedOrigin(req)) return Response.json({ error: "Forbidden" }, { status: 403 });
  if (!adminEnabled()) return Response.json({ error: "Admin disabled" }, { status: 503 });
  try {
    const key = `admin-login:${hashIp(clientIp(req))}`;
    const limiter = getStore().rateLimit;
    if ((await limiter.count(key, 900000)) >= 5)
      return Response.json({ error: "Too many attempts" }, { status: 429 });
    const bytes = await readBody(req, 4096);
    if (!bytes) return Response.json({ error: "Request too large" }, { status: 413 });
    const password = new URLSearchParams(new TextDecoder().decode(bytes)).get("password");
    if (
      typeof password !== "string" ||
      !(await verifyAdminPassword(password, adminPasswordHash()!))
    ) {
      await limiter.hit(key, 5, 900000);
      return Response.json({ error: "Invalid credentials" }, { status: 401 });
    }
    const response = NextResponse.redirect(new URL("/admin", req.url), 303);
    response.cookies.set("admin_session", signAdminSession(process.env.ADMIN_SESSION_SECRET!), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 28800,
    });
    return response;
  } catch {
    return Response.json({ error: "Unavailable" }, { status: 503 });
  }
}
