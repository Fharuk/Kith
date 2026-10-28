import { and, eq } from "drizzle-orm";
import { getDb, auctions } from "@kith/database";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** DEV/TEST ONLY — force an auction's clock into the past so the settlement worker picks it up. */
export async function POST(req: Request) {
  if (process.env.NODE_ENV === "production") {
    return Response.json({ ok: false, error: "not available" }, { status: 404 });
  }
  const body = (await req.json().catch(() => ({}))) as { auctionId?: string } | null;
  if (!body?.auctionId) return Response.json({ ok: false, error: "auctionId required" }, { status: 400 });
  const db = getDb();
  const past = new Date(Date.now() - 1000);
  const a = await db.update(auctions).set({ actualEndTime: past })
    .where(and(eq(auctions.id, body.auctionId), eq(auctions.status, "active")))
    .returning({ id: auctions.id });
  const b = a.length ? [] : await db.update(auctions).set({ actualEndTime: past })
    .where(and(eq(auctions.id, body.auctionId), eq(auctions.status, "extended")))
    .returning({ id: auctions.id });
  return Response.json({ ok: a.length + b.length > 0, forced: a.length + b.length });
}
