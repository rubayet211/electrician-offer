export function openAssistant() {
  window.dispatchEvent(new Event("assistant:open"));
}
