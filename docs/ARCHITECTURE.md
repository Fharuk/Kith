# Kith — Target Architecture (v1 build)

Decisions locked by the founder: Next.js 14+ App Router · TypeScript · Node/Express + Socket.io ·
PostgreSQL + Drizzle · NextAuth credentials + roles · Paystack (85/15) · Nigeria-first (FUNAAB/UNILAG) ·
brand colours locked to logo · NIMC + matric + biometric + institutional email verification.

## 1. Monorepo (pnpm workspaces + Turborepo)

```
kith/
├─ apps/
│  ├─ web/                 # Next.js App Router: marketing + 4 portals + API routes (webhooks)
│  └─ realtime/            # Express + Socket.io: auctions, presence, notifications push
├─ packages/
│  ├─ database/            # Drizzle schema, migrations, client, seed  (source of truth)
│  ├─ domain/              # pure TS: money, tiers, auction rules, escrow state machine, zod schemas
│  ├─ paystack/            # typed Paystack client: init/verify/split/refund/subaccount + HMAC verify
│  ├─ identity/            # NIMC + liveness + institutional-email providers (real & mock)
│  ├─ ui/                  # design system: tokens, primitives, icons (SVG-as-code), motion presets
│  ├─ config/              # shared tsconfig / eslint / tailwind preset
│  └─ testing/             # vitest + playwright helpers, factories, socket test harness
├─ docs/                   # ANALYSIS.md, ARCHITECTURE.md, knowledge/ (skill registry + playbooks)
└─ turbo.json, pnpm-workspace.yaml, .env.example
```

Rules: `web` never imports `realtime` internals; both import `domain` + `database`.
All money math in `domain/money.ts` (bigint kobo). All socket payloads validated with zod in `domain`.

## 2. Data model (extends V3 schema — ledger items 13–18)

Enums: `user_role`, `room_tier(circle|elite|market)`, `sale_mode(auction|fixed)`,
`auction_status`, `bid_status`, `booking_status`, `escrow_status(held|released|disputed|refunded)`,
`transaction_type/status`, `verification_status`, `kyc_step(nin|matric|biometric|review)`,
`notification_channel(in_app|email|sms)`, `porter_task_type(check_in|check_out|verify_property)`.

| Table | Purpose / key columns |
|---|---|
| `users` | role, email, `password_hash` (argon2id), `pseudonymized_id`, `totp_secret_enc`, `two_factor_enabled`, lockout counters, `is_verified` |
| `universities` | `code` (funaab/unilag…), name, city, `email_domains[]`, `matric_pattern` (regex), active |
| `student_profiles` | user→university, `matric_number`, `student_email`, level/faculty, `nin_hash`, nimc/biometric flags, `liveness_score`, step status |
| `landlord_profiles` | business name, CAC number, `paystack_subaccount_code`, KYC status, payout bank ref |
| `porter_profiles` | zone/campus assignment, active, device fingerprint |
| `user_verifications` | document uploads → admin review (type, url, number, status, reviewer, reason) |
| `properties` | landlord, address/city/state (NG), geo, `is_physically_verified`, verified_by_porter, amenities jsonb |
| `rooms` | property, number, type, capacity, **`tier`**, **`sale_mode`**, `price_kobo` (fixed), floor/increment for auction |
| `media` | polymorphic owner, url, w/h, alt, `format=webp`, sort (all uploads → webp at ingest) |
| `auctions` | room, landlord, `current_price_kobo`, floor, min_increment, scheduled/actual end, status, winner |
| `bids` | auction, student, `amount_kobo`, status, idempotency key — **write-through from realtime** |
| `bookings` | auction/room, student, landlord, `booked_price_kobo`, check-in/out, status |
| `guest_passes` | booking, `code_hash`, totp secret (enc), step window, status, expires (rotation; code never stored plain) |
| `transactions` | booking/auction, `amount_kobo`, `platform_fee_kobo`, `landlord_net_kobo`, type, status, escrow, `paystack_reference` (unique), split metadata, auto_release_at |
| `disputes` | transaction, opened_by, reason, evidence jsonb, status, resolution, resolved_by |
| `porter_tasks` | type, booking/property, porter, status, geo at completion, photo proof |
| `notifications` | user, channel, type, payload jsonb, read_at, provider message id |
| `audit_logs` | admin actor, action, target, old/new jsonb, ip, ua |
| `idempotency_keys` | scope+key unique (webhooks, bids, payouts) |
| `redis_cache_backup` | retained: crash-recovery snapshot of hot auction state |

Money invariant: **bigint minor units (kobo)** end-to-end; NGN strings only at the presentation edge.

## 3. Realtime contract (apps/realtime)

