type AssistantWindow = Window & { __assistantOpenPending?: boolean };

// The widget loads lazily; the pending flag covers taps that happen before it is listening.
export function openAssistant() {
  (window as AssistantWindow).__assistantOpenPending = true;
  window.dispatchEvent(new Event("assistant:open"));
}

export function takePendingAssistantOpen(): boolean {
  const w = window as AssistantWindow;
  const pending = !!w.__assistantOpenPending;
  w.__assistantOpenPending = false;
  return pending;
}
