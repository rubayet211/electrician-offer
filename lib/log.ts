export function logEvent(event: string, reference?: string, error?: unknown): void {
  console.error(
    JSON.stringify({
      event,
      ...(reference ? { reference } : {}),
      ...(error ? { errorClass: error instanceof Error ? error.name : "UnknownError" } : {}),
    }),
  );
}
