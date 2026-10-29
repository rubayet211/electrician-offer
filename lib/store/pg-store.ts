import { randomUUID } from "node:crypto";
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
export interface DbQuery {
  query<T = Record<string, unknown>>(sql: string, params?: unknown[]): Promise<{ rows: T[] }>;
}
export interface Db extends DbQuery {
  transaction<T>(fn: (db: DbQuery) => Promise<T>): Promise<T>;
}
const leadColumns = `id, reference, created_at AS "createdAt", name, phone, email, zip, location, service_slug AS "serviceSlug", description, urgency, details, consent, source, source_page AS "sourcePage", utm, ip_hash AS "ipHash", is_demo AS "isDemo", status, notification_status AS "notificationStatus", notification_attempts AS "notificationAttempts", notification_last_error AS "notificationLastError", notification_provider_id AS "notificationProviderId", notification_last_attempt_at AS "notificationLastAttemptAt", idempotency_key AS "idempotencyKey", dedupe_hash AS "dedupeHash", (SELECT count(*)::int FROM lead_attachments WHERE lead_id=leads.id) AS "photoCount"`;
const sessionColumns = `id, visitor_hash AS "visitorHash", month, started_at AS "startedAt", last_activity_at AS "lastActivityAt", visitor_messages AS "visitorMessages", counted, reservation_state AS "reservationState"`;
const usageColumns = `month, reserved, used, input_tokens::float8 AS "inputTokens", output_tokens::float8 AS "outputTokens", cost_usd::float8 AS "costUsd", model_errors AS "modelErrors"`;
export class PgStore implements Store {
  constructor(private readonly db: Db) {}
  private normalize<T>(row: T): T {
    if (row && typeof row === "object")
      for (const [key, value] of Object.entries(row))
        if (value instanceof Date) (row as Record<string, unknown>)[key] = value.toISOString();
    return row;
  }
  private async one<T>(sql: string, values: unknown[] = []): Promise<T | null> {
    const row = (await this.db.query<T>(sql, values)).rows[0];
    return row ? this.normalize(row) : null;
  }
  leads = {
    create: async (l: Lead, attachments: Attachment[]) =>
      this.db.transaction(async (tx) => {
        if (attachments.some((a) => a.leadId !== l.id)) throw new Error("Attachment lead mismatch");
        await tx.query("SELECT pg_advisory_xact_lock(hashtext($1))", [
          "inquiry-key:" + l.idempotencyKey,
        ]);
        await tx.query("SELECT pg_advisory_xact_lock(hashtext($1))", [
          "inquiry-hash:" + l.dedupeHash,
        ]);
        const existing = (
          await tx.query<Lead>(
            `SELECT ${leadColumns} FROM leads WHERE idempotency_key=$1 OR (dedupe_hash=$2 AND created_at >= $3) ORDER BY CASE WHEN idempotency_key=$1 THEN 0 ELSE 1 END, created_at DESC LIMIT 1`,
            [
              l.idempotencyKey,
              l.dedupeHash,
              new Date(+new Date(l.createdAt) - 900000).toISOString(),
            ],
          )
        ).rows[0];
        if (existing) return this.normalize(existing);
        await tx.query(
          `INSERT INTO leads(id,reference,created_at,name,phone,email,zip,location,service_slug,description,urgency,details,consent,source,source_page,utm,ip_hash,is_demo,status,notification_status,notification_attempts,idempotency_key,dedupe_hash) VALUES (${Array.from({ length: 23 }, (_, i) => `$${i + 1}`).join(",")})`,
          [
            l.id,
            l.reference,
            l.createdAt,
            l.name,
            l.phone,
            l.email || null,
            l.zip || null,
            l.location || null,
            l.serviceSlug,
            l.description,
            l.urgency,
            JSON.stringify(l.details),
            l.consent,
            l.source,
            l.sourcePage || null,
            l.utm ? JSON.stringify(l.utm) : null,
            l.ipHash,
            l.isDemo,
            l.status,
            l.notificationStatus,
            l.notificationAttempts,
            l.idempotencyKey,
            l.dedupeHash,
          ],
        );
        for (const a of attachments)
          await tx.query(
            "INSERT INTO lead_attachments(id,lead_id,name,content_type,data,created_at) VALUES ($1,$2,$3,$4,$5,$6)",
            [a.id, l.id, a.name, a.contentType, Buffer.from(a.data), a.createdAt],
          );
        return l;
      }),
    findByIdempotencyKey: (key: string) =>
      this.one<Lead>(`SELECT ${leadColumns} FROM leads WHERE idempotency_key=$1`, [key]),
    findDuplicate: (hash: string, minutes: number, now = new Date()) =>
      this.one<Lead>(
        `SELECT ${leadColumns} FROM leads WHERE dedupe_hash=$1 AND created_at >= $2 ORDER BY created_at DESC LIMIT 1`,
        [hash, new Date(+now - minutes * 60000).toISOString()],
      ),
    get: (id: string) => this.one<Lead>(`SELECT ${leadColumns} FROM leads WHERE id=$1`, [id]),
    list: async (f: LeadFilter = {}, p: { limit?: number; offset?: number } = {}) =>
      (
        await this.db.query<Lead>(
          `SELECT ${leadColumns} FROM leads WHERE ($1::text IS NULL OR service_slug=$1) AND ($2::text IS NULL OR status=$2) AND ($3::text IS NULL OR source=$3) AND ($4::text IS NULL OR position($4 in reference)>0) AND ($5::text[] IS NULL OR notification_status=ANY($5)) AND ($8::timestamptz IS NULL OR (notification_attempts<5 AND (notification_last_attempt_at IS NULL OR notification_last_attempt_at + interval '1 minute' * least(60, power(2,notification_attempts)) <= $8))) ORDER BY created_at DESC LIMIT $6 OFFSET $7`,
          [
            f.serviceSlug ?? null,
            f.status ?? null,
            f.source ?? null,
            f.reference ?? null,
            f.notificationStatus ?? null,
            p.limit ?? 50,
            p.offset ?? 0,
            f.retryBefore?.toISOString() ?? null,
          ],
        )
      ).rows.map((row) => this.normalize(row)),
    updateStatus: async (id: string, status: string) =>
      !!(await this.one("UPDATE leads SET status=$2 WHERE id=$1 RETURNING id", [id, status])),
    addEvent: async (id: string, type: string, value?: string) => {
      await this.db.query("INSERT INTO lead_events(id,lead_id,type,value) VALUES ($1,$2,$3,$4)", [
        randomUUID(),
        id,
        type,
        value ?? null,
      ]);
    },
    claimNotification: async (id: string, now: Date) =>
      !!(await this.one(
        "UPDATE leads SET notification_attempts=notification_attempts+1,notification_last_attempt_at=$2 WHERE id=$1 AND notification_status IN ('pending','failed') AND notification_attempts<5 AND (notification_last_attempt_at IS NULL OR notification_last_attempt_at + interval '1 minute' * least(60,power(2,notification_attempts)) <= $2) RETURNING id",
        [id, now.toISOString()],
      )),
    finishNotification: async (
      id: string,
      status: "sent" | "failed",
      error?: string,
      providerId?: string,
    ) => {
      await this.db.query(
        "UPDATE leads SET notification_status=$2,notification_last_error=$3,notification_provider_id=$4 WHERE id=$1",
        [id, status, error ?? null, providerId ?? null],
      );
    },
    setNotification: async (
      id: string,
      status: NotificationStatus,
      error?: string,
      providerId?: string,
    ) => {
      await this.db.query(
        "UPDATE leads SET notification_status=$2, notification_attempts=notification_attempts + CASE WHEN $2 IN ('sent','failed') THEN 1 ELSE 0 END, notification_last_attempt_at=CASE WHEN $2 IN ('sent','failed') THEN now() ELSE notification_last_attempt_at END, notification_last_error=$3, notification_provider_id=$4 WHERE id=$1",
        [id, status, error ?? null, providerId ?? null],
      );
    },
  };
  attachments = {
    get: (id: string) =>
      this.one<Attachment>(
        `SELECT id,lead_id AS "leadId",name,content_type AS "contentType",data,created_at AS "createdAt" FROM lead_attachments WHERE id=$1`,
        [id],
      ),
    purgeOlderThan: async (date: Date) =>
      (
        await this.db.query("DELETE FROM lead_attachments WHERE created_at<$1 RETURNING id", [
          date.toISOString(),
        ])
      ).rows.length,
  };
  rateLimit = {
    hit: async (key: string, limit: number, windowMs: number) => {
      const start = Math.floor(Date.now() / windowMs) * windowMs;
      const row = await this.one<{ count: number }>(
        "INSERT INTO rate_limits(key,window_start,count) VALUES ($1,$2,1) ON CONFLICT (key,window_start) DO UPDATE SET count=rate_limits.count+1 RETURNING count",
        [key, new Date(start).toISOString()],
      );
      const count = row!.count;
      return {
        allowed: count <= limit,
        remaining: Math.max(0, limit - count),
        resetAt: start + windowMs,
      };
    },
  };
  analytics = {
    record: async (e: AnalyticsEvent) => {
      await this.db.query(
        "INSERT INTO analytics_events(id,type,page,service_slug,created_at) VALUES ($1,$2,$3,$4,$5)",
        [e.id, e.type, e.page, e.serviceSlug ?? null, e.createdAt],
      );
    },
    countByType: async (start: Date, end: Date) =>
      Object.fromEntries(
        (
          await this.db.query<{ type: string; count: number }>(
            "SELECT type,count(*)::int AS count FROM analytics_events WHERE created_at >= $1 AND created_at < $2 GROUP BY type",
            [start.toISOString(), end.toISOString()],
          )
        ).rows.map((r) => [r.type, r.count]),
      ),
  };
  aiUsage = {
    getMonth: (month: string) =>
      this.one<Usage>(`SELECT ${usageColumns} FROM ai_usage_months WHERE month=$1`, [month]),
    reserve: async (month: string, allowance: number) =>
      !!(await this.one(
        "INSERT INTO ai_usage_months(month,reserved) SELECT $1,1 WHERE $2>0 ON CONFLICT (month) DO UPDATE SET reserved=ai_usage_months.reserved+1 WHERE ai_usage_months.used+ai_usage_months.reserved<$2 RETURNING month",
        [month, allowance],
      )),
    commit: async (month: string) =>
      !!(await this.one(
        "UPDATE ai_usage_months SET reserved=reserved-1,used=used+1 WHERE month=$1 AND reserved>0 RETURNING month",
        [month],
      )),
    release: async (month: string) =>
      !!(await this.one(
        "UPDATE ai_usage_months SET reserved=reserved-1 WHERE month=$1 AND reserved>0 RETURNING month",
        [month],
      )),
    addUsage: async (month: string, input: number, output: number, cost: number, errors = 0) => {
      await this.db.query(
        "INSERT INTO ai_usage_months(month,input_tokens,output_tokens,cost_usd,model_errors) VALUES ($1,$2,$3,$4,$5) ON CONFLICT (month) DO UPDATE SET input_tokens=ai_usage_months.input_tokens+$2,output_tokens=ai_usage_months.output_tokens+$3,cost_usd=ai_usage_months.cost_usd+$4,model_errors=ai_usage_months.model_errors+$5",
        [month, input, output, cost, errors],
      );
    },
    releaseStale: async (before: Date) => {
      const rows = await this.db.query(
        "WITH released AS (UPDATE ai_sessions SET reservation_state='released' WHERE reservation_state='reserved' AND last_activity_at<$1 RETURNING month), counts AS (SELECT month,count(*)::int AS n FROM released GROUP BY month), updated AS (UPDATE ai_usage_months u SET reserved=greatest(0,u.reserved-counts.n) FROM counts WHERE u.month=counts.month RETURNING u.month) SELECT month FROM released",
        [before.toISOString()],
      );
      return rows.rows.length;
    },
  };
  aiSessions = {
    get: (id: string) =>
      this.one<Session>(`SELECT ${sessionColumns} FROM ai_sessions WHERE id=$1`, [id]),
    create: async (s: Session) => {
      await this.db.query(
        "INSERT INTO ai_sessions(id,visitor_hash,month,started_at,last_activity_at,visitor_messages,counted,reservation_state) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)",
        [
          s.id,
          s.visitorHash,
          s.month,
          s.startedAt,
          s.lastActivityAt,
          s.visitorMessages,
          s.counted,
          s.reservationState,
        ],
      );
    },
    touch: async (id: string, at: Date) =>
      !!(await this.one("UPDATE ai_sessions SET last_activity_at=$2 WHERE id=$1 RETURNING id", [
        id,
        at.toISOString(),
      ])),
    incrementMessages: async (id: string) =>
      (
        await this.one<{ visitorMessages: number }>(
          `UPDATE ai_sessions SET visitor_messages=visitor_messages+1 WHERE id=$1 RETURNING visitor_messages AS "visitorMessages"`,
          [id],
        )
      )?.visitorMessages ?? null,
    countNewByVisitorSince: async (hash: string, since: Date) =>
      (await this.one<{ count: number }>(
        "SELECT count(*)::int AS count FROM ai_sessions WHERE visitor_hash=$1 AND started_at >= $2",
        [hash, since.toISOString()],
      ))!.count,
    purgeOlderThan: async (date: Date) =>
      (
        await this.db.query(
          "DELETE FROM ai_sessions WHERE last_activity_at<$1 AND reservation_state<>'reserved' RETURNING id",
          [date.toISOString()],
        )
      ).rows.length,
  };
  aiDrafts = {
    create: async (d: Draft) => {
      await this.db.query(
        "INSERT INTO ai_lead_drafts(token,session_id,payload,expires_at,consumed_at,lead_id) VALUES ($1,$2,$3,$4,$5,$6)",
        [
          d.token,
          d.sessionId,
          JSON.stringify(d.payload),
          d.expiresAt,
          d.consumedAt ?? null,
          d.leadId ?? null,
        ],
      );
    },
    consume: async (token: string, sessionId: string, now = new Date()) =>
      (
        await this.one<{ payload: unknown }>(
          "UPDATE ai_lead_drafts SET consumed_at=$3 WHERE token=$1 AND session_id=$2 AND consumed_at IS NULL AND expires_at>$3 RETURNING payload",
          [token, sessionId, now.toISOString()],
        )
      )?.payload ?? null,
    purgeExpired: async (now: Date) =>
      (
        await this.db.query("DELETE FROM ai_lead_drafts WHERE expires_at<$1 RETURNING token", [
          now.toISOString(),
        ])
      ).rows.length,
  };
}
