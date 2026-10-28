import { and, eq } from "drizzle-orm";
import { getDb, auctions, rooms, properties } from "@kith/database";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * DEV/TEST ONLY — open a fresh 12-minute Circle auction on a circle room (or one given
 * in the body). Disabled outside development. Landlords will schedule auctions from
 * their console in the landlord slice.
 */
export async function POST(req: Request) {
  if (process.env.NODE_ENV === "production") {
    return Response.json({ ok: false, error: "not available" }, { status: 404 });
  }
  const body = (await req.json().catch(() => ({}))) as { roomId?: string; minutes?: number; seconds?: number } | null;
  const db = getDb();

  let room;
  if (body?.roomId) {
    room = (await db.select().from(rooms).where(eq(rooms.id, body.roomId)))[0]!;
  } else {
    const circleRooms = await db.select().from(rooms).where(eq(rooms.tier, "circle"));
    room = circleRooms.find((r) => r.floorPriceKobo !== null) ?? circleRooms[0]!;
  }
  if (!room) return Response.json({ ok: false, error: "no circle room" }, { status: 409 });

  const property = (await db.select().from(properties).where(eq(properties.id, room.propertyId)))[0];
  if (!property) return Response.json({ ok: false, error: "property missing" }, { status: 409 });
  const seconds = body?.seconds ? Math.max(1, Math.min(7200, body.seconds)) : undefined;
  const minutes = Math.max(1, Math.min(120, body?.minutes ?? 12));
  const now = Date.now();
  const endsAt = new Date(now + (seconds ? seconds * 1000 : minutes * 60_000));

  // Close any running auction for this room first (one live auction per room).
  await db.update(auctions).set({ status: "cancelled" })
    .where(and(eq(auctions.roomId, room.id), eq(auctions.status, "active")));

  const [auction] = await db.insert(auctions).values({
    roomId: room.id,
    landlordId: property.landlordId,
    currentPriceKobo: room.floorPriceKobo ?? room.priceKobo ?? 0n,
    floorPriceKobo: room.floorPriceKobo ?? room.priceKobo ?? 0n,
    minIncrementKobo: room.minIncrementKobo ?? 50_000n,
    scheduledEndTime: endsAt,
    actualEndTime: endsAt,
    status: "active",
    totalBids: 0,
    version: 1,
  }).returning();
  if (!auction) return Response.json({ ok: false, error: "could not open auction" }, { status: 500 });

  await db.update(rooms).set({ isAvailable: false }).where(eq(rooms.id, room.id));

  return Response.json({
    ok: true,
    auctionId: auction.id,
    room: room.roomNumber,
    property: property.title,
    floorPriceKobo: (auction.floorPriceKobo ?? 0n).toString(),
    minIncrementKobo: (auction.minIncrementKobo ?? 0n).toString(),
    endsAt: endsAt.toISOString(),
  });
}
