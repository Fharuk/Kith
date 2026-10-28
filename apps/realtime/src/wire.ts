import type { AuctionState } from "@kith/domain";
import type { BidRecord } from "./store";

/** bigint never crosses the wire as bigint (JSON cannot serialize it) — kobo travels as string. */
export interface WireAuctionState {
  id: string;
  roomId: string;
  landlordId: string;
  currentPriceKobo: string;
  floorPriceKobo: string;
  minIncrementKobo: string;
  scheduledEndTime: number;
  actualEndTime: number;
  status: AuctionState["status"];
  winningStudentId: string | null;
  totalBids: number;
  version: number;
}

export const toWireState = (s: AuctionState): WireAuctionState => ({
  ...s,
  currentPriceKobo: s.currentPriceKobo.toString(),
  floorPriceKobo: s.floorPriceKobo.toString(),
  minIncrementKobo: s.minIncrementKobo.toString(),
});

export type WireBid = BidRecord; // amountKobo already a string
