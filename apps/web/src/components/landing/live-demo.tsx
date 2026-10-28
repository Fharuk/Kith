import Link from "next/link";
import { IconArrowRight, IconPulse } from "@/components/icons";

export function LiveDemo() {
  return (
    <section className="border-y border-hairline bg-paper">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <div className="grid items-center gap-10 lg:grid-cols-[1fr_auto]">
          <div className="max-w-2xl">
            <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-kith-blue-deep">
              <IconPulse width={16} height={16} /> Live right now
            </p>
            <h2 className="mt-3 text-3xl sm:text-4xl">Watch a Circle auction run.</h2>
            <p className="mt-4 text-base leading-relaxed text-ink/70">
              A demo auction is running on the real Kith realtime engine — soft-close clock,
              minimum increments, live bid feed. No signup needed to watch; verification required
              to bid, exactly like production.
            </p>
          </div>
          <Link
            href="/auctions/demo"
            className="group inline-flex items-center gap-3 rounded-full bg-kith-blue-deep px-8 py-4 text-base font-semibold text-paper shadow-card transition-all duration-200 hover:bg-navy hover:shadow-lift"
          >
            Enter the live auction
            <IconArrowRight width={18} height={18} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}
