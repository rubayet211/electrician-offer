import { NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/security/admin-session";
import { isAllowedOrigin } from "@/lib/security/origin";
export async function POST(req: Request) {
  if (!isAllowedOrigin(req)) return new Response(null, { status: 403 });
  const failure = assertAdminApi(req);
  if (failure) return failure;
  const response = NextResponse.redirect(new URL("/admin/login", req.url), 303);
  response.cookies.set("admin_session", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 0,
  });
  return response;
}
