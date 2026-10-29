import type { z } from "zod";
import type { clientConfigSchema, FormType } from "@/types/client-config";

const entries: [string, string, FormType, string][] = [
  ["repair-troubleshooting", "Repair and troubleshooting", "troubleshooting", "Troubleshooting"],
  ["panel-upgrades", "Panel upgrades", "panel", "Panel"],
  ["ev-charger-installation", "EV charger installation", "ev_charger", "EV charger"],
  ["lighting-installation", "Lighting installation", "lighting", "Lighting"],
  ["generator-installation", "Generator installation", "generator", "Generator"],
  ["outlets-switches", "Outlets and switches", "general", "Outlet"],
  ["surge-protection", "Surge protection", "general", "Surge"],
  ["electrical-inspections", "Electrical inspections", "general", "Inspection"],
];
const copy: Record<
  string,
  {
    intro: string;
    signs: string[];
    process: string[];
    faqs: { question: string; answer: string }[];
  }
> = {
  "repair-troubleshooting": {
    intro: "Describe the symptoms and when they started so the electrician can assess the issue.",
    signs: [
      "A circuit trips repeatedly.",
      "Lights flicker in one area.",
      "An outlet has stopped working.",
    ],
    process: [
      "Describe the symptoms and timing.",
      "Discuss a visit to assess the affected area.",
      "Review findings and proposed work.",
    ],
    faqs: [
      {
        question: "Should I reset a breaker repeatedly?",
        answer: "Avoid repeated resets; describe the issue when requesting help.",
      },
      {
        question: "What if I see smoke or sparks?",
        answer: "Leave the area if unsafe and call 911.",
      },
    ],
  },
  "panel-upgrades": {
    intro: "Discuss changes in electrical demand or concerns about existing equipment.",
    signs: [
      "You are planning additional electrical loads.",
      "Your panel is older and you have questions.",
      "A renovation changes your electrical needs.",
    ],
    process: [
      "Describe the project and property.",
      "Discuss existing equipment if known.",
      "Review an assessment and estimate.",
    ],
    faqs: [
      {
        question: "Do I need panel specifications?",
        answer: "No. Share details only if already known; do not open the panel.",
      },
      {
        question: "Will every project need an upgrade?",
        answer: "That depends on the equipment and the proposed loads.",
      },
    ],
  },
  "ev-charger-installation": {
    intro: "Share your vehicle or charger plans and preferred parking location.",
    signs: [
      "You are considering an electric vehicle.",
      "You want a charger near a parking space.",
      "You have a charger but need installation advice.",
    ],
    process: [
      "Share charger and property details.",
      "Discuss the parking location and electrical setup.",
      "Review an estimate for the proposed work.",
    ],
    faqs: [
      {
        question: "Must I buy a charger first?",
        answer: "No; you can request an estimate before choosing one.",
      },
      {
        question: "Can a charger be installed outdoors?",
        answer: "Options depend on the site and equipment selected.",
      },
    ],
  },
  "lighting-installation": {
    intro: "Discuss new or replacement lighting indoors or outside.",
    signs: [
      "A room needs more useful light.",
      "Outdoor fixtures need replacement.",
      "You are planning lighting for a renovation.",
    ],
    process: [
      "Describe the location and fixture count.",
      "Discuss fixtures and placement.",
      "Review the proposed work and estimate.",
    ],
    faqs: [
      {
        question: "Can I supply fixtures?",
        answer: "Mention the fixtures you have when requesting an estimate.",
      },
      {
        question: "Can you assess outdoor lighting?",
        answer: "Describe the location and existing fixtures in your request.",
      },
    ],
  },
  "generator-installation": {
    intro: "Discuss standby generator or portable inlet plans for your property.",
    signs: [
      "You are considering backup power.",
      "You want to discuss a portable generator inlet.",
      "Your backup power needs have changed.",
    ],
    process: [
      "Describe the generator and property.",
      "Discuss the equipment and site.",
      "Review an estimate for the proposed installation.",
    ],
    faqs: [
      {
        question: "Do I need to know the generator size?",
        answer: "No; share requirements if known.",
      },
      {
        question: "Can I request a portable inlet?",
        answer: "Yes, select portable inlet and describe your needs.",
      },
    ],
  },
  "outlets-switches": {
    intro: "Describe the outlets or switches you want assessed or changed.",
    signs: [
      "An outlet no longer works.",
      "You need an outlet in another location.",
      "A switch does not control the expected light.",
    ],
    process: [
      "Describe the affected rooms and devices.",
      "Discuss access and desired changes.",
      "Review an estimate before work.",
    ],
    faqs: [
      {
        question: "Can I request more than one outlet?",
        answer: "Yes; describe the locations and approximate count.",
      },
      {
        question: "Should I remove a cover for a photo?",
        answer: "No. Never remove covers or approach exposed wiring.",
      },
    ],
  },
  "surge-protection": {
    intro: "Ask about options for protecting electrical equipment from surges.",
    signs: [
      "You are adding sensitive equipment.",
      "You have questions about surge protection.",
      "You are reviewing protection for your property.",
    ],
    process: [
      "Describe your property and concerns.",
      "Discuss existing equipment and options.",
      "Review the proposed work and estimate.",
    ],
    faqs: [
      {
        question: "Does surge protection prevent every damage event?",
        answer: "No protection can guarantee that all equipment damage is prevented.",
      },
      {
        question: "What should I share?",
        answer: "Describe the equipment or concerns you want to discuss.",
      },
    ],
  },
  "electrical-inspections": {
    intro: "Request a discussion about an electrical assessment for your property.",
    signs: [
      "You have questions about existing equipment.",
      "You are planning a property purchase or sale.",
      "You are preparing for a renovation.",
    ],
    process: [
      "Describe the reason for the assessment.",
      "Discuss access and the areas to review.",
      "Review findings and any proposed next steps.",
    ],
    faqs: [
      {
        question: "Is an inspection a guarantee?",
        answer: "No; the scope and findings depend on what can be assessed.",
      },
      {
        question: "Can you inspect before a renovation?",
        answer: "Share the project plans so the scope can be discussed.",
      },
    ],
  },
};
const demo = {
  mode: "demo",
  business: {
    name: "Meridian Electric Co. (Demo)",
    domain: "electrician-demo.axinofy.com",
    phone: "+15550100142",
    phoneDisplay: "(555) 010-0142",
    email: "demo@example.com",
    timezone: "America/Chicago",
    address: { city: "Harbor Ridge", state: "Sample State", zip: "00000", showPublicly: false },
  },
  positioning: {
    heroHeadline: "Electrical Work Done Right. A Clear Way to Get Started.",
    heroSubhead:
      "Residential electrical repairs, panel updates, and equipment installations. Straightforward estimates and direct communication.",
    tagline: "Residential Electrical Services",
    closingHeadline: "Have an electrical project in mind?",
    nextSteps: [
      "We review your submitted project details.",
      "We contact you using the details you provided.",
      "We provide a clear written estimate before any work begins.",
    ],
  },
  practices: [
    {
      title: "Written estimates before work starts",
      description:
        "We review your project requirements and provide a written estimate before any physical work begins.",
    },
    {
      title: "Clear arrival windows confirmed by phone",
      description: "We contact you in advance to confirm timing so you are not left waiting.",
    },
    {
      title: "Photos optional — never open a panel",
      description:
        "If you have a clear photo of the room or label, send it along. Never open electrical equipment or approach exposed wiring.",
    },
    {
      title: "We explain options in plain language",
      description:
        "We explain what needs attention and walk through your repair or installation options without technical jargon.",
    },
  ],
  hours: [{ days: "Monday - Friday", open: "8:00 AM", close: "5:00 PM" }],
  emergency: {
    offered: false,
    verified: false,
    description: "Demo business does not offer 24/7 emergency service.",
  },
  serviceAreas: ["Harbor Ridge", "Oakmont Falls", "Cedar Point", "West Lindell"].map((name) => ({
    name,
    zipCodes: [],
    description: "Fictional sample service area.",
  })),
  services: entries.map(([slug, title, type, icon]) => ({
    slug,
    title,
    shortDescription: copy[slug].intro,
    icon,
    formType: type,
    offered: true,
    featured: true,
    headline: title,
    ...copy[slug],
  })),
  pages: ["home", "services", "service-areas", "about", "contact", "privacy", "terms"].map(
    (slug) => ({ slug, enabled: true }),
  ),
  credentials: {
    licenses: [
      {
        label: "Electrical Contractor License",
        number: "SAMPLE-000000",
        issuingAuthority: "Sample State Licensing Board",
        jurisdiction: "Sample State",
        status: "unverified",
        isSample: true,
      },
    ],
    insurance: { status: "unverified" },
    certifications: [],
  },
  reviews: [],
  projects: ["panel", "ev-charger", "lighting", "troubleshooting", "generator", "hero"].map(
    (name) => ({
      title: `Sample ${name} photo`,
      image: `/images/demo/${name}.jpg`,
      alt: `Sample ${name} image`,
      description: "Sample project image, not a real customer project.",
      isSample: true,
    }),
  ),
  faqs: [],
  branding: { primary: "#0B1726", accent: "#F2A516" },
  notifications: { recipients: ["demo@example.com"], fromAddress: "demo@example.com" },
  seo: {
    titleTemplate: "%s | Meridian Electric Co. (Demo)",
    defaultDescription: "A fictional electrician website demonstration.",
  },
  analytics: { enabled: true },
  uploads: { enabled: true, maxFiles: 3, maxBytesPerFile: 4 * 1024 * 1024, retentionDays: 180 },
  ai: {
    enabled: true,
    model: "deepseek/deepseek-v4.1-flash",
    monthlyConversationAllowance: 100,
    maxVisitorMessagesPerConversation: 15,
    sessionInactivityMinutes: 30,
    maxOutputTokens: 500,
    newConversationsPerVisitorPerDay: 4,
    displayName: "Demo assistant",
    approvedKnowledge: [
      { topic: "Hours", answer: "Sample hours are Monday through Friday, 8 AM to 5 PM." },
      {
        topic: "Areas",
        answer:
          "Harbor Ridge, Oakmont Falls, Cedar Point and West Lindell are fictional sample service areas.",
      },
      { topic: "Estimates", answer: "Submit the form and the business can review your request." },
      {
        topic: "Emergency",
        answer:
          "The demo business does not offer 24/7 emergency service; for fire, smoke or sparks call 911.",
      },
      {
        topic: "Services",
        answer:
          "The demo lists electrical repairs, panels, EV charging, lighting, generators, outlets, surge protection and inspections.",
      },
      {
        topic: "Pricing",
        answer: "Pricing depends on the project and is not provided in this demo.",
      },
      {
        topic: "Photos",
        answer: "Photos are optional; never open equipment or approach exposed wiring.",
      },
      { topic: "Status", answer: "This is a fictional demonstration, not a real business." },
    ],
  },
} satisfies z.input<typeof clientConfigSchema>;
export default demo;
