# Deploying Kith

## 0. What is already live

| Piece | Where | Status |
| --- | --- | --- |
| Web app | Vercel project `kith` (team `fharuks-projects`, root `apps/web`) | **READY** — production build `234fba1`, `https://kith-fharuks-projects.vercel.app` (`https://kith-phi-smoky.vercel.app`) |
| Database | Supabase `oinbukfmryzbeijbbqgi` (`eu-west-1`, PG 17) | schema + demo seed applied, login role `kith_app` |
| Realtime relay | — | **not deployed yet** (§3) — UI degrades to polling |
| Worker | Vercel Cron (daily) + `.github/workflows/worker.yml` (5 min) | cron installed; the GitHub workflow no-ops until the `CRON_SECRET` repo secret exists |

Demo logins (seeded): `student@demo.kith.ng` / `landlord@demo.kith.ng` / `porter@demo.kith.ng` /
`admin@demo.kith.ng`, password `demo1234` — porter TOTP secret `demo-secret`.

**Verify the live site** (run from a normal network; this build sandbox blocks `vercel.app`
egress, so the HTTP pass below has *not* been executed against the deployment):

```bash
BASE=https://kith-fharuks-projects.vercel.app
curl -sS -o /dev/null -w '%{http_code}\n' $BASE/ $BASE/find-a-room $BASE/login
curl -sS $BASE/api/health
BASE=$BASE SMOKE_EMAIL=student@demo.kith.ng SMOKE_PASSWORD=demo1234 pnpm smoke --auth
```

If `/api/health` reports the database as unreachable, the pooler string or the `kith_app`
password is wrong — check `DATABASE_URL` in the Vercel project settings (§2) and reconnect.

---

## Overview

Kith is two deployables — a Next.js 16 web app (`apps/web`) and a Socket.io realtime relay
(`apps/realtime`) — over one PostgreSQL database. Everything third-party is behind an
interface with a mock implementation, so the site is fully walkable with **zero vendor keys**
and each key you add flips exactly one integration.

**These credentials are checked in nowhere.** The generated secrets for the live project are in
Vercel env vars and in the Supabase dashboard; rotate them if this repo's history ever holds a
copy.

```
Vercel (apps/web)  ──►  Supabase Postgres (pooler)
        │                       ▲
        │ internal fan-out      │ cron worker (/api/cron/settle, 1 min)
        ▼                       │
Render/Railway (apps/realtime) ─┘  (no DB access — pure relay)
```

---

## 1. Database — Supabase

The project already provisioned for this build is **`oinbukfmryzbeijbbqgi`** (`eu-west-1`,
PostgreSQL 17). All 22 tables, enums, indexes and foreign keys are applied.

**Connection strings** (Project → Settings → Database):

| Use | String | Notes |
| --- | --- | --- |
| Runtime (Vercel) | pooler, port `6543`, `?pgbouncer=true` | serverless-safe, many connections |
| Migrations / scripts | direct, port `5432` | no pooler in the middle |

**Hardening applied to this project**

- a dedicated login role `kith_app` owns the app's grants (`usage` on schema `public`, CRUD on
  tables, `usage` on sequences, plus default privileges for future tables);
- `revoke all on schema public … from anon, authenticated` — the Supabase Data API cannot read
  or write these tables even with the publishable key. Only the app's server-side pooler
  connection can.

**Applying migrations to a fresh project**

```bash
export DATABASE_URL="postgresql://postgres:<password>@db.<ref>.supabase.co:5432/postgres"
pnpm --filter @kith/database db:migrate     # drizzle/0000…0002
pnpm --filter @kith/database db:seed        # demo data — skip in production
```

`drizzle-kit` writes into `packages/database/drizzle`. Never edit an applied migration; add a
new one. (In this sandbox `*.supabase.co` egress is blocked, so the schema was pushed through
the Supabase connector; from CI or your laptop the command above is the normal path.)

**Local development** needs none of the above: with `DATABASE_URL` unset the app uses an
embedded PGlite database at `<repo>/.cache/pglite` and runs migrations automatically before
`pnpm dev`.

---

## 2. Web — Vercel

```bash
vercel link
vercel env add DATABASE_URL production      # pooler string
vercel env add AUTH_SECRET production       # openssl rand -base64 32
vercel env add NEXT_PUBLIC_APP_URL production
vercel env add NEXT_PUBLIC_SOCKET_URL production
vercel env add CRON_SECRET production
vercel --prod
```

`vercel.json` schedules `POST /api/cron/settle` **every minute**. That single endpoint is the
whole worker: auction settlement, 24h escrow auto-release, payout reconciliation + bank
push, and the notification outbox. It is guarded by `CRON_SECRET` and single-flighted with a
Postgres advisory lock, so overlapping ticks are free.

**Scheduling on the current plan.** This project is on Hobby, which rejects anything faster
than once a day, so `vercel.json` runs `/api/cron/settle` once daily (`5 0 * * *`). Five-minute
granularity comes from `.github/workflows/worker.yml`, which POSTs the same endpoint every five
minutes with `Authorization: Bearer ${{ secrets.CRON_SECRET }}`:

```bash
gh secret set CRON_SECRET --repo Fharuk/Kith    # paste the same value as the Vercel env var
```

Until that secret exists the workflow exits green without calling the endpoint (by design, so
a fork cannot hammer production). On a Pro plan, delete the workflow and set the cron back to
`* * * * *`.

---

## 3. Realtime — Render / Railway / Fly

