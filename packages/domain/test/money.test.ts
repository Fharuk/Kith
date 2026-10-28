import { describe, expect, it } from "vitest";
import { fromNgnString, formatNgn, splitPayment, fromKobo, MoneyError, subtract } from "../src/money";

describe("money parsing", () => {
  it("parses plain, grouped and symbol-prefixed amounts", () => {
    expect(fromNgnString("45000")).toBe(4_500_000n);
    expect(fromNgnString("45,000")).toBe(4_500_000n);
    expect(fromNgnString("₦45,000.50")).toBe(4_500_050n);
    expect(fromNgnString("0.05")).toBe(5n);
  });
  it("rejects garbage", () => {
    for (const bad of ["", "abc", "-5", "1.234", "12..3", "₦"]) {
      expect(() => fromNgnString(bad)).toThrow(MoneyError);
    }
  });
});

describe("formatting", () => {
  it("groups en-NG and omits zero kobo", () => {
    expect(formatNgn(4_500_000n)).toBe("₦45,000");
    expect(formatNgn(4_500_050n)).toBe("₦45,000.50");
    expect(formatNgn(0n)).toBe("₦0");
    expect(formatNgn(1_000_000_00n)).toBe("₦1,000,000");
  });
});

describe("split", () => {
  it("85/15 on the canonical ₦50,000", () => {
    const s = splitPayment(5_000_000n, 1500);
    expect(s.platformKobo).toBe(750_000n);
    expect(s.landlordKobo).toBe(4_250_000n);
  });
  it("conserves money for every kobo value 0..200k (property sweep)", () => {
    for (let i = 0; i <= 200_000; i += 7) {
      const total = BigInt(i);
      const s = splitPayment(total, 1500);
      expect(s.platformKobo + s.landlordKobo).toBe(total);
      expect(s.platformKobo).toBe((total * 1500n) / 10_000n);
    }
  });
  it("rejects out-of-range bps", () => {
    expect(() => splitPayment(100n, 10_001)).toThrow(MoneyError);
    expect(() => splitPayment(100n, -1)).toThrow(MoneyError);
  });
});

describe("guards", () => {
  it("subtract refuses negatives; fromKobo refuses negatives", () => {
    expect(() => subtract(1n, 2n)).toThrow(MoneyError);
    expect(() => fromKobo(-5)).toThrow(MoneyError);
  });
});
