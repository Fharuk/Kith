import { and, eq, inArray } from "drizzle-orm";
import {
  getDb, disputes, transactions, bookings, payouts, auditLogs,
} from "@kith/database";
import { formatNgn } from "@kith/domain";
import { moveEscrow } from "./escrow";
import { getPaystack } from "./paystack";
import { notifyUser } from "./providers/notify";

/**
 * DISPUTES — the part of a marketplace that decides whether people trust it.
 *
 * Rules that matter, in order:
 *  1. Only the two parties on a transaction can open a dispute about it.
 *  2. Opening one freezes the money: escrow becomes `disputed` and any queued payout is
 *     cancelled, so a landlord's bank transfer cannot overtake an unresolved complaint.
 *  3. Only ops (admin) can resolve, and every resolution moves real money exactly once:
 *     `refund` sends the student's money back through Paystack, `release` pays the
 *     landlord's 85%, `split` does both in one settlement.
 *  4. Everything is audited and both parties are told the outcome — a dispute nobody
 *     hears about is a support ticket waiting to happen.
 */

export type DisputeOutcome = "refund" | "release" | "split";

export class DisputeError extends Error {
  constructor(message: string, readonly code: "not_found" | "forbidden" | "conflict" | "invalid") {
    super(message);
    this.name = "DisputeError";
  }
}

const OPEN_STATES = ["open", "under_review"] as const;

/** Student or landlord-facing: flag a paid booking. */
export async function openDispute(input: {
  transactionId: string;
  actorId: string;
  reason: string;
  evidence?: Record<string, unknown>;
}) {
  const db = getDb();
  const tx = (await db.select().from(transactions).where(eq(transactions.id, input.transactionId)))[0];
  if (!tx) throw new DisputeError("Transaction not found", "not_found");
  if (tx.studentId !== input.actorId && tx.landlordId !== input.actorId) {
    throw new DisputeError("You are not a party to this transaction", "forbidden");
  }
  if (tx.escrowStatus === "refunded") throw new DisputeError("This payment was already refunded", "conflict");
  if (tx.escrowStatus === "disputed") throw new DisputeError("A dispute is already open on this payment", "conflict");

  const reason = input.reason.trim();
  if (reason.length < 12) throw new DisputeError("Please describe the problem in at least a sentence", "invalid");

  // Freeze the money before writing anything the other side can see.
  if (tx.escrowStatus === "held" || tx.escrowStatus === "released") {
    if (tx.escrowStatus === "held") {
      await moveEscrow(tx.id, "disputed", "admin", null, "dispute opened");
    } else {
      // Already released: stop the transfer if it is still in flight, and record the dispute
      // against the (unchanged) ledger — clawing back a paid-out transfer is a manual ops job.
      const queue = await db.select().from(payouts).where(eq(payouts.transactionId, tx.id));
      for (const p of queue) {
        if (p.status === "queued" || p.status === "failed") {
          await db.update(payouts).set({ status: "cancelled", failureReason: "dispute opened", nextAttemptAt: null }).where(eq(payouts.id, p.id));
        }
      }
      await db.update(transactions).set({ escrowStatus: "disputed" }).where(eq(transactions.id, tx.id));
    }
  }

  const [dispute] = await db.insert(disputes).values({
    transactionId: tx.id,
    openedBy: input.actorId,
    reason,
    evidence: input.evidence ?? null,
    status: "open",
  }).returning();

  await db.insert(auditLogs).values({
    actorId: input.actorId,
    actionType: "dispute",
    targetResourceType: "transaction",
    targetResourceId: tx.id,
    oldValues: { escrowStatus: tx.escrowStatus },
    newValues: { escrowStatus: "disputed", disputeId: dispute!.id, reason },
  });

  const counterpart = tx.studentId === input.actorId ? tx.landlordId : tx.studentId;
  await notifyUser({
    userId: counterpart,
    type: "dispute_opened",
    payload: { transactionId: tx.id, disputeId: dispute!.id, reason },
    message: `Kith: a ${formatNgn(tx.amountKobo)} payment has been disputed and is on hold while we review it.`,
  });

  return dispute!;
}

