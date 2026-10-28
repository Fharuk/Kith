import { eq } from "drizzle-orm";
import { getDb, users, rooms, properties, bookings, transactions } from "@kith/database";
import { currentUser } from "@/lib/session";
import { initCheckout, newPaystackReference } from "@/lib/paystack";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * DEV/TEST ONLY — create a pending booking exactly as reserveRoom() does, without the
 * redirect, so the golden flow can be driven over HTTP. All writes happen inside the
 * web process (PGlite is single-writer). Disabled outside development.
 */
export async function POST() {
  if (process.env.NODE_ENV === "production") {
    return Response.json({ ok: false, error: "not available" }, { status: 404 });
  }
  const user = await currentUser();
  if (!user || user.role !== "student") {
    return Response.json({ ok: false, error: "student session required" }, { status: 401 });
  }

  const db = getDb();
  const available = await db.select().from(rooms).where(eq(rooms.isAvailable, true));
  const room = available.find((r) => r.saleMode === "fixed" && r.tier === "elite") ?? available.find((r) => r.saleMode === "fixed");
  if (!room) return Response.json({ ok: false, error: "no available fixed room" }, { status: 409 });

  const property = (await db.select().from(properties).where(eq(properties.id, room.propertyId)))[0];
  if (!property) return Response.json({ ok: false, error: "property missing" }, { status: 409 });
  const price = room.priceKobo ?? 0n;
  const platform = (price * 1500n) / 10_000n;
  const now = Date.now();
  const day = 86_400_000;

  const [booking] = await db.insert(bookings).values({
    roomId: room.id, studentId: user.id, landlordId: property.landlordId, bookedPriceKobo: price,
    checkInDate: new Date(now + 3 * day), checkOutDate: new Date(now + 368 * day), status: "pending",
  }).returning();
  if (!booking) return Response.json({ ok: false, error: "could not create booking" }, { status: 500 });

  const reference = newPaystackReference("KTH-DEV");
  const [tx] = await db.insert(transactions).values({
    bookingId: booking.id, studentId: user.id, landlordId: property.landlordId,
    amountKobo: price, platformFeeKobo: platform, landlordNetKobo: price - platform,
    transactionType: "booking", status: "pending", escrowStatus: "pending",
    paystackReference: reference, autoReleaseAt: new Date(now + 4 * day),
  }).returning();
  if (!tx) return Response.json({ ok: false, error: "could not create transaction" }, { status: 500 });

  await db.update(rooms).set({ isAvailable: false }).where(eq(rooms.id, room.id));
  const url = await initCheckout({ transactionId: tx.id, reference, email: user.email, amountKobo: price });

  return Response.json({
    ok: true, bookingId: booking.id, transactionId: tx.id, reference, checkoutUrl: url,
    room: room.roomNumber, tier: room.tier, amountKobo: price.toString(),
  });
}
