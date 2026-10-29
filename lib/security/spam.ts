export function isSpam(
  honeypot: string | undefined,
  startedAt: number | undefined,
  now = Date.now(),
): boolean {
  return !!honeypot?.trim() || !startedAt || now - startedAt < 3000 || now - startedAt > 86400000;
}
