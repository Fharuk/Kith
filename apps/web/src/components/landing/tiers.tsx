import Image from "next/image";
import Link from "next/link";
import market from "@/assets/img/room-market.webp";
import elite from "@/assets/img/room-elite.webp";
import hero from "@/assets/img/hero-campus.webp";
import { IconArrowRight, IconGavel, IconKey } from "@/components/icons";

const tiers = [
  {
    name: "Circle",
    band: "₦40,000 – ₦70,000",
    mode: "Live auction",
    modeIcon: IconGavel,
    image: hero,
    accent: "text-kith-blue-deep bg-kith-blue/10",
    body: "High-demand rooms go to the highest verified bidder. Soft-close auctions mean no last-second sniping — a bid in the final two minutes extends the clock by five.",
  },
  {
    name: "Market",
    band: "₦60,000 – ₦100,000",
    mode: "Fixed price",
    modeIcon: IconKey,
    image: market,
    accent: "text-kith-green-deep bg-kith-green/10",
    body: "Straightforward, fairly-priced rooms. Book, pay into escrow, and collect your guest pass. The landlord is paid when a porter confirms you through the door.",
  },
  {
    name: "Elite",
    band: "₦120,000 – ₦180,000",
    mode: "Fixed price · concierge",
    modeIcon: IconKey,
    image: elite,
    accent: "text-paper bg-navy",
    body: "Premium, physically-verified homes with concierge porter service, guaranteed utilities and a dedicated check-in window.",
  },
];

export function Tiers() {
  return (
    <section id="rooms" className="mx-auto max-w-6xl scroll-mt-20 px-6 py-24">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-clay">Three ways in</p>
          <h2 className="mt-3 max-w-xl text-3xl sm:text-4xl">A tier for every budget, one standard of trust.</h2>
        </div>
        <Link href="/rooms" className="group inline-flex items-center gap-2 text-sm font-semibold text-navy">
          Browse all rooms
          <IconArrowRight width={16} height={16} className="transition-transform duration-200 group-hover:translate-x-0.5" />
        </Link>
      </div>

      <div className="mt-12 grid gap-8 lg:grid-cols-3">
        {tiers.map(({ name, band, mode, modeIcon: Icon, image, accent, body }) => (
          <article
            key={name}
            className="group flex flex-col overflow-hidden rounded-card bg-paper shadow-card transition-shadow duration-300 hover:shadow-lift hairline"
          >
            <div className="relative aspect-[4/3] overflow-hidden">
              <Image
                src={image}
                alt={`${name} tier accommodation`}
                placeholder="blur"
                sizes="(max-width: 1024px) 100vw, 33vw"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              />
              <span className={`absolute left-4 top-4 rounded-full px-3.5 py-1.5 text-xs font-semibold ${accent}`}>
                {name}
              </span>
            </div>
            <div className="flex flex-1 flex-col p-6">
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="font-display text-2xl">{name}</h3>
                <p className="tabular text-sm font-semibold text-navy">{band}</p>
              </div>
              <p className="mt-1 inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.1em] text-ink/50">
                <Icon width={14} height={14} /> {mode}
              </p>
              <p className="mt-4 flex-1 text-sm leading-relaxed text-ink/65">{body}</p>
              <Link
                href={`/rooms?tier=${name.toLowerCase()}`}
                className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-navy transition-colors hover:text-kith-blue-deep"
              >
                View {name} rooms
                <IconArrowRight width={16} height={16} />
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
