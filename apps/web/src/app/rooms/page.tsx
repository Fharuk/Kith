import type { Metadata } from "next";
import Link from "next/link";
import { eq, and, ilike, sql } from "drizzle-orm";
import { getDb, rooms, properties, media, type Room } from "@kith/database";
import { formatNgn } from "@kith/domain";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { RoomCard } from "./room-card";

export const metadata: Metadata = { title: "Find a room", description: "Search verified student rooms across FUNAAB and UNILAG." };

const TIERS = ["circle", "market", "elite"] as const;

export default async function RoomsPage({ searchParams }: { searchParams: Promise<{ tier?: string; q?: string }> }) {
  const { tier, q } = await searchParams;
  const db = getDb();

  const where = and(
    tier && TIERS.includes(tier as (typeof TIERS)[number]) ? eq(rooms.tier, tier as Room["tier"]) : undefined,
    q ? ilike(sql`${properties.title} || ' ' || ${properties.city}`, `%${q}%`) : undefined,
  );

  const rows = await db
    .select({ room: rooms, property: properties })
    .from(rooms)
    .innerJoin(properties, eq(rooms.propertyId, properties.id))
    .where(where)
    .limit(48);

  const mediaRows = rows.length
    ? await db.select().from(media).where(
        sql`${media.ownerType} = 'property' AND ${media.ownerId} IN (${sql.join(rows.map((r) => sql`${r.property.id}`), sql`, `)})`,
      )
    : [];
  const mediaByProperty = new Map<string, string>();
  for (const m of mediaRows) if (!mediaByProperty.has(m.ownerId)) mediaByProperty.set(m.ownerId, m.url);

  return (
    <>
      <SiteNav />
      <main className="mx-auto max-w-6xl px-6 py-16">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl sm:text-5xl">Find a room.</h1>
            <p className="mt-3 max-w-xl text-base text-ink/70">
              Every home below was walked and photographed by a Kith porter before listing.
            </p>
          </div>
          <form action="/rooms" method="GET" className="flex gap-3">
            <input type="hidden" name="tier" value={tier ?? ""} />
            <input
              name="q" defaultValue={q ?? ""} placeholder="Campus, area or property…"
              aria-label="Search rooms"
              className="w-64 rounded-full bg-paper px-5 py-3 text-sm shadow-[inset_0_0_0_1px_var(--color-hairline)] outline-none focus:shadow-[inset_0_0_0_2px_var(--color-kith-blue)]"
            />
            <button type="submit" className="rounded-full bg-navy px-6 py-3 text-sm font-semibold text-paper transition-colors hover:bg-navy-soft">
              Search
            </button>
          </form>
        </div>

        <div className="mt-8 flex flex-wrap gap-2" role="tablist" aria-label="Tier filter">
          <TierChip href="/rooms" label="All tiers" active={!tier} />
          {TIERS.map((t) => (
            <TierChip key={t} href={`/rooms?tier=${t}${q ? `&q=${q}` : ""}`} label={t[0].toUpperCase() + t.slice(1)} active={tier === t} />
          ))}
        </div>

        {rows.length === 0 ? (
          <div className="mt-16 rounded-card bg-sand/60 p-12 text-center hairline">
            <p className="font-display text-2xl">No rooms match yet.</p>
            <p className="mt-2 text-sm text-ink/60">New listings land every week as porters verify more homes.</p>
            <Link href="/rooms" className="mt-6 inline-block rounded-full bg-navy px-6 py-3 text-sm font-semibold text-paper">Clear filters</Link>
          </div>
        ) : (
          <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {rows.map(({ room, property }) => (
              <RoomCard key={room.id} room={room} property={property} imageUrl={mediaByProperty.get(property.id)} />
            ))}
          </div>
        )}
      </main>
      <SiteFooter />
    </>
  );
}

function TierChip({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={`rounded-full px-5 py-2.5 text-sm font-semibold transition-colors ${
        active ? "bg-navy text-paper" : "bg-sand/60 text-ink/70 hairline hover:bg-sand"
      }`}
    >
      {label}
    </Link>
  );
}
