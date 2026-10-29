import demo from "@/clients/demo/client.config";
const required = "__REQUIRED__";
const template = {
  ...demo,
  mode: "production" as const,
  business: {
    ...demo.business,
    name: required,
    domain: required,
    phone: required,
    phoneDisplay: required,
    email: required,
    timezone: required,
    address: { city: required, state: required, zip: required, showPublicly: false },
  },
  serviceAreas: [],
  services: [],
  credentials: { licenses: [], insurance: { status: "unverified" as const }, certifications: [] },
  projects: [],
  notifications: { recipients: [required], fromAddress: required },
  seo: { titleTemplate: required, defaultDescription: required },
  ai: { ...demo.ai, enabled: false, approvedKnowledge: [] },
};

export default template;
