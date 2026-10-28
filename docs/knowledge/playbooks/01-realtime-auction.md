# Playbook 01 — Realtime Auction Engine

Distilled from `v3 BidManager/WaterfallQueue` (defects fixed), `realtime-concurrency` skills
(distributed locks, BullMQ), and Socket.io best practice. Read
`.cache/skills-src/PostHog_skills/...` no — for concurrency theory consult registry bucket
`realtime-concurrency`; the patterns below are the Kith-standard implementation.

## Money type
```ts
// packages/domain/src/money.ts — bigint kobo ONLY
export type Kobo = bigint;
export const ngn = (k: Kobo) => `₦${(Number(k) / 100).toLocaleString('en-NG', { maximumFractionDigits: 0 })}`;
export const fromNgnString = (s: string): Kobo => { /* parse, round half-up, throw on NaN/negative */ };
export const split = (amount: Kobo, platformBps: number) => {
  const platform = (amount * BigInt(platformBps)) / 10000n;   // integer math, no float
  return { platform, landlord: amount - platform };           // landlord absorbs remainder
};
```
Never `Number` for arithmetic above ₦9 quadrillion-safe range is irrelevant; the real reason is
float rounding on splits. Decimal strings are only for wire formats Paystack demands (it takes kobo ints).

## Lock with ownership (fixes defect #2)
```ts
const token = crypto.randomUUID();
const ok = await redis.set(`lock:auction:${id}`, token, 'PX', 5000, 'NX');
// release: Lua CAS — never bare DEL
const REL = `if redis.call("get",KEYS[1])==ARGV[1] then return redis.call("del",KEYS[1]) else return 0 end`;
```
On contention: retry 3× with 50/100/150ms jitter, then `bid_rejected{code:'CONTENTION'}` (not "System Busy").

## Bid critical section (order matters)
1. zod-validate `{auctionId, amountKobo, idempotencyKey}`.
2. Principal from `socket.data.user` (handshake-verified) — **never** from payload.
3. Token bucket: 10 bids/min/user/auction; 60/min/user global (anti-snipe DoS).
4. Idempotency: `idempotency_keys(scope='bid', key)` unique → duplicate returns original result.
5. Acquire lock → load state (Redis HIT, else hydrate from `auctions` row + replay `bids`).
6. Rules: status ∈ {active, extended}; `now < actualEndTime`; bidder verified student;
   bidder ≠ landlord; `amount ≥ current + minIncrement`; `amount ≥ floorPrice`;
   optional anti-collusion: cap bid ≤ floor × 50 (config).
7. **DB transaction**: `INSERT bids`, `UPDATE auctions SET current_price_kobo, winning_student_id, total_bids+1`.
8. Write Redis hot state (price, winner, end, version++).
9. Soft close: if `now + 2min > actualEndTime` → `actualEndTime = now + 5min`, status `extended`,
   emit `auction_extended`.
10. Emit `bid_accepted` (to bidder) + `bid_placed` (room) with `version` so clients can drop stale frames.
11. Release lock (Lua CAS).

## Settlement & waterfall (fixes #5/#6)
- BullMQ repeatable job (15s): `status IN (active,extended) AND actual_end_time <= now` →
  `completed`, freeze state, emit `auction_ended`, enqueue `charge-winner`.
- `charge-winner`: create `transactions(type=auction_payment, status=pending, escrow=pending)`;
  Paystack **split charge** (subaccount 85%); on `charge.success` webhook → booking + guest pass +
  `escrow=held`, `auto_release_at = checkin + 24h`.
- On charge failure/timeout (15 min): mark bid `withdrawn-by-payment-failure`, offer to next-highest
  bidder via `notification` + socket, 10-min accept window; ladder until exhausted → room relists,
  admin alerted. Every hop is an `audit_logs` entry.

## Crash safety
- Redis state is a cache: `version` + DB `bids` table is truth. On socket-server boot, hydrate all
  `active/extended` auctions from Postgres. `redis_cache_backup` written every N state changes as
  belt-and-braces for in-flight seconds.

## Test matrix (packages/testing)
- 200 concurrent sockets, one auction: exactly one winner, monotonic prices, no lost bids.
- Lock contention: kill holder mid-section → lock expires, no deadlock.
- Soft close: bid at T-30s extends exactly once per window.
- Crash: SIGKILL realtime mid-bid → restart → state == DB; no duplicate bids via idempotency.
- Waterfall: force winner charge failure → 2nd bidder offered, accept path completes booking.
