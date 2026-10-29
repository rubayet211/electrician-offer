export function databaseSsl(url, ca) {
  const host = new URL(url).hostname;
  if (["localhost", "127.0.0.1", "[::1]", "::1"].includes(host)) return false;
  return { rejectUnauthorized: true, ...(ca ? { ca } : {}) };
}
