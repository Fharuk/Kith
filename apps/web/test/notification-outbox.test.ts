import { describe, expect, it } from "vitest";
import { retryDelayFor, shouldRetry, MAX_DELIVERY_ATTEMPTS } from "@/lib/providers/notify";

/**
 * The outbox is what makes "the email is on its way" true rather than hopeful. The ladder is
 * pure logic, so it is pinned here: a regression that retries every second would burn the
 * vendor quota, and one that gives up after a single try loses receipts.
 */

describe("delivery retry ladder", () => {
  it("backs off progressively", () => {
    const delays = [1, 2, 3, 4, 5].map(retryDelayFor);
    expect(delays[0]).toBe(60_000);
    for (let i = 1; i < delays.length; i++) expect(delays[i]!).toBeGreaterThan(delays[i - 1]!);
  });

  it("clamps beyond the ladder", () => {
    expect(retryDelayFor(9)).toBe(retryDelayFor(5));
    expect(retryDelayFor(0)).toBe(60_000);
  });

  it("stops after five attempts", () => {
    expect(MAX_DELIVERY_ATTEMPTS).toBe(5);
    expect(shouldRetry(4)).toBe(true);
    expect(shouldRetry(5)).toBe(false);
    expect(shouldRetry(6)).toBe(false);
  });
});
