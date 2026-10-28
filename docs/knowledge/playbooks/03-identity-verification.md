# Playbook 03 — Identity & Trust (Nigeria launch)

From pyapi auth design (2FA/TOTP, emergency override) + v3 VerificationWizard + testing doc,
hardened with `auth-identity` and `security` buckets.

## Verification pipeline (student) — all 4 gates before bidding/booking
1. **NIN / NIMC**: 11-digit format → provider call (`NIMC_PROVIDER=mock|real`) → match name+DOB.
   Store **only** `sha256(nin + pepper)` (`nin_hash`); raw NIN never persisted, never logged.
2. **Institutional email**: must match `universities.email_domains[]`; magic-link confirmation.
3. **Matric number**: validated against `universities.matric_pattern` (e.g. FUNAAB `^U\d{2}/[A-Z]{2,4}/\d{3,4}$`);
   uniqueness per university → blocks duplicate accounts.
4. **Biometric liveness**: `LIVENESS_PROVIDER` returns `liveness_score ≥ 0.8` + selfie hash;
   mocked at 0.95 in dev. Frontend uses `getUserMedia` with explicit consent screen + fallback
   "verify at porter desk" path for devices without cameras.
Admin review queue catches step failures & document uploads (`user_verifications`).
`users.is_verified` flips true only when all gates pass; until then: browse yes, bid/book no
(enforced server-side in route guards **and** socket guards **and** DB check in bid rules).

## AuthN/AuthZ standard
- argon2id (m=64MB,t=3,p=4); password ≥ 10 chars, breach-list check (k-anonymity via HIBP range).
- Progressive lockout: 5 fails → 15min; 10 → 24h + email notice; lockouts per email+IP.
- TOTP 2FA **mandatory** for landlord, porter, admin; optional for students.
- NextAuth JWT 24h **with rotation** + revocation list in Redis (`revoked:<jti>`), checked per request
  and per socket handshake. Session cookie: `SameSite=Lax`, `Secure`, httpOnly.
- RBAC: `role` claim + per-route `requireRole(...)` wrapper; porter/admin additionally require 2FA
  at login step-up. Public identity is always `pseudonymized_id` (e.g. `KH-7F3K-92QD`).
- Emergency override (ported from pyapi SOP): time-boxed admin break-glass access, dual-control
  (two admins), auto-expiry 30min, immutable audit entry + incident ticket (see incident SOP PDF).

## Privacy & compliance posture
- NDPR-aware: data-minimisation map per field; NIN/biometric = purpose-limited, encrypted at rest,
  purge policy 90 days after account deletion; DPIA note in `docs/legal/`.
- Licence-to-occupy + guest agreement PDFs become in-app e-sign steps at booking (audit-trail hash).

## Test matrix
- Each gate fails independently → correct step state, no bypass via direct API.
- Duplicate matric across two accounts → second rejected.
- NIN never appears in logs (log-scrubber test), never in DB plaintext (schema test).
- 2FA step-up enforced for admin API even with valid password session.
