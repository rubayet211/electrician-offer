import type { Inquiry } from "@/lib/inquiries/schema";
export type NotificationStatus = "pending" | "sent" | "failed" | "skipped_demo";
export type Lead = Inquiry & {
  id: string;
  reference: string;
  createdAt: string;
  source: "contact_form" | "ai_chat";
  ipHash: string;
  isDemo: boolean;
  status: string;
  notificationStatus: NotificationStatus;
  notificationAttempts: number;
  notificationLastError?: string;
  notificationProviderId?: string;
  notificationLastAttemptAt?: string;
  dedupeHash: string;
  photoCount: number;
};
export type Attachment = {
  id: string;
  leadId: string;
  name: string;
  contentType: string;
  data: Uint8Array;
  createdAt: string;
};
export type LeadFilter = {
  serviceSlug?: string;
  status?: string;
  source?: string;
  reference?: string;
  notificationStatus?: NotificationStatus[];
  retryBefore?: Date;
};
export type Usage = {
  month: string;
  reserved: number;
  used: number;
  inputTokens: number;
  outputTokens: number;
  costUsd: number;
  modelErrors: number;
};
export type Session = {
  id: string;
  visitorHash: string;
  month: string;
  startedAt: string;
  lastActivityAt: string;
  visitorMessages: number;
  counted: boolean;
  reservationState: "none" | "reserved" | "committed" | "released";
};
export type Draft = {
  token: string;
  sessionId: string;
  payload: unknown;
  expiresAt: string;
  consumedAt?: string;
  confirmationKey?: string;
  leadId?: string;
};
export type AnalyticsEvent = {
  id: string;
  type: string;
  page: string;
  serviceSlug?: string;
  createdAt: string;
};
export interface Store {
  leads: {
    create(lead: Lead, attachments: Attachment[]): Promise<Lead>;
    findByIdempotencyKey(key: string): Promise<Lead | null>;
    findDuplicate(hash: string, sinceMinutes: number, now?: Date): Promise<Lead | null>;
    get(id: string): Promise<Lead | null>;
    list(filters?: LeadFilter, paging?: { limit?: number; offset?: number }): Promise<Lead[]>;
    updateStatus(id: string, status: string): Promise<boolean>;
    addEvent(id: string, type: string, value?: string): Promise<void>;
    setNotification(
      id: string,
      status: NotificationStatus,
      error?: string,
      providerId?: string,
    ): Promise<void>;
    claimNotification(id: string, now: Date): Promise<boolean>;
    finishNotification(
      id: string,
      status: "sent" | "failed",
      error?: string,
      providerId?: string,
    ): Promise<void>;
  };
  attachments: {
    get(id: string): Promise<Attachment | null>;
    purgeOlderThan(date: Date): Promise<number>;
  };
  rateLimit: {
    hit(
      key: string,
      limit: number,
      windowMs: number,
    ): Promise<{ allowed: boolean; remaining: number; resetAt: number }>;
  };
  analytics: {
    record(event: AnalyticsEvent): Promise<void>;
    countByType(start: Date, end: Date): Promise<Record<string, number>>;
  };
  aiUsage: {
    getMonth(month: string): Promise<Usage | null>;
    reserve(month: string, allowance: number): Promise<boolean>;
    commit(month: string): Promise<boolean>;
    release(month: string): Promise<boolean>;
    addUsage(
      month: string,
      inputTokens: number,
      outputTokens: number,
      costUsd: number,
      modelErrors?: number,
    ): Promise<void>;
    releaseStale(before: Date): Promise<number>;
  };
  aiSessions: {
    createLimited(session: Session, since: Date, limit: number): Promise<boolean>;
    reserve(
      id: string,
      allowance: number,
      since?: Date,
      visitorLimit?: number,
      now?: Date,
      month?: string,
    ): Promise<boolean>;
    settle(id: string, success: boolean): Promise<boolean>;
    get(id: string): Promise<Session | null>;
    create(session: Session): Promise<void>;
    touch(id: string, at: Date): Promise<boolean>;
    incrementMessages(id: string): Promise<number | null>;
    countNewByVisitorSince(visitorHash: string, since: Date): Promise<number>;
    purgeOlderThan(date: Date): Promise<number>;
  };
  aiDrafts: {
    claim(token: string, sessionId: string, key: string, now?: Date): Promise<unknown | null>;
    create(draft: Draft): Promise<void>;
    consume(token: string, sessionId: string, now?: Date): Promise<unknown | null>;
    purgeExpired(now: Date): Promise<number>;
  };
}
