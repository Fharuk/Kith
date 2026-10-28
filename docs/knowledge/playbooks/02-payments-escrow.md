# Playbook 02 — Payments, Split & Escrow (Paystack)

From `v3 PAYSTACK_INTEGRATION.md` + webhook route, hardened with `payments-billing` and `security`
skill buckets (webhook verification, idempotency, reconciliation).

## Flow
```
winner → chargeWinner (server action, authz: session.user.id === auction.winningStudentId)
       → INSERT transaction(pending, escrow=pending, reference=KTH-<ulid>)
       → Paystack initializeTransaction(amount_kobo, email, reference,
             split: { subaccount: landlord.paystack_subaccount_code, bearer: 'subaccount' })  // 85/15
       → hosted checkout → Paystack webhook(charge.success)  ─┐
       → /payment/callback (UX only — NEVER trust the redirect) ┘
webhook: HMAC-SHA512 verify (PAYSTACK_WEBHOOK_SECRET) → re-verify via GET /transaction/{ref}
       → idempotency (unique paystack_reference + event id) → transaction=completed, escrow=held
       → create booking + guest_passes row + notification → auto_release_at = checkin+24h
```

## Non-negotiables
- **The webhook is the only truth.** Callback page is cosmetic; it polls `/api/payments/status?ref`.
- Amount re-check: webhook payload amount **must equal** `transaction.amount_kobo` (kobo) — rejects
  tampered/underpaid charges. Currency must be `NGN`.
- Signature: `crypto.timingSafeEqual` on hex digests; reject on mismatch, log to Sentry, 400.
- Idempotency: DB unique constraints on `transactions.paystack_reference` and
  `idempotency_keys(scope='paystack_event')`; replayed webhooks return 200 without side effects.
- Split configured **server-side at initialize** via subaccount; never computed client-side.
  `PLATFORM_SPLIT_BPS=1500`; store `platform_fee_kobo` + `landlord_net_kobo` on the transaction row.
- Refunds: admin-only, Paystack refund API, `escrow=refunded`, dispute closed, audit entry,
  student notified (email + in-app). Partial refunds allowed for dispute settlements.
- Reconciliation job (daily): pull Paystack transactions for last 48h, diff against `transactions`;
  mismatch → `disputes` + admin alert. (Enterprise habit; catches silent webhook loss.)

## Escrow state machine (packages/domain/escrow.ts)
```
pending ──charge.success──▶ held ──porter check-in confirm──▶ released
                        └──auto_release_at elapsed──▶ released
                        └──dispute opened──▶ disputed ──admin resolve──▶ released | refunded
```
Guards: only porter (matching task) or the auto-release worker may move held→released;
only admin may enter/exit disputed; every transition writes `audit_logs` + notification.

## Guest pass (fixes defect #18)
- `guest_passes`: TOTP secret (AES-256-GCM at rest), 6-digit code, 5-min step, ±1 window grace.
- Display: rotating code + QR in student `/passes`; code **hash** only in DB lookup index.
- Porter terminal: numpad → hash lookup (current+prev window) → booking + guest identity
  (pseudonymized) → `Confirm check-in` → booking=checked_in, porter_task=done, escrow release
  queued, `transactions.released_at` set by worker after confirm.

## Test matrix
- Replay same webhook 5× → 1 booking, 1 transaction, 1 guest pass.
- Wrong signature → 400, no state change, Sentry event.
- Amount mismatch → rejected + dispute flag.
- Refund path reverses escrow and notifies both parties.
- Split math: property-based test over random amounts asserts platform+landlord == total.
