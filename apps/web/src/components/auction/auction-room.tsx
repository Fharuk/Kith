"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuctionSocket } from "@/hooks/use-auction-socket";
import { countdown, formatNgnFromKobo, kobo } from "@/lib/auction-wire";
import { IconGavel, IconPulse, IconUsers } from "@/components/icons";

export function AuctionRoom({ auctionId }: { auctionId: string }) {
  const { state, bids, conn, presence, flash, extension, ended, rejection, placeBid } = useAuctionSocket(auctionId);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(t);
  }, []);

  const quick = useMemo(() => {
    if (!state) return [];
    const cur = kobo(state.currentPriceKobo);
    const inc = kobo(state.minIncrementKobo);
    return [1n, 2n, 5n].map((m) => cur + inc * m);
  }, [state]);

  const live = state && (state.status === "active" || state.status === "extended");

  return (
    <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
      {/* Price + clock */}
      <section className="rounded-card bg-paper p-8 shadow-card hairline">
        <div className="flex items-center justify-between">
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-kith-blue-deep">
            <span className={`h-2 w-2 rounded-full ${conn === "live" ? "bg-kith-green" : "bg-clay"}`} aria-hidden />
            {conn === "live" ? "Live" : conn === "connecting" ? "Connecting" : "Reconnecting"}
          </p>
          <p className="inline-flex items-center gap-1.5 text-xs text-ink/50">
            <IconUsers width={14} height={14} /> <span className="tabular">{presence}</span> watching
          </p>
        </div>

        {state ? (
          <>
            <p className="mt-6 text-xs font-semibold uppercase tracking-[0.16em] text-ink/50">Current price</p>
            <p
              className={`tabular mt-1 font-display text-6xl text-navy transition-colors duration-300 ${flash ? "text-kith-blue-deep" : ""}`}
              aria-live="polite"
            >
              {formatNgnFromKobo(kobo(state.currentPriceKobo))}
            </p>
            <dl className="mt-6 grid grid-cols-3 gap-4 text-sm">
              <div>
                <dt className="text-xs text-ink/50">Floor</dt>
                <dd className="tabular mt-0.5 font-semibold text-ink">{formatNgnFromKobo(kobo(state.floorPriceKobo))}</dd>
              </div>
              <div>
                <dt className="text-xs text-ink/50">Min increment</dt>
                <dd className="tabular mt-0.5 font-semibold text-ink">{formatNgnFromKobo(kobo(state.minIncrementKobo))}</dd>
              </div>
              <div>
                <dt className="text-xs text-ink/50">Bids</dt>
                <dd className="tabular mt-0.5 font-semibold text-ink">{state.totalBids}</dd>
              </div>
            </dl>

            <div className="mt-8 flex items-end justify-between gap-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink/50">
                  {ended ? "Auction ended" : "Closes in"}
                </p>
                <p className={`tabular mt-1 font-mono text-4xl ${live && state.actualEndTime - now < 120_000 ? "text-danger" : "text-ink"}`}>
                  {ended ? "—" : countdown(state.actualEndTime, now)}
                </p>
              </div>
              {state.status === "extended" && !ended && (
                <p className="rounded-full bg-kith-blue/10 px-4 py-2 text-xs font-semibold text-kith-blue-deep">
                  Soft-close: clock extended
                </p>
              )}
            </div>

            {extension && !ended && (
              <p className="mt-4 rounded-field bg-sand px-4 py-2.5 text-xs text-ink/70" role="status">
                ⏱ A bid landed in the final two minutes — the clock jumped to {countdown(extension, now)} remaining.
              </p>
            )}

            {ended ? (
              <div className="mt-8 rounded-field bg-navy p-6 text-paper">
                <p className="text-xs uppercase tracking-[0.16em] text-paper/60">Won by</p>
                <p className="mt-1 font-display text-2xl">{ended.winnerLabel ?? "—"}</p>
                <p className="tabular mt-2 text-sm text-paper/70">
                  {formatNgnFromKobo(kobo(ended.finalPriceKobo))} · {ended.totalBids} bids · escrow opened, next auction
                  starting shortly
                </p>
              </div>
            ) : (
              <div className="mt-8">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink/50">Quick bid</p>
                <div className="mt-3 flex flex-wrap gap-3">
                  {quick.map((amount) => (
                    <button
                      key={amount.toString()}
                      type="button"
                      onClick={() => placeBid(amount)}
                      disabled={!live}
                      className="tabular rounded-full bg-navy px-5 py-3 text-sm font-semibold text-paper shadow-card transition-all duration-200 hover:bg-navy-soft hover:shadow-lift disabled:opacity-40"
                    >
                      {formatNgnFromKobo(amount)}
                    </button>
                  ))}
                </div>
                <p className="mt-3 text-xs text-ink/50">
                  Demo bidder identity: <span className="font-mono">KH-DEMO-1</span> (verified). Production requires the
                  four verification gates.
                </p>
                {rejection && (
                  <p className="mt-3 rounded-field bg-danger/10 px-4 py-2.5 text-xs font-medium text-danger" role="alert">
                    Bid rejected: {rejection}
                  </p>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="mt-8 space-y-3" aria-hidden>
            <div className="h-10 w-40 animate-pulse rounded bg-sand" />
            <div className="h-16 w-full animate-pulse rounded bg-sand" />
            <div className="h-24 w-full animate-pulse rounded bg-sand" />
          </div>
        )}
      </section>

      {/* Feed */}
      <section className="rounded-card bg-paper p-8 shadow-card hairline">
        <h2 className="inline-flex items-center gap-2 font-sans text-sm font-semibold uppercase tracking-[0.16em] text-ink/60">
          <IconPulse width={16} height={16} className="text-kith-blue-deep" /> Bid feed
        </h2>
        <ol className="mt-5 space-y-2.5" aria-live="polite">
          {bids.length === 0 && <li className="text-sm text-ink/50">Waiting for the first bid…</li>}
          {bids.map((b) => (
            <li key={b.id} className="flex items-baseline justify-between gap-4 rounded-field bg-sand/60 px-4 py-2.5">
              <span className="font-mono text-xs text-ink/60">{b.bidderLabel}</span>
              <span className="tabular text-sm font-semibold text-navy">{formatNgnFromKobo(kobo(b.amountKobo))}</span>
            </li>
          ))}
        </ol>
        <p className="mt-6 flex items-start gap-2 text-xs leading-relaxed text-ink/50">
          <IconGavel width={14} height={14} className="mt-0.5 shrink-0" />
          Circle auctions use soft-close: any bid inside the final two minutes adds five. The highest verified bid at
          the final bell wins and pays into escrow.
        </p>
      </section>
    </div>
  );
}
