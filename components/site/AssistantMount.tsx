"use client";

import dynamic from "next/dynamic";
import { parsedClientConfig } from "@/config/client.config";

const AssistantWidget = dynamic(
  () => import("@/components/ai/AssistantWidget").then((mod) => mod.AssistantWidget),
  { ssr: false },
);

export function AssistantMount() {
  if (!parsedClientConfig.ai?.enabled) {
    return null;
  }

  return (
    <AssistantWidget
      phone={parsedClientConfig.business.phone}
      phoneDisplay={parsedClientConfig.business.phoneDisplay}
    />
  );
}
