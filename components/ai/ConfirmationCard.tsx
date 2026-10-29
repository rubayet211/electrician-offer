"use client";

import { useState } from "react";

type Draft = { draftToken: string; summary: Record<string, unknown> };
type Props = { draft: Draft; onEdit: () => void };

export function ConfirmationCard({ draft, onEdit }: Props) {
  const [consent, setConsent] = useState(false);
  const [idempotencyKey] = useState(() => crypto.randomUUID());
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [complete, setComplete] = useState(false);
  async function submit() {
    if (!consent || busy) return;
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/ai-chat/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ draftToken: draft.draftToken, consent: true, idempotencyKey }),
      });
      const result: {
        ok?: boolean;
        reference?: string;
        error?: string;
        notification?: string;
        duplicate?: boolean;
      } = await response.json();
      if (!response.ok || !result.ok || !result.reference)
        throw new Error(
          result.error || "Unable to send request. Please call or use the contact form.",
        );
      setMessage(
        `Request received. Reference ${result.reference}. ${result.duplicate ? "This matches an earlier request. " : ""}${result.notification === "demo" ? "Demo request; no notification was sent." : "The business will review it and contact you."}`,
      );
      setComplete(true);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to send request. Please call or use the contact form.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <section
      className="my-3 rounded border border-steel-300 bg-steel-50 p-4"
      aria-label="Review estimate request"
    >
      <h3 className="font-bold">Review your request</h3>
      <dl className="mt-2 space-y-1 text-sm">
        {Object.entries(draft.summary)
          .filter(([, value]) => value !== undefined && value !== "")
          .map(([key, value]) => (
            <div key={key}>
              <dt className="inline font-semibold">
                {key.replace(/([A-Z])/g, " $1").replace(/^./, (letter) => letter.toUpperCase())}
                :{" "}
              </dt>
              <dd className="inline break-words">
                {typeof value === "object" ? JSON.stringify(value) : String(value)}
              </dd>
            </div>
          ))}
      </dl>
      {!complete && (
        <>
          <label className="mt-3 flex min-h-11 items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={consent}
              onChange={(event) => setConsent(event.target.checked)}
            />
            I agree to be contacted about this request
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={!consent || busy}
              onClick={submit}
              className="min-h-11 rounded bg-ink px-4 font-semibold text-white disabled:opacity-50"
            >
              {busy ? "Sending…" : "Send request"}
            </button>
            <button
              type="button"
              onClick={onEdit}
              disabled={busy}
              className="min-h-11 rounded border border-steel-500 px-4"
            >
              Edit
            </button>
          </div>
        </>
      )}
      {message && (
        <p className="mt-3 text-sm" role="status">
          {message}
        </p>
      )}
    </section>
  );
}
