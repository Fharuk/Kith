"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import logo from "@/assets/brand/logo.webp";

/**
 * Liquid-logo preloader.
 *
 * Runs once per browser session on the landing page: the Kith mark rises through a
 * soft mask with a refraction blur that settles to sharp, then the whole veil lifts.
 * ~1.1s total, pointer-events none, and it never blocks first paint — content is already
 * rendered underneath. Skipped entirely for reduced-motion or repeat visits.
 */
export function Preloader() {
  const [state, setState] = useState<"hidden" | "running" | "leaving">("hidden");

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;
    try {
      if (sessionStorage.getItem("kith.preloaded") === "1") return;
      sessionStorage.setItem("kith.preloaded", "1");
    } catch {
      return; // storage blocked — skip rather than flash
    }
    setState("running");
    const toLeave = setTimeout(() => setState("leaving"), 820);
    const toDone = setTimeout(() => setState("hidden"), 1400);
    return () => {
      clearTimeout(toLeave);
      clearTimeout(toDone);
    };
  }, []);

  if (state === "hidden") return null;

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[100] flex items-center justify-center bg-paper transition-opacity duration-500"
      style={{ opacity: state === "leaving" ? 0 : 1 }}
    >
      <div className="relative">
        <div
          aria-hidden
          className="absolute -inset-16 rounded-full blur-3xl"
          style={{
            background:
              "radial-gradient(circle at 35% 35%, rgba(76,175,80,0.22), transparent 60%), radial-gradient(circle at 65% 65%, rgba(41,171,226,0.18), transparent 62%)",
            animation: "kith-drift 2.4s var(--ease-kith) infinite alternate",
          }}
        />
        <div
          className="relative"
          style={{ animation: "kith-rise 900ms var(--ease-kith) both" }}
        >
          <Image src={logo} alt="" height={56} style={{ width: "auto" }} priority />
        </div>
        <div
          aria-hidden
          className="mx-auto mt-6 h-0.5 w-24 overflow-hidden rounded-full bg-hairline"
        >
          <span
            className="block h-full w-1/3 rounded-full bg-kith-green"
            style={{ animation: "kith-load 820ms var(--ease-kith) infinite" }}
          />
        </div>
      </div>

      <style>{`
        @keyframes kith-rise {
          0%   { opacity: 0; transform: translateY(14px) scale(0.975); filter: blur(10px); }
          55%  { opacity: 1; filter: blur(0.6px); }
          100% { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
        }
        @keyframes kith-drift {
          from { transform: scale(0.94) translate3d(-6px, 4px, 0); }
          to   { transform: scale(1.06) translate3d(6px, -4px, 0); }
        }
        @keyframes kith-load {
          0%   { transform: translateX(-120%); }
          100% { transform: translateX(360%); }
        }
      `}</style>
    </div>
  );
}
