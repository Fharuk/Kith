import Link from "next/link";
import { eq, desc } from "drizzle-orm";
import { getDb, bids, bookings, studentProfiles, rooms, properties } from "@kith/database";
import { formatNgn } from "@kith/domain";
import { requireUser } from "@/lib/session";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { IconGavel, IconKey, IconShieldCheck, IconArrowRight } from "@/components/icons";
import { PayNowButton } from "./pay-now-button";

export const metadata = { title: "Student dashboard" };

export default async function StudentDashboard() {
  const user = await requireUser();
  const db = getDb();
  const profile = (await db.select().from(studentProfiles).where(eq(studentProfiles.userId, user.id)))[0];
  const myBids = await db.select().from(bids).where(eq(bids.studentId, user.id)).orderBy(desc(bids.createdAt));
  const myBookings = await db
    .select({ booking: bookings, room: rooms, property: properties })
    .from(bookings)
    .innerJoin(rooms, eq(bookings.roomId, rooms.id))
    .innerJoin(properties, eq(rooms.propertyId, properties.id))
    .where(eq(bookings.studentId, user.id));

  const gates = (profile?.nimcVerified ? 1 : 0) + (profile?.matricVerified ? 1 : 0) + (profile?.biometricVerified ? 1 : 0);

  return (
    <>
      <SiteNav />
      <main className="mx-auto max-w-6xl px-6 py-16">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-clay">{user.pseudonymizedId}</p>
            <h1 className="mt-2 text-4xl">Hello, {user.name?.split(" ")[0] ?? "student"}.</h1>
          </div>
          <Link href="/rooms" className="group inline-flex items-center gap-2 rounded-full bg-navy px-6 py-3 text-sm font-semibold text-paper hover:bg-navy-soft">
            Find a room <IconArrowRight width={16} height={16} className="transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          <Stat label="Verification" value={`${gates}/3 gates`} href="/verify" tone={gates === 3 ? "green" : "clay"}
            hint={gates === 3 ? "Fully verified — you can bid and book" : "Finish verification to unlock bidding"} />
          <Stat label="Bids placed" value={String(myBids.length)} href="/auctions/demo" tone="blue" hint="Circle auction activity" />
          <Stat label="Bookings" value={String(myBookings.length)} href="/passes" tone="navy" hint="Guest passes live in one tap" />
        </div>

        <section className="mt-12">
          <h2 className="font-sans text-sm font-semibold uppercase tracking-[0.14em] text-ink/55">Your bookings</h2>
          {myBookings.length === 0 ? (
            <p className="mt-4 rounded-card bg-sand/60 p-8 text-sm text-ink/60 hairline">
              No bookings yet.{" "}<Link className="font-semibold text-navy underline underline-offset-4" href="/rooms">Browse verified rooms</Link>.
            </p>
          ) : (
            <ul className="mt-4 space-y-3">
              {myBookings.map(({ booking, room, property }) => (
                <li key={booking.id} className="flex flex-wrap items-center justify-between gap-4 rounded-card bg-paper p-5 shadow-card hairline">
                  <div>
                    <p className="font-semibold text-navy">{property.title} · {room.roomNumber}</p>
                    <p className="text-xs text-ink/55">{property.city} · check-in {new Date(booking.checkInDate).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="tabular text-sm font-semibold text-navy">{formatNgn(booking.bookedPriceKobo ?? 0n)}</p>
                    {booking.status === "pending" ? (
                      <div className="flex flex-col items-end gap-1">
                        <span className="rounded-full bg-clay/15 px-3 py-1 text-[11px] font-semibold text-clay">Awaiting payment</span>
                        <PayNowButton bookingId={booking.id} />
                      </div>
                    ) : (
                      <Link href="/passes" className="inline-flex items-center gap-1.5 rounded-full bg-kith-green/15 px-4 py-2 text-xs font-semibold text-kith-green-deep">
                        <IconKey width={14} height={14} /> Guest pass
                      </Link>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="mt-12">
          <h2 className="font-sans text-sm font-semibold uppercase tracking-[0.14em] text-ink/55">Recent bids</h2>
          {myBids.length === 0 ? (
            <p className="mt-4 rounded-card bg-sand/60 p-8 text-sm text-ink/60 hairline">
              No bids yet. Watch a{" "}<Link className="font-semibold text-navy underline underline-offset-4" href="/auctions/demo">live Circle auction</Link>{" "}
              <IconGavel width={14} height={14} className="inline" /> to learn the rhythm.
            </p>
          ) : (
            <ul className="mt-4 space-y-2">
              {myBids.slice(0, 8).map((b) => (
                <li key={b.id} className="flex justify-between rounded-field bg-sand/60 px-4 py-2.5 text-sm">
                  <span className="text-ink/60">{new Date(b.createdAt).toLocaleString("en-NG")}</span>
                  <span className="tabular font-semibold text-navy">{formatNgn(b.amountKobo ?? 0n)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        {!user.isVerified && (
          <div className="mt-12 flex items-center gap-4 rounded-card bg-clay/15 p-6">
            <IconShieldCheck width={26} height={26} className="shrink-0 text-clay" />
            <p className="text-sm text-ink/75">
              You can browse now, but bidding and booking unlock after verification.{" "}
              <Link href="/verify" className="font-semibold text-navy underline underline-offset-4">Continue verification</Link>
            </p>
          </div>
        )}
      </main>
      <SiteFooter />
    </>
  );
}

function Stat({ label, value, hint, href, tone }: { label: string; value: string; hint: string; href: string; tone: "green" | "blue" | "navy" | "clay" }) {
  const tones = { green: "text-kith-green-deep", blue: "text-kith-blue-deep", navy: "text-navy", clay: "text-clay" };
  return (
    <Link href={href} className="rounded-card bg-paper p-6 shadow-card transition-shadow hover:shadow-lift hairline">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink/50">{label}</p>
      <p className={`tabular mt-2 font-display text-3xl ${tones[tone]}`}>{value}</p>
      <p className="mt-1 text-xs text-ink/55">{hint}</p>
    </Link>
  );
}
