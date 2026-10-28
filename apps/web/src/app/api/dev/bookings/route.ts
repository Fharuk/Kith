import { desc, eq } from "drizzle-orm";
import { getDb, bookings, transactions, rooms } from "@kith/database";
import { currentUser } from "@/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** DEV/TEST ONLY — the signed-in student's bookings with their transactions (ids only). */
export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return Response.json({ ok: false, error: "not available" }, { status: 404 });
  }
  const user = await currentUser();
  if (!user) return Response.json({ ok: false, error: "auth required" }, { status: 401 });
  const db = getDb();
  const rows = await db
    .select({ booking: bookings, tx: transactions, room: rooms })
    .from(bookings)
    .leftJoin(transactions, eq(transactions.bookingId, bookings.id))
    .leftJoin(rooms, eq(rooms.id, bookings.roomId))
    .where(eq(bookings.studentId, user.id))
    .orderBy(desc(bookings.createdAt));
  return Response.json({
    ok: true,
    bookings: rows.map((r) => ({
      bookingId: r.booking.id,
      status: r.booking.status,
      room: r.room?.roomNumber ?? null,
      amountKobo: r.booking.bookedPriceKobo?.toString() ?? null,
      transactionId: r.tx?.id ?? null,
      txStatus: r.tx?.status ?? null,
      escrowStatus: r.tx?.escrowStatus ?? null,
      reference: r.tx?.paystackReference ?? null,
      type: r.tx?.transactionType ?? null,
    })),
  });
}
