# Kith — Prototype Synthesis & Defect Ledger

> Source: 5 prototypes in `.cache/prototypes/` (v1, v2, v2_0, v3, pyapi) + 7 business/legal PDFs
> in `.cache/drive-files/`. This document records **what we take, what we reject, and what we fix.**

## 1. Product in one paragraph

Kith is a verified student-housing marketplace for Nigeria (launch: FUNAAB + UNILAG, built to be
university-agnostic). Students are identity-verified (NIMC NIN + university matric + biometric
liveness) before they can bid or book. Landlords list properties/rooms in three tiers —
**Circle** (₦40k–₦70k, live reverse-scarcity auction), **Market** (₦60k–₦100k, fixed price),
**Elite** (₦120k–₦180k, fixed price). Payments run through Paystack with an **85% landlord / 15%
Kith split**; funds sit in **escrow** and release on porter-confirmed check-in (or auto-release
after 24h). Porters are the physical trust layer: they verify properties, and run check-in /
check-out at the door with rotating guest-pass codes. Admins govern verification, disputes and audit.

## 2. Per-prototype verdict

| Prototype | Stack | Verdict | What we take |
|---|---|---|---|
| **v1** | static HTML/CSS/JS, 10 pages | UI vision only; "Organic Fortress" glassmorphism + floating blobs is dated and off-brief | Feature scope & page inventory (7 surfaces + legal), copy voice |
| **v2** | React+Vite client, Express+Socket.io server | Best component vocabulary & role panels; but client-only auth context, mock APIs | Component list, `SearchFilters` tier config, 4 dashboards IA, `ADMIN_LANDLORD_PORTER_PANELS.md` |
| **v2_0** | Turborepo + Next + `packages/database` | Correct monorepo instinct, too empty | Monorepo shape (turbo + pnpm workspaces) |
| **v3** | Turborepo: `apps/web` (Next 14) + `apps/socket-server`, `packages/database` (Drizzle), Paystack, BullMQ, PWA, Terraform | **Backbone.** Production-shaped but with real defects (§4) | Drizzle schema, BidManager, WaterfallQueue, Paystack webhook/split, NextAuth wiring, PWA |
| **pyapi** | FastAPI + SQLAlchemy + Alembic + JWT/2FA/TOTP + emergency override | Best security thinking of the five | 2FA/TOTP design, emergency-override SOP, enterprise auth guide concepts (ported to TS) |

## 3. Business facts extracted (drive PDFs + testing doc)

- **Split:** 85% landlord / 15% platform, enforced via Paystack subaccount split at charge time.
- **Escrow:** `held → released | disputed`; auto-release 24h after check-in window opens.
- **Verification:** 3 steps — NIN (11 digits, NIMC), university matric + institutional email,
  biometric liveness. Admin review queue for documents.
- **Guest pass:** rotating 6-digit code (TOTP-style) + QR; porter numpad terminal grants/denies;
  check-in confirmation triggers escrow release.
- **Auction rules:** 12-min default window, soft-close (+5 min if a bid lands in the final 2 min),
  minimum increment, floor price, waterfall to 2nd-highest bidder if the winner's charge fails.
- **Roles:** `student | landlord | porter | admin`; pseudonymized public IDs (never expose UUIDs).
- **Compliance docs exist:** Master guest & property management agreement, digital licence to
  occupy, porter ops manual, incident SOP → our admin/ops surfaces must mirror these workflows.

## 4. Defect ledger — every issue we found and will fix

### Realtime / auction (v3 socket-server)
1. `winningSudentId` typo propagates through `types`, `BidManager`, socket events → rename `winningStudentId`.
2. Lock released with bare `DEL` → a slow holder can delete **another** process's lock. Fix: lock **value = token**, release via Lua compare-and-delete; add fencing.
3. Bids live **only in Redis** (`lpush`) — process/Redis loss = lost money trail. Fix: write-through to Postgres `bids` in the same critical section (Redis = hot cache, DB = truth).
4. `place_bid` trusts client-supplied `userId` (comment even notes the missing check) → spoofable bids. Fix: authenticate at Socket.io handshake with the NextAuth session token; `userId` comes from the socket principal.
5. `attemptCharge` is a simulation with 10% random failure; waterfall is a stub. Fix: real Paystack charge/verification + implemented waterfall with per-bidder offer expiry.
6. No auction **settlement worker** (end → booking + transaction + charge). Fix: BullMQ scheduler scanning `scheduledEndTime`.
7. `acquireLock` failure returns "System Busy" to the user. Fix: bounded retry with jittered backoff (3×, ≤300ms) before failing.
8. No per-socket rate limiting on `place_bid` (sniping/DoS). Fix: token bucket per user per auction.
9. CORS origin is a single env string. Fix: allow-list array + preview-domain support.

### Payments (v3 web)
10. Webhook idempotency must key on Paystack `reference` **and** event ID with a DB unique constraint (prototype relies on checks, not constraints).
11. Money as `decimal(12,2)` NGN — acceptable in Postgres, but Paystack speaks **kobo**. Fix: store minor units `bigint` (`amount_kobo`) as source of truth; format at the edge. Never float.
12. No refund/dispute money path beyond enums. Fix: `disputes` table + Paystack refund API + admin action with audit.

### Data model gaps (v3 schema vs. requirements)
13. No `student_profiles` / `landlord_profiles` / `porter_profiles` (verification fields, subaccount, zone).
14. No `universities` registry (FUNAAB/UNILAG, email domains, matric patterns) — required for institutional-email verification.
15. No `tier` / `sale_mode` on rooms (Circle/Elite/Market live only in frontend constants).
16. No `notifications`, `porter_tasks`, `property_verifications`, `disputes`, `guest_passes`, `media`.
17. `properties.country` defaults to `"UK"` — wrong market. Fix: `NG`, city = Lagos/Abeokuta/etc.
18. `guest_pass_code` stored plaintext & unique on booking — fix: hash at rest, rotate via `guest_passes` with TOTP secret + window.

### Auth
19. v3: credentials-only, 24h JWT, no rotation, no lockout, no 2FA (pyapi had it). Fix: argon2id, progressive lockout + breach detection, TOTP 2FA for landlord/admin/porter, session revocation list.
20. Role checks must be enforced **server-side per route and per socket event**, not in the UI.

### Frontend
21. v3 UI is functional-but-flat; v1 is blob-glassmorphism. Both fail the brief ("best-in-class,
    luxury/hospitality, no AI-slop gradients"). Fix: bespoke design system (§playbook 04).
22. Images: prototypes ship PNGs. Brief requires webp + SVG-as-code icons. Fix: asset pipeline.

## 5. What we deliberately do NOT carry over

- Terraform/infra (brief: deployment config not needed yet) — but we keep the env matrix.
- PWA offline-auth complexity at launch — we keep manifest + installability, defer offline bidding.
- Python service — security patterns ported to TypeScript; single language across the stack.
- Mock services as the *only* path — every mock sits behind a `Provider` interface with a real
  implementation (NIMC, liveness, Paystack, SMS) selectable by env.
