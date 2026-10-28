import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { getDb, media } from "@kith/database";
import { formatNgn } from "@kith/domain";
import { currentUser } from "@/lib/session";
import { loadAuction, listBids, toDomainState, toWireState, settleDueAuctions } from "@/lib/auction-service";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { IconArrowRight, IconShieldCheck } from "@/components/icons";
import { LiveAuction } from "./live-auction";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const loaded = await loadAuction(id);
  if (!loaded?.room) return { title: "Auction · Kith" };
  return { title: `${loaded.property?.title ?? "Room"} ${loaded.room.roomNumber} · live Circle auction` };
}

export default async function AuctionRoomPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await settleDueAuctions();
  const loaded = await loadAuction(id);
  if (!loaded || !loaded.room || !loaded.property) notFound();

  const [user, bids] = await Promise.all([currentUser(), listBids(id)]);
  const db = getDb();
  const images = await db.select().from(media).where(eq(media.ownerId, loaded.property.id));
  const cover = images[0];

  return (
    <>
      <SiteNav />
      <main id="main" className="mx-auto max-w-6xl px-5 pb-24 pt-10 sm:px-8">
        <nav className="text-xs text-ink/50" aria-label="Breadcrumb">
          <Link href="/rooms" className="hover:text-navy">Rooms</Link>
          <span className="mx-2">/</span>
          <Link href={`/rooms/${loaded.room.id}`} className="hover:text-navy">{loaded.property.title}</Link>
          <span className="mx-2">/</span>
          <span className="text-ink/70">Live auction</span>
        </nav>

        <header className="mt-6 flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="inline-flex items-center gap-1.5 rounded-full bg-kith-blue/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-kith-blue-deep">
              Circle · live soft-close auction
            </p>
            <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-navy sm:text-5xl">
              {loaded.property.title} · {loaded.room.roomNumber}
            </h1>
            <p className="mt-2 text-sm text-ink/60">
              {loaded.property.city}, {loaded.property.state} · floor {formatNgn(loaded.room.floorPriceKobo ?? 0n)} · increment {formatNgn(loaded.room.minIncrementKobo ?? 0n)}
            </p>
          </div>
          <Link href={`/rooms/${loaded.room.id}`} className="inline-flex items-center gap-1.5 text-sm font-semibold text-navy hover:gap-2.5 transition-all">
            View room details <IconArrowRight width={16} height={16} />
          </Link>
        </header>

        <div className="mt-8 overflow-hidden rounded-card shadow-lift">
          {cover ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={cover.url} alt={cover.alt ?? loaded.property.title} className="h-64 w-full object-cover sm:h-80" />
          ) : (
            <div className="h-40 w-full bg-sand" />
          )}
        </div>

        <div className="mt-10">
          <LiveAuction
            auctionId={id}
            initialState={toWireState(toDomainState(loaded.auction))}
            initialBids={bids}
            meId={user?.id ?? null}
            canBid={Boolean(user && user.role === "student" && user.isVerified)}
            signedIn={Boolean(user)}
          />
        </div>

        <section className="mt-10 grid gap-4 sm:grid-cols-3">
          {[
            { title: "Soft-close protection", body: "Every bid inside the final two minutes pushes the clock out five — no sniping." },
            { title: "Escrow-only money", body: "Winners pay through Paystack into escrow. Landlords are paid after porter-confirmed check-in." },
            { title: "Verified bidders only", body: "NIN, matric and biometric liveness checks keep the room free of ghost accounts." },
          ].map((c) => (
            <div key={c.title} className="rounded-card bg-paper p-6 shadow-card hairline">
              <IconShieldCheck width={20} height={20} className="text-kith-green-deep" />
              <p className="mt-3 font-semibold text-navy">{c.title}</p>
              <p className="mt-1 text-xs leading-relaxed text-ink/55">{c.body}</p>
            </div>
          ))}
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
