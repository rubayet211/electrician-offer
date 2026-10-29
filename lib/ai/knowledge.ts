import type { ClientConfig } from "@/types/client-config";

export function buildKnowledge(config: ClientConfig): string {
  const licenses = config.credentials.licenses.filter((item) => item.status === "verified");
  const insurance =
    config.credentials.insurance.status === "verified" ? config.credentials.insurance : undefined;
  const certifications = config.credentials.certifications.filter(
    (item) => item.status === "verified",
  );
  const facts = {
    business: config.business.name,
    phone: config.business.phone,
    services: config.services
      .filter((service) => service.offered)
      .map(({ title, shortDescription }) => ({ title, shortDescription })),
    areas: config.serviceAreas.map(({ name, zipCodes, description }) => ({
      name,
      zipCodes,
      description,
    })),
    hours: config.hours,
    credentials:
      licenses.length || insurance || certifications.length
        ? { licenses, insurance, certifications }
        : "Ask the office about credentials.",
    ...(config.emergency.verified ? { emergency: config.emergency } : {}),
    estimateProcess: "Visitors may request an estimate for the office to review.",
    approvedKnowledge: config.ai.approvedKnowledge.filter(
      (item) => config.emergency.verified || !/emergency/i.test(item.topic),
    ),
  };
  return JSON.stringify(facts);
}
