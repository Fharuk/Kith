# Kith — Your Verified Student Community

Verified Nigerian student housing. NIMC-checked students, porter-inspected homes, and
Paystack escrow that only releases when you are through the door. Launching at FUNAAB
and UNILAG; the product is not limited to them.

**Live preview:** web on `:3000`, realtime auction service on `:3001`.

---

## Run it

```bash
pnpm install
cp apps/web/.env.example apps/web/.env.local      # AUTH_SECRET is required
pnpm --filter @kith/database db:seed              # migrations + demo data (idempotent)
pnpm --filter @kith/web dev                       # http://localhost:3000
pnpm --filter @kith/realtime dev                  # http://localhost:3001
```

**Demo logins** — password `demo1234` for all four:

| Account | Email | Lands on |
|---|---|---|
| Student (fully verified) | `student@demo.kith.ng` | `/dashboard` |
| Landlord | `landlord@demo.kith.ng` | `/landlord` |
| Porter | `porter@demo.kith.ng` | `/porter` |
| Admin | `admin@demo.kith.ng` | `/admin` |

No Postgres server is needed: the database package falls back to **PGlite** (real
PostgreSQL compiled to WASM) persisted at `.cache/pglite`. Set `DATABASE_URL` to switch
to a real server with no code changes.

> **One writer per data directory.** PGlite is embedded, not a server: run `db:seed`
> only while the web dev server is stopped, and never point two processes at the same
> directory. In production (Postgres) this limitation disappears.

## What actually works end to end

1. **Reserve → pay → escrow → pass.** `reserveRoom` writes a *pending* booking and a
   *pending* 85/15 transaction, holds the room, then sends the student to Paystack — or to
   the hosted test checkout at `/checkout/mock` when no live key is configured. Nothing is
   confirmed until a **signed** `charge.success` webhook arrives: that flips the booking to
   confirmed, moves escrow `pending → held`, mints the guest pass, and notifies both sides.
   Tampered amounts, wrong signatures and replays are refused or ignored, and audited.
2. **Porter terminal.** A rotating 6-digit TOTP (300s step, ±1 window grace) resolves to a
   booking; confirming check-in sets the booking to `checked_in`, completes the porter task,
   and releases escrow `held → released` to the landlord at net-of-fee.
3. **Circle auctions.** Server-authoritative bidding on DB state with domain rules
   (floor, increment, verified-students-only, soft-close +5 min inside the last 2 min),
   optimistic version guards, idempotency keys and 20 bids/min. The settlement worker
   completes due auctions, creates the winner's payable booking, and cancels bidless ones.
   Escrow auto-release runs on the same worker pass (24h window).
4. **Verification.** NIN (NIMC name + DOB match, NIN stored only as a salted hash) → matric
   pattern + institutional email domain → biometric liveness.
5. **Money leaves as well as arrives.** Escrow release queues a payout for the landlord's
   **bank-verified** account (the name comes back from the bank, never typed by the
   landlord); the worker pushes transfers on a retry ladder, `transfer.*` webhooks settle
   failures and reversals, and ops can retry, cancel or hold an account. Verified end to end:
   check-in → ₦76,500 released → queued → transferred → `paid`.
6. **Disputes.** A student or landlord can flag a payment; escrow freezes and any queued
   payout is cancelled. Ops settle by refund / release / split — money moves once, both
   parties are emailed the finding, and everything is audited.
7. **Identity abuse controls.** Signup emails a single-use 24h confirmation link (hashed,
   POST-consumed so link scanners cannot burn it) and the KYC gates are budgeted per user:
   5/hr NIN, 5/hr matric, 3/hr biometric, 12/hr overall.
8. **Listings by landlords.** Tier decides sale mode, the tier band bounds the price, Circle
   opens a live 12-minute auction, and every property starts unverified with a porter visit
   auto-assigned to the porter with the lightest load. Only that porter can verify it.
9. **Search that joins up.** Text, city, price range (auction rooms compare their floor),
   tier, sale mode, porter-verified, amenities, sorting, pagination and honest facet counts.
