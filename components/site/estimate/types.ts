export type UrgencyType = "routine" | "soon" | "urgent";

export interface FormState {
  // Step 1
  serviceSlug: string;
  urgency: UrgencyType;

  // Step 2
  description: string;
  panelReason?: string;
  panelInfoKnown?: string;
  panelPropertyType?: string;
  evVehicleOrCharger?: string;
  evPropertyType?: string;
  evOwnsCharger?: string;
  evInstallLocation?: string;
  troubleStartedWhen?: string;
  lightingSetting?: string;
  lightingFixtureCount?: string;
  lightingInstallType?: string;
  generatorType?: string;
  generatorPropertyType?: string;
  generatorRequirements?: string;

  // Step 3
  name: string;
  phone: string;
  email?: string;
  zip: string;
  consent: boolean;
  company_website?: string; // honeypot
}

export type FieldErrors = Record<string, string>;

export interface SubmissionResult {
  ok: boolean;
  reference?: string;
  duplicate?: boolean;
  notification: "queued" | "demo";
  warnings: string[];
}
