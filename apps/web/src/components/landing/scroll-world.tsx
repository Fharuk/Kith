"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { IconArrowRight } from "@/components/icons";

/**
 * "Scroll-world" campus flythrough.
 *
 * Three frames (campus → street → room) cross-dissolve with a slow push-in as the section
 * pins, driven by scroll progress in a rAF loop (no libraries, no canvas). Each frame
 * carries a small caption so the journey reads as a story, not a slideshow.
 *
 * Accessibility: with prefers-reduced-motion the section renders as a static three-up
 * gallery — same content, no motion.
 */
const FRAMES = [
  {
    src: "/img/hero-campus.webp",
    kicker: "01 · The campus gate",
    title: "Walk out of the lecture hall",
    body: "FUNAAB and UNILAG first — every listed home is within a porter-checked walk or keke ride.",
    alt: "Students walking through a Nigerian campus gate at golden hour",
  },
  {
    src: "/img/room-market.webp",
    kicker: "02 · The street",
    title: "Past the agents, straight to the door",
    body: "No agency fee. No caution fee. No \"the landlord is not around\" — every property has a named owner and a Kith porter.",
    alt: "Residential street with student housing in Lagos",
  },
  {
    src: "/img/room-elite.webp",
    kicker: "03 · Your room",
    title: "Keys in your hand, kobo still protected",
    body: "Your 6-digit guest pass opens the gate. Escrow releases only after the porter confirms you are in.",
    alt: "Bright student room interior with desk and window light",
  },
];

export function ScrollWorld() {
  const ref = useRef<HTMLDivElement | null>(null);
  const [progress, setProgress] = useState(0);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (reduced) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      if (total <= 0) return setProgress(0);
      const p = Math.min(1, Math.max(0, -rect.top / total));
      setProgress(p);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [reduced]);

  if (reduced) {
    return (
      <section className="mx-auto max-w-6xl px-6 py-20">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-kith-green-deep">The walk</p>
        <h2 className="mt-3 max-w-2xl text-4xl sm:text-5xl">From campus gate to your front door</h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {FRAMES.map((f) => (
            <figure key={f.src} className="overflow-hidden rounded-card shadow-card hairline">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={f.src} alt={f.alt} className="h-56 w-full object-cover" loading="lazy" />
              <figcaption className="p-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink/45">{f.kicker}</p>
                <p className="mt-1 font-display text-lg text-navy">{f.title}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>
    );
  }

  const stage = Math.min(FRAMES.length - 1, Math.floor(progress * FRAMES.length));
  // Frame-local progress 0→1 for the push-in
  const local = progress * FRAMES.length - stage;

  return (
    <section ref={ref} className="relative h-[300vh]" aria-label="Campus walkthrough">
      <div className="sticky top-0 flex h-dvh items-center overflow-hidden bg-navy">
        {FRAMES.map((f, i) => {
          const visible = i === stage;
          return (
            <div
              key={f.src}
              aria-hidden={!visible}
              className="absolute inset-0 transition-opacity duration-700 ease-[var(--ease-kith)]"
              style={{ opacity: visible ? 1 : 0 }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={f.src}
                alt={f.alt}
                className="h-full w-full object-cover"
                style={{
                  transform: visible ? `scale(${1.06 + local * 0.07})` : "scale(1.06)",
                  transition: "transform 120ms linear",
                  willChange: "transform",
                }}
                loading={i === 0 ? "eager" : "lazy"}
              />
              <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-navy/85 via-navy/35 to-navy/10" />
            </div>
          );
        })}

        <div className="relative mx-auto w-full max-w-6xl px-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-kith-green">The walk</p>
          <p className="tabular mt-2 font-mono text-xs text-paper/50">
            {FRAMES[stage].kicker} · {String(Math.round(progress * 100)).padStart(2, "0")}%
          </p>
          <h2 className="mt-4 max-w-2xl font-display text-4xl leading-tight text-paper sm:text-5xl">
            {FRAMES[stage].title}
          </h2>
          <p className="mt-4 max-w-lg text-base leading-relaxed text-paper/70">{FRAMES[stage].body}</p>

          {stage === FRAMES.length - 1 && (
            <Link
              href="/rooms"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-paper px-6 py-3 text-sm font-semibold text-navy transition-all hover:gap-3"
            >
              Find your room <IconArrowRight width={16} height={16} />
            </Link>
          )}

          <div className="mt-10 flex gap-2" aria-hidden>
            {FRAMES.map((f, i) => (
              <span
                key={f.src}
                className="h-0.5 w-14 rounded-full transition-colors duration-300"
                style={{ background: i <= stage ? "#4CAF50" : "rgba(250,248,244,0.25)" }}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
