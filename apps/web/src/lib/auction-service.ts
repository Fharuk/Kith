import { and, desc, eq, lte } from "drizzle-orm";
import {
  getDb, auctions, bids, rooms, properties, bookings, transactions, notifications, auditLogs,
} from "@kith/database";
import {
  evaluateBid, applyBid, BID_REJECTION,
  type AuctionState, type BidIntent, type BidRejectionCode,
} from "@kith/domain";
import { newPaystackReference, initCheckout } from "./paystack";
import { moveEscrow } from "./escrow";

/**
 * Circle auctions — server-authoritative, DB-backed.
 *
 * The web app is the ONLY database writer (PGlite is single-writer in dev; Postgres in
 * prod), so the pure domain rules run here inside an optimistic-concurrency update on
 * `auctions.version`. The realtime service is a fan-out relay: after a successful write
 * we publish the new state to `auction:<id>`, and clients also poll as a fallback.
 */

const REALTIME_URL = (process.env.REALTIME_INTERNAL_URL ?? "http://localhost:3001").replace(/\/$/, "");
const INTERNAL_SECRET = process.env.INTERNAL_SECRET ?? "kith-internal-dev";

export function toDomainState(a: {
  id: string; roomId: string; landlordId: string;
  currentPriceKobo: bigint | null; floorPriceKobo: bigint | null; minIncrementKobo: bigint | null;
  scheduledEndTime: Date; actualEndTime: Date | null; status: AuctionState["status"];
  winningStudentId: string | null; totalBids: number; version: number;
}): AuctionState {
  return {
    id: a.id,
    roomId: a.roomId,
    landlordId: a.landlordId,
    currentPriceKobo: a.currentPriceKobo ?? 0n,
    floorPriceKobo: a.floorPriceKobo ?? 0n,
    minIncrementKobo: a.minIncrementKobo ?? 0n,
    scheduledEndTime: a.scheduledEndTime.getTime(),
    actualEndTime: (a.actualEndTime ?? a.scheduledEndTime).getTime(),
    status: a.status,
    winningStudentId: a.winningStudentId,
    totalBids: a.totalBids,
    version: a.version,
  };
}

export interface WireLiveState {
  id: string; roomId: string; landlordId: string;
  currentPriceKobo: string; floorPriceKobo: string; minIncrementKobo: string;
  scheduledEndTime: number; actualEndTime: number;
  status: AuctionState["status"]; winningStudentId: string | null;
  totalBids: number; version: number;
}

export const toWireState = (s: AuctionState): WireLiveState => ({
  ...s,
  currentPriceKobo: s.currentPriceKobo.toString(),
  floorPriceKobo: s.floorPriceKobo.toString(),
  minIncrementKobo: s.minIncrementKobo.toString(),
});

export interface WireBidRecord {
  id: string; studentId: string; label: string | null;
  amountKobo: string; status: string; createdAt: number;
}

/** Fan-out to the realtime relay. Best-effort: a dead relay must never fail a committed bid. */
async function publish(room: string, event: string, payload: unknown): Promise<void> {
  try {
    await fetch(`${REALTIME_URL}/internal/publish`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-internal-secret": INTERNAL_SECRET },
      body: JSON.stringify({ room, event, payload }),
      signal: AbortSignal.timeout(1500),
    });
  } catch {
    // relay unreachable — polling fallback keeps the UI live
  }
}

export async function loadAuction(auctionId: string) {
  const db = getDb();
  const auction = (await db.select().from(auctions).where(eq(auctions.id, auctionId)))[0]!;
  if (!auction) return null;
  const room = (await db.select().from(rooms).where(eq(rooms.id, auction.roomId)))[0]!;
  const property = room ? (await db.select().from(properties).where(eq(properties.id, room.propertyId)))[0]! : undefined;
  return { auction, room, property };
}

export async function listBids(auctionId: string, limit = 25): Promise<WireBidRecord[]> {
  const db = getDb();
  const rows = await db
    .select()
    .from(bids)
    .where(eq(bids.auctionId, auctionId))
    .orderBy(desc(bids.createdAt))
    .limit(limit);
  return rows.map((b) => ({
    id: b.id,
    studentId: b.studentId,
    label: (b as { bidderLabel?: string | null }).bidderLabel ?? null,
    amountKobo: b.amountKobo.toString(),
    status: b.status,
    createdAt: b.createdAt.getTime(),
  }));
}

export type PlaceBidResult =
  | { ok: true; state: AuctionState; record: WireBidRecord; extended: boolean }
  | { ok: false; code: BidRejectionCode | "not_found"; state?: AuctionState };

/**
 * Place a bid. Validation order: auction exists → domain rules → optimistic version
 * guard → insert bid → retire previous active bids → audit/notify → publish.
 */