/** Ops: move the money and close the case. Idempotent per dispute. */
export async function resolveDispute(input: {
  disputeId: string;
  adminId: string;
  outcome: DisputeOutcome;
  /** required for "split": how much goes back to the student, in kobo */
  refundKobo?: bigint;
  note: string;
}) {
  const db = getDb();
  const dispute = (await db.select().from(disputes).where(eq(disputes.id, input.disputeId)))[0];
  if (!dispute) throw new DisputeError("Dispute not found", "not_found");
  if (!OPEN_STATES.includes(dispute.status as (typeof OPEN_STATES)[number])) {
    throw new DisputeError("This dispute is already closed", "conflict");
  }
  const tx = (await db.select().from(transactions).where(eq(transactions.id, dispute.transactionId)))[0];
  if (!tx) throw new DisputeError("Transaction missing", "not_found");

  const note = input.note.trim() || "resolved by Kith operations";
  let refundedKobo = 0n;
  let releasedKobo = 0n;
  let refundReference: string | null = null;

  if (input.outcome === "refund" || input.outcome === "split") {
    const amount = input.outcome === "refund" ? tx.amountKobo : input.refundKobo ?? 0n;
    if (amount <= 0n) throw new DisputeError("Refund amount must be positive", "invalid");
    if (amount > tx.amountKobo) throw new DisputeError("Refund cannot exceed the payment", "invalid");

    const { driver } = getPaystack();
    const refund = await driver.refund({
      transactionReference: tx.paystackReference ?? tx.id,
      amountKobo: amount,
      reason: note,
    });
    refundReference = refund.refundReference;
    refundedKobo = refund.amountKobo ?? amount;
  }

  if (input.outcome === "release") {
    await moveEscrow(tx.id, "released", "admin", input.adminId, note); // queues the payout
    releasedKobo = tx.landlordNetKobo;
  } else if (input.outcome === "refund") {
    await moveEscrow(tx.id, "refunded", "admin", input.adminId, note);
    if (tx.bookingId) {
      await db.update(bookings).set({ status: "cancelled" }).where(eq(bookings.id, tx.bookingId));
    }
  } else {
    // split: student gets their share back, landlord is paid the rest of the net.
    const landlordShare = tx.landlordNetKobo - refundedKobo;
    if (landlordShare > 0n) {
      await db.update(transactions).set({ escrowStatus: "held" }).where(eq(transactions.id, tx.id));
      await moveEscrow(tx.id, "released", "admin", input.adminId, `split: ${note}`);
      releasedKobo = landlordShare;
    } else {
      await moveEscrow(tx.id, "refunded", "admin", input.adminId, `split: ${note}`);
    }
  }

  // Close the case and stamp the outcome on both rows.
  await db.update(disputes).set({
    status: "resolved",
    resolution: note,
    resolutionOutcome: input.outcome,
    refundedKobo: refundedKobo > 0n ? refundedKobo : null,
    releasedKobo: releasedKobo > 0n ? releasedKobo : null,
    paystackRefundReference: refundReference,
    resolvedBy: input.adminId,
    resolvedAt: new Date(),
  }).where(eq(disputes.id, dispute.id));

  await db.insert(auditLogs).values({
    actorId: input.adminId,
    actionType: "complete",
    targetResourceType: "dispute",
    targetResourceId: dispute.id,
    oldValues: { status: dispute.status },
    newValues: {
      status: "resolved",
      outcome: input.outcome,
      refundedKobo: refundedKobo.toString(),
      releasedKobo: releasedKobo.toString(),
      refundReference,
    },
  });

  const summary = input.outcome === "refund"
    ? `your payment of ${formatNgn(refundedKobo)} is being refunded`
    : input.outcome === "release"
      ? `the payment has been released to the landlord`
      : `${formatNgn(refundedKobo)} is being refunded to the student and ${formatNgn(releasedKobo)} released to the landlord`;

  for (const userId of [tx.studentId, tx.landlordId]) {
    await notifyUser({
      userId,
      type: "dispute_resolved",
      payload: { disputeId: dispute.id, outcome: input.outcome, refundedKobo: refundedKobo.toString(), releasedKobo: releasedKobo.toString() },
      message: `Kith: dispute closed — ${summary}. Note: ${note}`,
    });
  }

  return { disputeId: dispute.id, outcome: input.outcome, refundedKobo, releasedKobo, refundReference };
}

/** Ops queue: open cases with their transaction context, oldest first. */
export async function openDisputes() {
  const db = getDb();
  const rows = await db.select().from(disputes).where(inArray(disputes.status, ["open", "under_review"]));
  const txIds = rows.map((r) => r.transactionId);
  const txs = txIds.length ? await db.select().from(transactions).where(inArray(transactions.id, txIds)) : [];
  return rows
    .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
    .map((d) => ({ dispute: d, transaction: txs.find((t) => t.id === d.transactionId) ?? null }));
}

/** Whether a given transaction currently has an open case (used to hide "Report a problem"). */
export async function hasOpenDispute(transactionId: string) {
  const db = getDb();
  const rows = await db.select().from(disputes).where(and(eq(disputes.transactionId, transactionId), inArray(disputes.status, ["open", "under_review"])));
  return rows.length > 0;
}
