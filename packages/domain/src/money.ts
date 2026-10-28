/**
 * Money for Kith. Source of truth is **minor units (kobo)** as bigint.
 * NGN strings exist only at the presentation edge. No floats, ever.
 */
export type Kobo = bigint;
export type Currency = "NGN";

export class MoneyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MoneyError";
  }
}

const KOBO_PER_NAIRA = 100n;

/** Parse a user/API string like "45000", "45,000", "₦45,000.50" into kobo (round half-up). */
export function fromNgnString(input: string): Kobo {
  const cleaned = input.replace(/[₦\s,]/g, "");
  if (!/^\d+(\.\d{1,2})?$/.test(cleaned)) {
    throw new MoneyError(`Invalid NGN amount: "${input}"`);
  }
  const [whole, frac = ""] = cleaned.split(".");
  const fracPadded = (frac + "00").slice(0, 2);
  return BigInt(whole) * KOBO_PER_NAIRA + BigInt(fracPadded);
}

export function fromKobo(k: Kobo | number | string): Kobo {
  const v = typeof k === "bigint" ? k : BigInt(k);
  if (v < 0n) throw new MoneyError("Negative money is not representable here");
  return v;
}

/** "₦45,000" — en-NG grouping, no decimals (kobo shown only when non-zero). */
export function formatNgn(k: Kobo): string {
  const sign = k < 0n ? "-" : "";
  const abs = k < 0n ? -k : k;
  const naira = abs / KOBO_PER_NAIRA;
  const kobo = abs % KOBO_PER_NAIRA;
  const grouped = naira.toLocaleString("en-NG");
  return kobo === 0n ? `${sign}₦${grouped}` : `${sign}₦${grouped}.${kobo.toString().padStart(2, "0")}`;
}

export interface Split {
  platformKobo: Kobo;
  landlordKobo: Kobo;
  totalKobo: Kobo;
}

/**
 * Platform take in basis points (1500 = 15%). Integer math only.
 * The landlord absorbs the integer-division remainder so platform+landlord === total, always.
 */
export function splitPayment(total: Kobo, platformBps: number): Split {
  if (!Number.isInteger(platformBps) || platformBps < 0 || platformBps > 10_000) {
    throw new MoneyError(`platformBps must be 0..10000, got ${platformBps}`);
  }
  const platform = (total * BigInt(platformBps)) / 10_000n;
  return { platformKobo: platform, landlordKobo: total - platform, totalKobo: total };
}

export function add(a: Kobo, b: Kobo): Kobo {
  return a + b;
}
export function subtract(a: Kobo, b: Kobo): Kobo {
  const r = a - b;
  if (r < 0n) throw new MoneyError("Subtraction would go negative");
  return r;
}
export function compare(a: Kobo, b: Kobo): -1 | 0 | 1 {
  return a < b ? -1 : a > b ? 1 : 0;
}