Handshake: Socket.io `auth.token` = NextAuth session JWT → verified server-side (shared secret),
principal put on `socket.data.user`. **Client-supplied userId is never trusted.**
Rooms: `auction:<id>`, `user:<id>`, `role:porter` etc.

Events (client→server): `join_auction`, `leave_auction`, `place_bid{idempotencyKey,amountKobo}`.
Events (server→client): `auction_state`, `bid_accepted`, `bid_rejected{code}`, `bid_placed`,
`auction_extended`, `auction_ended{winnerPseudonym}`, `presence_update`, `notification`.

Bid critical section (corrected BidManager):
1 zod-validate → 2 acquire lock(`auction:<id>`, token, 5s TTL, 3 bounded retries) →
3 load state (Redis, hydrate from DB on miss) → 4 rules: status ∈ {active,extended}, now < end,
amount ≥ current+increment, amount ≥ floor, bidder ≠ landlord, bidder verified, rate-limit bucket →
5 DB `INSERT bid` + update `auctions` row **in one transaction** → 6 update Redis hot state →
7 soft-close (+5min if inside final 2min) → 8 publish events → 9 release lock via Lua CAS.

Settlement worker (BullMQ, cron 15s): auctions past `actualEndTime` & status active →
mark completed, pick winner, enqueue `charge-winner` → Paystack split charge → on success create
booking + guest pass + transaction(escrow=held, auto_release=+24h) → on failure **waterfall**:
offer to 2nd-highest bidder (10-min acceptance window), repeat down the bid ladder, else relist.

## 4. Web app surface (apps/web)

Public: `/` (marketing), `/rooms` (search + filters), `/rooms/[id]`, `/auctions/[id]` (live),
`/how-it-works`, `/landlords`, `/porters`, `/legal/*` (licence-to-occupy, guest agreement, privacy).
Auth: `/login`, `/register`, `/verify/*` (3-step wizard), `/forgot`, `/2fa`.
Student: `/dashboard`, `/bookings`, `/bids`, `/passes`. Landlord: `/landlord` (revenue, listings,
auctions, payouts). Porter: `/porter` (terminal numpad, tasks, verification jobs).
Admin: `/admin` (verification queue, disputes, transactions, audit, universities, flags).
API routes: `/api/paystack/webhook` (HMAC + idempotent), `/api/paystack/callback`,
`/api/uploads/sign`, `/api/health`, `/api/rooms` (GET, cursor-paginated, cached).

## 5. Cross-cutting standards (from learned skills)

- **Security:** zod at every boundary; argon2id; helmet+CSP; rate limits (bids 20/min/user,
  api 100/15min/ip); HMAC-verified webhooks; secrets in env only; RLS-style tenant checks in
  repository layer; audit every admin mutation; dependency pinning + `pnpm audit` in CI.
- **Quality:** vitest unit (domain/money/auction/escrow = 100% branch), playwright e2e for the 5
  golden flows (register→verify→bid→pay→check-in), socket harness for concurrency tests,
  `break-ui` style chaos passes, axe-core a11y gate, Lighthouse CI budget (LCP<2.5s, CLS<0.1).
- **Perf:** RSC by default, `'use client'` only at interaction edges; images via `next/image`
  webp/avif; fonts self-hosted subset; three.js/WebGL behind dynamic import + `prefers-reduced-motion`
  and GPU-tier fallback; socket reconnect w/ exponential backoff + state resync.
- **Observability:** pino structured logs w/ request ids, Sentry (web+realtime), `/healthz`+`/readyz`,
  PostHog product analytics (skill registry: `PostHog_skills`), audit log as compliance trail.

## 6. Environment matrix (single source: `.env.example`)

`DATABASE_URL`, `REDIS_URL`, `AUTH_SECRET`, `AUTH_URL`, `NEXT_PUBLIC_APP_URL`,
`NEXT_PUBLIC_SOCKET_URL`, `PAYSTACK_SECRET_KEY`, `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY`,
`PAYSTACK_WEBHOOK_SECRET`, `PLATFORM_SPLIT_BPS=1500`, `NIMC_PROVIDER=mock|real`, `NIMC_API_URL/KEY`,
`LIVENESS_PROVIDER=mock|real`, `SMS_PROVIDER=mock|termii|twilio`, `EMAIL_PROVIDER=mock|resend`,
`STORAGE_PROVIDER=local|cloudinary|s3`, `TOTP_ISSUER=Kith`, `SENTRY_DSN`, `POSTHOG_KEY`.

Every provider is an interface with `mock` + `real` implementations; dev runs fully offline on mocks,
production flips env only. **No code branch on `NODE_ENV` for provider choice.**
