import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { IconArrowRight, IconLock, IconUsers, IconNaira, IconHomeCheck } from "@/components/icons";
import elite from "@/assets/img/room-elite.webp";

export const metadata: Metadata = { title: "For landlords", description: "List once, reach every verified student on your campus, get paid through escrow." };

const points = [
  { icon: IconUsers, title: "Tenants who are real", body: "Every student passes NIMC, institutional email, matric and liveness checks before they can bid or book. No ghosts, no proxies." },
  { icon: IconLock, title: "Rent secured before keys move", body: "Payment sits in Paystack escrow from the moment of booking. The money exists before anyone touches a key." },
  { icon: IconHomeCheck, title: "Porter-verified handover", body: "A Kith porter confirms check-in at your door. That confirmation — not a phone call — releases your payout." },
  { icon: IconNaira, title: "85% of every payment, automatically", body: "Split payments land in your Paystack subaccount. No chasing, no agents, no 'next week'." },
];

export default function LandlordsPage() {
  return (
    <>
      <SiteNav />
      <main>
        <section className="mx-auto grid max-w-6xl gap-14 px-6 py-20 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-clay">For landlords</p>
            <h1 className="mt-3 text-4xl sm:text-5xl">Get paid, not chased.</h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink/70">
              Kith replaces the handshake economy of campus housing with verified tenants, escrowed
              rent and porter-confirmed handovers — so your property earns while you sleep.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/register?role=landlord" className="group inline-flex items-center gap-2 rounded-full bg-navy px-7 py-3.5 text-base font-semibold text-paper shadow-card hover:bg-navy-soft hover:shadow-lift">
                Start listing <IconArrowRight width={18} height={18} className="transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link href="/login" className="rounded-full px-7 py-3.5 text-base font-semibold text-navy hairline hover:bg-sand">Sign in</Link>
            </div>
          </div>
          <Image src={elite} alt="A premium verified listing interior" placeholder="blur" sizes="(max-width:1024px) 100vw, 45vw" className="rounded-[20px] shadow-lift" />
        </section>

        <section className="border-y border-hairline bg-sand/40">
          <ul className="mx-auto grid max-w-6xl gap-8 px-6 py-16 sm:grid-cols-2">
            {points.map(({ icon: Icon, title, body }) => (
              <li key={title} className="rounded-card bg-paper p-7 shadow-card">
                <Icon width={26} height={26} className="text-kith-green-deep" />
                <h2 className="mt-4 font-sans text-lg font-semibold text-navy">{title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-ink/65">{body}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-20">
          <h2 className="max-w-xl text-3xl">How payouts work, step by step.</h2>
          <ol className="mt-10 grid gap-8 md:grid-cols-4">
            {[
              "Student books or wins an auction and pays via Paystack.",
              "Funds are held in escrow — 85% earmarked to your subaccount.",
              "Porter confirms the tenant through your door at check-in.",
              "Escrow releases. Money lands in your account, reconciled daily.",
            ].map((t, i) => (
              <li key={t}>
                <p className="tabular font-mono text-sm text-kith-blue-deep">0{i + 1}</p>
                <p className="mt-2 text-sm leading-relaxed text-ink/70">{t}</p>
              </li>
            ))}
          </ol>
          <p className="mt-10 text-xs text-ink/50">
            Disputes freeze release until resolved. Full terms in the{" "}
            <Link className="underline underline-offset-4" href="/legal/licence-to-occupy">master guest &amp; property management agreement</Link>.
          </p>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
