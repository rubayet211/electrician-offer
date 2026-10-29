export function assistantErrorMessage(error: Error): string {
  let reason = "";
  try {
    reason = JSON.parse(error.message).reason ?? "";
  } catch {
    /* transport can report a plain message */
  }
  return (
    (
      {
        message_limit:
          "This conversation has reached its message limit. Please call or request an estimate.",
        rate_limited: "Too many requests. Please wait a moment and try again.",
        in_flight: "A reply is already in progress. Please wait.",
        quota_exhausted:
          "The assistant is temporarily unavailable. Please call or request an estimate.",
      } as Record<string, string>
    )[reason] ?? "Assistant unavailable. Please call or request an estimate."
  );
}
