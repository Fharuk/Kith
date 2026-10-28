import type { Metadata } from "next";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { AuctionRoom } from "@/components/auction/auction-room";

export const metadata: Metadata = {
  title: "Live Circle auction demo",
  description:
    "Watch a Circle auction run on the real Kith realtime engine — soft-close clock, minimum increments and a live bid feed.",
};

export default function DemoAuctionPage() {
  return (
    <>
      <SiteNav />
      <main className="mx-auto max-w-6xl px-6 py-16">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-clay">Circle · live demo</p>
        <h1 className="mt-3 max-w-2xl text-4xl sm:text-5xl">One room. Twelve minutes. Highest verified bid.</h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink/70">
          This is the production realtime engine running in demo mode: simulated verified bidders,
          soft-close extensions and a live feed. Place a bid as the demo student and watch every
          other tab update in the same tick.
        </p>
        <div className="mt-10">
          <AuctionRoom auctionId="demo" />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
