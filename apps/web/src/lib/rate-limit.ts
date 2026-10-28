/**
 * RATE LIMITING — shared, swappable, boring.
 *
 * The documented contract is "100 requests / 15 minutes per caller on every API route,
 * with tighter budgets on the endpoints that cost money or can be brute-forced".
 *
 * The store is deliberately a tiny interface. Today it is an in-process map (one Node
 * process in dev / one Vercel instance), and swapping in Upstash/Redis later is a one-file
 * change (`RateLimitStore`) with no call-site edits. Keys are caller-scoped, never global,
 * so one abusive client cannot lock everyone out.
 */

export interface RateLimitStore {
  /** Returns the timestamps of accepted hits inside the window and records a new one. */
  hit(key: string, now: number, windowMs: number): { count: number; resetAt: number };
}

export class MemoryLimitStore implements RateLimitStore {
  private readonly hits = new Map<string, number[]>();
  /** Bound memory: drop keys whose newest hit is older than this. */
  private readonly sweepAfterMs = 60 * 60 * 1000;

  hit(key: string, now: number, windowMs: number) {
    const recent = (this.hits.get(key) ?? []).filter((t) => now - t < windowMs);
    recent.push(now);
    this.hits.set(key, recent);
    if (this.hits.size > 5_000) this.sweep(now);
    return { count: recent.length, resetAt: (recent[0] ?? now) + windowMs };
  }

  private sweep(now: number) {
    for (const [key, stamps] of this.hits) {
      const newest = stamps[stamps.length - 1] ?? 0;
      if (now - newest > this.sweepAfterMs) this.hits.delete(key);
    }
  }
}

/** One process-wide store so every route shares the same counters. */
const globalStore = globalThis as unknown as { __kithLimitStore?: MemoryLimitStore };
export const limitStore: RateLimitStore = (globalStore.__kithLimitStore ??= new MemoryLimitStore());

export interface LimitPolicy {
  /** Max accepted requests inside the window. */
  limit: number;
  /** Window length in milliseconds. */
  windowMs: number;
}

export interface LimitDecision {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
  retryAfterSeconds: number;
}

/** Default API budget: 100 requests / 15 minutes. */
export const API_POLICY: LimitPolicy = { limit: 100, windowMs: 15 * 60 * 1000 };

/**
 * Per-route overrides for endpoints that deserve a tighter budget than the API default.
 * Matched as a prefix against the pathname, most specific first.
 */
export const ROUTE_POLICIES: Array<{ prefix: string; policy: LimitPolicy; keyBy?: "ip" | "session" }> = [
  // Credentials sign-in: brute-force surface. Per-IP, 10 attempts / 15 min.
  { prefix: "/api/auth/callback/credentials", policy: { limit: 10, windowMs: 15 * 60 * 1000 } },
  // Checkout initiation mints Paystack authorizations.
  { prefix: "/api/checkout", policy: { limit: 20, windowMs: 15 * 60 * 1000 } },
  // Verification submission burns paid KYC calls (NIMC, liveness).
  { prefix: "/api/verify", policy: { limit: 15, windowMs: 15 * 60 * 1000 } },
  // Bidding stays at its documented 20/min bucket, enforced here as well as in the route.
  { prefix: "/api/auctions", policy: { limit: 40, windowMs: 60 * 1000 } },
  // Porter code lookups are a PHI-adjacent oracle: slow them right down.
  { prefix: "/api/porter", policy: { limit: 30, windowMs: 60 * 1000 } },
];

export function policyFor(pathname: string): LimitPolicy {
  const match = ROUTE_POLICIES.find((r) => pathname.startsWith(r.prefix));
  return match?.policy ?? API_POLICY;
}

export function evaluate(key: string, policy: LimitPolicy, now = Date.now(), store: RateLimitStore = limitStore): LimitDecision {
  const { count, resetAt } = store.hit(key, now, policy.windowMs);
  const allowed = count <= policy.limit;
  return {
    allowed,
    limit: policy.limit,
    remaining: Math.max(0, policy.limit - count),
    resetAt,
    retryAfterSeconds: Math.max(1, Math.ceil((resetAt - now) / 1000)),
  };
}
