import type { Kobo } from "./money";
import { fromKobo } from "./money";

export const ROOM_TIERS = ["circle", "elite", "market"] as const;
export type RoomTier = (typeof ROOM_TIERS)[number];

export const SALE_MODES = ["auction", "fixed"] as const;
export type SaleMode = (typeof SALE_MODES)[number];

export interface TierSpec {
  tier: RoomTier;
  label: string;
  saleMode: SaleMode;
  /** Inclusive guide band in kobo, used for search filters + listing validation. */
  bandKobo: readonly [Kobo, Kobo];
  blurb: string;
}

export const TIERS: Record<RoomTier, TierSpec> = {
  circle: {
    tier: "circle",
    label: "Circle",
    saleMode: "auction",
    bandKobo: [fromKobo(4_000_000), fromKobo(7_000_000)], // ₦40k – ₦70k
    blurb: "High-demand rooms let to the highest verified bidder in a live, soft-closing auction.",
  },
  market: {
    tier: "market",
    label: "Market",
    saleMode: "fixed",
    bandKobo: [fromKobo(6_000_000), fromKobo(10_000_000)], // ₦60k – ₦100k
    blurb: "Straightforward fixed-price rooms. Book, pay, move in.",
  },
  elite: {
    tier: "elite",
    label: "Elite",
    saleMode: "fixed",
    bandKobo: [fromKobo(12_000_000), fromKobo(18_000_000)], // ₦120k – ₦180k
    blurb: "Premium, physically-verified homes with concierge porter service.",
  },
};

export function tierOf(mode: SaleMode): RoomTier[] {
  return ROOM_TIERS.filter((t) => TIERS[t].saleMode === mode);
}

export function priceWithinBand(tier: RoomTier, price: Kobo): boolean {
  const [lo, hi] = TIERS[tier].bandKobo;
  return price >= lo && price <= hi;
}
