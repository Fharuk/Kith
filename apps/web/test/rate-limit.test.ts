import { describe, expect, it } from "vitest";
import { evaluate, MemoryLimitStore, policyFor, API_POLICY } from "@/lib/rate-limit";

/**
 * The rate limiter is a security control, so it gets tests: budget accounting, window
 * rollover, per-key isolation, and the tighter per-route policies that protect money and
 * identity endpoints.
 */

const store = () => new MemoryLimitStore();

describe("evaluate", () => {
  it("allows exactly the budget then blocks", () => {
    const s = store();
    const policy = { limit: 3, windowMs: 1000 };
    const now = 1_000_000;
    const results = [0, 1, 2, 3].map(() => evaluate("ip:1.1.1.1", policy, now, s));
    expect(results.slice(0, 3).every((r) => r.allowed)).toBe(true);
    expect(results[3]!.allowed).toBe(false);
    expect(results[2]!.remaining).toBe(0);
  });

  it("reports a retry-after inside the window", () => {
    const s = store();
    const policy = { limit: 1, windowMs: 60_000 };
    evaluate("ip:x", policy, 5_000, s);
    const blocked = evaluate("ip:x", policy, 15_000, s);
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
    expect(blocked.retryAfterSeconds).toBeLessThanOrEqual(60);
  });

  it("rolls the window forward instead of counting forever", () => {
    const s = store();
    const policy = { limit: 2, windowMs: 1_000 };
    evaluate("ip:y", policy, 0, s);
    evaluate("ip:y", policy, 10, s);
    expect(evaluate("ip:y", policy, 20, s).allowed).toBe(false);
    // every earlier hit aged out
    expect(evaluate("ip:y", policy, 5_000, s).allowed).toBe(true);
  });

  it("keeps callers isolated — one abuser cannot lock out everyone", () => {
    const s = store();
    const policy = { limit: 1, windowMs: 60_000 };
    expect(evaluate("ip:noisy", policy, 0, s).allowed).toBe(true);
    expect(evaluate("ip:noisy", policy, 0, s).allowed).toBe(false);
    expect(evaluate("ip:quiet", policy, 0, s).allowed).toBe(true);
  });
});

describe("policyFor", () => {
  it("defaults to 100 requests per 15 minutes", () => {
    expect(policyFor("/api/rooms")).toEqual(API_POLICY);
    expect(API_POLICY.limit).toBe(100);
    expect(API_POLICY.windowMs).toBe(15 * 60 * 1000);
  });

  it("tightens sign-in, checkout, verification and porter lookups", () => {
    expect(policyFor("/api/auth/callback/credentials").limit).toBe(10);
    expect(policyFor("/api/checkout/pay").limit).toBe(20);
    expect(policyFor("/api/verify/nin").limit).toBe(15);
    expect(policyFor("/api/porter/verify-code").windowMs).toBe(60_000);
  });
});
