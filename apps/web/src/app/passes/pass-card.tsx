"use client";

import { useEffect, useState } from "react";
import { IconKey } from "@/components/icons";

export function PassCard({
  bookingId, propertyTitle, roomNumber, city, status, checkIn, hasPass,
}: {
  bookingId: string; propertyTitle: string; roomNumber: string; city: string;
  status: string; checkIn: Date; hasPass: boolean;
}) {
  const [code, setCode] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!hasPass) return;
    let alive = true;
    const load = async () => {
      const res = await fetch(`/api/passes/code?booking=${bookingId}`);
      if (!res.ok) return;
      const json = (await res.json()) as { code: string; expiresAt: number };
      if (!alive) return;
      setCode(json.code);
      setExpiresAt(json.expiresAt);
    };
    void load();
    const t = setInterval(() => {
      setNow(Date.now());
      if (expiresAt && now >= expiresAt - 500) void load();
    }, 1000);
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, [bookingId, hasPass, expiresAt, now]);

  const secondsLeft = expiresAt ? Math.max(0, Math.ceil((expiresAt - now) / 1000)) : null;

  return (
    <article
      className="relative overflow-hidden rounded-card bg-navy text-paper shadow-lift"
      style={{
        // liquid-glass: a faint refraction sheen across the pass, specular top edge
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.16), inset 0 -1px 0 rgba(0,0,0,0.25), 0 24px 48px rgba(18,32,63,0.28)",
      }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 90% at 12% -10%, rgba(41,171,226,0.22), transparent 55%), radial-gradient(90% 80% at 92% 110%, rgba(76,175,80,0.20), transparent 58%)",
        }}
      />
      <div className="relative grid sm:grid-cols-[1fr_auto]">
        <div className="p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-paper/55">{status.replace("_", " ")}</p>
          <h2 className="mt-2 font-display text-2xl">{propertyTitle} · {roomNumber}</h2>
          <p className="mt-1 text-sm text-paper/65">{city}</p>
          <p className="mt-4 text-sm text-paper/70">
            Check-in {new Date(checkIn).toLocaleDateString("en-NG", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
        <div className="flex flex-col items-center justify-center gap-2 border-t border-paper/10 p-8 sm:border-l sm:border-t-0">
          <IconKey width={22} height={22} className="text-kith-green" />
          {hasPass ? (
            <>
              <p className="tabular font-mono text-5xl tracking-[0.12em] text-paper" aria-live="polite">
                {code ?? "······"}
              </p>
              <p className="tabular text-xs text-paper/55">rotates in {secondsLeft ?? "—"}s</p>
            </>
          ) : (
            <p className="text-xs text-paper/55">pass issued at payment</p>
          )}
        </div>
      </div>
    </article>
  );
}
