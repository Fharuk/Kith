import { describe, expect, it } from "vitest";
import { evaluateBudget, limitMessage, STEP_BUDGETS, GLOBAL_BUDGET } from "@/lib/verification-limits";
import { inResendCooldown, needsEmailConfirmation, RESEND_COOLDOWN_MS, TOKEN_TTL_MS } from "@/lib/email-verification";

/**
 * Abuse limits on the identity gates and the email-confirmation rules. These exist because
 * KYC lookups cost money per call and a leaked NIN can be brute-forced against name/DOB
 * combinations — the budget is the control that makes that pointless.
 */

describe("evaluateBudget", () => {
  const policy = { limit: 3, windowMs: 60_000 };
  const now = 1_000_000;

  it("allows attempts inside the budget", () => {
    expect(evaluateBudget([], policy, now)).toEqual({ allowed: true, used: 0, limit: 3, retryAfterMinutes: 0 });
    expect(evaluateBudget([now - 1000, now - 2000], policy, now).allowed).toBe(true);
  });

  it("blocks once the budget is spent and reports the wait from the OLDEST attempt", () => {
    const state = evaluateBudget([now - 30_000, now - 20_000, now - 10_000], policy, now);
    expect(state.allowed).toBe(false);
    expect(state.used).toBe(3);
    expect(state.retryAfterMinutes).toBe(1); // oldest ages out in 30s → rounded up
  });

  it("forgets attempts outside the window", () => {
    const state = evaluateBudget([now - 120_000, now - 90_000, now - 5_000], policy, now);
    expect(state.used).toBe(1);
    expect(state.allowed).toBe(true);
  });

  it("keeps the documented per-step budgets", () => {
    expect(STEP_BUDGETS.nin.limit).toBe(5);
    expect(STEP_BUDGETS.matric.limit).toBe(5);
    expect(STEP_BUDGETS.biometric.limit).toBe(3);
    expect(GLOBAL_BUDGET.limit).toBe(12);
  });

  it("tells the student how long to wait without revealing risk scoring", () => {
    const msg = limitMessage({ allowed: false, used: 5, limit: 5, retryAfterMinutes: 42 });
    expect(msg).toContain("42 minutes");
    expect(msg.toLowerCase()).not.toContain("fraud");
  });
});

describe("email confirmation rules", () => {
  it("grandfathers accounts verified through KYC and confirmed addresses", () => {
    expect(needsEmailConfirmation({ emailVerifiedAt: new Date(), isVerified: false })).toBe(false);
    expect(needsEmailConfirmation({ emailVerifiedAt: null, isVerified: true })).toBe(false);
    expect(needsEmailConfirmation({ emailVerifiedAt: null, isVerified: false })).toBe(true);
  });

  it("cooldowns resends for two minutes", () => {
    const now = Date.now();
    expect(inResendCooldown(new Date(now - 10_000), now)).toBe(true);
    expect(inResendCooldown(new Date(now - RESEND_COOLDOWN_MS - 1), now)).toBe(false);
    expect(inResendCooldown(null, now)).toBe(false);
  });

  it("expires links after 24 hours", () => {
    expect(TOKEN_TTL_MS).toBe(24 * 60 * 60 * 1000);
  });
});
