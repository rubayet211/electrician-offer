import { createHash, createHmac, scrypt, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { adminPasswordHash } from "@/lib/security/admin-password";

const lifetime = 8 * 60 * 60 * 1000;
export { adminPasswordHash } from "@/lib/security/admin-password";
export function adminEnabled() {
  return !!adminPasswordHash() && !!process.env.ADMIN_SESSION_SECRET;
}
export async function verifyAdminPassword(password: string, encoded: string): Promise<boolean> {
  const [algorithm, n, r, p, saltText, hashText, extra] = encoded.split("$");
  if (algorithm !== "scrypt" || extra !== undefined || !saltText || !hashText) return false;
  const N = Number(n),
    R = Number(r),
    P = Number(p);
  if (
    !Number.isSafeInteger(N) ||
    N < 2 ||
    N > 1048576 ||
    (N & (N - 1)) !== 0 ||
    !Number.isSafeInteger(R) ||
    R < 1 ||
    R > 32 ||
    !Number.isSafeInteger(P) ||
    P < 1 ||
    P > 16
  )
    return false;
  const salt = Buffer.from(saltText, "base64");
  const hash = Buffer.from(hashText, "base64");
  if (salt.length < 16 || hash.length < 32 || hash.length > 128 || password.length > 1024)
    return false;
  try {
    const actual = await new Promise<Buffer>((resolve, reject) =>
      scrypt(
        password,
        salt,
        hash.length,
        { N, r: R, p: P, maxmem: 256 * 1024 * 1024 },
        (error, result) => (error ? reject(error) : resolve(result)),
      ),
    );
    return timingSafeEqual(actual, hash);
  } catch {
    return false;
  }
}
export function signAdminSession(secret: string, now = Date.now()): string {
  const expiry = String(now + lifetime);
  const fingerprint = createHash("sha256")
    .update(adminPasswordHash() ?? "")
    .digest("base64url");
  const payload = `${expiry}.${fingerprint}`;
  return `${payload}.${createHmac("sha256", secret).update(payload).digest("base64url")}`;
}
export function verifyAdminSession(
  token: string | undefined,
  secret: string | undefined,
  now = Date.now(),
): boolean {
  if (!token || !secret) return false;
  const [expiry, fingerprint, signature, extra] = token.split(".");
  if (!expiry || !fingerprint || !signature || extra !== undefined || !/^\d+$/.test(expiry))
    return false;
  if (
    fingerprint !==
    createHash("sha256")
      .update(adminPasswordHash() ?? "")
      .digest("base64url")
  )
    return false;
  const expiration = Number(expiry);
  if (!Number.isSafeInteger(expiration) || expiration <= now || expiration > now + lifetime)
    return false;
  const expected = Buffer.from(
    createHmac("sha256", secret).update(`${expiry}.${fingerprint}`).digest("base64url"),
  );
  const supplied = Buffer.from(signature);
  return supplied.length === expected.length && timingSafeEqual(supplied, expected);
}
export async function requireAdmin() {
  if (
    !adminEnabled() ||
    !verifyAdminSession(
      (await cookies()).get("admin_session")?.value,
      process.env.ADMIN_SESSION_SECRET,
    )
  )
    redirect("/admin/login");
}
export function assertAdminApi(req: Request): Response | null {
  if (!adminEnabled()) return Response.json({ error: "Admin disabled" }, { status: 503 });
  const token = req.headers
    .get("cookie")
    ?.split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith("admin_session="))
    ?.slice("admin_session=".length);
  return verifyAdminSession(token, process.env.ADMIN_SESSION_SECRET)
    ? null
    : Response.json({ error: "Unauthorized" }, { status: 401 });
}
