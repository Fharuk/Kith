import { and, eq, isNull, lte, or, sql } from "drizzle-orm";
import {
  getDb, payouts, transactions, users, landlordProfiles, auditLogs, notifications,
} from "@kith/database";
import { formatNgn } from "@kith/domain";
import { getPaystack } from "./paystack";
import { notifyUser } from "./providers/notify";

/**
 * PAYOUTS — the second half of the money story.
 *
 * Escrow "released" is a ledger statement: the landlord is now owed money. This module turns
 * that into an actual bank transfer, and keeps doing so until the money lands or a human
 * decides otherwise.
 *
 * Invariants
 *  · One payout per booking transaction (unique index), so releases are never double-paid.
 *  · A payout only ever moves the landlord's NET (escrow already carries the 85/15 split).
 *  · Every attempt uses a fresh Paystack transfer reference; the reference is the
 *    idempotency key on Paystack's side, so a retried call cannot double-send.
 *  · Failures back off exponentially and stop after MAX_ATTEMPTS, surfacing to admins
 *    instead of looping forever.
 *  · No transfer is ever attempted to an unverified account: the destination is resolved
 *    with Paystack's /bank/resolve before a recipient code is minted.
 */

const MAX_ATTEMPTS = 5;
/** 1m, 5m, 30m, 2h, 8h */
const BACKOFF_MS = [60_000, 300_000, 1_800_000, 7_200_000, 28_800_000];

export function backoffFor(attempt: number, now: number = Date.now()): Date {
  const idx = Math.min(Math.max(attempt - 1, 0), BACKOFF_MS.length - 1);
  return new Date(now + (BACKOFF_MS[idx] ?? BACKOFF_MS[BACKOFF_MS.length - 1]!));
}

export interface PayoutProfile {
  payoutHold: boolean;
  paystackRecipientCode: string | null;
  bankCode: string | null;
  bankAccountNumber: string | null;
  bankAccountName: string | null;
  bankVerifiedAt: Date | null;
}

export function payoutDestinationReady(profile: PayoutProfile | undefined): boolean {
  if (!profile) return false;
  if (profile.payoutHold) return false;
  return Boolean(profile.bankCode && profile.bankAccountNumber && profile.bankVerifiedAt);
}

/**
 * Create the payout row for a released booking transaction (idempotent).
 * Returns null when the transaction is not eligible (not released, or already queued).
 */
export async function queuePayoutForTransaction(transactionId: string) {
  const db = getDb();
  const tx = (await db.select().from(transactions).where(eq(transactions.id, transactionId)))[0];
  if (!tx) return null;
  if (tx.escrowStatus !== "released") return null;

  const existing = (await db.select().from(payouts).where(eq(payouts.transactionId, transactionId)))[0];
  if (existing) return existing;

  const amount = tx.landlordNetKobo; // 85% — the landlord's money, never the gross
  try {
    const [created] = await db.insert(payouts).values({
      transactionId,
      landlordId: tx.landlordId,
      amountKobo: amount,
      status: "queued",
      nextAttemptAt: new Date(), // immediately eligible
    }).returning();
    return created ?? null;
  } catch {
    // unique(transaction_id) raced with a concurrent release — read the winner
    return (await db.select().from(payouts).where(eq(payouts.transactionId, transactionId)))[0] ?? null;
  }
}

/**
 * Reconcile: any released booking transaction without a payout row gets one.
 * This is the safety net for releases that happened while a landlord had no bank details
 * (or while payouts were on hold). Safe to run on every worker tick.
 */
export async function queueMissingPayouts(limit = 100) {
  const db = getDb();
  const released = await db
    .select({ id: transactions.id })
    .from(transactions)
    .leftJoin(payouts, eq(payouts.transactionId, transactions.id))
    .where(and(eq(transactions.escrowStatus, "released"), isNull(payouts.id)))
    .limit(limit);

  let queued = 0;
  for (const row of released) {
    const payout = await queuePayoutForTransaction(row.id);
    if (payout) queued++;
  }
  return { queued };
}

export type PayoutAttemptResult =
  | { ok: true; payoutId: string; status: "paid" | "processing"; transferReference: string }
  | { ok: false; payoutId: string; reason: string; retryAt?: Date; terminal: boolean };

/**
 * Attempt one queued payout.
 * Order: profile → destination readiness → recipient code → transfer → apply outcome.
 */
