import type { Metadata } from "next";
import Link from "next/link";
import { eq } from "drizzle-orm";
import { getDb, bookings, rooms, properties, guestPasses } from "@kith/database";
import { requireUser } from "@/lib/session";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { PassCard } from "./pass-card";

export const metadata: Metadata = { title: "My guest passes" };

export default async function PassesPage() {
  const user = await requireUser();
  const db = getDb();
  const rows = await db
    .select({ booking: bookings, room: rooms, property: properties, pass: guestPasses })
    .from(bookings)
    .innerJoin(rooms, eq(bookings.roomId, rooms.id))
    .innerJoin(properties, eq(rooms.propertyId, properties.id))
    .leftJoin(guestPasses, eq(bookings.id, guestPasses.bookingId))
    .where(eq(bookings.studentId, user.id));

  return (
    <>
      <SiteNav />
      <main className="mx-auto max-w-4xl px-6 py-16">
        <h1 className="text-4xl sm:text-5xl">Your guest passes.</h1>
        <p className="mt-3 max-w-xl text-base text-ink/70">
          The code rotates every five minutes. Show it at the gate — a porter confirms it and your
          escrow releases to the landlord.
        </p>

        {rows.length === 0 ? (
          <div className="mt-14 rounded-card bg-sand/60 p-12 text-center hairline">
            <p className="font-display text-2xl">No passes yet.</p>
            <p className="mt-2 text-sm text-ink/60">Book a room and your pass appears here instantly.</p>
            <Link href="/rooms" className="mt-6 inline-block rounded-full bg-navy px-6 py-3 text-sm font-semibold text-paper">Find a room</Link>
          </div>
        ) : (
          <div className="mt-12 space-y-8">
            {rows.map(({ booking, room, property, pass }) => (
              <PassCard
                key={booking.id}
                bookingId={booking.id}
                propertyTitle={property.title}
                roomNumber={room.roomNumber}
                city={property.city}
                status={booking.status}
                checkIn={booking.checkInDate}
                hasPass={pass !== null}
              />
            ))}
          </div>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
