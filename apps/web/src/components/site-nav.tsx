import Image from "next/image";
import Link from "next/link";
import logo from "@/assets/brand/logo.webp";

const links = [
  { href: "/#rooms", label: "Find a room" },
  { href: "/#how", label: "How it works" },
  { href: "/#landlords", label: "Landlords" },
  { href: "/#porters", label: "Porters" },
];

export function SiteNav() {
  return (
    <header className="sticky top-0 z-40 bg-paper/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6 hairline">
        <Link href="/" className="flex items-center gap-3" aria-label="Kith home">
          <Image
            src={logo}
            alt="Kith — Your Verified Student Community"
            height={40}
            style={{ width: "auto" }}
            priority
          />
        </Link>
        <nav aria-label="Primary" className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-ink/70 transition-colors duration-200 hover:text-navy"
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="hidden text-sm font-medium text-ink/70 transition-colors hover:text-navy sm:block"
          >
            Sign in
          </Link>
          <Link
            href="/register"
            className="rounded-full bg-navy px-5 py-2.5 text-sm font-semibold text-paper shadow-card transition-all duration-200 hover:bg-navy-soft hover:shadow-lift"
          >
            Get verified
          </Link>
        </div>
      </div>
    </header>
  );
}
