import type { PaystackDriver, InitializeParams, InitializeResult, VerifyResult } from "./api";
import { signWebhookBody, PAYSTACK_EVENTS, type ChargeSuccessData } from "./webhook";

/**
 * MockPaystack — offline driver for the golden flow (playbook 04, mocks-first).
 *
 * `initialize` returns an app-relative URL to Kith's own hosted test checkout
 * (/checkout/mock?ref=...). The mock-pay endpoint "charges" the reference and
 * produces a properly HMAC-signed `charge.success` body via `buildChargeSuccess`,
 * which is fed through the SAME webhook handler as live traffic. Signature
 * verification is therefore never bypassed in any environment.
 */
export class MockPaystack implements PaystackDriver {
  readonly mode = "mock" as const;

  constructor(
    private readonly opts: {
      webhookSecret: string;
      /** Where the hosted mock checkout lives. Relative URLs are allowed (same app). */
      checkoutPath?: string;
    },
  ) {}

  async initialize(p: InitializeParams): Promise<InitializeResult> {
    if (p.amountKobo <= 0n) throw new Error("MockPaystack: amount must be positive kobo");
    const path = this.opts.checkoutPath ?? "/checkout/mock";
    return {
      authorizationUrl: `${path}?ref=${encodeURIComponent(p.reference)}`,
      accessCode: `mock_${p.reference}`,
      reference: p.reference,
    };
  }

  async verify(reference: string): Promise<VerifyResult> {
    // The signed webhook is the source of truth in mock mode; verify never claims success
    // on its own so the flow cannot shortcut the webhook handler.
    return { status: "pending", reference, amountKobo: null, currency: "NGN", paidAt: null, channel: "mock", gatewayResponse: null };
  }

  /** Build a signed charge.success webhook (body + header value) for a "paid" reference. */
  buildChargeSuccess(data: Omit<ChargeSuccessData, "status" | "paid_at" | "channel"> & { paid_at?: string | null }): {
    rawBody: string;
    signature: string;
    event: string;
  } {
    const payload: ChargeSuccessData = {
      ...data,
      status: "success",
      paid_at: data.paid_at ?? new Date().toISOString(),
      channel: "mock",
    };
    const rawBody = JSON.stringify({ event: PAYSTACK_EVENTS.chargeSuccess, data: payload });
    return { rawBody, signature: signWebhookBody(rawBody, this.opts.webhookSecret), event: PAYSTACK_EVENTS.chargeSuccess };
  }
}
