import { handlePaystackEvent } from "@/lib/paystack-webhook";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Paystack webhook endpoint. Configure in the Paystack dashboard to POST here:
 *   https://<app>/api/webhooks/paystack
 * Signature verification runs on the RAW body (never re-serialized JSON).
 * Always answer fast: 200 ack (even for ignored events), 400 only on bad signature/parse.
 */
export async function POST(req: Request) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-paystack-signature");
  const result = await handlePaystackEvent(rawBody, signature);
  return Response.json(result.body, { status: result.status });
}
