import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { Hero } from "@/components/landing/hero";
import { Trust } from "@/components/landing/trust";
import { Tiers } from "@/components/landing/tiers";
import { How } from "@/components/landing/how";
import { LiveDemo } from "@/components/landing/live-demo";
import { Partners } from "@/components/landing/partners";

export default function HomePage() {
  return (
    <>
      <SiteNav />
      <main>
        <Hero />
        <Trust />
        <Tiers />
        <How />
        <LiveDemo />
        <Partners />
      </main>
      <SiteFooter />
    </>
  );
}
