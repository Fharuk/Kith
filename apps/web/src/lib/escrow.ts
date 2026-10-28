import { eq, and } from "drizzle-orm";
import { getDb, transactions, bookings, auditLogs, notifications, users } from "@kith/database";
import { transition, type EscrowActor } from "@kith/domain";

/**
 * Single escrow state-change path (playbook 02). Every transition is validated by the
 * domain state machine, audited, and notified. Throws on illegal transitions.
 */
export async function moveEscrow(
  transactionId: string,
  to: "held" | "released" | "disputed" | "refunded",
  actor: EscrowActor,
  actorUserId: string | null,
  reason?: string,
) {
  const db = getDb();
  const tx = (await db.select().from(transactions).where(eq(transactions.id, transactionId)))[0];
  if (!tx) throw new Error("transaction not found");
  transition(tx.escrowStatus, to, actor); // throws EscrowError on illegal moves

  await db.update(transactions).set({
    escrowStatus: to,
    releasedAt: to === "released" ? new Date() : tx.releasedAt,
  }).where(eq(transactions.id, transactionId));

  await db.insert(auditLogs).values({
    actorId: actorUserId,
    actionType: to === "released" ? "release" : to === "disputed" ? "dispute" : "update",
    targetResourceType: "transaction",
    targetResourceId: transactionId,
    oldValues: { escrowStatus: tx.escrowStatus },
    newValues: { escrowStatus: to, reason: reason ?? null },
  });

  if (tx.bookingId) {
    await db.insert(notifications).values([
      { userId: tx.studentId, channel: "in_app", type: `escrow_${to}`, payload: { transactionId, reason: reason ?? null } },
      { userId: tx.landlordId, channel: "in_app", type: `escrow_${to}`, payload: { transactionId, reason: reason ?? null } },
    ]);
  }
  return to;
}

/** Porter-confirmed check-in: booking -> checked_in, escrow held -> released, task done. */
export async function confirmCheckIn(bookingId: string, porterUserId: string) {
  const db = getDb();
  const booking = (await db.select().from(bookings).where(eq(bookings.id, bookingId)))[0];
  if (!booking) throw new Error("booking not found");
  if (booking.status !== "confirmed") throw new Error(`booking is ${booking.status}, not confirmed`);

  const tx = (
    await db.select().from(transactions).where(and(eq(transactions.bookingId, bookingId)))
  )[0];
  if (!tx) throw new Error("no transaction for booking");

  await db.update(bookings).set({ status: "checked_in" }).where(eq(bookings.id, bookingId));
  await moveEscrow(tx.id, "released", "porter", porterUserId, "porter-confirmed check-in");

  const { porterTasks } = await import("@kith/database");
  await db.update(porterTasks).set({ status: "done", completedAt: new Date() })
    .where(and(eq(porterTasks.bookingId, bookingId), eq(porterTasks.type, "check_in")));

  return { bookingId, releasedKobo: tx.landlordNetKobo };
}
