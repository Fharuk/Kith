# Playbook 06 — Quality, Security & Operations

## Test pyramid (packages/testing)
1. **Unit (vitest)** — `domain` at 100% branch: money/split, auction rules, escrow machine, TOTP
   window, matric regex per university, zod schemas. Fast, no DB.
2. **Integration (vitest + testcontainers-postgres)** — repositories, migrations idempotency,
   webhook handler with real HMAC fixtures, bid critical section against real Redis.
3. **Concurrency harness** — socket.io-client swarm (50–500) against `apps/realtime` in-process;
   asserts single-winner, monotonic price, idempotency, soft-close, lock expiry.
4. **E2E (playwright)** — 5 golden flows: register→verify(4 gates)→search→bid→win→pay→pass→porter
   check-in→escrow released; landlord listing→auction→payout view; admin review→approve;
   dispute→refund; 2FA login. Run on CI with seeded DB snapshot.
5. **Chaos/`break-ui`** — kill realtime mid-auction; Redis flush; webhook replay storm; Paystack
   500s; slow-3G throttle; axe scan; Lighthouse CI budgets.

## Security baseline (threat model highlights)
- Bid spoofing → handshake-authed sockets + server principal (fixed v3 defect).
- Webhook forgery → HMAC-SHA512 timing-safe + amount/currency re-check + idempotency keys.
- Price tampering → server-authoritative kobo; client sends intent only.
- IDOR → repository layer always scopes by principal (`where studentId = principal.id`).
- Enumeration → uniform auth errors, lockouts, pseudonymized public ids.
- Upload abuse → signed URLs, MIME sniffing, 10MB cap, webp re-encode (kills polyglots), EXIF strip.
- SSRF/redirect → allow-listed callback hosts only.
- Secrets → env only; `pnpm audit --audit-level=high` + Dependabot; Sentry scrubbers for NIN/PII.
- Rate limits: bids 20/min/user, api 100/15min/IP, login 5/min/IP, webhook exempt-but-HMAC.

## Ops mapped to the founder's SOP documents
- **Porter ops manual** → `/porter` surfaces: task queue, verification checklist (photo + geo +
  timestamp), offline-tolerant numpad (last-known pass window), escalation contact tree.
- **Incident SOP** → runbook hooks: Sentry alert → severity matrix → break-glass dual-control →
  post-incident audit entry; status page stub at `/status`.
- **Licence-to-occupy / guest agreement** → e-sign at booking with document-version hash stored on
  the booking row (legal traceability per transaction).
- **Business plan / pitch deck** → KPI events (PostHog): verified students, auction fill rate,
  take-rate realised, time-to-check-in, dispute rate. Dashboards in `/admin/metrics`.

## Definition of done (every PR)
typecheck + lint + unit + integration green; playwright golden flow touched by change; axe zero;
Lighthouse budget; migration reversible; playbook/ANALYSIS updated if a decision changed; no
`any`, no `console.log`, no plaintext secrets, no mock provider reachable when
`NODE_ENV=production` (enforced by config assertion at boot).
