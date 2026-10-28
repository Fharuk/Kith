import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Paystack webhook crypto + event parsing.
 *
 * Paystack signs the RAW request body with HMAC sha512 using the dashboard webhook secret
 * and sends the hex digest in `x-paystack-signature`. Verification must run against the
 * unparsed body string — never a re-serialized JSON object.
 */

export function signWebhookBody(rawBody: string, secret: string): string {
  return createHmac("sha512", secret).update(rawBody).digest("hex");
}

export function verifyWebhookSignature(rawBody: string, signatureHeader: string | null, secret: string): boolean {
  if (!secret) return false; // refuse unsigned configs
  if (!signatureHeader) return false;
  const expected = Buffer.from(signWebhookBody(rawBody, secret), "utf8");
  const got = Buffer.from(signatureHeader.trim(), "utf8");
  if (expected.length !== got.length) return false;
  return timingSafeEqual(expected, got);
}

/** Event names Kith handles. Everything else is acknowledged and ignored. */
export const PAYSTACK_EVENTS = {
  chargeSuccess: "charge.success",
  transferSuccess: "transfer.success",
  transferFailed: "transfer.failed",
  transferReversed: "transfer.reversed",
  refundProcessed: "refund.processed",
  refundFailed: "refund.failed",
  refundDeclined: "refund.declined",
} as const;

export interface ChargeSuccessData {
  reference: string;
  amount: number; // kobo
  currency: string;
  status: string;
  paid_at: string | null;
  channel: string | null;
  gateway_response?: string | null;
  customer?: { email?: string; id?: number } | null;
  metadata?: Record<string, unknown> | null;
}

export interface TransferEventData {
  reference: string;
  transfer_code?: string;
  amount: number;
  currency?: string;
  status: string;
  reason?: string | null;
  occurred_at?: string;
}

export interface PaystackEvent<T = Record<string, unknown>> {
  event: string;
  data: T;
}

/** Parse + minimally validate a webhook payload. Throws on malformed JSON / missing fields. */
export function parseChargeSuccess(rawBody: string): PaystackEvent<ChargeSuccessData> {
  let parsed: unknown;
  try {
    parsed = JSON.parse(rawBody);
  } catch {
    throw new WebhookParseError("invalid JSON body");
  }
  if (typeof parsed !== "object" || parsed === null) throw new WebhookParseError("body is not an object");
  const evt = parsed as Record<string, unknown>;
  if (typeof evt.event !== "string") throw new WebhookParseError("missing event name");
  const data = evt.data as Record<string, unknown> | undefined;
  if (!data || typeof data !== "object") throw new WebhookParseError("missing event data");
  if (evt.event === PAYSTACK_EVENTS.chargeSuccess) {
    if (typeof data.reference !== "string" || !data.reference) throw new WebhookParseError("charge.success without reference");
    if (typeof data.amount !== "number" || !Number.isInteger(data.amount) || data.amount <= 0) {
      throw new WebhookParseError("charge.success with non-positive integer amount");
    }
  }
  return evt as unknown as PaystackEvent<ChargeSuccessData>;
}

/**
 * Parse a transfer.* event. Transfers move REAL money out of the Paystack balance, so a
 * malformed payload must never be treated as a success — the caller only marks a payout
 * paid when this returns a well-formed success/failed/reversed body.
 */
export function parseTransferEvent(rawBody: string): PaystackEvent<TransferEventData> {
  let parsed: unknown;
  try {
    parsed = JSON.parse(rawBody);
  } catch {
    throw new WebhookParseError("invalid JSON body");
  }
  if (typeof parsed !== "object" || parsed === null) throw new WebhookParseError("body is not an object");
  const evt = parsed as Record<string, unknown>;
  const name = evt.event;
  if (
    name !== PAYSTACK_EVENTS.transferSuccess &&
    name !== PAYSTACK_EVENTS.transferFailed &&
    name !== PAYSTACK_EVENTS.transferReversed
  ) {
    throw new WebhookParseError(`not a transfer event: ${String(name)}`);
  }
  const data = evt.data as Record<string, unknown> | undefined;
  if (!data || typeof data !== "object") throw new WebhookParseError("missing event data");
  if (typeof data.reference !== "string" || !data.reference) throw new WebhookParseError("transfer event without reference");
  if (typeof data.amount !== "number" || !Number.isInteger(data.amount) || data.amount <= 0) {
    throw new WebhookParseError("transfer event with non-positive integer amount");
  }
  return evt as unknown as PaystackEvent<TransferEventData>;
}

export class WebhookParseError extends Error {
  readonly kind = "webhook_parse" as const;
}
