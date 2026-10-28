import { currentUser } from "@/lib/session";
import { placeBid, toWireState, loadAuction, settleDueAuctions } from "@/lib/auction-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/auctions/:id/bids  { amountKobo: "5500000", idempotencyKey: "..." }
 * Server-authoritative bidding: verified students only, 20 bids/min/user, optimistic
 * version guard against double-spend, then fan-out to the realtime relay.
 */
const RATE_LIMIT = 20;
const WINDOW_MS = 60_000;
const hits = new Map<string, number[]>();

function rateLimited(userId: string, now: number): boolean {
  const recent = (hits.get(userId) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= RATE_LIMIT) { hits.set(userId, recent); return true; }
  recent.push(now);
  hits.set(userId, recent);
  return false;
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await currentUser();
  if (!user) return Response.json({ ok: false, code: "unauthenticated" }, { status: 401 });
  if (user.role !== "student") return Response.json({ ok: false, code: "student_only" }, { status: 403 });
  if (!user.isVerified) return Response.json({ ok: false, code: "student_not_verified" }, { status: 403 });

  const body = (await req.json().catch(() => null)) as { amountKobo?: string; idempotencyKey?: string } | null;
  const amount = String(body?.amountKobo ?? "");
  const idempotencyKey = String(body?.idempotencyKey ?? "");
  if (!/^\d+$/.test(amount) || amount.length > 15) {
    return Response.json({ ok: false, code: "invalid_amount" }, { status: 400 });
  }
  if (idempotencyKey.length < 8) return Response.json({ ok: false, code: "invalid_idempotency_key" }, { status: 400 });

  const now = Date.now();
  if (rateLimited(user.id, now)) return Response.json({ ok: false, code: "rate_limited" }, { status: 429 });

  // Lazily settle anything whose clock already ran out before accepting new bids.
  await settleDueAuctions(now);

  const loaded = await loadAuction(id);
  if (!loaded) return Response.json({ ok: false, code: "not_found" }, { status: 404 });

  const result = await placeBid({
    auctionId: id,
    bidderId: user.id,
    bidderLabel: user.pseudonymizedId,
    isVerified: user.isVerified,
    amountKobo: BigInt(amount),
    idempotencyKey,
    now,
  });

  if (!result.ok) {
    const status = result.code === "not_found" ? 404 : result.code === "rate_limited" ? 429 : 409;
    return Response.json(
      { ok: false, code: result.code, state: result.state ? toWireState(result.state) : null },
      { status },
    );
  }
  return Response.json({ ok: true, state: toWireState(result.state), record: result.record, extended: result.extended });
}
