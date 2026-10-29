"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { MessageSquare } from "lucide-react";
import { ConfirmationCard } from "./ConfirmationCard";

type Props = { phone: string; phoneDisplay?: string };
type Status = {
  available: boolean;
  reason?: string;
  displayName: string;
  isDemo: boolean;
  isSimulated?: boolean;
};
type Draft = {
  status: "awaiting_visitor_confirmation";
  draftToken: string;
  summary: Record<string, unknown>;
};
function asDraft(value: unknown): Draft | null {
  if (!value || typeof value !== "object") return null;
  const draft = value as Record<string, unknown>;
  return draft.status === "awaiting_visitor_confirmation" &&
    typeof draft.draftToken === "string" &&
    !!draft.summary &&
    typeof draft.summary === "object" &&
    !Array.isArray(draft.summary)
    ? (draft as Draft)
    : null;
}

export function AssistantWidget({ phone, phoneDisplay = phone }: Props) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [availability, setAvailability] = useState<Status | null>(null);
  const [dismissed, setDismissed] = useState<string[]>([]);
  const launcher = useRef<HTMLButtonElement>(null);
  const dialog = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const transport = useMemo(() => new DefaultChatTransport({ api: "/api/ai-chat" }), []);
  const { messages, sendMessage, status, error } = useChat({ transport });
  const close = useCallback(() => {
    setOpen(false);
    requestAnimationFrame(() => launcher.current?.focus());
  }, []);
  useEffect(() => {
    if (!open) return;
    const controller = new AbortController();
    fetch("/api/ai-chat", { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error();
        setAvailability(await response.json());
      })
      .catch(() => {
        if (!controller.signal.aborted)
          setAvailability({ available: false, displayName: "Assistant", isDemo: false });
      });
    dialog.current?.focus();
    return () => controller.abort();
  }, [open]);
  const launch = useCallback(() => {
    setOpen(true);
    void fetch("/api/analytics/event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "ai_open", page: window.location.pathname }),
    }).catch(() => {});
  }, []);
  useEffect(() => {
    window.addEventListener("assistant:open", launch);
    return () => window.removeEventListener("assistant:open", launch);
  }, [launch]);
  function trap(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      close();
      return;
    }
    if (event.key !== "Tab" || !dialog.current) return;
    const items = Array.from(
      dialog.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ),
    );
    if (!items.length) {
      event.preventDefault();
      return;
    }
    const first = items[0];
    const last = items[items.length - 1];
    if (
      event.shiftKey &&
      (document.activeElement === first || document.activeElement === dialog.current)
    ) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }
  const busy = status === "submitted" || status === "streaming";
  return (
    <div className="fixed bottom-5 right-5 z-50">
      {!open && (
        <button
          ref={launcher}
          type="button"
          onClick={launch}
          className="hidden min-h-11 items-center gap-2 rounded border border-steel-300 bg-paper px-5 font-semibold text-ink shadow-technical md:flex"
        >
          <MessageSquare size={18} aria-hidden="true" />
          Ask a question
        </button>
      )}
      {open && (
        <div
          ref={dialog}
          role="dialog"
          aria-modal="true"
          aria-labelledby="assistant-title"
          tabIndex={-1}
          onKeyDown={trap}
          className="flex h-[min(640px,calc(100dvh-120px))] w-[min(24rem,calc(100vw-2rem))] flex-col overflow-hidden rounded border border-steel-300 bg-white text-ink shadow-xl"
        >
          <header className="flex items-start justify-between gap-2 bg-ink p-4 text-white">
            <div>
              <h2 id="assistant-title" className="text-lg font-bold">
                {availability?.displayName || "Assistant"}
              </h2>
              <p className="text-sm">AI assistant Â· can make mistakes</p>
              {availability?.isDemo && (
                <p className="text-xs">
                  {availability.isSimulated ? "Demo assistant - simulated responses" : "Demo site"}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={close}
              aria-label="Close assistant"
              className="min-h-11 min-w-11 text-xl"
            >
              Ã—
            </button>
          </header>
          <div className="flex items-center justify-between gap-2 border-b border-steel-200 bg-steel-50 px-4 py-2 text-sm">
            <span>Electrical emergency or fire? Call 911.</span>
            <a
              href={`tel:${phone}`}
              className="flex min-h-11 min-w-11 items-center justify-center font-bold underline"
            >
              Call
            </a>
          </div>
          {availability === null ? (
            <p className="p-4" role="status">
              Checking availabilityâ€¦
            </p>
          ) : !availability.available ? (
            <div className="p-4">
              <p>Assistant temporarily unavailable.</p>
              <a
                className="mt-2 flex min-h-11 items-center font-semibold underline"
                href={`tel:${phone}`}
              >
                Call {phoneDisplay}
              </a>
              <a className="flex min-h-11 items-center font-semibold underline" href="/contact">
                Request an estimate
              </a>
            </div>
          ) : (
            <>
              <div
                className="flex-1 space-y-3 overflow-y-auto p-4"
                aria-live="polite"
                aria-relevant="additions text"
              >
                {messages.map((message) => (
                  <div key={message.id} className="text-sm">
                    <p className="font-semibold">{message.role === "user" ? "You" : "Assistant"}</p>
                    {message.parts.map((part, index) => {
                      if (part.type === "text")
                        return (
                          <p key={index} className="whitespace-pre-wrap break-words">
                            {part.text}
                          </p>
                        );
                      if (
                        part.type === "tool-prepare_estimate_request" &&
                        part.state === "output-available"
                      ) {
                        const draft = asDraft(part.output);
                        return draft && !dismissed.includes(draft.draftToken) ? (
                          <ConfirmationCard
                            key={draft.draftToken}
                            draft={draft}
                            onEdit={() => {
                              setDismissed((old) => [...old, draft.draftToken]);
                              setInput("I'd like to change my request: ");
                              requestAnimationFrame(() => inputRef.current?.focus());
                            }}
                          />
                        ) : null;
                      }
                      return null;
                    })}
                  </div>
                ))}
                {error && (
                  <p role="alert">
                    Assistant unavailable. Call {phoneDisplay} or{" "}
                    <a href="/contact" className="underline">
                      request an estimate
                    </a>
                    .
                  </p>
                )}
              </div>
              <form
                className="border-t border-steel-200 p-3"
                onSubmit={(event) => {
                  event.preventDefault();
                  const text = input.trim();
                  if (!text || busy) return;
                  setInput("");
                  void sendMessage({ text });
                }}
              >
                <label htmlFor="assistant-input" className="sr-only">
                  Message
                </label>
                <textarea
                  id="assistant-input"
                  ref={inputRef}
                  maxLength={4000}
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  rows={2}
                  className="w-full rounded border border-steel-400 p-2"
                />
                <div className="flex items-center justify-between text-xs">
                  <span>{input.length}/4000</span>
                  <button
                    disabled={busy || !input.trim()}
                    className="min-h-11 rounded bg-ink px-4 text-sm font-semibold text-white disabled:opacity-50"
                    type="submit"
                  >
                    Send
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      )}
    </div>
  );
}
