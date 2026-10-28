import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { getDb, roommateProfiles, users, universities, studentProfiles } from "@kith/database";
import { formatNgn } from "@kith/domain";
import { requireUser } from "@/lib/session";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { rankMatches, type RoommateProfileShape } from "@/lib/roommate-matching";
import { RoommateProfileForm } from "./profile-form";
import { setLooking } from "@/app/actions/roommate-actions";

export const metadata: Metadata = {
  title: "Find a roommate",
  description: "Match with verified students at your university who are looking for the same kind of share.",
};

export const dynamic = "force-dynamic";

export default async function RoommatesPage() {
  const user = await requireUser();
  if (user.role !== "student") redirect("/");

  const db = getDb();
  const [mine] = await db.select().from(roommateProfiles).where(eq(roommateProfiles.userId, user.id));

  // Candidates: looking, verified students, excluding me.
  const candidates = await db
    .select({
      profile: roommateProfiles,
      firstName: users.firstName,
      lastName: users.lastName,
      pseudonym: users.pseudonymizedId,
      universityName: universities.name,
      matricVerified: studentProfiles.matricVerified,
    })
    .from(roommateProfiles)
    .innerJoin(users, eq(roommateProfiles.userId, users.id))
    .leftJoin(universities, eq(roommateProfiles.universityId, universities.id))
    .leftJoin(studentProfiles, eq(studentProfiles.userId, users.id))
    .where(eq(roommateProfiles.looking, true));

  const toShape = (p: typeof roommateProfiles.$inferSelect): RoommateProfileShape => ({
    userId: p.userId,
    universityId: p.universityId,
    budgetMinKobo: Number(p.budgetMinKobo),
    budgetMaxKobo: Number(p.budgetMaxKobo),
    gender: p.gender,
    genderPreference: p.genderPreference,
    sleepSchedule: p.sleepSchedule,
    cleanliness: p.cleanliness,
    smoker: p.smoker,
    guests: p.guests,
    course: p.course,
  });

  const matches = mine ? rankMatches(toShape(mine), candidates.map((c) => toShape(c.profile))) : [];
  const detailsFor = (userId: string) => candidates.find((c) => c.profile.userId === userId);

  return (
    <>
      <SiteNav />
      <main id="main" className="mx-auto max-w-5xl px-6 py-16">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-clay">Roommates</p>
        <h1 className="mt-2 text-4xl">Share the rent, not the risk.</h1>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-ink/70">
          Every profile here belongs to a student whose matric number and identity are verified.
          Matches are scored on budget, sleep, tidiness and guests — and you can see exactly why
          two people were suggested.
        </p>

        <div className="mt-10 grid gap-8 lg:grid-cols-[0.9fr,1.1fr] lg:items-start">
          <div className="space-y-4">
            <RoommateProfileForm
              defaults={
                mine
                  ? {
                      budgetMinNaira: Number(mine.budgetMinKobo / 100n),
                      budgetMaxNaira: Number(mine.budgetMaxKobo / 100n),
                      gender: mine.gender,
                      genderPreference: mine.genderPreference,
                      sleepSchedule: mine.sleepSchedule,
                      cleanliness: mine.cleanliness,
                      smoker: mine.smoker,
                      guests: mine.guests,
                      course: mine.course,
                      bio: mine.bio,
                    }
                  : {}
              }
            />
            {mine && (
              <form action={setLooking} className="flex items-center justify-between gap-4 rounded-card bg-sand/50 px-5 py-4 hairline">
                <input type="hidden" name="looking" value={mine.looking ? "false" : "true"} />
                <p className="text-sm text-ink/70">
                  {mine.looking ? "Your profile is visible to other students." : "Your profile is hidden."}
                </p>
                <button type="submit" className="rounded-full bg-paper px-4 py-2 text-xs font-semibold text-navy shadow-card hairline">
                  {mine.looking ? "Pause matching" : "Start matching again"}
                </button>
              </form>
            )}
          </div>

          <section>
            <h2 className="font-sans text-sm font-semibold uppercase tracking-[0.14em] text-ink/55">
              {mine ? `Matches (${matches.length})` : "Matches appear once you set preferences"}
            </h2>
            <ul className="mt-4 space-y-3">
              {mine && matches.length === 0 && (
                <li className="rounded-card bg-sand/50 p-6 text-sm text-ink/60 hairline">
                  No compatible matches yet. Widen your budget range or check back as more students join.
                </li>
              )}
              {matches.map(({ candidate, match }) => {
                const detail = detailsFor(candidate.userId);
                return (
                  <li key={candidate.userId} className="rounded-card bg-paper p-5 shadow-card hairline">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-semibold text-navy">
                          {detail?.firstName ?? "Student"} {detail?.lastName?.charAt(0) ?? ""}.{" "}
                          <span className="text-xs font-normal text-ink/45">{detail?.pseudonym}</span>
                        </p>
                        <p className="text-xs text-ink/55">
                          {detail?.universityName ?? "University not set"}
                          {candidate.course ? ` · ${candidate.course}` : ""}
                          {detail?.matricVerified ? " · matric verified" : ""}
                        </p>
                        <p className="mt-1 text-xs text-ink/60">
                          {formatNgn(BigInt(candidate.budgetMinKobo))}–{formatNgn(BigInt(candidate.budgetMaxKobo))} / month
                        </p>
                      </div>
                      <span className="shrink-0 rounded-full bg-kith-green/10 px-3 py-1 text-xs font-semibold text-kith-green-deep">
                        {match.score}% fit
                      </span>
                    </div>
                    <ul className="mt-3 flex flex-wrap gap-1.5">
                      {match.reasons.slice(0, 3).map((r) => (
                        <li key={r} className="rounded-full bg-sand/70 px-2.5 py-1 text-[11px] text-ink/65">{r}</li>
                      ))}
                    </ul>
                  </li>
                );
              })}
            </ul>
            <p className="mt-4 text-xs text-ink/50">
              Kith does not reveal phone numbers or run in-app chat. Meet in a public place on campus
              and never pay a landlord outside Kith escrow.{" "}
              <Link href="/legal/disputes" className="underline decoration-kith-green decoration-2 underline-offset-2">How we protect payments</Link>.
            </p>
          </section>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
