import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/session";
import { referralSummary } from "@/lib/referrals";
import { formatNgn } from "@kith/domain";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { CopyCode } from "./copy-code";

export const metadata: Metadata = {
  title: "Refer a classmate",
  description: "Earn Kith credit when a friend's first booking is paid.",
};

export const dynamic = "force-dynamic";

export default async function ReferralsPage() {
  const user = await requireUser();
  if (user.role !== "student") redirect("/");
  const summary = await referralSummary(user.id);
  const share = `Join me on Kith — verified student housing. Use my code ${summary.code} when you sign up: ${process.env.NEXT_PUBLIC_APP_URL ?? "https://kith.ng"}/register?ref=${summary.code}`;

  return (
    <>
      <SiteNav />
      <main id="main" className="mx-auto max-w-3xl px-6 py-16">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-clay">Referrals</p>
        <h1 className="mt-2 text-4xl">Bring a classmate. Earn credit.</h1>
        <p className="mt-3 max-w-xl text-base leading-relaxed text-ink/70">
          When a friend you invited pays their first booking, ₦2,000 lands on your account as
          credit against your next one. Signups alone earn nothing — the reward follows a real
          payment, so it stays honest.
        </p>

        <div className="mt-8 rounded-card bg-navy p-6 text-paper">
          <p className="text-xs uppercase tracking-[0.14em] text-paper/60">Your code</p>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <p className="font-mono text-2xl font-semibold tracking-[0.08em]">{summary.code}</p>
            <CopyCode code={summary.code} />
          </div>
          <p className="mt-4 break-all rounded-field bg-paper/10 px-3 py-2 text-xs text-paper/80">{share}</p>
        </div>

        <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            ["Credit", formatNgn(summary.creditKobo)],
            ["Invited", String(summary.total)],
            ["Pending", String(summary.pending)],
            ["Rewarded", String(summary.rewarded)],
          ].map(([label, value]) => (
            <div key={label} className="rounded-card bg-paper p-4 shadow-card hairline">
              <dt className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink/50">{label}</dt>
              <dd className="mt-1 text-lg font-semibold text-navy">{value}</dd>
            </div>
          ))}
        </dl>

        <section className="mt-8 rounded-card bg-sand/50 p-5 hairline">
          <h2 className="font-sans text-sm font-semibold uppercase tracking-[0.14em] text-ink/55">How it works</h2>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-ink/70">
            <li>Share your code or the link above with a classmate.</li>
            <li>They sign up with it and get verified like everyone else.</li>
            <li>When their first booking is paid, your ₦2,000 credit is applied automatically.</li>
          </ol>
          <p className="mt-3 text-xs text-ink/50">
            Credit is not withdrawable and cannot be transferred. One referral per person, and no
            referring yourself.
          </p>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
