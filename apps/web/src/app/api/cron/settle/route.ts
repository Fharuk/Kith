import { settleDueAuctions, releaseDueEscrows } from "@/lib/auction-service";
import { processDuePayouts, queueMissingPayouts } from "@/lib/payouts";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/cron/settle — the money worker pass. Every tick:
 *   1. settle auctions whose clock ran out (creates the winner's payable booking)
 *   2. auto-release escrows past their 24h window
 *   3. reconcile released escrows that have no payout row yet
 *   4. push due payouts to the landlord's bank (with retry/backoff)
 *
 * Idempotent by construction, so it is safe to call every minute from Vercel Cron, a k8s
 * CronJob, or the standalone worker. Guarded by CRON_SECRET when set.
 */
export async function POST(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get("authorization") !== `Bearer ${secret}`) {
    return Response.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  const settled = await settleDueAuctions();
  const released = await releaseDueEscrows();
  const reconciled = await queueMissingPayouts();
  const paidOut = await processDuePayouts();
  return Response.json({ ok: true, ...settled, ...released, ...reconciled, payouts: paidOut });
}

export async function GET(req: Request) {
  return POST(req);
}
