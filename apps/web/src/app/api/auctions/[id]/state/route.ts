import { loadAuction, listBids, toDomainState, toWireState, settleDueAuctions } from "@/lib/auction-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/auctions/:id/state — polling fallback + initial hydrate for the live room. */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await settleDueAuctions();
  const loaded = await loadAuction(id);
  if (!loaded) return Response.json({ ok: false, code: "not_found" }, { status: 404 });
  return Response.json({
    ok: true,
    state: toWireState(toDomainState(loaded.auction)),
    bids: await listBids(id),
    room: loaded.room ? { roomNumber: loaded.room.roomNumber, tier: loaded.room.tier } : null,
    property: loaded.property ? { title: loaded.property.title, city: loaded.property.city } : null,
  });
}
