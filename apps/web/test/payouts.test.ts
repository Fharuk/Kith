import { describe, expect, it } from "vitest";
import { backoffFor, payoutDestinationReady } from "@/lib/payouts";

/**
 * The payout engine's pure decisions. The DB-facing half is exercised end-to-end (check-in →
 * release → queue → transfer → paid), but these rules must never regress silently:
 * money leaving a landlord's account is not something you discover in production.
 */

describe("backoffFor", () => {
  const now = 1_700_000_000_000;

  it("backs off progressively and never retries faster than a minute", () => {
    const gaps = [1, 2, 3, 4, 5].map((n) => backoffFor(n, now).getTime() - now);
    expect(gaps[0]!).toBeGreaterThanOrEqual(59_000);
    for (let i = 1; i < gaps.length; i++) expect(gaps[i]!).toBeGreaterThan(gaps[i - 1]!);
  });

  it("is deterministic for the same attempt number", () => {
    expect(backoffFor(2, now).getTime()).toBe(backoffFor(2, now).getTime());
  });

  it("clamps attempts beyond the ladder to the longest delay", () => {
    const last = backoffFor(5, now).getTime() - now;
    expect(backoffFor(99, now).getTime() - now).toBe(last);
    expect(backoffFor(0, now).getTime() - now).toBeGreaterThan(0);
  });
});

describe("payoutDestinationReady", () => {
  const verified = {
    bankCode: "058",
    bankAccountNumber: "0123456789",
    bankAccountName: "CHINEDU EZE",
    paystackRecipientCode: "RCP_mock_abc",
    bankVerifiedAt: new Date(),
    payoutHold: false,
  };

  it("accepts a bank-verified recipient with no hold", () => {
    expect(payoutDestinationReady(verified)).toBe(true);
  });

  it("refuses an unverified or partial destination", () => {
    expect(payoutDestinationReady(undefined)).toBe(false);
    expect(payoutDestinationReady({ ...verified, bankCode: null })).toBe(false);
    expect(payoutDestinationReady({ ...verified, bankAccountNumber: null })).toBe(false);
    expect(payoutDestinationReady({ ...verified, bankVerifiedAt: null })).toBe(false);
  });

  it("accepts a verified account whose transfer recipient is minted lazily", () => {
    expect(payoutDestinationReady({ ...verified, paystackRecipientCode: null })).toBe(true);
  });

  it("refuses a destination under compliance hold", () => {
    expect(payoutDestinationReady({ ...verified, payoutHold: true })).toBe(false);
  });
});
