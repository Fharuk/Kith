import { NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { getDb, guestPasses, bookings, rooms, properties, users } from "@kith/database";
import { currentUser } from "@/lib/session";
import { totpCode } from "@/lib/totp";

/**
 * Porter terminal: resolve a rotating 6-digit pass code to a booking.
 * Accepts current ±1 step window (clock skew at the gate). Read-only.
 */
export async function POST(req: Request) {
  const user = await currentUser();
  if (!user || user.role !== "porter") {
    return NextResponse.json({ error: "porter role required" }, { status: 403 });
  }
  const { code } = (await req.json().catch(() => ({}))) as { code?: string };
  if (!code || !/^\d{6}$/.test(code)) {
    return NextResponse.json({ granted: false, reason: "invalid_code_format" }, { status: 400 });
  }

  const db = getDb();
  const step = 300;
  const now = Date.now();

  // We cannot invert hashes, so verify per active pass: recompute each pass's
  // current ±1 windows and compare with the presented code.
  const active = await db
    .select({ pass: guestPasses, booking: bookings, room: rooms, property: properties, student: users })
    .from(guestPasses)
    .innerJoin(bookings, eq(guestPasses.bookingId, bookings.id))
    .innerJoin(rooms, eq(bookings.roomId, rooms.id))
    .innerJoin(properties, eq(rooms.propertyId, properties.id))
    .innerJoin(users, eq(bookings.studentId, users.id))
    .where(and(eq(bookings.status, "confirmed"), eq(guestPasses.status, "active")));

  for (const row of active) {
    const secret = row.pass.totpSecretEnc.replace(/^enc:/, "");
    const ok = [0, -1, 1].some((w) => totpCode(secret, step, now + w * step * 1000) === code);
    if (!ok) continue;
    return NextResponse.json({
      granted: true,
      bookingId: row.booking.id,
      guest: {
        label: row.student.pseudonymizedId,
        name: `${row.student.firstName} ${row.student.lastName[0]}.`,
        property: row.property.title,
        room: row.room.roomNumber,
        checkIn: row.booking.checkInDate,
      },
    });
  }
  return NextResponse.json({ granted: false, reason: "code_not_recognised" }, { status: 404 });
}
