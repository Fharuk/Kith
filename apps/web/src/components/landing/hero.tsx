import Image from "next/image";
import Link from "next/link";
import hero from "@/assets/img/hero-campus.webp";
import { IconArrowRight, IconShieldCheck } from "@/components/icons";

const stats = [
  ["4", "verification gates before anyone bids"],
  ["85%", "of every payment goes to the landlord"],
  ["24h", "escrow release after porter check-in"],
  ["2", "launch campuses — FUNAAB & UNILAG"],
];

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div aria-hidden className="brand-mesh absolute inset-0 opacity-70" />
      <div className="relative mx-auto grid max-w-6xl gap-14 px-6 pb-24 pt-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:pt-24">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full bg-sand px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-navy">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-kith-green opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-kith-green" />
            </span>
            Now verifying at FUNAAB &amp; UNILAG
          </p>
          <h1 className="mt-6 text-5xl leading-[1.04] sm:text-6xl lg:text-[4.25rem]">
            Every room verified.
            <br />
            Every student verified.
            <br />
            <span className="text-navy">Every kobo protected.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink/70">
            Kith is Nigeria&rsquo;s verified student housing community. NIMC-checked students,
            porter-inspected homes, and payments held in escrow until you are through the door.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-4">
            <Link
              href="/rooms"
              className="group inline-flex items-center gap-2 rounded-full bg-navy px-7 py-3.5 text-base font-semibold text-paper shadow-card transition-all duration-200 hover:bg-navy-soft hover:shadow-lift"
            >
              Find your room
              <IconArrowRight width={18} height={18} className="transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/landlords"
              className="inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-base font-semibold text-navy hairline transition-colors duration-200 hover:bg-sand"
            >
              List your property
            </Link>
          </div>
          <dl className="mt-14 grid grid-cols-2 gap-x-8 gap-y-8 sm:grid-cols-4">
            {stats.map(([n, label]) => (
              <div key={label}>
                <dt className="tabular font-display text-3xl text-navy">{n}</dt>
                <dd className="mt-1 text-xs leading-snug text-ink/60">{label}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="relative">
          <div className="absolute -inset-3 -rotate-1 rounded-[24px] bg-kith-green/15" aria-hidden />
          <div className="absolute -inset-3 rotate-1 rounded-[24px] bg-kith-blue/15" aria-hidden />
          <Image
            src={hero}
            alt="Students walking through a verified Kith residence courtyard in warm afternoon light"
            placeholder="blur"
            priority
            sizes="(max-width: 1024px) 100vw, 46vw"
            className="relative rotate-0 rounded-[20px] shadow-lift"
          />
          <div className="absolute -bottom-6 left-6 right-6 flex items-center gap-3 rounded-card bg-paper/95 p-4 shadow-lift backdrop-blur">
            <IconShieldCheck width={28} height={28} className="shrink-0 text-kith-green-deep" />
            <p className="text-sm leading-snug text-ink/80">
              <span className="font-semibold text-navy">Physically inspected.</span> A Kith porter
              walks every home before it can be listed.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
