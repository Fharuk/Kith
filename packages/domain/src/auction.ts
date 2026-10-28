import type { Kobo } from "./money";

export const AUCTION_STATUSES = ["active", "extended", "completed", "cancelled"] as const;
export type AuctionStatus = (typeof AUCTION_STATUSES)[number];

export const BID_REJECTION = {
  NOT_ACTIVE: "auction_not_active",
  ENDED: "auction_ended",
  TOO_LOW: "bid_below_increment",
  BELOW_FLOOR: "bid_below_floor",
  SELF_BID: "landlord_cannot_bid",
  NOT_VERIFIED: "student_not_verified",
  RATE_LIMITED: "rate_limited",
  CONTENTION: "contention",
  DUPLICATE: "duplicate_bid",
} as const;
export type BidRejectionCode = (typeof BID_REJECTION)[keyof typeof BID_REJECTION];

export interface AuctionState {
  id: string;
  roomId: string;
  landlordId: string;
  currentPriceKobo: Kobo;
  floorPriceKobo: Kobo;
  minIncrementKobo: Kobo;
  scheduledEndTime: number; // epoch ms
  actualEndTime: number; // epoch ms (soft-close may push this out)
  status: AuctionStatus;
  winningStudentId: string | null;
  totalBids: number;
  version: number;
}

export const SOFT_CLOSE_WINDOW_MS = 2 * 60 * 1000;
export const SOFT_CLOSE_EXTENSION_MS = 5 * 60 * 1000;
export const DEFAULT_AUCTION_DURATION_MS = 12 * 60 * 1000;
/** Anti-collusion ceiling: bids above 50× floor are rejected as suspicious. */
export const MAX_FLOOR_MULTIPLE = 50n;

export interface BidIntent {
  bidderId: string;
  amountKobo: Kobo;
  now: number;
  isVerifiedStudent: boolean;
}

export type BidDecision =
  | { ok: true; extended: boolean; newEndTime: number }
  | { ok: false; code: BidRejectionCode };

/**
 * Pure auction rules — no I/O. The realtime service wraps this in a lock + DB transaction.
 * Returns whether a soft-close extension applies; the caller mutates state via {@link applyBid}.
 */
export function evaluateBid(state: AuctionState, intent: BidIntent): BidDecision {
  if (state.status !== "active" && state.status !== "extended") {
    return { ok: false, code: BID_REJECTION.NOT_ACTIVE };
  }
  if (intent.now >= state.actualEndTime) return { ok: false, code: BID_REJECTION.ENDED };
  if (intent.bidderId === state.landlordId) return { ok: false, code: BID_REJECTION.SELF_BID };
  if (!intent.isVerifiedStudent) return { ok: false, code: BID_REJECTION.NOT_VERIFIED };
  if (intent.amountKobo < state.floorPriceKobo) return { ok: false, code: BID_REJECTION.BELOW_FLOOR };
  if (intent.amountKobo < state.currentPriceKobo + state.minIncrementKobo) {
    return { ok: false, code: BID_REJECTION.TOO_LOW };
  }
  if (intent.amountKobo > state.floorPriceKobo * MAX_FLOOR_MULTIPLE) {
    return { ok: false, code: BID_REJECTION.TOO_LOW };
  }
  const extended = intent.now + SOFT_CLOSE_WINDOW_MS > state.actualEndTime;
  return { ok: true, extended, newEndTime: extended ? intent.now + SOFT_CLOSE_EXTENSION_MS : state.actualEndTime };
}

/** Immutable state transition for an accepted bid. */
export function applyBid(state: AuctionState, intent: BidIntent, newEndTime: number): AuctionState {
  return {
    ...state,
    currentPriceKobo: intent.amountKobo,
    winningStudentId: intent.bidderId,
    totalBids: state.totalBids + 1,
    actualEndTime: newEndTime,
    status: newEndTime > state.actualEndTime || state.status === "extended" ? "extended" : state.status,
    version: state.version + 1,
  };
}

export function isSettled(state: AuctionState, now: number): boolean {
  return state.status === "completed" || state.status === "cancelled" || now >= state.actualEndTime;
}
