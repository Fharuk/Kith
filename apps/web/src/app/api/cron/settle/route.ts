import { settleDueAuctions, releaseDueEscrows } from "@/lib/auction-service";
import { processDuePayouts, queueMissingPayouts } from "@/lib/payouts";
import { withWorkerLock } from "@/lib/worker-lock";
import { processNotificationOutbox } from "@/lib/providers/notify";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/cron/settle — the money worker pass. Every tick:
 *   1. settle auctions whose clock ran out (creates the winner's payable booking)
 *   2. auto-release escrows past their 24h window
 *   3. reconcile released escrows that have no payout row yet
 *   4. push due payouts to the landlord's bank (with retry/backoff)
 *   5. retry queued SMS/email that a vendor failed to accept (outbox)
 *
 * Idempotent by construction, so it is safe to call every minute from Vercel Cron, a k8s
 * CronJob, or the standalone worker. Guarded by CRON_SECRET when set, and single-flighted by
 * a Postgres advisory lock so overlapping invocations cannot race the same rows (the loser
 * answers 202 "busy" and the next tick does the work).
 */
export async function POST(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get("authorization") !== `Bearer ${secret}`) {
    return Response.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  const pass = await withWorkerLock(async () => {
    const settled = await settleDueAuctions();
    const released = await releaseDueEscrows();
    const reconciled = await queueMissingPayouts();
    const paidOut = await processDuePayouts();
    const outbox = await processNotificationOutbox();
    return { ...settled, ...released, ...reconciled, payouts: paidOut, notifications: outbox };
  });

  if (!pass.ran) {
    return Response.json({ ok: true, skipped: "another worker pass is in flight" }, { status: 202 });
  }
  return Response.json({ ok: true, ...pass.result });
}

export async function GET(req: Request) {
  return POST(req);
}
