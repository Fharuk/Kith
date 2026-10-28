import type { Metadata } from "next";
import Link from "next/link";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { IconArrowRight, IconKey, IconHomeCheck, IconPulse, IconShieldCheck } from "@/components/icons";

export const metadata: Metadata = { title: "For porters", description: "Paid, scheduled, geo-stamped trust work with a terminal built for the field." };

const perks = [
  { icon: IconKey, title: "A terminal built for the gate", body: "Big numpad, sunlight-readable contrast, rotating guest-pass codes, offline-tolerant verification." },
  { icon: IconHomeCheck, title: "Inspection jobs with proof", body: "Photo + geo-stamp + timestamp on every verification. Your work record is your reputation." },
  { icon: IconPulse, title: "Scheduled, paid work", body: "Check-ins, check-outs and inspections arrive as a queue — not as favour-calls from landlords." },
  { icon: IconShieldCheck, title: "Backed by an SOP", body: "Incident standard operating procedures, escalation tree and dual-control break-glass — you're never alone on a call." },
];

export default function PortersPage() {
  return (
    <>
      <SiteNav />
      <main>
        <section className="bg-navy text-paper">
          <div className="mx-auto max-w-6xl px-6 py-24">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-kith-green">The porter network</p>
            <h1 className="mt-3 max-w-2xl text-4xl text-paper sm:text-5xl">You are the human layer of trust.</h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-paper/70">
              Every verified home on Kith exists because a porter walked it. Every released escrow
              exists because a porter confirmed a check-in. It is real work, properly toolled.
            </p>
            <div className="mt-9 flex flex-wrap gap-4">
              <Link href="/register?role=porter" className="group inline-flex items-center gap-2 rounded-full bg-kith-green px-7 py-3.5 text-base font-semibold text-navy transition-colors hover:bg-kith-green-deep hover:text-paper">
                Join the network <IconArrowRight width={18} height={18} className="transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link href="/login" className="rounded-full px-7 py-3.5 text-base font-semibold text-paper hairline hover:bg-paper/10">Sign in</Link>
            </div>
          </div>
        </section>
        <section className="mx-auto grid max-w-6xl gap-8 px-6 py-20 sm:grid-cols-2">
          {perks.map(({ icon: Icon, title, body }) => (
            <article key={title} className="rounded-card bg-paper p-7 shadow-card hairline">
              <Icon width={26} height={26} className="text-kith-green-deep" />
              <h2 className="mt-4 font-sans text-lg font-semibold text-navy">{title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-ink/65">{body}</p>
            </article>
          ))}
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
