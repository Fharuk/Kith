import { describe, expect, it } from "vitest";
import { formatNgnFromKobo } from "@/lib/auction-wire";

/**
 * Money never crosses a boundary as a float or a bigint-in-JSON. Kobo travels as a
 * decimal string on the wire and is formatted for humans only at the edge.
 */
describe("kobo formatting (wire → UI)", () => {
  it("formats whole naira without decimals", () => {
    expect(formatNgnFromKobo(4_500_000n)).toBe("₦45,000");
    expect(formatNgnFromKobo(15_000_000n)).toBe("₦150,000");
  });

  it("shows kobo only when non-zero", () => {
    expect(formatNgnFromKobo(4_550_050n)).toBe("₦45,500.50");
    expect(formatNgnFromKobo(100n)).toBe("₦1");
  });

  it("groups thousands at every tier", () => {
    expect(formatNgnFromKobo(1_000_000_000n)).toBe("₦10,000,000");
  });

  it("handles zero", () => {
    expect(formatNgnFromKobo(0n)).toBe("₦0");
  });
});
