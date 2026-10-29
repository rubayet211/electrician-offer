import { parsedClientConfig as config } from "@/config/client.config";
export const isDemo = () => config.mode === "demo";
export const siteEnv = () => config.mode;
export const canonicalUrl = (path = "/") =>
  new URL(path, `https://${config.business.domain}`).toString();
export const offeredServices = () => config.services.filter((service) => service.offered);
export const getService = (slug: string) =>
  offeredServices().find((service) => service.slug === slug);
export const phoneTelHref = () => `tel:${config.business.phone}`;