`apps/realtime` is a small Express + Socket.io service with no database access.

```bash
pnpm --filter @kith/realtime build
node apps/realtime/dist/index.js      # PORT=3001
```

- must bind `0.0.0.0`
- `CORS_ORIGINS=https://kith.ng,https://www.kith.ng` (comma separated; origin callback is
  required by socket.io, a bare string fails silently)
- set `INTERNAL_SECRET` to the same value as the web app so `/internal/publish` fan-out is
  authenticated

---

## 4. Environment matrix

| Variable | Required | Unset behaviour |
| --- | --- | --- |
| `DATABASE_URL` | prod | embedded PGlite (dev only) |
| `AUTH_SECRET` | yes | sessions fail |
| `NEXT_PUBLIC_APP_URL` | yes | links/redirects use localhost |
| `NEXT_PUBLIC_SOCKET_URL` | yes | client falls back to same-origin socket |
| `CRON_SECRET` | yes | worker is unauthenticated (dev convenience) |
| `PAYSTACK_SECRET_KEY` / `PAYSTACK_PUBLIC_KEY` / `PAYSTACK_WEBHOOK_SECRET` | for money | mock driver + hosted test checkout |
| `NIMC_API_KEY` + `NIMC_BASE_URL`, `NIN_PEPPER` | for identity | `MockNimc` |
| `TERMII_API_KEY`, `TERMII_SENDER_ID`, `RESEND_API_KEY`, `EMAIL_FROM` | for messaging | `MockNotifier` (logged, still recorded) |
| `INTERNAL_SECRET`, `REALTIME_INTERNAL_URL` | realtime fan-out | dev default |
| `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` | optional | no analytics script at all |

**Going live with Paystack:** webhook URL `https://<domain>/api/webhooks/paystack`, events
`charge.success`, `transfer.success`, `transfer.failed`, `transfer.reversed`,
`refund.processed`. The route verifies the `x-paystack-signature` HMAC over the raw body and
is idempotent per reference/transfer.

---

## 5. Verification

```bash
pnpm -r typecheck                 # strict, whole workspace
pnpm --filter @kith/domain test   # money + escrow + auction state machines
pnpm --filter @kith/paystack test # amounts, signatures, transfer mapping
pnpm --filter @kith/web test      # rate limits, KYC budgets, payout ladder, TOTP
pnpm smoke                        # HTTP pass over every public surface
SMOKE_EMAIL=… SMOKE_PASSWORD=… pnpm smoke --auth   # plus authenticated consoles
```

Browser-driven visual QA (Playwright) is not available in this build environment — its
browser download is blocked — so visual checks were done by rendering real pages and
inspecting the HTML output. `scripts/smoke.mjs` is the CI-safe substitute and asserts both
status codes and content markers, because a 200 rendering an error boundary is still broken.

---

## 6. Operations runbook

| Situation | What to do |
| --- | --- |
| Payout stuck `failed` | Admin → payouts shows the vendor reason; fix bank details (re-verifies), then retry. 5 attempts then it holds for ops. |
| Landlord says "no money" | Check `payouts.transfer_reference` and the Paystack dashboard; `transfer.reversed` webhooks land automatically. |
| Dispute opened | Escrow freezes and any queued payout cancels. Resolve in Admin → refund / release / split; both parties are emailed. |
| Verification abuse | `verification_attempts` records every try. Budgets: 5/hr NIN, 5/hr matric, 3/hr biometric, 12/hr overall. |
| Notification not delivered | `notifications.delivery_status` / `delivery_attempts` / `last_error`. Worker retries 5 times (1m/5m/30m/2h/8h). |
| Worker not running | `/api/cron/settle` returns 202 when another pass holds the advisory lock; 401 means `CRON_SECRET` mismatch. |

---

## 7. Known limitations (honest list)

- **Paystack payouts** are complete in mock and against the documented API, but were not
  exercised against a live Paystack account (no keys in this environment). The mock's test
  hooks (accounts ending `00` fail, `99` stay pending) cover the branches.
- **NIMC / liveness** are mock drivers: the real NIN lookup needs a licensed aggregator
  (Smile ID / Dojah / VerifyMe) and a signed merchant agreement. The interface is ready —
  `providers/nimc.ts` takes a `NIMC_BASE_URL` and bearer key.
- **Rate limiting** is per-process memory. On Vercel's multi-instance runtime, swap
  `MemoryLimitStore` for Upstash Redis (one file, same interface) for a global budget.
- **PGlite** is a development convenience, not a production database.
- **Uploads on Vercel are ephemeral.** `UPLOAD_DIR=/tmp/uploads` is per-lambda scratch: a file
  written by one instance is not visible to another, and it disappears on cold start. Photos
  work in the local build and for the same warm instance only. Production needs object storage
  — S3/R2/Supabase Storage behind `lib/media.ts`'s `filePathFor`/`readImageFile` pair (two
  functions, no call-site changes).
- **Realtime is not deployed with the web app.** Vercel's serverless runtime cannot hold a
  Socket.io server, so the bidding/notification sockets need `apps/realtime` on Render/Fly
  (§3). Without it the UI still works — bids refetch — it just is not live.
- **`NEXT_PUBLIC_SOCKET_URL` is unset on Vercel** for that reason; set it when §3 lands, then
  redeploy (public env vars are inlined at build time).
- **Visual QA is by rendered HTML, not a browser** — Playwright's browser download is blocked in
  the build environment. `pnpm smoke` asserts status codes *and* content markers.
