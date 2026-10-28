import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { Hero } from "@/components/landing/hero";
import { Trust } from "@/components/landing/trust";
import { Tiers } from "@/components/landing/tiers";
import { How } from "@/components/landing/how";
import { LiveDemo } from "@/components/landing/live-demo";
import { Partners } from "@/components/landing/partners";
import { ScrollWorld } from "@/components/landing/scroll-world";
import { Preloader } from "@/components/brand/preloader";

export default function HomePage() {
  return (
    <>
      <Preloader />
      <SiteNav />
      <main>
        <Hero />
        <Trust />
        <Tiers />
        <ScrollWorld />
        <How />
        <LiveDemo />
        <Partners />
      </main>
      <SiteFooter />
    </>
  );
}
