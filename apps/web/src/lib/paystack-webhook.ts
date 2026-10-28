import { eq } from "drizzle-orm";
import { getDb, transactions, bookings, auditLogs, users } from "@kith/database";
import {
  verifyWebhookSignature,
  parseChargeSuccess,
  WebhookParseError,
  PAYSTACK_EVENTS,
  type ChargeSuccessData,
} from "@kith/paystack";
import { getPaystack } from "./paystack";
import { notifyUser } from "./providers/notify";
import { moveEscrow } from "./escrow";
import { createGuestPass } from "./guest-pass";

/**
 * Paystack event processing — the ONLY path that turns a payment into confirmed state.
 *
 * Golden flow: charge.success → transaction completed → escrow pending→held (domain
 * machine, actor "paystack") → booking confirmed → guest pass minted → both sides
 * notified → audited. Idempotent at every step: repeated webhooks are acknowledged
 * without re-triggering effects. Amount mismatches are refused and audited.
 */

export interface WebhookResult {
  status: number; // HTTP status to return Paystack
  body: Record<string, unknown>;
}

export async function handlePaystackEvent(rawBody: string, signatureHeader: string | null): Promise<WebhookResult> {
  const { cfg } = getPaystack();

  if (!verifyWebhookSignature(rawBody, signatureHeader, cfg.webhookSecret)) {
    return { status: 400, body: { ok: false, error: "invalid signature" } };
  }

  let evt;
  try {
    evt = parseChargeSuccess(rawBody);
  } catch (e) {
    if (e instanceof WebhookParseError) return { status: 400, body: { ok: false, error: e.message } };
    throw e;
  }

  if (evt.event !== PAYSTACK_EVENTS.chargeSuccess) {
    // transfer.* / refund.* land with the payout + dispute slices; acknowledge for now.
    return { status: 200, body: { ok: true, ignored: evt.event } };
  }

  return confirmChargeSuccess(evt.data);
}

/** Apply a verified charge.success to the ledger. Exported for the live verify-fallback too. */
export async function confirmChargeSuccess(data: ChargeSuccessData): Promise<WebhookResult> {
  const db = getDb();
  const tx = (await db.select().from(transactions).where(eq(transactions.paystackReference, data.reference)))[0];
  if (!tx) return { status: 200, body: { ok: true, ignored: "unknown reference" } };

  // Idempotency: already applied.
  if (tx.status === "completed") return { status: 200, body: { ok: true, duplicate: true } };
  if (tx.status === "failed" || tx.status === "cancelled") {
    return { status: 200, body: { ok: true, ignored: `transaction ${tx.status}` } };
  }

  // Amount must match to the kobo — refuse partial/tampered charges.
  if (BigInt(data.amount) !== tx.amountKobo) {
    await db.insert(auditLogs).values({
      actorId: null,
      actionType: "reject",
      targetResourceType: "transaction",
      targetResourceId: tx.id,
      oldValues: { status: tx.status },
      newValues: { webhookAmount: data.amount, expectedAmount: tx.amountKobo.toString() },
    });
    return { status: 200, body: { ok: true, ignored: "amount mismatch" } };
  }

  await db.update(transactions).set({ status: "completed" }).where(eq(transactions.id, tx.id));

  // escrow pending → held via the single state-machine path (audits + notifies).
  if (tx.escrowStatus === "pending") {
    await moveEscrow(tx.id, "held", "paystack", null, `charge.success ${data.reference} (${data.channel ?? "unknown"} channel)`);
  }

  if (tx.bookingId) {
    const booking = (await db.select().from(bookings).where(eq(bookings.id, tx.bookingId)))[0];
    if (booking && booking.status === "pending") {
      await db.update(bookings).set({ status: "confirmed" }).where(eq(bookings.id, booking.id));
      await createGuestPass(booking.id);
      const [student, landlord] = await Promise.all([
        db.select().from(users).where(eq(users.id, tx.studentId)).then((r) => r[0]),
        db.select().from(users).where(eq(users.id, tx.landlordId)).then((r) => r[0]),
      ]);
      await Promise.all([
        notifyUser({
          userId: tx.studentId, type: "booking_confirmed",
          payload: { bookingId: booking.id, transactionId: tx.id },
          message: `Kith: payment received. Your room is confirmed — your rotating guest pass is live at /passes.`,
          phone: student?.phone ?? null, email: student?.email ?? null,
          emailSubject: "Your Kith room is confirmed",
        }),
        notifyUser({
          userId: tx.landlordId, type: "booking_confirmed",
          payload: { bookingId: booking.id, transactionId: tx.id },
          message: `Kith: a booking was paid. Funds are held in escrow until porter-confirmed check-in (or 24h).`,
          phone: landlord?.phone ?? null, email: landlord?.email ?? null,
        }),
      ]);
    }
    await db.insert(auditLogs).values({
      actorId: null,
      actionType: "complete",
      targetResourceType: "transaction",
      targetResourceId: tx.id,
      oldValues: { status: "pending" },
      newValues: { status: "completed", escrowStatus: "held", reference: data.reference, channel: data.channel, paidAt: data.paid_at },
    });
  } else if (tx.auctionId) {
    // Auction deposit/settlement payments: ledger effect only — booking creation belongs
    // to the settlement worker (slice 3).
    await db.insert(auditLogs).values({
      actorId: null,
      actionType: "complete",
      targetResourceType: "transaction",
      targetResourceId: tx.id,
      oldValues: { status: "pending" },
      newValues: { status: "completed", reference: data.reference, auctionId: tx.auctionId },
    });
  }

  return { status: 200, body: { ok: true, applied: data.reference } };
}

/**
 * Live-mode fallback for the return URL: if the webhook hasn't landed yet, verify with
 * Paystack directly and apply the same confirmation path.
 */
export async function verifyAndConfirm(reference: string): Promise<WebhookResult> {
  const { driver } = getPaystack();
  const v = await driver.verify(reference);
  if (v.status !== "success" || v.amountKobo === null) {
    return { status: 200, body: { ok: true, pending: v.status } };
  }
  return confirmChargeSuccess({
    reference: v.reference,
    amount: Number(v.amountKobo),
    currency: v.currency ?? "NGN",
    status: "success",
    paid_at: v.paidAt,
    channel: v.channel,
  });
}
