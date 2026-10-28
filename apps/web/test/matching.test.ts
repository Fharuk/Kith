import { describe, expect, it } from "vitest";
import { compatibilityScore, rankMatches, type RoommateProfileShape } from "@/lib/roommate-matching";
import { MIN_SAMPLES, priceBand, priceVerdict, verdictCopy } from "@/lib/fair-price";

const base = (over: Partial<RoommateProfileShape> = {}): RoommateProfileShape => ({
  userId: "a",
  universityId: "uni-1",
  budgetMinKobo: 60_000_00,
  budgetMaxKobo: 100_000_00,
  gender: "female",
  genderPreference: "female",
  sleepSchedule: "early_bird",
  cleanliness: 4,
  smoker: false,
  guests: "sometimes",
  course: "Law",
  ...over,
});

describe("roommate matching", () => {
  it("scores an identical profile highly and explains why", () => {
    const result = compatibilityScore(base(), base({ userId: "b" }));
    expect(result.score).toBeGreaterThanOrEqual(90);
    expect(result.reasons).toContain("Same university");
    expect(result.blockers).toHaveLength(0);
  });

  it("blocks a share that one side's gender preference rules out", () => {
    const result = compatibilityScore(base({ genderPreference: "female" }), base({ userId: "b", gender: "male", genderPreference: "any" }));
    expect(result.score).toBe(0);
    expect(result.blockers.join(" ")).toMatch(/gender/i);
  });

  it("blocks non-overlapping budgets and smoking mismatches", () => {
    expect(compatibilityScore(base(), base({ userId: "b", budgetMinKobo: 300_000_00, budgetMaxKobo: 400_000_00 })).blockers).toContain(
      "Your budgets do not overlap",
    );
    expect(compatibilityScore(base(), base({ userId: "b", smoker: true })).blockers).toContain(
      "One of you smokes and the other does not",
    );
  });

  it("rewards shared habits and penalises sleep and tidiness gaps", () => {
    const close = compatibilityScore(base(), base({ userId: "b" })).score;
    const far = compatibilityScore(base(), base({ userId: "b", sleepSchedule: "night_owl", cleanliness: 1 })).score;
    expect(close).toBeGreaterThan(far);
  });

  it("drops blocked candidates from the ranked list and orders by fit", () => {
    const ranked = rankMatches(base(), [
      base({ userId: "b", cleanliness: 4 }),
      base({ userId: "c", cleanliness: 1, sleepSchedule: "night_owl" }),
      base({ userId: "d", smoker: true }),
    ]);
    expect(ranked.map((r) => r.candidate.userId)).toEqual(["b", "c"]);
    expect(ranked[0]!.match.score).toBeGreaterThanOrEqual(ranked[1]!.match.score);
  });
});

describe("fair-price bands", () => {
  const prices = [80_000n, 90_000n, 100_000n, 120_000n, 150_000n].map((p) => p * 100n);

  it("refuses to invent a band from a thin sample", () => {
    expect(priceBand(prices.slice(0, MIN_SAMPLES - 1))).toBeNull();
  });

  it("computes quartiles from real listings", () => {
    const band = priceBand(prices)!;
    expect(band.samples).toBe(5);
    expect(band.medianKobo).toBe(100_000_00n);
    expect(band.p25Kobo).toBeLessThan(band.medianKobo);
    expect(band.p75Kobo).toBeGreaterThan(band.medianKobo);
  });

  it("classifies prices against the band", () => {
    const band = priceBand(prices);
    expect(priceVerdict(70_000_00n, band)).toBe("below");
    expect(priceVerdict(100_000_00n, band)).toBe("fair");
    expect(priceVerdict(400_000_00n, band)).toBe("above");
    expect(priceVerdict(0n, band)).toBe("unknown");
    expect(priceVerdict(100_000_00n, null)).toBe("unknown");
  });

  it("never claims confidence it does not have", () => {
    expect(verdictCopy("unknown", null).headline).toMatch(/Not enough/i);
    expect(verdictCopy("above", priceBand(prices)).detail).toMatch(/Proof of Room/i);
  });
});
