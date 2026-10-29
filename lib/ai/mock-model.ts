import { simulateReadableStream } from "ai";
import { MockLanguageModelV4 } from "ai/test";
import { parsedClientConfig as config } from "@/config/client.config";

const usage = {
  inputTokens: { total: 0, noCache: 0, cacheRead: undefined, cacheWrite: undefined },
  outputTokens: { total: 0, text: 0, reasoning: undefined },
};

export function createMockModel() {
  return new MockLanguageModelV4({
    modelId: "electrical-demo-simulator",
    doStream: async ({ prompt }) => {
      const userMessages = prompt
        .filter((message) => message.role === "user")
        .map((message) =>
          typeof message.content === "string"
            ? message.content
            : message.content
                .filter((part) => part.type === "text")
                .map((part) => part.text)
                .join(" "),
        );
      const text = userMessages.join("\n");
      const last = userMessages.at(-1) ?? "";
      const offered = config.services.filter((service) => service.offered);
      const service = offered.find(
        (item) =>
          text.toLowerCase().includes(item.title.toLowerCase()) ||
          text.toLowerCase().includes(item.slug),
      );
      const field = (name: string) =>
        text.match(new RegExp(`(?:^|\\n)\\s*${name}\\s*:\\s*([^\\n]+)`, "i"))?.[1].trim();
      const name = field("name");
      const phone = field("phone");
      const zip = field("zip");
      const description = field("description");
      const urgency = field("urgency")?.toLowerCase();
      const consent = userMessages.some((message) => /\b(yes|agree|consent)\b/i.test(message));
      if (
        consent &&
        name &&
        phone &&
        zip &&
        service &&
        description &&
        ["routine", "soon", "urgent"].includes(urgency ?? "")
      ) {
        return {
          stream: simulateReadableStream({
            chunks: [
              {
                type: "tool-call" as const,
                toolCallId: "demo-estimate",
                toolName: "prepare_estimate_request",
                input: JSON.stringify({
                  name,
                  phone,
                  zip,
                  serviceSlug: service.slug,
                  description,
                  urgency,
                }),
              },
              {
                type: "finish" as const,
                finishReason: { unified: "tool-calls" as const, raw: "tool_calls" },
                usage,
              },
            ],
          }),
        };
      }
      let reply: string;
      if (/estimate|quote|price|cost/i.test(text) || consent) {
        reply = consent
          ? "Please provide each on a separate line: Name, Phone, ZIP, Service, Description, and Urgency (routine, soon, or urgent), followed by a colon and your answer."
          : "Would you like me to help prepare an estimate request? Please say yes to continue.";
      } else if (/hours|open/i.test(last)) {
        reply = `Hours: ${config.hours.map((h) => `${h.days}: ${h.open}–${h.close}`).join("; ")}.`;
      } else if (/area|serve|location/i.test(last)) {
        reply = `Service areas: ${config.serviceAreas.map((area) => area.name).join(", ")}.`;
      } else {
        reply = `Offered services: ${offered.map((item) => item.title).join(", ")}.`;
      }
      reply += ` Call ${config.business.phone} or request an estimate.`;
      return {
        stream: simulateReadableStream({
          chunks: [
            { type: "text-start" as const, id: "text" },
            { type: "text-delta" as const, id: "text", delta: reply },
            { type: "text-end" as const, id: "text" },
            {
              type: "finish" as const,
              finishReason: { unified: "stop" as const, raw: "stop" },
              usage,
            },
          ],
        }),
      };
    },
  });
}
