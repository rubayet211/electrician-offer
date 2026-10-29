export function adminPasswordHash(
  env: Record<string, string | undefined> = process.env,
): string | undefined {
  if (env.ADMIN_PASSWORD_HASH_B64) {
    const value = env.ADMIN_PASSWORD_HASH_B64;
    if (!/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(value))
      return undefined;
    const decoded = Buffer.from(value, "base64").toString("utf8");
    return decoded || undefined;
  }
  return env.ADMIN_PASSWORD_HASH;
}
