import Link from "next/link";
import { eq, inArray } from "drizzle-orm";
import { getDb, properties, rooms, transactions, bookings, landlordProfiles, payouts } from "@kith/database";
import { formatNgn, splitPayment } from "@kith/domain";
import { requireUser } from "@/lib/session";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { getPaystack } from "@/lib/paystack";
import { PayoutAccountForm } from "./payout-account-form";
import { ListingForm } from "./listing-form";
import { MaintenanceTicketRow, type TicketView } from "@/components/maintenance-ticket-row";
import { landlordTickets } from "@/lib/maintenance";
import { isOverdue, type MaintenanceCategory } from "@/lib/maintenance-config";

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

  /* payouts: what actually left the escrow ledger and hit a bank account */
  const myPayouts = await db.select().from(payouts).where(eq(payouts.landlordId, user.id));
  const paidOut = myPayouts.filter((p) => p.status === "paid").reduce((a, p) => a + (p.amountKobo ?? 0n), 0n);
  const inFlight = myPayouts.filter((p) => p.status === "queued" || p.status === "processing").reduce((a, p) => a + (p.amountKobo ?? 0n), 0n);
  const failedPayouts = myPayouts.filter((p) => p.status === "failed");
  let banks: { code: string; name: string }[] = [];
  try {
    banks = await getPaystack().driver.listBanks();
  } catch {
    banks = [];
  }

  const tickets = await landlordTickets(user.id);
  const ticketViews: TicketView[] = tickets.map(({ ticket, property }) => ({
    id: ticket.id,
    category: ticket.category,
    description: ticket.description,
    status: ticket.status,
    createdAt: ticket.createdAt.toISOString(),
    acknowledgedAt: ticket.acknowledgedAt ? ticket.acknowledgedAt.toISOString() : null,
    resolutionNote: ticket.resolutionNote,
    propertyTitle: property.title,
    overdue: isOverdue({ status: ticket.status, acknowledgedAt: ticket.acknowledgedAt, createdAt: ticket.createdAt }, ticket.category as MaintenanceCategory),
    photoCount: ticket.photoIds.length,
  }));
  const openTickets = ticketViews.filter((t) => t.status !== "resolved");

  return (
    <>
      <SiteNav />
      <main id="main" className="mx-auto max-w-6xl px-6 py-16">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-clay">{profile?.businessName ?? "Your portfolio"}</p>
        <h1 className="mt-2 text-4xl">Revenue & listings.</h1>

        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          <Card label="In escrow (your 85%)" value={formatNgn(held)} hint="Releases on porter-confirmed check-in" />
          <Card label="Released to you" value={formatNgn(released)} hint="Escrow released by porter check-in or 24h" />
          <Card label="Paid to your bank" value={formatNgn(paidOut)} hint={inFlight > 0n ? `${formatNgn(inFlight)} in flight` : "Transfers settled"} />
        </div>

        <section className="mt-10">
          <ListingForm />
        </section>

        <section className="mt-10 grid gap-6 lg:grid-cols-[1fr_1.1fr]">
          <PayoutAccountForm
            banks={banks}
            current={profile ? {
              bankName: profile.bankName,
              last4: profile.bankAccountNumber ? profile.bankAccountNumber.slice(-4) : null,
              accountName: profile.bankAccountName,
              verifiedAt: profile.bankVerifiedAt,
              hold: profile.payoutHold,
            } : null}
          />

          <div className="rounded-card bg-paper p-6 shadow-card hairline">
            <h2 className="font-sans text-sm font-semibold uppercase tracking-[0.14em] text-ink/55">Payout history</h2>
            {myPayouts.length === 0 ? (
              <p className="mt-4 rounded-field bg-sand/60 px-4 py-3 text-xs text-ink/60">
                No payouts yet. Escrow releases are transferred to your verified account automatically.
              </p>
            ) : (
              <ul className="mt-4 space-y-2">
                {myPayouts.slice(0, 6).map((p) => (
                  <li key={p.id} className="flex flex-wrap items-center justify-between gap-2 rounded-field bg-sand/60 px-4 py-2.5 text-sm">
                    <span className="tabular font-semibold text-navy">{formatNgn(p.amountKobo ?? 0n)}</span>
                    <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                      p.status === "paid" ? "bg-kith-green/15 text-kith-green-deep"
                      : p.status === "failed" ? "bg-danger/10 text-danger"
                      : p.status === "cancelled" ? "bg-ink/10 text-ink/60"
                      : "bg-kith-blue/15 text-kith-blue-deep"
                    }`}>{p.status}</span>
                    <span className="font-mono text-[10px] text-ink/45">{p.transferReference ?? "queued"}</span>
                  </li>
                ))}
              </ul>
            )}
            {failedPayouts.length > 0 && (
              <p className="mt-3 rounded-field bg-danger/10 px-4 py-2.5 text-[11px] font-semibold text-danger">
                {failedPayouts.length} payout{failedPayouts.length > 1 ? "s" : ""} need attention — check your account details or contact support.
              </p>
            )}
          </div>
        </section>

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
          <div className="flex items-center justify-between">
            <h2 className="font-sans text-sm font-semibold uppercase tracking-[0.14em] text-ink/55">Maintenance ({openTickets.length} open)</h2>
            {ticketViews.some((t) => t.overdue) && (
              <span className="rounded-full bg-danger/10 px-3 py-1 text-[11px] font-semibold text-danger">
                {ticketViews.filter((t) => t.overdue).length} past SLA
              </span>
            )}
          </div>
          {ticketViews.length === 0 ? (
            <p className="mt-4 rounded-card bg-sand/50 p-5 text-sm text-ink/60 hairline">
              No maintenance tickets. Tenants can report a problem from their dashboard.
            </p>
          ) : (
            <ul className="mt-4 space-y-3">
              {ticketViews.map((t) => <MaintenanceTicketRow key={t.id} ticket={t} />)}
            </ul>
          )}
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
