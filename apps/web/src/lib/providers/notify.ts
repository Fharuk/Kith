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
 * Record a notification in-app and fan it out to the configured vendors. Never throws.
 * `phone`/`email` are optional: without a destination channel only the in-app row is kept.
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
  const notifier = getNotifier();
  try {
    const [smsResult, emailResult] = await Promise.all([
      input.phone ? notifier.sms(input.phone, input.message) : Promise.resolve(null),
      input.email
        ? notifier.email(
            input.email,
            input.emailSubject ?? "Kith — your verified student community",
            `<p>${input.message}</p><p style="color:#6b7280;font-size:12px">Kith · Your Verified Student Community</p>`,
          )
        : Promise.resolve(null),
    ]);

    await getDb().insert(notifications).values([
      { userId: input.userId, channel: "in_app", type: input.type, payload: input.payload },
      ...(input.phone
        ? [{
            userId: input.userId, channel: "sms" as const, type: input.type,
            payload: input.payload, providerMessageId: smsResult?.providerMessageId ?? null,
          }]
        : []),
      ...(input.email
        ? [{
            userId: input.userId, channel: "email" as const, type: input.type,
            payload: input.payload, providerMessageId: emailResult?.providerMessageId ?? null,
          }]
        : []),
    ]);
  } catch (e) {
    // Never let messaging break a money path; the caller's audit log is the record.
    console.error("[notify] failed", e instanceof Error ? e.message : e);
  }
}
