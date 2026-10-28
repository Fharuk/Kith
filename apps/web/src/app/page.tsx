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

const organisationLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://kith.ng/#org",
      name: "Kith",
      url: "https://kith.ng",
      slogan: "Your Verified Student Community",
      description:
        "Nigeria's verified student housing marketplace: NIMC-checked students, porter-inspected homes, escrowed payments.",
      areaServed: "NG",
      logo: "https://kith.ng/img/hero-campus.webp",
    },
    {
      "@type": "WebSite",
      "@id": "https://kith.ng/#site",
      url: "https://kith.ng",
      name: "Kith",
      publisher: { "@id": "https://kith.ng/#org" },
      inLanguage: "en-NG",
      potentialAction: {
        "@type": "SearchAction",
        target: "https://kith.ng/rooms?q={search_term_string}",
        "query-input": "required name=search_term_string",
      },
    },
  ],
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        // Structured data is a literal we control — no user input is interpolated here.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organisationLd) }}
      />
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
