import type { Metadata } from "next";
import Link from "next/link";
import { eq, and, ilike, sql, desc, type SQL } from "drizzle-orm";
import { getDb, rooms, properties, media, type Room } from "@kith/database";
import { AMENITIES, TIERS } from "@kith/domain";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { RoomCard } from "./room-card";

export const metadata: Metadata = {
  title: "Find a room",
  description: "Search verified student rooms across FUNAAB and UNILAG — filter by price, tier, city and amenities.",
};

const TIER_KEYS = ["circle", "market", "elite"] as const;
const MODES = ["auction", "fixed"] as const;
const SORTS = { recommended: "Recommended", price_asc: "Price: low to high", price_desc: "Price: high to low", newest: "Newest" } as const;

/** Shared vocabulary (packages/domain) so a filter always matches what landlords can tick. */
const AMENITY_FILTERS = AMENITIES;

type Params = {
  tier?: string; q?: string; city?: string; min?: string; max?: string;
  mode?: string; verified?: string; amenities?: string | string[]; sort?: string; page?: string;
};

const PAGE_SIZE = 12;

/** Carry every active filter into a link while overriding one key (tier chips, paging). */
function href(params: Params, overrides: Partial<Params>) {
  const merged: Record<string, string> = {};
  for (const [k, v] of Object.entries({ ...params, ...overrides })) {
    if (v && String(v).length > 0) merged[k] = String(v);
  }
  const qs = new URLSearchParams(merged).toString();
  return qs ? `/rooms?${qs}` : "/rooms";
}