export async function placeBid(input: {
  auctionId: string;
  bidderId: string;
  bidderLabel: string;
  isVerified: boolean;
  amountKobo: bigint;
  idempotencyKey: string;
  now?: number;
}): Promise<PlaceBidResult> {
  const db = getDb();
  const now = input.now ?? Date.now();
  const loaded = await loadAuction(input.auctionId);
  if (!loaded) return { ok: false, code: "not_found" };
  const state = toDomainState(loaded.auction);

  // Duplicate submission (double-tap / retry) — same key already recorded.
  const dupe = (await db.select().from(bids).where(eq(bids.idempotencyKey, input.idempotencyKey)))[0]!;
  if (dupe) return { ok: false, code: BID_REJECTION.DUPLICATE, state };

  const intent: BidIntent = {
    bidderId: input.bidderId,
    amountKobo: input.amountKobo,
    now,
    isVerifiedStudent: input.isVerified,
  };
  const decision = evaluateBid(state, intent);
  if (!decision.ok) return { ok: false, code: decision.code, state };

  const next = applyBid(state, intent, decision.newEndTime);

  // Optimistic concurrency: only the writer that saw `state.version` may advance it.
  const updated = await db
    .update(auctions)
    .set({
      currentPriceKobo: next.currentPriceKobo,
      winningStudentId: next.winningStudentId,
      totalBids: next.totalBids,
      actualEndTime: new Date(next.actualEndTime),
      status: next.status,
      version: next.version,
    })
    .where(and(eq(auctions.id, state.id), eq(auctions.version, state.version)))
    .returning({ id: auctions.id });
  if (updated.length === 0) return { ok: false, code: BID_REJECTION.CONTENTION, state };

  let record;
  try {
    const [inserted] = await db.insert(bids).values({
      auctionId: state.id,
      studentId: input.bidderId,
      amountKobo: input.amountKobo,
      status: "active",
      idempotencyKey: input.idempotencyKey,
    }).returning();
    if (!inserted) return { ok: false, code: BID_REJECTION.CONTENTION, state };
    record = { id: inserted.id, studentId: inserted.studentId, label: input.bidderLabel, amountKobo: inserted.amountKobo.toString(), status: inserted.status, createdAt: inserted.createdAt.getTime() };
  } catch {
    // unique(idempotencyKey) raced — treat as duplicate, no harm done (version already advanced
    // to the same value this key would produce).
    return { ok: false, code: BID_REJECTION.DUPLICATE, state };
  }

  // Everyone previously leading is now outbid.
  await db.update(bids).set({ status: "outbid" })
    .where(and(eq(bids.auctionId, state.id), eq(bids.status, "active")));
  await db.update(bids).set({ status: "active" }).where(eq(bids.id, record.id));

  if (state.winningStudentId && state.winningStudentId !== input.bidderId) {
    await db.insert(notifications).values({
      userId: state.winningStudentId, channel: "in_app", type: "outbid",
      payload: { auctionId: state.id, newPriceKobo: input.amountKobo.toString() },
    });
  }

  await db.insert(auditLogs).values({
    actorId: input.bidderId,
    actionType: "update",
    targetResourceType: "auction",
    targetResourceId: state.id,
    oldValues: { currentPriceKobo: state.currentPriceKobo.toString(), version: state.version },
    newValues: { currentPriceKobo: input.amountKobo.toString(), version: next.version, extended: decision.extended },
  });

  void publish(`auction:${state.id}`, "bid_placed", {
    state: toWireState(next), record, extended: decision.extended,
  });
  if (decision.extended) {
    void publish(`auction:${state.id}`, "auction_extended", { auctionId: state.id, newEndTime: next.actualEndTime });
  }

  return { ok: true, state: next, record, extended: decision.extended };
}

/**
 * Settlement worker pass: complete any auction whose clock has run out, creating the
 * winner's PENDING booking + PENDING transaction (paid through the same Paystack flow)
 * and releasing the room to them. Idempotent — safe to run every minute.
 */
