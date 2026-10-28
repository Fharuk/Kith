/**
 * FAIR-PRICE INTELLIGENCE.
 *
 * Lagos student housing has no reference price: a room that should be ₦80,000 gets quoted at
 * ₦150,000 to anyone who sounds new. We have real listings, so we can show the honest band for
 * the same tier in the same city and let the student judge.
 *
 * Deliberately descriptive, never predictive: we report what comparable rooms are actually
 * advertised at, with the sample size, and refuse to render a band from too few rooms rather
 * than inventing confidence.
 */

export interface PriceBand {
  samples: number;
  p25Kobo: bigint;
  medianKobo: bigint;
  p75Kobo: bigint;
  currency: "NGN";
}

export type PriceVerdict = "below" | "fair" | "above" | "unknown";

export const MIN_SAMPLES = 4;

function percentile(sorted: bigint[], p: number): bigint {
  if (sorted.length === 0) return 0n;
  const idx = Math.min(sorted.length - 1, Math.max(0, Math.round((sorted.length - 1) * p)));
  return sorted[idx]!;
}

/** Quantile band from comparable advertised prices (kobo). Null when the sample is too thin. */
export function priceBand(pricesKobo: bigint[], minimum = MIN_SAMPLES): PriceBand | null {
  const clean = pricesKobo.filter((p) => p > 0n).sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
  if (clean.length < minimum) return null;
  return {
    samples: clean.length,
    p25Kobo: percentile(clean, 0.25),
    medianKobo: percentile(clean, 0.5),
    p75Kobo: percentile(clean, 0.75),
    currency: "NGN",
  };
}

export function priceVerdict(priceKobo: bigint, band: PriceBand | null): PriceVerdict {
  if (!band || priceKobo <= 0n) return "unknown";
  if (priceKobo < band.p25Kobo) return "below";
  if (priceKobo > band.p75Kobo) return "above";
  return "fair";
}

export function verdictCopy(verdict: PriceVerdict, band: PriceBand | null): { headline: string; detail: string } {
  if (!band) {
    return {
      headline: "Not enough comparable rooms yet",
      detail: "We only show a fair-price band once there are a few live listings for this tier and city.",
    };
  }
  switch (verdict) {
    case "below":
      return {
        headline: "Below the typical band",
        detail: `Cheaper than 75% of comparable listings. Ask why — a price this low is sometimes a room that is not available.`,
      };
    case "above":
      return {
        headline: "Above the typical band",
        detail: `Pricier than most comparable listings. Use the Proof of Room report and ask what justifies it.`,
      };
    case "fair":
      return { headline: "Within the typical band", detail: "Priced like the rooms around it." };
    default:
      return { headline: "No price to compare", detail: "This room is sold by auction." };
  }
}