export async function processPayout(payoutId: string): Promise<PayoutAttemptResult> {
  const db = getDb();
  const payout = (await db.select().from(payouts).where(eq(payouts.id, payoutId)))[0];
  if (!payout) return { ok: false, payoutId, reason: "payout not found", terminal: true };
  if (payout.status === "paid" || payout.status === "cancelled") {
    return { ok: false, payoutId, reason: `payout already ${payout.status}`, terminal: true };
  }

  const profile = (await db.select().from(landlordProfiles).where(eq(landlordProfiles.userId, payout.landlordId)))[0];
  if (!payoutDestinationReady(profile)) {
    const reason = profile?.payoutHold ? "payouts are on hold for this landlord" : "landlord bank details are not verified";
    await db.update(payouts).set({ failureReason: reason }).where(eq(payouts.id, payoutId));
    return { ok: false, payoutId, reason, terminal: false };
  }

  const { driver } = getPaystack();
  const attempt = payout.attempts + 1;
  const transferReference = `KTH-PAY-${payout.id.slice(0, 8).toUpperCase()}-${attempt}`;

  try {
    // Mint (or reuse) the Paystack recipient for this destination.
    let recipientCode = profile!.paystackRecipientCode;
    if (!recipientCode) {
      const recipient = await driver.createRecipient({
        name: profile!.bankAccountName ?? "Kith Landlord",
        accountNumber: profile!.bankAccountNumber!,
        bankCode: profile!.bankCode!,
      });
      recipientCode = recipient.recipientCode;
      await db.update(landlordProfiles)
        .set({ paystackRecipientCode: recipientCode })
        .where(eq(landlordProfiles.userId, payout.landlordId));
    }

    const transfer = await driver.initiateTransfer({
      amountKobo: payout.amountKobo,
      recipientCode,
      reference: transferReference,
      reason: `Kith payout ${payout.id.slice(0, 8)}`,
    });

    if (transfer.status === "success") {
      await markPayoutPaid(payoutId, transfer.transferCode, transferReference);
      return { ok: true, payoutId, status: "paid", transferReference };
    }

    if (transfer.status === "pending") {
      await db.update(payouts).set({
        status: "processing",
        attempts: attempt,
        transferReference,
        transferCode: transfer.transferCode,
        recipientCode,
        failureReason: null,
        processedAt: new Date(),
      }).where(eq(payouts.id, payoutId));
      return { ok: true, payoutId, status: "processing", transferReference };
    }

    // failed / reversed at initiation
    return await recordPayoutFailure(payoutId, attempt, transferReference, transfer.failureReason ?? "transfer rejected");
  } catch (e) {
    const reason = e instanceof Error ? e.message : "transfer failed";
    return await recordPayoutFailure(payoutId, attempt, transferReference, reason);
  }
}

async function recordPayoutFailure(
  payoutId: string,
  attempt: number,
  transferReference: string,
  reason: string,
): Promise<PayoutAttemptResult> {
  const db = getDb();
  const terminal = attempt >= MAX_ATTEMPTS;
  const retryAt = terminal ? undefined : backoffFor(attempt);

  await db.update(payouts).set({
    status: terminal ? "failed" : "queued",
    attempts: attempt,
    transferReference,
    failureReason: reason,
    nextAttemptAt: retryAt ?? null,
    processedAt: new Date(),
  }).where(eq(payouts.id, payoutId));

  await db.insert(auditLogs).values({
    actorId: null,
    actionType: "update",
    targetResourceType: "payout",
    targetResourceId: payoutId,
    oldValues: { status: "queued", attempts: attempt - 1 },
    newValues: { status: terminal ? "failed" : "queued", attempts: attempt, reason, retryAt: retryAt?.toISOString() ?? null },
  });

  if (terminal) {
    await alertPayoutFailure(payoutId, reason);
  }
  return { ok: false, payoutId, reason, retryAt, terminal };
}

/** Mark the payout paid and tell the landlord the money is on the way. */
export async function markPayoutPaid(payoutId: string, transferCode: string, transferReference: string) {
  const db = getDb();
  const payout = (await db.select().from(payouts).where(eq(payouts.id, payoutId)))[0];
  if (!payout) return;
  if (payout.status === "paid") return; // idempotent — webhooks repeat

  await db.update(payouts).set({
    status: "paid",
    transferCode,
    transferReference,
    failureReason: null,
    processedAt: new Date(),
  }).where(eq(payouts.id, payoutId));

  await db.insert(auditLogs).values({
    actorId: null,
    actionType: "release",
    targetResourceType: "payout",
    targetResourceId: payoutId,
    oldValues: { status: payout.status },
    newValues: { status: "paid", transferCode, amountKobo: payout.amountKobo.toString() },
  });

  const landlord = (await db.select().from(users).where(eq(users.id, payout.landlordId)))[0];
  await notifyUser({
    userId: payout.landlordId,
    type: "payout_paid",
    payload: { payoutId, amountKobo: payout.amountKobo.toString(), transferCode },
    message: `Kith: ${formatNgn(payout.amountKobo)} has been sent to your bank account.`,
    phone: landlord?.phone ?? null,
    email: landlord?.email ?? null,
    emailSubject: "Payout sent — Kith",
  });
}

