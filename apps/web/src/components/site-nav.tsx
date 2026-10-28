"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import logo from "@/assets/brand/logo.webp";

const links = [
  { href: "/rooms", label: "Find a room" },
  { href: "/#how", label: "How it works" },
  { href: "/landlords", label: "Landlords" },
  { href: "/porters", label: "Porters" },
];

/**
 * Liquid-glass sticky nav.
 *
 * A single translucent surface that condenses as you scroll: blur + saturation rise,
 * the inner specular hairline tightens, and the bar insets into a floating capsule.
 * Pure CSS compositing (backdrop-filter) — no canvas, no scroll listeners beyond one
 * rAF-throttled flag. Degrades to an opaque paper bar when backdrop-filter is missing.
 */
export function SiteNav() {
  const [condensed, setCondensed] = useState(false);

  useEffect(() => {
    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        setCondensed(window.scrollY > 24);
        frame = 0;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <header className="sticky top-0 z-40 px-3 pt-3 sm:px-4">
      <div
        className={[
          "mx-auto flex max-w-6xl items-center justify-between rounded-full transition-all duration-300 ease-[var(--ease-kith)]",
          condensed
            ? "h-14 border border-white/60 bg-paper/62 px-4 shadow-[0_10px_30px_-12px_rgba(18,32,63,0.35)] backdrop-blur-xl backdrop-saturate-150 supports-[backdrop-filter]:bg-paper/55 sm:px-5"
            : "h-16 border border-transparent bg-paper/35 px-4 backdrop-blur-sm sm:px-5",
        ].join(" ")}
        style={{
          // specular top edge + soft inner light: the "glass" read, without a gradient wash
          boxShadow: condensed
            ? "inset 0 1px 0 rgba(255,255,255,0.85), inset 0 -1px 0 rgba(18,32,63,0.05), 0 10px 30px -12px rgba(18,32,63,0.35)"
            : "inset 0 1px 0 rgba(255,255,255,0.5)",
        }}
      >
        <Link href="/" className="flex items-center gap-3" aria-label="Kith home">
          <Image
            src={logo}
            alt="Kith — Your Verified Student Community"
            height={condensed ? 30 : 34}
            style={{ width: "auto", height: "auto" }}
            className="transition-all duration-300"
            priority
          />
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-7 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="relative text-sm font-medium text-ink/70 transition-colors duration-200 hover:text-navy after:absolute after:-bottom-1 after:left-0 after:h-px after:w-0 after:bg-kith-green after:transition-all after:duration-200 hover:after:w-full"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/login"
            className="hidden rounded-full px-3 py-2 text-sm font-medium text-ink/70 transition-colors hover:text-navy sm:block"
          >
            Sign in
          </Link>
          <Link
            href="/register"
            className="rounded-full bg-navy px-4 py-2 text-sm font-semibold text-paper shadow-card transition-all duration-200 hover:bg-navy-soft hover:shadow-lift sm:px-5 sm:py-2.5"
          >
            Get verified
          </Link>
        </div>
      </div>
    </header>
  );
}
