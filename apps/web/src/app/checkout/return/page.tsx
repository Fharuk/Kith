import type { Metadata } from "next";
import Link from "next/link";
import { eq } from "drizzle-orm";
import { getDb, transactions } from "@kith/database";
import { formatNgn } from "@kith/domain";
import { redirect } from "next/navigation";
import { currentUser } from "@/lib/session";
import { verifyAndConfirm } from "@/lib/paystack-webhook";

export const metadata: Metadata = { title: "Payment status · Kith" };
export const dynamic = "force-dynamic";

/**
 * Paystack callback_url landing page (live mode). The webhook is the source of truth,
 * but webhooks can lag — so this page runs the verify fallback once server-side and
 * renders the resulting ledger state.
 */
export default async function CheckoutReturnPage({
  searchParams,
}: {
  searchParams: Promise<{ tx?: string; trxref?: string; reference?: string }>;
}) {
  const { tx: txId, trxref, reference } = await searchParams;
  const user = await currentUser();
  if (!user) redirect("/login?callbackUrl=" + encodeURIComponent(txId ? `/checkout/return?tx=${txId}` : "/dashboard"));
  const db = getDb();
  const ref = trxref || reference;

  // Verify fallback: applies the same confirmation path as the webhook if it hasn't landed.
  if (ref) {
    try {
      await verifyAndConfirm(ref);
    } catch {
      // Paystack unreachable — fall through to whatever the ledger says.
    }
  }

  const tx = txId
    ? (await db.select().from(transactions).where(eq(transactions.id, txId)))[0]
    : ref
      ? (await db.select().from(transactions).where(eq(transactions.paystackReference, ref)))[0]
      : undefined;

  const paid = tx?.status === "completed";

  return (
    <main id="main" className="flex min-h-screen items-center justify-center bg-sand/70 px-4 py-16">
      <div className="w-full max-w-md rounded-card bg-paper p-8 text-center shadow-lift hairline">
        <Link href="/" className="font-display text-2xl font-semibold tracking-tight text-navy">Kith</Link>
        {!tx ? (
          <>
            <p className="mt-6 font-display text-xl text-navy">Payment reference not found</p>
            <Link href="/dashboard" className="mt-6 inline-block rounded-full bg-navy px-5 py-2.5 text-sm font-semibold text-paper">Back to dashboard</Link>
          </>
        ) : paid ? (
          <>
            <p className="mt-6 font-display text-2xl text-navy">Payment received</p>
            <p className="mt-2 text-sm text-ink/60">
              {formatNgn(tx.amountKobo)} is held in escrow. Your booking is confirmed and your guest pass is live.
            </p>
            <Link href="/passes" className="mt-6 inline-block rounded-full bg-kith-green px-5 py-2.5 text-sm font-semibold text-white">View guest pass</Link>
          </>
        ) : (
          <>
            <p className="mt-6 font-display text-2xl text-navy">Still confirming…</p>
            <p className="mt-2 text-sm text-ink/60">
              We have not received confirmation for {tx.paystackReference ?? "this payment"} yet. If money left your account it will
              reconcile within a few minutes — refresh, or resume from your dashboard.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <Link href="/dashboard" className="rounded-full bg-navy px-5 py-2.5 text-sm font-semibold text-paper">Dashboard</Link>
              <button onClick={() => location.reload()} className="rounded-full bg-sand px-5 py-2.5 text-sm font-semibold text-navy hairline">Refresh status</button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
