import { NextResponse } from "next/server";
import { currentUser } from "@/lib/session";
import { confirmCheckIn } from "@/lib/escrow";

/** Porter confirms a verified guest at the gate → booking checked_in, escrow released. */
export async function POST(req: Request) {
  const user = await currentUser();
  if (!user || user.role !== "porter") {
    return NextResponse.json({ error: "porter role required" }, { status: 403 });
  }
  const { bookingId } = (await req.json().catch(() => ({}))) as { bookingId?: string };
  if (!bookingId) return NextResponse.json({ error: "bookingId required" }, { status: 400 });
  try {
    const result = await confirmCheckIn(bookingId, user.id);
    return NextResponse.json({
      ok: true,
      bookingId: result.bookingId,
      releasedKobo: result.releasedKobo !== null ? result.releasedKobo.toString() : null,
    });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "failed" }, { status: 409 });
  }
}
