import { describe, expect, it } from "vitest";
import {
  paystackConfigFromEnv,
  MOCK_WEBHOOK_SECRET,
  signWebhookBody,
  verifyWebhookSignature,
  parseChargeSuccess,
  WebhookParseError,
  PAYSTACK_EVENTS,
  MockPaystack,
  LivePaystack,
  PaystackApiError,
} from "../src/index.js";

describe("config", () => {
  it("detects mock mode when no secret key", () => {
    const cfg = paystackConfigFromEnv({});
    expect(cfg.mode).toBe("mock");
    expect(cfg.webhookSecret).toBe(MOCK_WEBHOOK_SECRET);
  });

  it("detects live mode from sk_test/sk_live keys", () => {
    expect(paystackConfigFromEnv({ PAYSTACK_SECRET_KEY: "sk_test_abc123" }).mode).toBe("live");
    expect(paystackConfigFromEnv({ PAYSTACK_SECRET_KEY: "sk_live_abc123" }).mode).toBe("live");
    expect(paystackConfigFromEnv({ PAYSTACK_SECRET_KEY: "garbage" }).mode).toBe("mock");
  });

  it("live mode keeps empty webhook secret (assertLiveConfig must catch it)", () => {
    const cfg = paystackConfigFromEnv({ PAYSTACK_SECRET_KEY: "sk_test_abc123" });
    expect(cfg.webhookSecret).toBe("");
  });
});

describe("webhook signature", () => {
  const secret = "whsec_demo";
  const body = JSON.stringify({ event: "charge.success", data: { reference: "KTH-1", amount: 7500000 } });

  it("round-trips a signature", () => {
    const sig = signWebhookBody(body, secret);
    expect(verifyWebhookSignature(body, sig, secret)).toBe(true);
  });

  it("rejects tampered bodies", () => {
    const sig = signWebhookBody(body, secret);
    const tampered = body.replace("7500000", "1");
    expect(verifyWebhookSignature(tampered, sig, secret)).toBe(false);
  });

  it("rejects wrong secret, missing header, empty secret", () => {
    const sig = signWebhookBody(body, secret);
    expect(verifyWebhookSignature(body, sig, "other")).toBe(false);
    expect(verifyWebhookSignature(body, null, secret)).toBe(false);
    expect(verifyWebhookSignature(body, sig, "")).toBe(false);
  });
});

describe("event parsing", () => {
  it("parses a valid charge.success", () => {
    const raw = JSON.stringify({
      event: PAYSTACK_EVENTS.chargeSuccess,
      data: { reference: "KTH-9", amount: 4500000, currency: "NGN", status: "success", paid_at: "2026-10-28T12:00:00Z", channel: "card" },
    });
    const evt = parseChargeSuccess(raw);
    expect(evt.event).toBe("charge.success");
    expect(evt.data.reference).toBe("KTH-9");
    expect(evt.data.amount).toBe(4500000);
  });

  it("rejects malformed payloads", () => {
    expect(() => parseChargeSuccess("not json")).toThrow(WebhookParseError);
    expect(() => parseChargeSuccess(JSON.stringify({ event: "charge.success" }))).toThrow(WebhookParseError);
    expect(() => parseChargeSuccess(JSON.stringify({ event: "charge.success", data: { amount: 100 } }))).toThrow(WebhookParseError);
    expect(() => parseChargeSuccess(JSON.stringify({ event: "charge.success", data: { reference: "K", amount: -5 } }))).toThrow(WebhookParseError);
  });
});

describe("MockPaystack", () => {
  it("initializes to the hosted mock checkout", async () => {
    const mock = new MockPaystack({ webhookSecret: MOCK_WEBHOOK_SECRET });
    const res = await mock.initialize({ email: "s@demo.kith.ng", amountKobo: 7500000n, reference: "KTH-ABC" });
    expect(res.authorizationUrl).toBe("/checkout/mock?ref=KTH-ABC");
    expect(res.reference).toBe("KTH-ABC");
  });

  it("rejects non-positive amounts", async () => {
    const mock = new MockPaystack({ webhookSecret: MOCK_WEBHOOK_SECRET });
    await expect(mock.initialize({ email: "s@demo.kith.ng", amountKobo: 0n, reference: "KTH-0" })).rejects.toThrow();
  });

  it("verify never claims success (webhook is the truth)", async () => {
    const mock = new MockPaystack({ webhookSecret: MOCK_WEBHOOK_SECRET });
    expect((await mock.verify("KTH-ABC")).status).toBe("pending");
  });

  it("builds signed charge.success bodies that pass verification", () => {
    const mock = new MockPaystack({ webhookSecret: MOCK_WEBHOOK_SECRET });
    const { rawBody, signature, event } = mock.buildChargeSuccess({ reference: "KTH-ABC", amount: 7500000, currency: "NGN" });
    expect(event).toBe("charge.success");
    expect(verifyWebhookSignature(rawBody, signature, MOCK_WEBHOOK_SECRET)).toBe(true);
    const parsed = parseChargeSuccess(rawBody);
    expect(parsed.data.reference).toBe("KTH-ABC");
    expect(parsed.data.channel).toBe("mock");
  });
});

describe("LivePaystack", () => {
  it("requires a secret key", () => {
    expect(() => new LivePaystack(paystackConfigFromEnv({}))).toThrow(PaystackApiError);
  });
});
