import { randomUUID } from "node:crypto";
import { parsedClientConfig } from "@/config/client.config";
import { allowsDemoMemory } from "@/lib/config/env";
import type {
  Store,
  Lead,
  Attachment,
  LeadFilter,
  NotificationStatus,
  Usage,
  Session,
  Draft,
  AnalyticsEvent,
} from "./types";
export class MemoryStore implements Store {
  private leadMap = new Map<string, Lead>();
  private attachmentMap = new Map<string, Attachment>();
  private limits = new Map<string, number>();
  private usage = new Map<string, Usage>();
  private sessions = new Map<string, Session>();
  private drafts = new Map<string, Draft>();
  private events: AnalyticsEvent[] = [];
  private leadEvents: { id: string; leadId: string; type: string; value?: string }[] = [];
  constructor(allowDemo = false) {
    if (
      process.env.NODE_ENV === "production" &&
      !(allowDemo && allowsDemoMemory(parsedClientConfig, process.env))
    )
      throw new Error("Memory store is unavailable in production");
  }
  leads = {
    create: async (lead: Lead, attachments: Attachment[]) => {
      const existing = [...this.leadMap.values()].find(
        (row) =>
          row.idempotencyKey === lead.idempotencyKey ||
          (row.dedupeHash === lead.dedupeHash &&
            +new Date(row.createdAt) >= +new Date(lead.createdAt) - 900000),
      );
      if (existing) return structuredClone(existing);
      if (
        [...this.leadMap.values()].some(
          (row) => row.reference === lead.reference || row.id === lead.id,
        )
      )
        throw new Error("Lead conflict");
      if (
        attachments.some((a) => a.leadId !== lead.id || this.attachmentMap.has(a.id)) ||
        new Set(attachments.map((a) => a.id)).size !== attachments.length
      )
        throw new Error("Attachment conflict");
      this.leadMap.set(lead.id, structuredClone(lead));
      for (const attachment of attachments)
        this.attachmentMap.set(attachment.id, structuredClone(attachment));
      return structuredClone(lead);
    },
    findByIdempotencyKey: async (key: string) =>
      structuredClone(
        [...this.leadMap.values()].find((lead) => lead.idempotencyKey === key) ?? null,
      ),
    findDuplicate: async (hash: string, minutes: number, now = new Date()) =>
      structuredClone(
        [...this.leadMap.values()]
          .filter(
            (lead) =>
              lead.dedupeHash === hash && +new Date(lead.createdAt) >= +now - minutes * 60000,
          )
          .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0] ?? null,
      ),
    get: async (id: string) => structuredClone(this.leadMap.get(id) ?? null),
    list: async (filters: LeadFilter = {}, paging: { limit?: number; offset?: number } = {}) =>
      structuredClone(
        [...this.leadMap.values()]
          .filter(
            (l) =>
              (!filters.serviceSlug || l.serviceSlug === filters.serviceSlug) &&
              (!filters.status || l.status === filters.status) &&
              (!filters.source || l.source === filters.source) &&
              (!filters.reference || l.reference.includes(filters.reference)) &&
              (!filters.notificationStatus ||
                filters.notificationStatus.includes(l.notificationStatus)) &&
              (!filters.retryBefore ||
                (l.notificationStatus === "sending" &&
                  !!l.notificationLastAttemptAt &&
                  +new Date(l.notificationLastAttemptAt) + 600000 <= +filters.retryBefore) ||
                (l.notificationStatus !== "sending" && l.notificationAttempts >= 5) ||
                (l.notificationStatus !== "sending" &&
                  l.notificationAttempts < 5 &&
                  (!l.notificationLastAttemptAt ||
                    +new Date(l.notificationLastAttemptAt) +
                      Math.min(3600000, 60000 * 2 ** l.notificationAttempts) <=
                      +filters.retryBefore))),
          )
          .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
          .slice(paging.offset ?? 0, (paging.offset ?? 0) + (paging.limit ?? 50)),
      ),
    updateStatus: async (id: string, status: string) => {
      const l = this.leadMap.get(id);
      if (!l) return false;
      l.status = status;
      return true;
    },
    addEvent: async (leadId: string, type: string, value?: string) => {
      if (!this.leadMap.has(leadId)) throw new Error("Lead not found");
      this.leadEvents.push({ id: randomUUID(), leadId, type, value });
    },
    claimNotification: async (id: string, now: Date, manual = false) => {
      const l = this.leadMap.get(id);
      if (manual) {
        if (!l || l.isDemo || !["pending", "failed", "failed_final"].includes(l.notificationStatus))
          return false;
        l.notificationAttempts = 1;
        l.notificationStatus = "sending";
        l.notificationLastAttemptAt = now.toISOString();
        return true;
      }
      if (
        !l ||
        !["pending", "failed", "sending"].includes(l.notificationStatus) ||
        l.notificationAttempts >= 5 ||
        (l.notificationLastAttemptAt &&
          +new Date(l.notificationLastAttemptAt) +
            (l.notificationStatus === "sending"
              ? 600000
              : Math.min(3600000, 60000 * 2 ** l.notificationAttempts)) >
            +now)
      )
        return false;
      l.notificationAttempts++;
      l.notificationStatus = "sending";
      l.notificationLastAttemptAt = now.toISOString();
      return true;
    },
    finishNotification: async (
      id: string,
      status: "sent" | "failed",
      error?: string,
      providerId?: string,
    ) => {
      const l = this.leadMap.get(id);
      if (!l) throw new Error("Lead not found");
      l.notificationStatus =
        status === "failed" && l.notificationAttempts >= 5 ? "failed_final" : status;
      l.notificationLastError = error;
      l.notificationProviderId = providerId;
    },
    setNotification: async (
      id: string,
      status: NotificationStatus,
      error?: string,
      providerId?: string,
    ) => {
      const l = this.leadMap.get(id);
      if (!l) throw new Error("Lead not found");
      l.notificationStatus = status;
      if (status === "sent" || status === "failed") {
        l.notificationAttempts++;
        l.notificationLastAttemptAt = new Date().toISOString();
      }
      l.notificationLastError = error;
      l.notificationProviderId = providerId;
    },
  };
  attachments = {
    get: async (id: string) => structuredClone(this.attachmentMap.get(id) ?? null),
    purgeOlderThan: async (date: Date) => {
      let n = 0;
      for (const [id, a] of this.attachmentMap)
        if (+new Date(a.createdAt) < +date) {
          this.attachmentMap.delete(id);
          const lead = this.leadMap.get(a.leadId);
          if (lead) lead.photoCount--;
          n++;
        }
      return n;
    },
  };
  rateLimit = {
    count: async (key: string, windowMs: number) =>
      this.limits.get(`${key}:${Math.floor(Date.now() / windowMs) * windowMs}`) ?? 0,
    purgeOlderThan: async (date: Date) => {
      let count = 0;
      for (const key of this.limits.keys())
        if (Number(key.slice(key.lastIndexOf(":") + 1)) < +date) {
          this.limits.delete(key);
          count++;
        }
      return count;
    },
    hit: async (key: string, limit: number, windowMs: number) => {
      const start = Math.floor(Date.now() / windowMs) * windowMs;
      const k = `${key}:${start}`;
      const count = (this.limits.get(k) ?? 0) + 1;
      this.limits.set(k, count);
      return {
        allowed: count <= limit,
        remaining: Math.max(0, limit - count),
        resetAt: start + windowMs,
      };
    },
  };
  analytics = {
    purgeOlderThan: async (date: Date) => {
      const before = this.events.length;
      this.events = this.events.filter((event) => +new Date(event.createdAt) >= +date);
      return before - this.events.length;
    },
    record: async (event: AnalyticsEvent) => {
      this.events.push(structuredClone(event));
    },
    countByType: async (start: Date, end: Date) => {
      const counts: Record<string, number> = {};
      for (const e of this.events)
        if (+new Date(e.createdAt) >= +start && +new Date(e.createdAt) < +end)
          counts[e.type] = (counts[e.type] ?? 0) + 1;
      return counts;
    },
  };
  private month(month: string): Usage {
    let value = this.usage.get(month);
    if (!value) {
      value = {
        month,
        reserved: 0,
        used: 0,
        inputTokens: 0,
        outputTokens: 0,
        costUsd: 0,
        modelErrors: 0,
      };
      this.usage.set(month, value);
    }
    return value;
  }
  aiUsage = {
    getMonth: async (month: string) => structuredClone(this.usage.get(month) ?? null),
    reserve: async (month: string, allowance: number) => {
      const existing = this.usage.get(month);
      if ((existing?.reserved ?? 0) + (existing?.used ?? 0) >= allowance) return false;
      const u = this.month(month);
      u.reserved++;
      return true;
    },
    commit: async (month: string) => {
      const u = this.usage.get(month);
      if (!u?.reserved) return false;
      u.reserved--;
      u.used++;
      return true;
    },
    release: async (month: string) => {
      const u = this.usage.get(month);
      if (!u?.reserved) return false;
      u.reserved--;
      return true;
    },
    addUsage: async (month: string, input: number, output: number, cost: number, errors = 0) => {
      const u = this.month(month);
      u.inputTokens += input;
      u.outputTokens += output;
      u.costUsd += cost;
      u.modelErrors += errors;
    },
    releaseStale: async (before: Date) => {
      let n = 0;
      for (const s of this.sessions.values())
        if (s.reservationState === "reserved" && +new Date(s.lastActivityAt) < +before) {
          const u = this.usage.get(s.month);
          if (u && u.reserved > 0) u.reserved--;
          s.reservationState = "released";
          n++;
        }
      return n;
    },
  };
  private aiRequests = new Map<string, { requestId: string; at: number }>();
  aiSessions = {
    beginRequest: async (id: string, requestId: string, now: Date) => {
      const active = this.aiRequests.get(id);
      if (!this.sessions.has(id) || (active && active.at > +now - 30000)) return false;
      this.aiRequests.set(id, { requestId, at: +now });
      return true;
    },
    endRequest: async (id: string, requestId: string) => {
      if (this.aiRequests.get(id)?.requestId === requestId) this.aiRequests.delete(id);
    },
    createLimited: async (session: Session, since: Date, limit: number) => {
      if (
        [...this.sessions.values()].filter(
          (s) => s.visitorHash === session.visitorHash && +new Date(s.startedAt) >= +since,
        ).length >= limit
      )
        return false;
      if (this.sessions.has(session.id)) throw new Error("Session conflict");
      this.sessions.set(session.id, structuredClone(session));
      return true;
    },
    reserve: async (
      id: string,
      allowance: number,
      since?: Date,
      visitorLimit?: number,
      now?: Date,
      month?: string,
    ) => {
      const s = this.sessions.get(id);
      if (!s) return false;
      if (s.counted) return true;
      if (s.reservationState === "reserved") return false;
      if (
        since &&
        visitorLimit !== undefined &&
        [...this.sessions.values()].filter(
          (other) =>
            other.id !== id &&
            other.visitorHash === s.visitorHash &&
            +new Date(other.startedAt) >= +since &&
            (other.counted || other.reservationState === "reserved"),
        ).length >= visitorLimit
      )
        return false;
      const u = this.month(month ?? s.month);
      if (u.used + u.reserved >= allowance) return false;
      u.reserved++;
      s.month = month ?? s.month;
      if (now) s.startedAt = now.toISOString();
      s.reservationState = "reserved";
      return true;
    },
    settle: async (id: string, success: boolean) => {
      const s = this.sessions.get(id);
      if (!s || s.reservationState !== "reserved") return false;
      const u = this.month(s.month);
      u.reserved--;
      if (success) {
        u.used++;
        s.counted = true;
      }
      s.reservationState = success ? "committed" : "released";
      return true;
    },
    get: async (id: string) => structuredClone(this.sessions.get(id) ?? null),
    create: async (session: Session) => {
      if (this.sessions.has(session.id)) throw new Error("Session conflict");
      this.sessions.set(session.id, structuredClone(session));
    },
    touch: async (id: string, at: Date) => {
      const s = this.sessions.get(id);
      if (!s) return false;
      s.lastActivityAt = at.toISOString();
      return true;
    },
    incrementMessages: async (id: string) => {
      const s = this.sessions.get(id);
      return s ? ++s.visitorMessages : null;
    },
    countNewByVisitorSince: async (hash: string, since: Date) =>
      [...this.sessions.values()].filter(
        (s) => s.visitorHash === hash && +new Date(s.startedAt) >= +since,
      ).length,
    purgeOlderThan: async (date: Date) => {
      let n = 0;
      for (const [id, s] of this.sessions)
        if (+new Date(s.lastActivityAt) < +date && s.reservationState !== "reserved") {
          this.sessions.delete(id);
          for (const [token, d] of this.drafts) if (d.sessionId === id) this.drafts.delete(token);
          n++;
        }
      return n;
    },
  };
  aiDrafts = {
    createLimited: async (draft: Draft, limit: number) => {
      if (!this.sessions.has(draft.sessionId)) throw new Error("Session not found");
      if (
        [...this.drafts.values()].filter((item) => item.sessionId === draft.sessionId).length >=
        limit
      )
        return false;
      if (this.drafts.has(draft.token)) throw new Error("Draft conflict");
      this.drafts.set(draft.token, structuredClone(draft));
      return true;
    },
    claim: async (token: string, sessionId: string, key: string, now = new Date()) => {
      const d = this.drafts.get(token);
      if (
        !d ||
        d.sessionId !== sessionId ||
        (+new Date(d.expiresAt) <= +now &&
          !(
            d.consumedAt &&
            d.confirmationKey === key &&
            [...this.leadMap.values()].some((lead) => lead.idempotencyKey === key)
          )) ||
        (d.consumedAt && d.confirmationKey !== key)
      )
        return null;
      d.consumedAt ??= now.toISOString();
      d.confirmationKey = key;
      return structuredClone(d.payload);
    },
    create: async (draft: Draft) => {
      if (!this.sessions.has(draft.sessionId)) throw new Error("Session not found");
      if (this.drafts.has(draft.token)) throw new Error("Draft conflict");
      this.drafts.set(draft.token, structuredClone(draft));
    },
    consume: async (token: string, sessionId: string, now = new Date()) => {
      const d = this.drafts.get(token);
      if (!d || d.sessionId !== sessionId || d.consumedAt || +new Date(d.expiresAt) <= +now)
        return null;
      d.consumedAt = now.toISOString();
      return structuredClone(d.payload);
    },
    purgeExpired: async (now: Date) => {
      let n = 0;
      for (const [token, d] of this.drafts)
        if (
          +new Date(d.expiresAt) < +now &&
          !(
            d.confirmationKey &&
            [...this.leadMap.values()].some((lead) => lead.idempotencyKey === d.confirmationKey)
          )
        ) {
          this.drafts.delete(token);
          n++;
        }
      return n;
    },
  };
  private adminEvents: { leadId: string; type: string; value?: string; createdAt: string }[] = [];
  private maintenanceEntries: { date: string; minutes: number; description: string }[] = [];
  admin = {
    attachments: async (leadId: string) =>
      structuredClone([...this.attachmentMap.values()].filter((a) => a.leadId === leadId)),
    events: async (leadId: string) =>
      structuredClone(this.adminEvents.filter((e) => e.leadId === leadId)),
    update: async (leadId: string, status: string, note: string, booked: boolean) => {
      const lead = this.leadMap.get(leadId);
      if (!lead) return false;
      lead.status = status;
      const createdAt = new Date().toISOString();
      this.adminEvents.push({ leadId, type: "status", value: status, createdAt });
      if (note) this.adminEvents.push({ leadId, type: "note", value: note, createdAt });
      const previous =
        this.adminEvents.filter((e) => e.leadId === leadId && e.type === "booking").at(-1)
          ?.value === "true";
      if (previous !== booked)
        this.adminEvents.push({ leadId, type: "booking", value: String(booked), createdAt });
      return true;
    },
    bookingCount: async (start: Date, end: Date, excludeDemo: boolean) =>
      this.adminEvents.filter(
        (e) =>
          e.type === "booking" &&
          e.value === "true" &&
          +new Date(e.createdAt) >= +start &&
          +new Date(e.createdAt) < +end &&
          (!excludeDemo || !this.leadMap.get(e.leadId)?.isDemo) &&
          !this.leadMap.get(e.leadId)?.isTest,
      ).length,
    maintenance: async (start: Date, end: Date) =>
      structuredClone(
        this.maintenanceEntries.filter(
          (e) => +new Date(e.date) >= +start && +new Date(e.date) < +end,
        ),
      ),
    addMaintenance: async (date: string, minutes: number, description: string) => {
      this.maintenanceEntries.push({ date, minutes, description });
    },
  };
}