async function alertPayoutFailure(payoutId: string, reason: string) {
  const db = getDb();
  const payout = (await db.select().from(payouts).where(eq(payouts.id, payoutId)))[0];
  if (!payout) return;
  const admins = await db.select().from(users).where(eq(users.role, "admin"));
  for (const admin of admins) {
    await notifyUser({
      userId: admin.id,
      type: "payout_failed",
      payload: { payoutId, landlordId: payout.landlordId, reason, amountKobo: payout.amountKobo.toString() },
      message: `Kith ops: payout ${payout.id.slice(0, 8)} for ${formatNgn(payout.amountKobo)} failed after ${MAX_ATTEMPTS} attempts — ${reason}`,
      email: admin.email,
      emailSubject: "Payout needs attention — Kith ops",
    });
  }
}

/** Worker pass: process every payout that is due. */
export async function processDuePayouts(limit = 25) {
  const db = getDb();
  const now = new Date();
  const due = await db
    .select()
    .from(payouts)
    .where(and(
      eq(payouts.status, "queued"),
      or(isNull(payouts.nextAttemptAt), lte(payouts.nextAttemptAt, now)),
      sql`${payouts.attempts} < ${MAX_ATTEMPTS}`,
    ))
    .limit(limit);

  let paid = 0, processing = 0, failed = 0, blocked = 0;
  for (const p of due) {
    const result = await processPayout(p.id);
    if (result.ok && result.status === "paid") paid++;
    else if (result.ok) processing++;
    else if (result.terminal) failed++;
    else blocked++;
  }
  return { attempted: due.length, paid, processing, failed, blocked };
}

/**
 * Webhook reconciliation for transfer.* events (money already left the balance).
 * The transfer reference carries the payout id, so no extra lookup table is needed.
 */
export async function applyTransferOutcome(input: {
  reference: string;
  status: "success" | "failed" | "reversed";
  transferCode?: string;
  reason?: string | null;
}): Promise<{ applied: boolean; payoutId?: string }> {
  const db = getDb();
  const payout =
    (await db.select().from(payouts).where(eq(payouts.transferReference, input.reference)))[0] ??
    // fall back to parsing the reference (KTH-PAY-<id8>-<attempt>)
    (await db.select().from(payouts).where(sql`${payouts.id}::text like ${input.reference.slice(8, 16).toLowerCase() + "%"}`))[0];

  if (!payout) return { applied: false };

  if (input.status === "success") {
    await markPayoutPaid(payout.id, input.transferCode ?? payout.transferCode ?? "", input.reference);
    return { applied: true, payoutId: payout.id };
  }

  const attempt = Math.max(payout.attempts, 1);
  await recordPayoutFailure(
    payout.id,
    input.status === "reversed" ? MAX_ATTEMPTS : attempt,
    input.reference,
    input.reason ?? `transfer ${input.status}`,
  );
  return { applied: true, payoutId: payout.id };
}

/** Admin: retry a payout now (resets the backoff clock, keeps the attempt history). */
export async function retryPayout(payoutId: string, adminId: string) {
  const db = getDb();
  await db.update(payouts)
    .set({ status: "queued", nextAttemptAt: new Date(), failureReason: null })
    .where(eq(payouts.id, payoutId));
  await db.insert(auditLogs).values({
    actorId: adminId, actionType: "update", targetResourceType: "payout", targetResourceId: payoutId,
    oldValues: { status: "failed" }, newValues: { status: "queued", reason: "admin retry" },
  });
}

/** Admin: cancel a payout (e.g. fraud hold). Money stays owed; escrow is untouched. */
export async function cancelPayout(payoutId: string, adminId: string, reason: string) {
  const db = getDb();
  await db.update(payouts)
    .set({ status: "cancelled", failureReason: reason, nextAttemptAt: null })
    .where(eq(payouts.id, payoutId));
  await db.insert(auditLogs).values({
    actorId: adminId, actionType: "cancel", targetResourceType: "payout", targetResourceId: payoutId,
    oldValues: { status: "queued" }, newValues: { status: "cancelled", reason },
  });
  const payout = (await db.select().from(payouts).where(eq(payouts.id, payoutId)))[0];
  if (payout) {
    await db.insert(notifications).values({
      userId: payout.landlordId, channel: "in_app", type: "payout_cancelled",
      payload: { payoutId, reason },
    });
  }
}
