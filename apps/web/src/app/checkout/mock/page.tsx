import type { Metadata } from "next";
import Link from "next/link";
import { eq } from "drizzle-orm";
import { getDb, transactions, bookings, rooms, properties } from "@kith/database";
import { formatNgn } from "@kith/domain";
import { redirect } from "next/navigation";
import { currentUser } from "@/lib/session";
import { MockPayButton } from "./mock-pay-button";

export const metadata: Metadata = { title: "Checkout · Kith" };
export const dynamic = "force-dynamic";

/**
 * Hosted test checkout (mock mode). Stands in for Paystack's authorization URL so the
 * golden flow — reserve → pay → signed webhook → escrow held → guest pass — is fully
 * walkable offline. When real keys are configured, `initialize` returns Paystack's own
 * URL instead and this page is never reached.
 */
export default async function MockCheckoutPage({ searchParams }: { searchParams: Promise<{ ref?: string }> }) {
  const { ref } = await searchParams;
  const user = await currentUser();
  if (!user) redirect("/login?callbackUrl=" + encodeURIComponent(ref ? `/checkout/mock?ref=${ref}` : "/dashboard"));
  const db = getDb();

  const tx = ref ? (await db.select().from(transactions).where(eq(transactions.paystackReference, ref)))[0] : undefined;
  const booking = tx?.bookingId ? (await db.select().from(bookings).where(eq(bookings.id, tx.bookingId)))[0] : undefined;
  const room = booking ? (await db.select().from(rooms).where(eq(rooms.id, booking.roomId)))[0] : undefined;
  const property = room ? (await db.select().from(properties).where(eq(properties.id, room.propertyId)))[0] : undefined;

  return (
    <main id="main" className="flex min-h-screen items-center justify-center bg-sand/70 px-4 py-16">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <Link href="/" className="font-display text-2xl font-semibold tracking-tight text-navy">Kith</Link>
          <p className="mt-1 text-xs text-ink/55">Your Verified Student Community</p>
        </div>

        <div className="rounded-card bg-paper p-8 shadow-lift hairline">
          {!tx ? (
            <>
              <p className="font-display text-xl text-navy">Unknown checkout reference</p>
              <p className="mt-2 text-sm text-ink/60">We could not find a pending payment for this link. Start again from your dashboard.</p>
              <Link href="/dashboard" className="mt-6 inline-block rounded-full bg-navy px-5 py-2.5 text-sm font-semibold text-paper">Back to dashboard</Link>
            </>
          ) : tx.status === "completed" ? (
            <>
              <p className="font-display text-xl text-navy">Already paid</p>
              <p className="mt-2 text-sm text-ink/60">This charge completed. Your guest pass is live.</p>
              <Link href="/passes" className="mt-6 inline-block rounded-full bg-kith-green px-5 py-2.5 text-sm font-semibold text-white">View guest pass</Link>
            </>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <p className="font-sans text-xs font-semibold uppercase tracking-[0.14em] text-ink/55">Pay Kith escrow</p>
                <span className="rounded-full bg-clay/15 px-3 py-1 text-[11px] font-semibold text-clay">Test mode · no real money</span>
              </div>

              <p className="mt-6 font-display text-4xl font-semibold tabular text-navy">{formatNgn(tx.amountKobo)}</p>
              {property && room && (
                <p className="mt-2 text-sm text-ink/60">
                  {property.title} · Room {room.roomNumber} — {room.tier === "circle" ? "Circle" : room.tier === "market" ? "Market" : "Elite"}
                </p>
              )}

              <dl className="mt-6 space-y-2 border-t border-hairline pt-4 text-sm">
                <div className="flex justify-between"><dt className="text-ink/55">Platform fee (15%)</dt><dd className="tabular font-semibold text-ink">{formatNgn(tx.platformFeeKobo)}</dd></div>
                <div className="flex justify-between"><dt className="text-ink/55">Landlord net (escrowed)</dt><dd className="tabular font-semibold text-ink">{formatNgn(tx.landlordNetKobo)}</dd></div>
                <div className="flex justify-between"><dt className="text-ink/55">Reference</dt><dd className="font-mono text-xs text-ink/70">{tx.paystackReference}</dd></div>
              </dl>

              <p className="mt-4 rounded-field bg-sand/70 p-3 text-xs leading-relaxed text-ink/60">
                Funds are held in escrow and released to the landlord only when a Kith porter confirms your
                check-in — or automatically after 24 hours. Paying as {user?.email ?? "student"}.
              </p>

              <MockPayButton reference={tx.paystackReference!} />
            </>
          )}
        </div>

        <p className="mt-6 text-center text-[11px] text-ink/45">
          Secured by Paystack · In test mode this page simulates the Paystack authorization flow
        </p>
      </div>
    </main>
  );
}
