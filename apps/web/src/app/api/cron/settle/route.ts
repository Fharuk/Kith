import { settleDueAuctions, releaseDueEscrows } from "@/lib/auction-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/cron/settle — auction settlement + escrow auto-release worker pass.
 * Call every minute (cron / Vercel cron / k8s CronJob). Guarded by CRON_SECRET when set;
 * in development an unauthenticated call is allowed so the flow is testable.
 */
export async function POST(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get("authorization") !== `Bearer ${secret}`) {
    return Response.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  const settled = await settleDueAuctions();
  const released = await releaseDueEscrows();
  return Response.json({ ok: true, ...settled, ...released });
}

export async function GET(req: Request) {
  return POST(req);
}
