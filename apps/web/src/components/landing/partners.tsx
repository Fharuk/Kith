import Link from "next/link";
import { IconArrowRight, IconBuilding, IconUsers } from "@/components/icons";

export function Partners() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-24">
      <div className="grid gap-8 lg:grid-cols-2">
        <article id="landlords" className="scroll-mt-20 rounded-card bg-sand/60 p-10 hairline">
          <IconBuilding width={28} height={28} className="text-navy" />
          <h2 className="mt-5 text-3xl">Landlords: get paid, not chased.</h2>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-ink/70">
            List once, reach every verified student on your campus. Rent lands in your Paystack
            subaccount automatically — 85% of every payment, released the day your tenant checks in.
            No agents, no defaults, no stories.
          </p>
          <ul className="mt-6 space-y-2 text-sm text-ink/70">
            <li>· Verified tenants only — NIN, matric and face matched</li>
            <li>· Escrow means rent is secured before keys change hands</li>
            <li>· Porter check-in ends &ldquo;I paid, he refused me entry&rdquo; disputes</li>
          </ul>
          <Link
            href="/register?role=landlord"
            className="group mt-8 inline-flex items-center gap-2 rounded-full bg-navy px-6 py-3 text-sm font-semibold text-paper transition-colors hover:bg-navy-soft"
          >
            Start listing
            <IconArrowRight width={16} height={16} className="transition-transform group-hover:translate-x-0.5" />
          </Link>
        </article>

        <article id="porters" className="scroll-mt-20 rounded-card bg-navy p-10 text-paper">
          <IconUsers width={28} height={28} className="text-kith-green" />
          <h2 className="mt-5 text-3xl text-paper">Porters: the human layer of trust.</h2>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-paper/70">
            Kith porters inspect homes, run check-ins and hold the keys to escrow release. It is
            paid, scheduled, geo-stamped work with a proper operations manual and a terminal built
            for sunlight and gloved hands.
          </p>
          <ul className="mt-6 space-y-2 text-sm text-paper/70">
            <li>· Numpad terminal with rotating guest-pass codes</li>
            <li>· Inspection jobs with photo + geo proof</li>
            <li>· Incident SOP and escalation tree, built in</li>
          </ul>
          <Link
            href="/register?role=porter"
            className="group mt-8 inline-flex items-center gap-2 rounded-full bg-kith-green px-6 py-3 text-sm font-semibold text-navy transition-colors hover:bg-kith-green-deep hover:text-paper"
          >
            Join the network
            <IconArrowRight width={16} height={16} className="transition-transform group-hover:translate-x-0.5" />
          </Link>
        </article>
      </div>
    </section>
  );
}
