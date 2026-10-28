import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { getDb, inspectionReports, properties, rooms, users } from "@kith/database";
import { formatNgn } from "@kith/domain";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { IconShieldCheck } from "@/components/icons";
import { INSPECTION_CHECKLIST, reportSummary } from "@/lib/inspection-checklist";
import { loadMediaForViewer, readImageFile } from "@/lib/media";

export const revalidate = 0;

async function loadReport(slug: string) {
  const db = getDb();
  const rows = await db
    .select({ report: inspectionReports, property: properties, porter: users })
    .from(inspectionReports)
    .innerJoin(properties, eq(inspectionReports.propertyId, properties.id))
    .innerJoin(users, eq(inspectionReports.porterId, users.id))
    .where(eq(inspectionReports.publicSlug, slug));
  return rows[0] ?? null;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const row = await loadReport(slug);
  if (!row) return { title: "Report not found" };
  const title = `${row.property.title} — Proof of Room`;
  const description = `A Kith porter inspected this room on site. Score ${row.report.score}/100 — ${reportSummary(row.report.score).label}. Verified photos, checklist and location.`;
  return { title, description, openGraph: { title, description, type: "article" }, robots: { index: true } };
}

/**
 * The public, shareable report. Renders only what was observed: the porter's name, the date,
 * the checklist answers, the photos and the location they were taken. No marketing language,
 * because its whole value is that it reads like evidence.
 */
export default async function ReportPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const row = await loadReport(slug);
  if (!row) notFound();

  const [room] = row.report.roomId ? await getDb().select().from(rooms).where(eq(rooms.id, row.report.roomId)) : [];
  const summary = reportSummary(row.report.score);

  // Photos are public media; read them through the same access-checked path the API uses.
  const photos: string[] = [];
  for (const id of row.report.photoIds) {
    const access = await loadMediaForViewer(id, null);
    if (access.ok && access.row.storageKey) {
      const bytes = await readImageFile(access.row.storageKey);
      photos.push(`data:image/webp;base64,${bytes.toString("base64")}`);
    }
  }

  const tone =
    summary.tone === "good" ? "text-kith-green-deep bg-kith-green/10"
      : summary.tone === "mixed" ? "text-clay bg-clay/10"
        : "text-danger bg-danger/10";

  return (
    <>
      <SiteNav />
      <main id="main" className="mx-auto max-w-4xl px-6 py-16">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-clay">Proof of Room · {row.report.publicSlug}</p>
        <h1 className="mt-2 text-4xl">{row.property.title}</h1>
        <p className="mt-2 text-sm text-ink/60">
          {room ? `${room.roomNumber} · ` : ""}{row.property.address}, {row.property.city}, {row.property.state}
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-[auto,1fr] sm:items-center">
          <div className="flex h-28 w-28 flex-col items-center justify-center rounded-full bg-navy text-paper">
            <span className="text-3xl font-semibold">{row.report.score}</span>
            <span className="text-[10px] uppercase tracking-[0.14em] text-paper/70">out of 100</span>
          </div>
          <div>
            <p className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${tone}`}>{summary.label}</p>
            <p className="mt-2 text-sm text-ink/70">
              Inspected on site by <span className="font-medium text-ink">{row.porter.firstName} {row.porter.lastName}</span>, a
              verified Kith porter, on {row.report.createdAt.toISOString().slice(0, 10)}.
              {row.report.gpsLat && row.report.gpsLng
                ? ` Location recorded: ${Number(row.report.gpsLat).toFixed(4)}, ${Number(row.report.gpsLng).toFixed(4)}.`
                : ""}
            </p>
            <p className="mt-1 flex items-center gap-1.5 text-xs text-kith-green-deep">
              <IconShieldCheck width={14} height={14} /> Photos taken by the porter at inspection time
            </p>
          </div>
        </div>

        {photos.length > 0 && (
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {photos.map((src, i) => (
              <Image
                key={i}
                src={src}
                alt={`Inspection photo ${i + 1} of ${row.property.title}`}
                width={480}
                height={360}
                unoptimized
                className="h-36 w-full rounded-card object-cover hairline"
              />
            ))}
          </div>
        )}

        <section className="mt-10">
          <h2 className="font-sans text-sm font-semibold uppercase tracking-[0.14em] text-ink/55">What the porter checked</h2>
          <ul className="mt-4 divide-y divide-hairline rounded-card bg-paper shadow-card hairline">
            {INSPECTION_CHECKLIST.map((item) => {
              const answer = row.report.checklist[item.key];
              const ok = Boolean(answer?.ok);
              return (
                <li key={item.key} className="flex items-start gap-3 px-5 py-3">
                  <span
                    aria-hidden
                    className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${ok ? "bg-kith-green/15 text-kith-green-deep" : "bg-danger/10 text-danger"}`}
                  >
                    {ok ? "✓" : "✕"}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-ink">{item.label}</p>
                    <p className="text-xs text-ink/55">
                      {answer?.note ? answer.note : ok ? "Present" : "Not present or not working at inspection"}
                    </p>
                  </div>
                  <span className="sr-only">{ok ? "Pass" : "Fail"}</span>
                </li>
              );
            })}
          </ul>
        </section>

        {row.report.notes && (
          <section className="mt-8 rounded-card bg-sand/50 p-5 hairline">
            <h2 className="font-sans text-sm font-semibold uppercase tracking-[0.12em] text-ink/55">Porter&rsquo;s note</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink/75">{row.report.notes}</p>
          </section>
        )}

        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 rounded-card bg-navy p-6 text-paper">
          <div>
            <p className="text-sm font-semibold">{room ? (room.priceKobo ? `${formatNgn(room.priceKobo)} / month` : "Auction — place a bid") : "Ask about this room"}</p>
            <p className="mt-1 text-xs text-paper/70">
              Escrow-protected: your money is held until you check in and confirm the room.
            </p>
          </div>
          <Link
            href={room ? `/rooms/${room.id}` : "/rooms"}
            className="rounded-full bg-paper px-5 py-2.5 text-sm font-semibold text-navy hover:bg-sand"
          >
            {room ? "View the room" : "Browse rooms"}
          </Link>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
