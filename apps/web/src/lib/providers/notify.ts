import { and, eq, inArray, isNull, lte, or } from "drizzle-orm";
import { getDb, notifications } from "@kith/database";

/**
 * Outbound messaging — SMS (Termii) and email (Resend) behind one port.
 *
 * Rules that hold in both modes:
 *  · Every send is recorded in `notifications` FIRST (type, channel, payload, provider id)
 *    so the in-app feed is always complete even if a vendor is down.
 *  · Vendor failures never throw into a payment or escrow path — they are logged and the
 *    in-app notification stands as the record.
 *  · Mock mode writes the message to the server log with a MOUTHPIECE prefix, so demos
 *    can show exactly what the student would receive.
 */

export type SmsResult = { ok: boolean; providerMessageId: string | null; error?: string };
export type EmailResult = SmsResult;

export interface Notifier {
  readonly mode: "mock" | "live";
  sms(to: string, body: string): Promise<SmsResult>;
  email(to: string, subject: string, html: string): Promise<EmailResult>;
}

export class MockNotifier implements Notifier {
  readonly mode = "mock" as const;

  async sms(to: string, body: string): Promise<SmsResult> {
    console.log(`[MOUTHPIECE sms] → ${to}: ${body}`);
    return { ok: true, providerMessageId: `mock-sms-${Date.now().toString(36)}` };
  }

  async email(to: string, subject: string, _html: string): Promise<EmailResult> {
    console.log(`[MOUTHPIECE email] → ${to}: ${subject}`);
    return { ok: true, providerMessageId: `mock-email-${Date.now().toString(36)}` };
  }
}

export class TermiiSms implements Notifier {
  readonly mode = "live" as const;
  private readonly from: string;

  constructor(
    private readonly config: { apiKey: string; senderId: string; baseUrl?: string },
    private readonly emailSender?: ResendEmail,
  ) {
    this.from = config.senderId;
  }

