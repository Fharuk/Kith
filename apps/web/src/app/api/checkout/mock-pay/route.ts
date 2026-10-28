import { eq } from "drizzle-orm";
import { getDb, transactions } from "@kith/database";
import { MockPaystack } from "@kith/paystack";
import { getPaystack } from "@/lib/paystack";
import { handlePaystackEvent } from "@/lib/paystack-webhook";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Hosted test-checkout "charge" endpoint (mock mode ONLY — 403 in live).
 * Builds a properly HMAC-signed charge.success body from the stored transaction and
 * feeds it through the exact same handlePaystackEvent path as live Paystack traffic,
 * so signature verification and ledger effects are never bypassed in any environment.
 */
export async function POST(req: Request) {
  const { cfg } = getPaystack();
  if (cfg.mode !== "mock") {
    return Response.json({ ok: false, error: "mock checkout is disabled when Paystack live keys are configured" }, { status: 403 });
  }

  const body = (await req.json().catch(() => null)) as { reference?: string } | null;
  const reference = String(body?.reference ?? "");
  if (!reference) return Response.json({ ok: false, error: "reference required" }, { status: 400 });

  const db = getDb();
  const tx = (await db.select().from(transactions).where(eq(transactions.paystackReference, reference)))[0];
  if (!tx) return Response.json({ ok: false, error: "unknown reference" }, { status: 404 });

  if (tx.status === "completed") {
    return Response.json({ ok: true, alreadyPaid: true });
  }

  const mock = new MockPaystack({ webhookSecret: cfg.webhookSecret });
  const { rawBody, signature } = mock.buildChargeSuccess({
    reference: tx.paystackReference!,
    amount: Number(tx.amountKobo),
    currency: tx.currency,
  });

  const result = await handlePaystackEvent(rawBody, signature);
  if (result.status !== 200 || result.body.ok !== true) {
    return Response.json({ ok: false, error: "webhook handler rejected the mock charge", detail: result.body }, { status: 500 });
  }
  return Response.json({ ok: true, reference, applied: result.body });
}
