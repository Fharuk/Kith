import { describe, expect, it } from "vitest";
import {
  applyBid, evaluateBid, BID_REJECTION, DEFAULT_AUCTION_DURATION_MS,
  SOFT_CLOSE_EXTENSION_MS, type AuctionState,
} from "../src/auction";
import { fromKobo } from "../src/money";

const T0 = 1_700_000_000_000;
const state = (over: Partial<AuctionState> = {}): AuctionState => ({
  id: "a1", roomId: "r1", landlordId: "landlord",
  currentPriceKobo: fromKobo(5_000_000), floorPriceKobo: fromKobo(4_000_000),
  minIncrementKobo: fromKobo(100_000),
  scheduledEndTime: T0 + DEFAULT_AUCTION_DURATION_MS, actualEndTime: T0 + DEFAULT_AUCTION_DURATION_MS,
  status: "active", winningStudentId: null, totalBids: 0, version: 1,
  ...over,
});
const bid = (amountNairaKobo: bigint, over: Partial<Parameters<typeof evaluateBid>[1]> = {}) => ({
  bidderId: "student", amountKobo: amountNairaKobo, now: T0, isVerifiedStudent: true, ...over,
});

describe("evaluateBid", () => {
  it("accepts a valid opening bid", () => {
    expect(evaluateBid(state(), bid(5_100_000n))).toEqual({ ok: true, extended: false, newEndTime: T0 + DEFAULT_AUCTION_DURATION_MS });
  });
  it("rejects below increment and below floor", () => {
    expect(evaluateBid(state(), bid(5_050_000n))).toMatchObject({ ok: false, code: BID_REJECTION.TOO_LOW });
    expect(evaluateBid(state(), bid(3_900_000n))).toMatchObject({ ok: false, code: BID_REJECTION.BELOW_FLOOR });
  });
  it("rejects ended, cancelled, landlord self-bid, unverified", () => {
    expect(evaluateBid(state({ actualEndTime: T0 - 1 }), bid(6_000_000n))).toMatchObject({ code: BID_REJECTION.ENDED });
    expect(evaluateBid(state({ status: "cancelled" }), bid(6_000_000n))).toMatchObject({ code: BID_REJECTION.NOT_ACTIVE });
    expect(evaluateBid(state(), bid(6_000_000n, { bidderId: "landlord" }))).toMatchObject({ code: BID_REJECTION.SELF_BID });
    expect(evaluateBid(state(), bid(6_000_000n, { isVerifiedStudent: false }))).toMatchObject({ code: BID_REJECTION.NOT_VERIFIED });
  });
  it("soft-close: bid inside final 2 minutes extends by exactly 5 minutes", () => {
    const late = state();
    const now = late.actualEndTime - 30_000;
    const d = evaluateBid(late, bid(6_000_000n, { now }));
    expect(d).toEqual({ ok: true, extended: true, newEndTime: now + SOFT_CLOSE_EXTENSION_MS });
  });
  it("anti-collusion ceiling rejects 51x floor", () => {
    expect(evaluateBid(state(), bid(4_000_000n * 51n))).toMatchObject({ ok: false });
  });
});

describe("applyBid", () => {
  it("advances price, winner, count and version immutably", () => {
    const before = state();
    const after = applyBid(before, bid(6_000_000n), before.actualEndTime);
    expect(after.currentPriceKobo).toBe(6_000_000n);
    expect(after.winningStudentId).toBe("student");
    expect(after.totalBids).toBe(1);
    expect(after.version).toBe(2);
    expect(before.version).toBe(1); // untouched
  });
  it("marks extended when the end moved", () => {
    const before = state();
    const after = applyBid(before, bid(6_000_000n), before.actualEndTime + SOFT_CLOSE_EXTENSION_MS);
    expect(after.status).toBe("extended");
  });
});
