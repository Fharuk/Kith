/**
 * Paystack configuration + mode detection.
 *
 * Enterprise rule (playbook 04 — mocks-first): if no `sk_test_`/`sk_live_` secret key is
 * configured, the stack runs against the in-process MockPaystack driver so the golden
 * flow (initialize → charge → signed webhook → escrow held) is fully exercisable offline.
 * The webhook signature path is identical in both modes — the mock signs with a
 * deterministic dev secret so the verification code is never bypassed.
 */

export type PaystackMode = "live" | "mock";

export interface PaystackConfig {
  mode: PaystackMode;
  secretKey: string;
  publicKey: string;
  /** HMAC sha512 secret for x-paystack-signature. Always non-empty (mock falls back). */
  webhookSecret: string;
  baseUrl: string;
}

/** Deterministic dev secret — mock mode only. Never accepted in live mode. */
export const MOCK_WEBHOOK_SECRET = "kith-mock-webhook-secret";

const LIVE_KEY_RE = /^sk_(test|live)_[0-9a-zA-Z]+$/;

export function paystackConfigFromEnv(env: NodeJS.ProcessEnv | Record<string, string | undefined> = process.env): PaystackConfig {
  const secretKey = (env.PAYSTACK_SECRET_KEY ?? "").trim();
  const live = LIVE_KEY_RE.test(secretKey);
  const webhookSecret = (env.PAYSTACK_WEBHOOK_SECRET ?? "").trim();
  return {
    mode: live ? "live" : "mock",
    secretKey,
    publicKey: (env.PAYSTACK_PUBLIC_KEY ?? "").trim(),
    webhookSecret: webhookSecret || (live ? "" : MOCK_WEBHOOK_SECRET),
    baseUrl: (env.PAYSTACK_BASE_URL ?? "").trim() || "https://api.paystack.co",
  };
}

/** Live deployments MUST set a webhook secret; throw early rather than accept unsigned events. */
export function assertLiveConfig(cfg: PaystackConfig): void {
  if (cfg.mode === "live" && !cfg.webhookSecret) {
    throw new Error("PAYSTACK_WEBHOOK_SECRET is required in live mode");
  }
}