export default async function RoomsPage({ searchParams }: { searchParams: Promise<Params> }) {
  const params = await searchParams;
  const db = getDb();

  const tier = TIER_KEYS.includes(params.tier as (typeof TIER_KEYS)[number]) ? (params.tier as Room["tier"]) : undefined;
  const mode = MODES.includes(params.mode as (typeof MODES)[number]) ? (params.mode as Room["saleMode"]) : undefined;
  const amenityParam = Array.isArray(params.amenities) ? params.amenities.join(",") : params.amenities ?? "";
  const pickedAmenities = amenityParam.split(",").map((a) => a.trim()).filter((a) => (AMENITY_FILTERS as readonly string[]).includes(a));
  const minKobo = params.min ? BigInt(Math.max(0, Number(params.min) || 0)) * 100n : null;
  const maxKobo = params.max ? BigInt(Math.max(0, Number(params.max) || 0)) * 100n : null;
  const page = Math.max(1, Number(params.page ?? 1) || 1);
  const sort = (params.sort && params.sort in SORTS ? params.sort : "recommended") as keyof typeof SORTS;

  /** Auction rooms carry a floor rather than a price — search compares the number a student would pay next. */
  const priceExpr = sql`coalesce(${rooms.priceKobo}, ${rooms.floorPriceKobo})`;

  /** Every filter except the tier — facet counts are computed from this so chips never lie. */
  const conditionsExceptTier: Array<SQL | undefined> = [
    eq(rooms.isAvailable, true),
    mode ? eq(rooms.saleMode, mode) : undefined,
    params.q ? ilike(sql`${properties.title} || ' ' || ${properties.city} || ' ' || ${properties.address} || ' ' || ${rooms.roomType}`, `%${params.q}%`) : undefined,
    params.city ? ilike(properties.city, `%${params.city}%`) : undefined,
    minKobo !== null ? sql`${priceExpr} >= ${minKobo.toString()}::bigint` : undefined,
    maxKobo !== null ? sql`${priceExpr} <= ${maxKobo.toString()}::bigint` : undefined,
    params.verified === "1" ? eq(properties.isPhysicallyVerified, true) : undefined,
    ...pickedAmenities.map((a) => sql`${properties.amenities} @> jsonb_build_array(${a}::text)`),
  ];
  const where = and(...conditionsExceptTier, tier ? eq(rooms.tier, tier) : undefined);

  const orderBy = sort === "price_asc"
    ? sql`${priceExpr} asc nulls last`
    : sort === "price_desc"
      ? sql`${priceExpr} desc nulls last`
      : sort === "newest"
        ? desc(rooms.createdAt)
        : desc(properties.isPhysicallyVerified);

  const [rows, totals, facetRows] = await Promise.all([
    db.select({ room: rooms, property: properties })
      .from(rooms)
      .innerJoin(properties, eq(rooms.propertyId, properties.id))
      .where(where)
      .orderBy(orderBy)
      .limit(PAGE_SIZE)
      .offset((page - 1) * PAGE_SIZE),
    db.select({ count: sql<number>`count(*)::int` })
      .from(rooms)
      .innerJoin(properties, eq(rooms.propertyId, properties.id))
      .where(where),
    // Facet counts respect every filter EXCEPT the tier itself, so the chips never lie.
    db.select({ tier: rooms.tier, count: sql<number>`count(*)::int` })
      .from(rooms)
      .innerJoin(properties, eq(rooms.propertyId, properties.id))
      .where(and(...conditionsExceptTier))
      .groupBy(rooms.tier),
  ]);

  const total = totals[0]?.count ?? 0;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const facet = new Map(facetRows.map((f) => [f.tier, f.count]));
  const tierTotal = [...facet.values()].reduce((a, b) => a + b, 0);

  const mediaRows = rows.length
    ? await db.select().from(media).where(
        sql`${media.ownerType} = 'property' AND ${media.ownerId} IN (${sql.join(rows.map((r) => sql`${r.property.id}`), sql`, `)})`,
      )
    : [];
  const mediaByProperty = new Map<string, string>();
  for (const m of mediaRows) if (!mediaByProperty.has(m.ownerId)) mediaByProperty.set(m.ownerId, m.url);

  const activeFilterCount = [tier, mode, params.q, params.city, minKobo, maxKobo, params.verified, pickedAmenities.length ? "a" : undefined]
    .filter(Boolean).length;

  return (
    <>
      <SiteNav />
      <main id="main" className="mx-auto max-w-6xl px-6 py-16">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl sm:text-5xl">Find a room.</h1>
            <p className="mt-3 max-w-xl text-base text-ink/70">
              Every home below was walked and photographed by a Kith porter before listing.
            </p>
          </div>
          <p className="tabular text-sm text-ink/55">
            <span className="font-semibold text-navy">{total}</span> room{total === 1 ? "" : "s"}
            {activeFilterCount > 0 && <> · {activeFilterCount} filter{activeFilterCount === 1 ? "" : "s"} active</>}
          </p>
        </div>

        {/* ── filters ─────────────────────────────────────────────────── */}
        <form action="/rooms" method="GET" className="mt-10 rounded-card bg-paper p-6 shadow-card hairline">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="lg:col-span-2">
              <label htmlFor="q" className="text-[11px] font-semibold uppercase tracking-[0.1em] text-ink/55">Search</label>
              <input id="q" name="q" defaultValue={params.q ?? ""} placeholder="Property, area, room type…"
                className="mt-1 w-full rounded-field bg-paper px-4 py-2.5 text-sm text-ink hairline" />
            </div>
            <div>
              <label htmlFor="city" className="text-[11px] font-semibold uppercase tracking-[0.1em] text-ink/55">City</label>
              <input id="city" name="city" defaultValue={params.city ?? ""} placeholder="Lagos or Abeokuta"
                className="mt-1 w-full rounded-field bg-paper px-4 py-2.5 text-sm text-ink hairline" />
            </div>
            <div>
              <label htmlFor="sort" className="text-[11px] font-semibold uppercase tracking-[0.1em] text-ink/55">Sort</label>
              <select id="sort" name="sort" defaultValue={sort}
                className="mt-1 w-full rounded-field bg-paper px-4 py-2.5 text-sm text-ink hairline">
                {Object.entries(SORTS).map(([k, label]) => <option key={k} value={k}>{label}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="min" className="text-[11px] font-semibold uppercase tracking-[0.1em] text-ink/55">Min price (₦)</label>
              <input id="min" name="min" type="number" min={0} step={1000} defaultValue={params.min ?? ""} placeholder="40000"
                className="tabular mt-1 w-full rounded-field bg-paper px-4 py-2.5 text-sm text-ink hairline" />
            </div>
            <div>
              <label htmlFor="max" className="text-[11px] font-semibold uppercase tracking-[0.1em] text-ink/55">Max price (₦)</label>
              <input id="max" name="max" type="number" min={0} step={1000} defaultValue={params.max ?? ""} placeholder="180000"
                className="tabular mt-1 w-full rounded-field bg-paper px-4 py-2.5 text-sm text-ink hairline" />
            </div>
            <div>
              <label htmlFor="mode" className="text-[11px] font-semibold uppercase tracking-[0.1em] text-ink/55">How it sells</label>
              <select id="mode" name="mode" defaultValue={mode ?? ""}
                className="mt-1 w-full rounded-field bg-paper px-4 py-2.5 text-sm text-ink hairline">
                <option value="">Any</option>
                <option value="auction">Live auction</option>
                <option value="fixed">Fixed price</option>
              </select>
            </div>
            <div className="flex items-end pb-1">
              <label className="flex items-center gap-2 text-sm text-ink/75">
                <input type="checkbox" name="verified" value="1" defaultChecked={params.verified === "1"}
                  className="size-4 rounded border-hairline text-navy focus:ring-kith-blue" />
                Porter-verified only
              </label>
            </div>
          </div>

          <fieldset className="mt-4">
            <legend className="text-[11px] font-semibold uppercase tracking-[0.1em] text-ink/55">Amenities</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {AMENITY_FILTERS.map((a) => (
                <label key={a} className="cursor-pointer rounded-full bg-sand/60 px-3.5 py-1.5 text-xs font-semibold text-ink/70 has-checked:bg-navy has-checked:text-paper hairline">
                  <input type="checkbox" name="amenities" value={a} defaultChecked={pickedAmenities.includes(a)} className="sr-only" />
                  {a}
                </label>
              ))}
            </div>
            <p className="mt-1 text-[11px] text-ink/40">Tick and press Show rooms — filters combine.</p>
          </fieldset>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button type="submit" className="rounded-full bg-navy px-6 py-2.5 text-sm font-semibold text-paper hover:bg-navy-soft">Show rooms</button>
            <Link href="/rooms" className="text-xs font-semibold text-ink/55 underline underline-offset-4 hover:text-ink">Reset</Link>
          </div>
        </form>

        {/* ── tier facets ─────────────────────────────────────────────── */}
        <div className="mt-8 flex flex-wrap gap-2" role="group" aria-label="Tier filter">
          <TierChip href={href(params, { tier: "", page: "" })} label={`All tiers (${tierTotal})`} active={!tier} />
          {TIER_KEYS.map((t) => (
            <TierChip key={t} href={href(params, { tier: t, page: "" })} label={`${TIERS[t].label} (${facet.get(t) ?? 0})`} active={tier === t} />
          ))}
          {(["auction", "fixed"] as const).map((m) => (
            <TierChip key={m} href={href(params, { mode: mode === m ? "" : m, page: "" })} label={m === "auction" ? "Live auctions" : "Fixed price"} active={mode === m} />
          ))}
        </div>

        {rows.length === 0 ? (
          <div className="mt-16 rounded-card bg-sand/60 p-12 text-center hairline">
            <p className="font-display text-2xl">No rooms match yet.</p>
            <p className="mt-2 text-sm text-ink/60">
              {activeFilterCount > 0 ? "Try widening the price range or dropping a filter." : "New listings land every week as porters verify more homes."}
            </p>
            <Link href="/rooms" className="mt-6 inline-block rounded-full bg-navy px-6 py-3 text-sm font-semibold text-paper">Clear filters</Link>
          </div>
        ) : (
          <>
            <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {rows.map(({ room, property }) => (
                <RoomCard key={room.id} room={room} property={property} imageUrl={mediaByProperty.get(property.id)} />
              ))}
            </div>

            {pages > 1 && (
              <nav className="mt-12 flex items-center justify-center gap-2" aria-label="Pagination">
                {page > 1 && <Link href={href(params, { page: String(page - 1) })} className="rounded-full bg-sand/60 px-4 py-2 text-sm font-semibold text-ink/70 hairline">Previous</Link>}
                <span className="tabular text-sm text-ink/55">Page {page} of {pages}</span>
                {page < pages && <Link href={href(params, { page: String(page + 1) })} className="rounded-full bg-sand/60 px-4 py-2 text-sm font-semibold text-ink/70 hairline">Next</Link>}
              </nav>
            )}
          </>
        )}

        <p className="mt-12 text-xs text-ink/45">
          Prices are per academic session. Circle rooms settle by live auction; Market and Elite are fixed price.
        </p>
      </main>
      <SiteFooter />
    </>
  );
}

function TierChip({ href: to, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link
      href={to}
      aria-pressed={active}
      className={`rounded-full px-5 py-2.5 text-sm font-semibold transition-colors ${
        active ? "bg-navy text-paper" : "bg-sand/60 text-ink/70 hairline hover:bg-sand"
      }`}
    >
      {label}
    </Link>
  );
}
