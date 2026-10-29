import React from "react";
import {
  Wrench,
  Gauge,
  PlugZap,
  Lightbulb,
  Cpu,
  Plug,
  ShieldCheck,
  ClipboardCheck,
  Zap,
  type LucideIcon,
} from "lucide-react";

export function getServiceIcon(iconName: string): LucideIcon {
  const normalized = iconName.toLowerCase().trim();

  if (normalized.includes("troubleshoot") || normalized.includes("repair")) {
    return Wrench;
  }
  if (normalized.includes("panel")) {
    return Gauge;
  }
  if (normalized.includes("ev") || normalized.includes("charger")) {
    return PlugZap;
  }
  if (normalized.includes("lighting") || normalized.includes("light")) {
    return Lightbulb;
  }
  if (normalized.includes("generator") || normalized.includes("power")) {
    return Cpu;
  }
  if (normalized.includes("outlet") || normalized.includes("switch")) {
    return Plug;
  }
  if (normalized.includes("surge")) {
    return ShieldCheck;
  }
  if (normalized.includes("inspect")) {
    return ClipboardCheck;
  }

  return Zap;
}

export function ServiceIcon({
  name,
  className = "",
  "aria-hidden": ariaHidden = true,
}: {
  name: string;
  className?: string;
  "aria-hidden"?: boolean;
}) {
  const normalized = name.toLowerCase().trim();

  if (normalized.includes("troubleshoot") || normalized.includes("repair")) {
    return <Wrench className={className} aria-hidden={ariaHidden} />;
  }
  if (normalized.includes("panel")) {
    return <Gauge className={className} aria-hidden={ariaHidden} />;
  }
  if (normalized.includes("ev") || normalized.includes("charger")) {
    return <PlugZap className={className} aria-hidden={ariaHidden} />;
  }
  if (normalized.includes("lighting") || normalized.includes("light")) {
    return <Lightbulb className={className} aria-hidden={ariaHidden} />;
  }
  if (normalized.includes("generator") || normalized.includes("power")) {
    return <Cpu className={className} aria-hidden={ariaHidden} />;
  }
  if (normalized.includes("outlet") || normalized.includes("switch")) {
    return <Plug className={className} aria-hidden={ariaHidden} />;
  }
  if (normalized.includes("surge")) {
    return <ShieldCheck className={className} aria-hidden={ariaHidden} />;
  }
  if (normalized.includes("inspect")) {
    return <ClipboardCheck className={className} aria-hidden={ariaHidden} />;
  }

  return <Zap className={className} aria-hidden={ariaHidden} />;
}
