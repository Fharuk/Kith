import Link from "next/link";
import { eq, inArray } from "drizzle-orm";
import { getDb, properties, rooms, transactions, bookings, landlordProfiles } from "@kith/database";
import { formatNgn, splitPayment } from "@kith/domain";
import { requireUser } from "@/lib/session";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";

export const metadata = { title: "Landlord console" };

export default async function LandlordConsole() {
  const user = await requireUser();
  const db = getDb();
  const profile = (await db.select().from(landlordProfiles).where(eq(landlordProfiles.userId, user.id)))[0];
  const myProperties = await db.select().from(properties).where(eq(properties.landlordId, user.id));
  const ids = myProperties.map((p) => p.id);
  const myRooms = ids.length ? await db.select().from(rooms).where(inArray(rooms.propertyId, ids)) : [];
  const txs = await db.select().from(transactions).where(eq(transactions.landlordId, user.id));
  const held = txs.filter((t) => t.escrowStatus === "held").reduce((a, t) => a + (t.landlordNetKobo ?? 0n), 0n);
  const released = txs.filter((t) => t.escrowStatus === "released").reduce((a, t) => a + (t.landlordNetKobo ?? 0n), 0n);
  const myBookings = await db.select().from(bookings).where(eq(bookings.landlordId, user.id));

  return (
    <>
      <SiteNav />
      <main className="mx-auto max-w-6xl px-6 py-16">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-clay">{profile?.businessName ?? "Your portfolio"}</p>
        <h1 className="mt-2 text-4xl">Revenue & listings.</h1>

        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          <Card label="In escrow (your 85%)" value={formatNgn(held)} hint="Releases on porter-confirmed check-in" />
          <Card label="Released to you" value={formatNgn(released)} hint="Settled to your Paystack subaccount" />
          <Card label="Active bookings" value={String(myBookings.length)} hint="Across all properties" />
        </div>

        <section className="mt-12">
          <div className="flex items-center justify-between">
            <h2 className="font-sans text-sm font-semibold uppercase tracking-[0.14em] text-ink/55">Your properties</h2>
            <span className="text-xs text-ink/50">{myProperties.length} listed · {myRooms.length} rooms in first property</span>
          </div>
          <ul className="mt-4 space-y-3">
            {myProperties.map((p) => (
              <li key={p.id} className="flex flex-wrap items-center justify-between gap-4 rounded-card bg-paper p-5 shadow-card hairline">
                <div>
                  <p className="font-semibold text-navy">{p.title}</p>
                  <p className="text-xs text-ink/55">{p.address}, {p.city} · {p.isPhysicallyVerified ? "porter-verified" : "verification pending"}</p>
                </div>
                <Link href="/rooms" className="rounded-full bg-sand px-4 py-2 text-xs font-semibold text-navy hover:bg-sand/70">View live listing</Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-12">
          <h2 className="font-sans text-sm font-semibold uppercase tracking-[0.14em] text-ink/55">Transactions</h2>
          <ul className="mt-4 space-y-2">
            {txs.map((t) => {
              const split = splitPayment(t.amountKobo ?? 0n, 1500);
              void split;
              return (
                <li key={t.id} className="flex flex-wrap items-center justify-between gap-3 rounded-field bg-sand/60 px-4 py-3 text-sm">
                  <span className="font-mono text-xs text-ink/55">{t.paystackReference}</span>
                  <span className="text-xs uppercase tracking-wide text-ink/50">{t.escrowStatus}</span>
                  <span className="tabular font-semibold text-navy">{formatNgn(t.landlordNetKobo ?? 0n)} of {formatNgn(t.amountKobo ?? 0n)}</span>
                </li>
              );
            })}
          </ul>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

function Card({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="rounded-card bg-paper p-6 shadow-card hairline">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink/50">{label}</p>
      <p className="tabular mt-2 font-display text-3xl text-navy">{value}</p>
      <p className="mt-1 text-xs text-ink/55">{hint}</p>
    </div>
  );
}