export async function settleDueAuctions(now = Date.now()): Promise<{ settled: number; cancelled: number }> {
  const db = getDb();
  const due = await db.select().from(auctions).where(
    and(eq(auctions.status, "active"), lte(auctions.actualEndTime, new Date(now))),
  );
  const extendedDue = await db.select().from(auctions).where(
    and(eq(auctions.status, "extended"), lte(auctions.actualEndTime, new Date(now))),
  );
  let settled = 0, cancelled = 0;

  for (const auction of [...due, ...extendedDue]) {
    const state = toDomainState(auction);
    const winning = (await db.select().from(bids)
      .where(and(eq(bids.auctionId, auction.id), eq(bids.status, "active")))
      .orderBy(desc(bids.amountKobo), desc(bids.createdAt)))[0]!;

    if (!winning) {
      await db.update(auctions).set({ status: "cancelled" }).where(eq(auctions.id, auction.id));
      await db.update(rooms).set({ isAvailable: true }).where(eq(rooms.id, auction.roomId));
      await db.insert(auditLogs).values({
        actorId: null, actionType: "cancel", targetResourceType: "auction",
        targetResourceId: auction.id, oldValues: { status: auction.status }, newValues: { status: "cancelled", reason: "no bids" },
      });
      cancelled++;
      void publish(`auction:${auction.id}`, "auction_cancelled", { auctionId: auction.id });
      continue;
    }

    const room = (await db.select().from(rooms).where(eq(rooms.id, auction.roomId)))[0]!;
    const property = room ? (await db.select().from(properties).where(eq(properties.id, room.propertyId)))[0]! : undefined;
    if (!room || !property) continue;

    const price = winning.amountKobo;
    const platform = (price * 1500n) / 10_000n;
    const day = 86_400_000;
    const reference = newPaystackReference("KTH-AUC");

    const [booking] = await db.insert(bookings).values({
      auctionId: auction.id,
      roomId: room.id,
      studentId: winning.studentId,
      landlordId: auction.landlordId,
      bookedPriceKobo: price,
      checkInDate: new Date(now + 3 * day),
      checkOutDate: new Date(now + 368 * day),
      status: "pending",
      signedAgreementHash: null,
    }).returning();
    if (!booking) continue;

    const [tx] = await db.insert(transactions).values({
      bookingId: booking.id,
      auctionId: auction.id,
      studentId: winning.studentId,
      landlordId: auction.landlordId,
      amountKobo: price,
      platformFeeKobo: platform,
      landlordNetKobo: price - platform,
      transactionType: "auction_payment",
      status: "pending",
      escrowStatus: "pending",
      paystackReference: reference,
      autoReleaseAt: new Date(now + 4 * day),
    }).returning();
    if (!tx) continue;

    await db.update(auctions).set({
      status: "completed", winningStudentId: winning.studentId, version: state.version + 1,
    }).where(eq(auctions.id, auction.id));
    await db.update(bids).set({ status: "won" }).where(eq(bids.id, winning.id));
    await db.update(bids).set({ status: "outbid" })
      .where(and(eq(bids.auctionId, auction.id), eq(bids.status, "active")));
    await db.update(rooms).set({ isAvailable: false }).where(eq(rooms.id, room.id));

    await db.insert(notifications).values([
      {
        userId: winning.studentId, channel: "in_app", type: "auction_won",
        payload: { auctionId: auction.id, bookingId: booking.id, amountKobo: price.toString(), message: "You won the Circle auction — complete payment to secure the room." },
      },
      {
        userId: auction.landlordId, channel: "in_app", type: "auction_settled",
        payload: { auctionId: auction.id, bookingId: booking.id, amountKobo: price.toString() },
      },
    ]);
    await db.insert(auditLogs).values({
      actorId: null, actionType: "complete", targetResourceType: "auction", targetResourceId: auction.id,
      oldValues: { status: auction.status, version: state.version },
      newValues: { status: "completed", winningStudentId: winning.studentId, amountKobo: price.toString(), bookingId: booking.id, transactionId: tx.id },
    });

    settled++;
    void publish(`auction:${auction.id}`, "auction_settled", {
      auctionId: auction.id, bookingId: booking.id, winningStudentId: winning.studentId, amountKobo: price.toString(),
    });
  }

  return { settled, cancelled };
}

/**
 * Escrow auto-release (worker actor): any HELD transaction past its autoReleaseAt — i.e.
 * the student never checked in within the window — releases to the landlord.
 * Idempotent and audited per transaction.
 */
export async function releaseDueEscrows(now = Date.now()): Promise<{ released: number }> {
  const db = getDb();
  const due = await db.select().from(transactions).where(
    and(eq(transactions.escrowStatus, "held"), lte(transactions.autoReleaseAt, new Date(now))),
  );
  let released = 0;
  for (const tx of due) {
    try {
      await moveEscrow(tx.id, "released", "worker", null, "auto-release window elapsed (24h)");
      released++;
    } catch {
      // illegal transition (e.g. disputed) — leave for a human
    }
  }
  return { released };
}

/** Initialize payment for a settled auction win (student-side, from their dashboard). */
export async function initAuctionCheckout(bookingId: string, email: string): Promise<string | null> {
  const db = getDb();
  const tx = (await db.select().from(transactions).where(eq(transactions.bookingId, bookingId)))[0]!;
  if (!tx || !tx.paystackReference || tx.status !== "pending") return null;
  return initCheckout({
    transactionId: tx.id,
    reference: tx.paystackReference,
    email,
    amountKobo: tx.amountKobo,
  });
}
