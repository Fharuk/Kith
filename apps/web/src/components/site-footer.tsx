import Image from "next/image";
import Link from "next/link";
import logo from "@/assets/brand/logo.webp";

export function SiteFooter() {
  return (
    <footer className="bg-navy text-paper/80">
      <div className="mx-auto grid max-w-6xl gap-12 px-6 py-16 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Image src={logo} alt="Kith" height={46} style={{ width: "auto" }} className="brightness-0 invert" />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-paper/60">
            Your verified student community. Built in Nigeria for Nigerian campuses — launching at
            FUNAAB and UNILAG.
          </p>
        </div>
        <FooterCol
          title="Students"
          items={[
            ["Find a room", "/rooms"],
            ["Live auctions", "/auctions/demo"],
            ["Verification", "/verify"],
            ["Guest passes", "/passes"],
          ]}
        />
        <FooterCol
          title="Partners"
          items={[
            ["List a property", "/landlords"],
            ["Porter network", "/porters"],
            ["Payouts & split", "/landlords#payouts"],
          ]}
        />
        <FooterCol
          title="Company"
          items={[
            ["How it works", "/#how"],
            ["Licence to occupy", "/legal/licence-to-occupy"],
            ["Guest agreement", "/legal/guest-agreement"],
            ["Privacy (NDPR)", "/legal/privacy"],
          ]}
        />
      </div>
      <div className="border-t border-paper/10">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-6 py-6 text-xs text-paper/50 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Kith Solutions Ltd · RC pending · Lagos, Nigeria</p>
          <p className="tabular">Escrowed payments powered by Paystack · 85% landlord / 15% Kith</p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, items }: { title: string; items: [string, string][] }) {
  return (
    <nav aria-label={title}>
      <h3 className="font-sans text-xs font-semibold uppercase tracking-[0.14em] text-paper/50">{title}</h3>
      <ul className="mt-4 space-y-3">
        {items.map(([label, href]) => (
          <li key={href}>
            <Link href={href} className="text-sm text-paper/75 transition-colors hover:text-paper">
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
