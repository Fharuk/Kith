import { eq, and } from "drizzle-orm";
import { getDb, transactions, bookings } from "@kith/database";
import { currentUser } from "@/lib/session";
import { initCheckout } from "@/lib/paystack";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Resume checkout for a pending booking: { bookingId } → re-initializes Paystack with
 * the SAME transaction reference (idempotent on Paystack's side) and returns the
 * authorization URL. Owner (student) only.
 */
export async function POST(req: Request) {
  const user = await currentUser();
  if (!user) return Response.json({ ok: false, error: "auth required" }, { status: 401 });

  const body = (await req.json().catch(() => null)) as { bookingId?: string } | null;
  const bookingId = String(body?.bookingId ?? "");
  if (!bookingId) return Response.json({ ok: false, error: "bookingId required" }, { status: 400 });

  const db = getDb();
  const booking = (await db.select().from(bookings).where(eq(bookings.id, bookingId)))[0];
  if (!booking) return Response.json({ ok: false, error: "booking not found" }, { status: 404 });
  if (user.role !== "admin" && booking.studentId !== user.id) {
    return Response.json({ ok: false, error: "forbidden" }, { status: 403 });
  }
  if (booking.status !== "pending") {
    return Response.json({ ok: false, error: `booking is ${booking.status}, not awaiting payment` }, { status: 409 });
  }

  const tx = (
    await db.select().from(transactions).where(and(eq(transactions.bookingId, bookingId), eq(transactions.status, "pending")))
  )[0];
  if (!tx || !tx.paystackReference) {
    return Response.json({ ok: false, error: "no pending transaction for this booking" }, { status: 409 });
  }

  const url = await initCheckout({
    transactionId: tx.id,
    reference: tx.paystackReference,
    email: user.email,
    amountKobo: tx.amountKobo,
  });
  return Response.json({ ok: true, url, reference: tx.paystackReference });
}
