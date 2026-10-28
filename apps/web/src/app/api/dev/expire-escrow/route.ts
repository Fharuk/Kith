import { eq } from "drizzle-orm";
import { getDb, transactions } from "@kith/database";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** DEV/TEST ONLY — age a HELD escrow so the auto-release worker (24h window) fires now. */
export async function POST(req: Request) {
  if (process.env.NODE_ENV === "production") {
    return Response.json({ ok: false, error: "not available" }, { status: 404 });
  }
  const body = (await req.json().catch(() => ({}))) as { bookingId?: string; transactionId?: string } | null;
  const db = getDb();
  const tx = body?.transactionId
    ? (await db.select().from(transactions).where(eq(transactions.id, body.transactionId)))[0]
    : body?.bookingId
      ? (await db.select().from(transactions).where(eq(transactions.bookingId, body.bookingId)))[0]
      : undefined;
  if (!tx) return Response.json({ ok: false, error: "transaction not found" }, { status: 404 });
  await db.update(transactions).set({ autoReleaseAt: new Date(Date.now() - 60_000) }).where(eq(transactions.id, tx.id));
  return Response.json({ ok: true, transactionId: tx.id, escrowStatus: tx.escrowStatus });
}