  async sms(to: string, body: string): Promise<SmsResult> {
    try {
      const res = await fetch(`${this.config.baseUrl ?? "https://api.ng.termii.com"}/api/sms/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to,
          from: this.from,
          sms: body,
          type: "plain",
          channel: "generic",
          api_key: this.config.apiKey,
        }),
        signal: AbortSignal.timeout(10_000),
      });
      const data = (await res.json().catch(() => null)) as { message_id?: string; code?: string } | null;
      if (!res.ok) return { ok: false, providerMessageId: null, error: data?.code ?? `termii ${res.status}` };
      return { ok: true, providerMessageId: data?.message_id ?? null };
    } catch (e) {
      return { ok: false, providerMessageId: null, error: e instanceof Error ? e.message : "termii error" };
    }
  }

  async email(to: string, subject: string, html: string): Promise<EmailResult> {
    if (!this.emailSender) return { ok: false, providerMessageId: null, error: "email driver not configured" };
    return this.emailSender.send(to, subject, html);
  }
}

export class ResendEmail {
  constructor(private readonly config: { apiKey: string; from: string; baseUrl?: string }) {}

  async send(to: string, subject: string, html: string): Promise<EmailResult> {
    try {
      const res = await fetch(`${this.config.baseUrl ?? "https://api.resend.com"}/emails`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.config.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ from: this.config.from, to, subject, html }),
        signal: AbortSignal.timeout(10_000),
      });
      const data = (await res.json().catch(() => null)) as { id?: string; message?: string } | null;
      if (!res.ok) return { ok: false, providerMessageId: null, error: data?.message ?? `resend ${res.status}` };
      return { ok: true, providerMessageId: data?.id ?? null };
    } catch (e) {
      return { ok: false, providerMessageId: null, error: e instanceof Error ? e.message : "resend error" };
    }
  }
}

/** Adapter that gives Termii SMS + Resend email through the single Notifier port. */
class LiveNotifier implements Notifier {
  readonly mode = "live" as const;
  constructor(private readonly smsDriver: TermiiSms) {}
  sms(to: string, body: string) { return this.smsDriver.sms(to, body); }
  email(to: string, subject: string, html: string) { return this.smsDriver.email(to, subject, html); }
}

let cached: Notifier | null = null;

export function getNotifier(): Notifier {
  if (cached) return cached;
  const termiiKey = (process.env.TERMII_API_KEY ?? "").trim();
  const resendKey = (process.env.RESEND_API_KEY ?? "").trim();
  if (!termiiKey && !resendKey) {
    cached = new MockNotifier();
    return cached;
  }
  const email = resendKey
    ? new ResendEmail({ apiKey: resendKey, from: process.env.EMAIL_FROM ?? "Kith <hello@kith.ng>" })
    : undefined;
  cached = new LiveNotifier(
    new TermiiSms({ apiKey: termiiKey || "unset", senderId: process.env.TERMII_SENDER_ID ?? "Kith" }, email),
  );
  return cached;
}

/**
 * NOTIFICATION OUTBOX.
 *
 * The row is written BEFORE the vendor is called. That single ordering decision is what makes
 * messaging durable: a provider outage, a timeout, or a process death mid-send leaves a
 * `pending` row with a destination and a body that the worker can retry — instead of a
 * message that vanished with no trace. `in_app` rows are delivered by the insert itself.
 *
 * Retries: 5 attempts on a 1m/5m/30m/2h/8h ladder, then `failed` for ops to inspect.
 */
export const MAX_DELIVERY_ATTEMPTS = 5;
const RETRY_LADDER_MS = [60_000, 300_000, 1_800_000, 7_200_000, 28_800_000];

/** Pure: delay before the next attempt (clamped to the ladder's end). */
export function retryDelayFor(attempt: number): number {
  const i = Math.min(Math.max(attempt, 1), RETRY_LADDER_MS.length) - 1;
  return RETRY_LADDER_MS[i]!;
}

/** Pure: give up after the ladder is exhausted. */
export function shouldRetry(attempts: number): boolean {
  return attempts < MAX_DELIVERY_ATTEMPTS;
}

const HTML_FOOTER = '<p style="color:#6b7280;font-size:12px">Kith · Your Verified Student Community</p>';

/** Send one queued row and record the outcome. Never throws. */
export async function deliverNotification(id: string): Promise<"sent" | "failed" | "skipped"> {
  const db = getDb();
  try {
    const [row] = await db.select().from(notifications).where(eq(notifications.id, id));
    if (!row) return "skipped";
    if (row.channel === "in_app") return "sent";
    if (!row.destination) {
      await db.update(notifications).set({ deliveryStatus: "skipped", lastError: "no destination" }).where(eq(notifications.id, id));
      return "skipped";
    }

    const notifier = getNotifier();
    const result = row.channel === "email"
      ? await notifier.email(row.destination, row.subject ?? "Kith — your verified student community", row.body ?? `<p>${row.type}</p>${HTML_FOOTER}`)
      : await notifier.sms(row.destination, row.body ?? "");

    const attempt = row.deliveryAttempts + 1;
    if (result.ok) {
      await db.update(notifications).set({
        deliveryStatus: "sent",
        deliveryAttempts: attempt,
        providerMessageId: result.providerMessageId,
        deliveredAt: new Date(),
        lastError: null,
        nextAttemptAt: null,
      }).where(eq(notifications.id, id));
      return "sent";
    }

    const retryable = shouldRetry(attempt);
    await db.update(notifications).set({
      deliveryStatus: retryable ? "pending" : "failed",
      deliveryAttempts: attempt,
      lastError: result.error ?? "provider rejected the message",
      nextAttemptAt: retryable ? new Date(Date.now() + retryDelayFor(attempt)) : null,
    }).where(eq(notifications.id, id));
    return retryable ? "sent" : "failed";
  } catch (e) {
    // Never let messaging break a money path; the audit log remains the record.
    console.error("[notify] failed", e instanceof Error ? e.message : e);
    return "failed";
  }
}

/**
 * Record a notification in-app and queue its fan-out. Never throws; `email`/`phone` are
 * optional, and without a destination only the in-app row exists.
 */
export async function notifyUser(input: {
  userId: string;
  type: string;
  payload: Record<string, unknown>;
  message: string;
  phone?: string | null;
  email?: string | null;
  emailSubject?: string;
}): Promise<void> {
  try {
    const db = getDb();
    const html = `<p>${input.message}</p>${HTML_FOOTER}`;

    const rows = [
      {
        userId: input.userId, channel: "in_app" as const, type: input.type,
        payload: input.payload, body: input.message,
        deliveryStatus: "sent", deliveredAt: new Date(),
      },
      ...(input.phone ? [{
        userId: input.userId, channel: "sms" as const, type: input.type, payload: input.payload,
        destination: input.phone, body: input.message, deliveryStatus: "pending",
      }] : []),
      ...(input.email ? [{
        userId: input.userId, channel: "email" as const, type: input.type, payload: input.payload,
        destination: input.email, body: html,
        subject: input.emailSubject ?? "Kith — your verified student community",
        deliveryStatus: "pending",
      }] : []),
    ];

    const inserted = await db.insert(notifications).values(rows).returning({ id: notifications.id, channel: notifications.channel });

    // Attempt immediately; anything that fails stays queued for the worker.
    for (const row of inserted) {
      if (row.channel !== "in_app") await deliverNotification(row.id);
    }
  } catch (e) {
    console.error("[notify] failed", e instanceof Error ? e.message : e);
  }
}

/** Worker pass: retry queued SMS/email whose backoff has elapsed. */
export async function processNotificationOutbox(limit = 50): Promise<{ attempted: number; sent: number; failed: number }> {
  const db = getDb();
  const now = new Date();
  const due = await db.select({ id: notifications.id })
    .from(notifications)
    .where(and(
      inArray(notifications.channel, ["email", "sms"]),
      inArray(notifications.deliveryStatus, ["pending", "failed"]),
      lte(notifications.deliveryAttempts, MAX_DELIVERY_ATTEMPTS - 1),
      or(isNull(notifications.nextAttemptAt), lte(notifications.nextAttemptAt, now)),
    ))
    .limit(limit);

  let sent = 0;
  let failed = 0;
  for (const row of due) {
    const outcome = await deliverNotification(row.id);
    if (outcome === "sent") sent++;
    if (outcome === "failed") failed++;
  }
  return { attempted: due.length, sent, failed };
}
