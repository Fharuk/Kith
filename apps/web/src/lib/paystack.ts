import {
  paystackConfigFromEnv,
  assertLiveConfig,
  LivePaystack,
  MockPaystack,
  type PaystackConfig,
  type PaystackDriver,
} from "@kith/paystack";

/**
 * Paystack driver singleton for the web app.
 * Mocks-first (playbook 04): with no PAYSTACK_SECRET_KEY the MockPaystack driver serves
 * the hosted test checkout; with a real sk_test/sk_live key the same code paths talk to
 * api.paystack.co. The webhook handler is identical in both modes.
 */

let cached: { cfg: PaystackConfig; driver: PaystackDriver } | null = null;

export function getPaystack(): { cfg: PaystackConfig; driver: PaystackDriver } {
  if (cached) return cached;
  const cfg = paystackConfigFromEnv();
  assertLiveConfig(cfg);
  const driver: PaystackDriver =
    cfg.mode === "live" ? new LivePaystack(cfg) : new MockPaystack({ webhookSecret: cfg.webhookSecret });
  cached = { cfg, driver };
  return cached;
}

export function appUrl(): string {
  return (process.env.NEXT_PUBLIC_APP_URL || process.env.AUTH_URL || "http://localhost:3000").replace(/\/$/, "");
}

export interface InitCheckoutArgs {
  transactionId: string;
  reference: string;
  email: string;
  amountKobo: bigint;
}

/** Initialize a Paystack charge for an existing Kith transaction; returns the URL to redirect the student to. */
export async function initCheckout(args: InitCheckoutArgs): Promise<string> {
  const { cfg, driver } = getPaystack();
  const res = await driver.initialize({
    email: args.email,
    amountKobo: args.amountKobo,
    reference: args.reference,
    callbackUrl: cfg.mode === "live" ? `${appUrl()}/checkout/return?tx=${args.transactionId}` : undefined,
    metadata: { transactionId: args.transactionId, platform: "kith" },
  });
  return res.authorizationUrl;
}

/** Fresh kobo-safe Paystack reference for a new transaction. */
export function newPaystackReference(prefix = "KTH"): string {
  const rand = Array.from(cryptoRandom(4))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase();
  return `${prefix}-${Date.now().toString(36).toUpperCase()}-${rand}`;
}

function cryptoRandom(n: number): Uint8Array {
  const out = new Uint8Array(n);
  crypto.getRandomValues(out);
  return out;
}
