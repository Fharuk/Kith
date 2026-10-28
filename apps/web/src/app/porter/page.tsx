import { eq, and, ne } from "drizzle-orm";
import { getDb, porterTasks, porterProfiles, bookings, properties, rooms } from "@kith/database";
import { requireUser } from "@/lib/session";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { Numpad } from "@/components/porter/numpad";
import { IconKey, IconHomeCheck } from "@/components/icons";

export const metadata = { title: "Porter terminal" };

export default async function PorterTerminal() {
  const user = await requireUser();
  const db = getDb();
  const profile = (await db.select().from(porterProfiles).where(eq(porterProfiles.userId, user.id)))[0];
  const queue = await db.select().from(porterTasks).where(and(eq(porterTasks.porterId, user.id), ne(porterTasks.status, "done")));
  const done = await db.select().from(porterTasks).where(and(eq(porterTasks.porterId, user.id), eq(porterTasks.status, "done")));

  return (
    <>
      <SiteNav />
      <main className="mx-auto max-w-4xl px-6 py-16">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-clay">Zone: {profile?.zone ?? "Unassigned"}</p>
        <h1 className="mt-2 text-4xl">Terminal.</h1>
        <p className="mt-3 max-w-xl text-base text-ink/70">
          Enter a guest&rsquo;s 6-digit pass code at the gate. A valid code shows the guest; confirming
          check-in releases escrow to the landlord.
        </p>

        <div className="mt-10">
          <Numpad />
        </div>

        <section className="mt-12">
          <h2 className="font-sans text-sm font-semibold uppercase tracking-[0.14em] text-ink/55">Open tasks ({queue.length})</h2>
          <ul className="mt-4 space-y-3">
            {queue.length === 0 && <li className="rounded-card bg-sand/60 p-8 text-sm text-ink/60 hairline">Queue clear. Well done.</li>}
            {queue.map((t) => (
              <li key={t.id} className="flex flex-wrap items-center justify-between gap-4 rounded-card bg-paper p-5 shadow-card hairline">
                <div className="flex items-center gap-3">
                  {t.type === "verify_property" ? <IconHomeCheck width={22} height={22} className="text-kith-green-deep" /> : <IconKey width={22} height={22} className="text-kith-blue-deep" />}
                  <div>
                    <p className="font-semibold text-navy">{t.type.replace("_", " ")}</p>
                    <p className="text-xs text-ink/55">status: {t.status}</p>
                  </div>
                </div>
                <span className="rounded-full bg-sand px-4 py-2 text-xs font-semibold text-navy">Accept job</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-12">
          <h2 className="font-sans text-sm font-semibold uppercase tracking-[0.14em] text-ink/55">Completed ({done.length})</h2>
          <ul className="mt-4 space-y-2 text-sm text-ink/60">
            {done.map((t) => (
              <li key={t.id} className="flex justify-between rounded-field bg-sand/60 px-4 py-2.5">
                <span>{t.type.replace("_", " ")}</span>
                <span className="tabular">{t.completedAt ? new Date(t.completedAt).toLocaleDateString("en-NG") : ""}</span>
              </li>
            ))}
          </ul>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
