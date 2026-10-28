import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { eq, and } from "drizzle-orm";
import { getDb, rooms, properties, media, auctions, landlordProfiles } from "@kith/database";
import { formatNgn } from "@kith/domain";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { IconHomeCheck, IconLock, IconGavel, IconArrowRight } from "@/components/icons";
import { ReserveForm } from "./reserve-form";

export const metadata: Metadata = { title: "Room" };

export default async function RoomPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = getDb();
  const room = (await db.select().from(rooms).where(eq(rooms.id, id)))[0]!;
  if (!room) notFound();
  const property = (await db.select().from(properties).where(eq(properties.id, room.propertyId)))[0]!;
  const photos = await db.select().from(media).where(and(eq(media.ownerType, "room"), eq(media.ownerId, room.id)));
  const propertyPhotos = photos.length ? photos : await db.select().from(media).where(and(eq(media.ownerType, "property"), eq(media.ownerId, property.id)));
  const auction = (await db.select().from(auctions).where(and(eq(auctions.roomId, room.id), eq(auctions.status, "active"))))[0]!;
  const landlord = (await db.select().from(landlordProfiles).where(eq(landlordProfiles.userId, property.landlordId)))[0]!;

  return (
    <>
      <SiteNav />
      <main className="mx-auto max-w-6xl px-6 py-16">
        <nav aria-label="Breadcrumb" className="text-sm text-ink/55">
          <Link href="/rooms" className="hover:text-navy">Rooms</Link>
          <span className="mx-2">/</span>
          <span className="text-ink">{property.title} · {room.roomNumber}</span>
        </nav>

        <div className="mt-6 grid gap-12 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <div className="relative aspect-[4/3] overflow-hidden rounded-card bg-sand">
              {propertyPhotos[0]! && (
                <Image src={propertyPhotos[0]!.url} alt={propertyPhotos[0]!.alt ?? property.title} width={1200} height={900} priority className="h-full w-full object-cover" />
              )}
            </div>
            <h1 className="mt-8 text-4xl">{property.title}</h1>
            <p className="mt-2 text-base text-ink/65">{property.address}, {property.city}, {property.state}</p>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-ink/75">{property.description}</p>

            <h2 className="mt-10 font-sans text-sm font-semibold uppercase tracking-[0.14em] text-ink/55">Amenities</h2>
            <ul className="mt-3 flex flex-wrap gap-2">
              {(room.amenities.length ? room.amenities : property.amenities).map((a) => (
                <li key={a} className="rounded-full bg-sand/70 px-4 py-2 text-xs font-medium text-ink/75">{a}</li>
              ))}
            </ul>

            <div className="mt-10 flex items-center gap-3 rounded-card bg-kith-green/10 p-5">
              <IconHomeCheck width={26} height={26} className="shrink-0 text-kith-green-deep" />
              <p className="text-sm leading-snug text-ink/75">
                <span className="font-semibold text-navy">Physically verified.</span> Inspected and geo-stamped by a Kith
                porter{property.verifiedAt ? ` on ${property.verifiedAt.toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" })}` : ""}.
                Listed by <span className="font-semibold">{landlord?.businessName ?? "Kith partner"}</span>.
              </p>
            </div>
          </div>

          <aside className="h-fit rounded-card bg-paper p-8 shadow-card hairline lg:sticky lg:top-24">
            {room.saleMode === "auction" ? (
              <>
                <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-kith-blue-deep">
                  <IconGavel width={15} height={15} /> Circle · live auction
                </p>
                <p className="tabular mt-4 font-display text-4xl text-navy">
                  {auction ? formatNgn(auction.currentPriceKobo ?? 0n) : "Auction scheduled"}
                </p>
                <dl className="mt-5 space-y-2 text-sm text-ink/70">
                  <div className="flex justify-between"><dt>Floor price</dt><dd className="tabular font-semibold text-ink">{room.floorPriceKobo !== null ? formatNgn(room.floorPriceKobo) : "—"}</dd></div>
                  <div className="flex justify-between"><dt>Min increment</dt><dd className="tabular font-semibold text-ink">{room.minIncrementKobo !== null ? formatNgn(room.minIncrementKobo) : "—"}</dd></div>
                  <div className="flex justify-between"><dt>Bids so far</dt><dd className="tabular font-semibold text-ink">{auction?.totalBids ?? 0}</dd></div>
                </dl>
                <Link
                  href={auction ? `/auctions/${auction.id}` : "/auctions/demo"}
                  className="group mt-7 inline-flex w-full items-center justify-center gap-2 rounded-full bg-kith-blue-deep px-6 py-3.5 text-sm font-semibold text-paper transition-colors hover:bg-navy"
                >
                  Join the live auction room
                  <IconArrowRight width={16} height={16} className="transition-transform group-hover:translate-x-0.5" />
                </Link>
                <p className="mt-3 text-xs leading-relaxed text-ink/55">
                  Soft-close applies: bids in the final two minutes add five. Verification required to bid.
                </p>
              </>
            ) : (
              <>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-kith-green-deep">
                  {room.tier[0]!.toUpperCase() + room.tier.slice(1)} · fixed price
                </p>
                <p className="tabular mt-4 font-display text-4xl text-navy">{room.priceKobo !== null ? formatNgn(room.priceKobo) : "—"}</p>
                <p className="mt-1 text-xs text-ink/55">per academic session · no agency fee, no caution fee</p>
                <div className="mt-6 flex items-start gap-2.5 rounded-field bg-sand/70 p-4">
                  <IconLock width={18} height={18} className="mt-0.5 shrink-0 text-navy" />
                  <p className="text-xs leading-relaxed text-ink/70">
                    You pay into escrow via Paystack. 85% reaches the landlord only when a porter confirms your
                    check-in; 15% is the Kith platform fee. Disputes freeze release.
                  </p>
                </div>
                <ReserveForm roomId={room.id} available={room.isAvailable} />
              </>
            )}
          </aside>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
