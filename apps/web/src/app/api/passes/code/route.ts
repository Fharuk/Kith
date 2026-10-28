import { NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { getDb, bookings, guestPasses } from "@kith/database";
import { currentUser } from "@/lib/session";
import { totpCode, currentStepExpiresAt } from "@/lib/totp";

/** Codes are computed server-side; the TOTP secret never reaches the browser. */
export async function GET(req: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  const bookingId = new URL(req.url).searchParams.get("booking");
  if (!bookingId) return NextResponse.json({ error: "missing booking" }, { status: 400 });

  const db = getDb();
  const row = (
    await db
      .select({ booking: bookings, pass: guestPasses })
      .from(bookings)
      .leftJoin(guestPasses, eq(bookings.id, guestPasses.bookingId))
      .where(and(eq(bookings.id, bookingId), eq(bookings.studentId, user.id)))
  )[0];
  if (!row?.pass) return NextResponse.json({ error: "not found" }, { status: 404 });

  const secret = row.pass.totpSecretEnc.replace(/^enc:/, "");
  return NextResponse.json({
    code: totpCode(secret, row.pass.stepSeconds),
    expiresAt: currentStepExpiresAt(row.pass.stepSeconds),
  });
}