10. **All six surfaces** (landing, search, student dashboard + auctions, landlord console,
    porter terminal, admin console) plus legal pages, sitemap/robots, structured data and a
    keyboard-accessible shell.

## Mocked vs live (env-only switches)

| Capability | Default | Switch |
|---|---|---|
| Payments | `MockPaystack` → hosted test checkout, HMAC-signed webhook | `PAYSTACK_SECRET_KEY`, `PAYSTACK_WEBHOOK_SECRET` |
| Identity | `MockNimc` (11 digits; `00000000000` = not found) | `NIMC_API_KEY` + `NIMC_BASE_URL` |
| SMS | logs `[MOUTHPIECE sms]`, row still recorded | `TERMII_API_KEY`, `TERMII_SENDER_ID` |
| Email | logs `[MOUTHPIECE email]` | `RESEND_API_KEY`, `EMAIL_FROM` |
| Database | PGlite on disk | `DATABASE_URL` |
| Redis | in-process store behind the Redis-shaped port | `REDIS_URL` (prod) |

Mock webhooks are **not** a bypass: the mock provider signs its payload with the same
secret and it passes through the same verifier as live traffic.

## Architecture

```
apps/web          Next 16 App Router · RSC + server actions + route handlers
apps/realtime     Express + Socket.io auction engine (lock, idempotency, rate limits)
packages/domain   pure money/tier/auction/escrow rules + state machines (24 tests)
packages/database Drizzle schema (20 tables), PGlite/postgres-js client, seed
packages/paystack Paystack driver port: live REST client + signing mock (13 tests)
```

The web app is the only writer of money state. The realtime service broadcasts; after a
committed auction write the web app fans out to `POST /internal/publish` (shared secret),
and clients also poll as a fallback.

**Dev-specific detail worth knowing:** Next instantiates separate module graphs for RSC and
for route handlers, so the database handle lives on `globalThis` (see
`packages/database/src/client.ts`). Without that, each graph opens its own PGlite engine on
one data directory.

## Verify

```bash
pnpm -r typecheck                                  # 5/5 packages, strict + noUncheckedIndexedAccess
pnpm --filter @kith/domain test                    # 24
pnpm --filter @kith/paystack test                  # 13
pnpm --filter @kith/web test                       # 12
node apps/realtime/test/smoke.mjs                  # live socket: join → bid → soft-close
curl -X POST localhost:3000/api/cron/settle        # settlement + auto-release worker pass
```

Dev-only helpers (404 in production): `/api/dev/reserve`, `/api/dev/auction`,
`/api/dev/auction/end`, `/api/dev/expire-escrow`, `/api/dev/bookings`.

## Design system

Fraunces (display) + Inter (UI) + JetBrains Mono (money/codes) on warm paper `#FAF8F4`.
Brand is locked to the logo: navy `#1E2D5E`, Kith green `#4CAF50`, Kith blue `#29ABE2`.
Gradients are limited to the single hero brand-mesh and low-alpha brand light; the nav and
guest pass are liquid-glass surfaces.

## Operations & deployment

`docs/DEPLOYMENT.md` covers the Vercel + Supabase + realtime topology, the full env matrix,
the go-live checklist (Paystack webhooks, NIMC aggregator, Termii/Resend), the ops runbook
for stuck payouts and disputes, and an honest list of limitations.

`vercel.json` schedules the money worker every minute; `pnpm smoke` (optionally `--auth`)
is the CI-safe HTTP pass over every public surface and both consoles.

## Not built yet

- **Production Redis** — rate limiting is per-process memory today; `MemoryLimitStore` is a
  one-file swap for Upstash when running multi-instance.
- **Live vendor credentials** — Paystack, NIMC, Termii and Resend are mock-complete and
  env-swappable but have not been exercised against live accounts (no keys available here).
- **Browser visual QA** — Playwright's browser download is blocked in this environment; the
  HTML output was inspected directly and `scripts/smoke.mjs` covers regressions.

See `docs/ARCHITECTURE.md` for the decision record and `docs/DEPLOYMENT.md` for the runbook.
