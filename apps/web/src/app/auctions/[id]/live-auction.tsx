"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";
import { resolveSocketUrl } from "@/lib/socket-url";
import { formatNgnFromKobo } from "@/lib/auction-wire";

export interface LiveState {
  id: string;
  currentPriceKobo: string;
  floorPriceKobo: string;
  minIncrementKobo: string;
  actualEndTime: number;
  status: "active" | "extended" | "completed" | "cancelled";
  winningStudentId: string | null;
  totalBids: number;
  version: number;
}
export interface LiveBid {
  id: string;
  studentId: string;
  label: string | null;
  amountKobo: string;
  status: string;
  createdAt: number;
}

const CODE_COPY: Record<string, string> = {
  bid_below_increment: "That bid is below the next allowed amount.",
  bid_below_floor: "Bids must meet the floor price.",
  auction_ended: "This auction has closed.",
  auction_not_active: "This auction is no longer live.",
  student_not_verified: "Verify your student account to bid.",
  rate_limited: "Slow down — 20 bids per minute.",
  contention: "Someone bid at the same instant. Try again.",
  duplicate_bid: "That bid was already submitted.",
  landlord_cannot_bid: "Landlords cannot bid on their own rooms.",
  unauthenticated: "Sign in as a verified student to bid.",
};

export function LiveAuction({
  auctionId,
  initialState,
  initialBids,
  meId,
  canBid,
  signedIn,
}: {
  auctionId: string;
  initialState: LiveState;
  initialBids: LiveBid[];
  meId: string | null;
  canBid: boolean;
  signedIn: boolean;
}) {
  const [state, setState] = useState<LiveState>(initialState);
  const [bids, setBids] = useState<LiveBid[]>(initialBids);
  const [conn, setConn] = useState<"connecting" | "live" | "offline">("connecting");
  const [flash, setFlash] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const keyRef = useRef<string | null>(null);

  // Countdown ticker
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(t);
  }, []);

  const applyState = useCallback((next: LiveState, incoming?: LiveBid[]) => {
    setState((prev) => {
      if (next.version < prev.version) return prev;
      if (next.version > prev.version) setFlash(true);
      return next;
    });
    if (incoming) setBids((prev) => [incoming, ...prev.filter((b) => b.id !== incoming.id)].slice(0, 40));
  }, []);

  // Realtime subscription (fan-out relay) with polling fallback
  useEffect(() => {
    let socket: Socket | null = null;
    try {
      socket = io(resolveSocketUrl(), { transports: ["websocket", "polling"], reconnectionDelayMax: 4000 });
      socket.on("connect", () => { setConn("live"); socket?.emit("watch_auction", { auctionId }); });
      socket.on("disconnect", () => setConn("offline"));
      socket.on("connect_error", () => setConn("offline"));
      socket.on("bid_placed", (p: { state: LiveState; record: LiveBid; extended: boolean }) => {
        applyState(p.state, p.record);
        if (p.extended) setNotice("Soft-close: +5 minutes added.");
      });
      socket.on("auction_extended", () => setNotice("Soft-close: +5 minutes added."));
      socket.on("auction_settled", () => setNotice("Auction settled — the winner has been notified."));
      socket.on("auction_cancelled", () => setNotice("Auction closed with no bids."));
    } catch {
      setConn("offline");
    }
    return () => { socket?.disconnect(); };
  }, [auctionId, applyState]);

  // Polling fallback — also catches settlement performed by the cron pass
  useEffect(() => {
    const t = setInterval(async () => {
      try {
        const res = await fetch(`/api/auctions/${auctionId}/state`, { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as { state: LiveState; bids: LiveBid[] };
        applyState(data.state);
        setBids((prev) => {
          const map = new Map(prev.map((b) => [b.id, b]));
          data.bids.forEach((b) => map.set(b.id, b));
          return [...map.values()].sort((a, b) => b.createdAt - a.createdAt).slice(0, 40);
        });
      } catch { /* offline */ }
    }, 4000);
    return () => clearInterval(t);
  }, [auctionId, applyState]);

  useEffect(() => {
    if (!flash) return;
    const t = setTimeout(() => setFlash(false), 700);
    return () => clearTimeout(t);
  }, [flash]);

  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(null), 3500);
    return () => clearTimeout(t);
  }, [notice]);

  const price = BigInt(state.currentPriceKobo);
  const increment = BigInt(state.minIncrementKobo);
  const nextMin = price + increment;
  const msLeft = Math.max(0, state.actualEndTime - now);
  const ended = state.status === "completed" || state.status === "cancelled" || msLeft === 0;
  const secs = Math.floor(msLeft / 1000);
  const clock = `${String(Math.floor(secs / 60)).padStart(2, "0")}:${String(secs % 60).padStart(2, "0")}`;
  const lastBid = bids[0];

  const quickOptions = useMemo(() => {
    return [nextMin, nextMin + increment, nextMin + increment * 2n];
  }, [nextMin, increment]);

  async function submit(amount: bigint) {
    setError(null);
    setPending(true);
    try {
      const idempotencyKey = `${auctionId}:${meId ?? "anon"}:${amount.toString()}:${Date.now()}`.slice(0, 64);
      keyRef.current = idempotencyKey;
      const res = await fetch(`/api/auctions/${auctionId}/bids`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amountKobo: amount.toString(), idempotencyKey }),
      });
      const data = (await res.json()) as { ok?: boolean; code?: string; state?: LiveState; record?: LiveBid; extended?: boolean };
      if (!res.ok || !data.ok) {
        setError(CODE_COPY[data.code ?? ""] ?? `Bid rejected (${data.code ?? res.status})`);
        if (data.state) applyState(data.state);
      } else if (data.state && data.record) {
        applyState(data.state, data.record);
        if (data.extended) setNotice("Soft-close: +5 minutes added.");
      }
    } catch {
      setError("Network hiccup — your bid was not sent.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
      {/* Price + bidding */}
      <section className="rounded-card bg-paper p-8 shadow-card hairline">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink/55">Current bid</p>
          <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold ${conn === "live" ? "bg-kith-green/15 text-kith-green-deep" : "bg-sand text-ink/55"}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${conn === "live" ? "bg-kith-green" : "bg-ink/30"}`} />
            {conn === "live" ? "Live" : conn === "connecting" ? "Connecting" : "Polling"}
          </span>
        </div>

        <p className={`tabular mt-3 font-display text-6xl font-semibold transition-colors ${flash ? "text-kith-green" : "text-navy"}`}>
          {formatNgnFromKobo(price)}
        </p>
        {lastBid && (
          <p className="mt-1 text-xs text-ink/55">
            {lastBid.label ?? "Bidder"} · {new Date(lastBid.createdAt).toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
          </p>
        )}

        <div className="mt-6 flex items-center justify-between rounded-field bg-navy px-5 py-4 text-paper">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-paper/55">{ended ? "Auction" : "Closes in"}</p>
            <p className="tabular font-mono text-3xl font-semibold">{ended ? "CLOSED" : clock}</p>
          </div>
          <div className="text-right">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-paper/55">Bids</p>
            <p className="tabular font-mono text-3xl font-semibold">{state.totalBids}</p>
          </div>
        </div>

        {notice && <p className="mt-4 rounded-field bg-kith-blue/10 px-4 py-2.5 text-xs font-semibold text-kith-blue-deep">{notice}</p>}

        {ended ? (
          <div className="mt-6 rounded-field bg-sand/70 p-5">
            <p className="font-display text-xl text-navy">
              {state.status === "cancelled" ? "Closed without a winner" : "Auction settled"}
            </p>
            <p className="mt-1 text-sm text-ink/60">
              {state.status === "completed"
                ? "The winning student has been notified and can complete payment from their dashboard."
                : "No bids met the reserve. The room stays available."}
            </p>
          </div>
        ) : signedIn && canBid ? (
          <div className="mt-6">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink/55">Place a bid · min {formatNgnFromKobo(nextMin)}</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              {quickOptions.map((amt, i) => (
                <button
                  key={amt.toString()}
                  disabled={pending}
                  onClick={() => submit(amt)}
                  className={`rounded-field px-3 py-3 text-sm font-semibold transition-colors disabled:opacity-50 ${i === 0 ? "bg-navy text-paper hover:bg-navy-soft" : "bg-sand text-navy hover:bg-sand/70"}`}
                >
                  {formatNgnFromKobo(amt)}
                </button>
              ))}
            </div>
            <BidForm onSubmit={submit} min={nextMin} pending={pending} />
            {error && <p role="alert" className="mt-3 rounded-field bg-danger/10 px-4 py-2.5 text-xs font-semibold text-danger">{error}</p>}
            <p className="mt-3 text-[11px] leading-relaxed text-ink/45">
              Bids are binding offers. If you win, you pay the full amount into escrow — released to the landlord
              only after a Kith porter confirms your check-in, or 24h later.
            </p>
          </div>
        ) : (
          <div className="mt-6 rounded-field bg-sand/70 p-5 text-center">
            <p className="text-sm font-semibold text-navy">
              {signedIn ? "Verify your student account to bid" : "Sign in to bid"}
            </p>
            <a
              href={signedIn ? "/verify" : "/login?callbackUrl=/auctions/" + auctionId}
              className="mt-3 inline-block rounded-full bg-navy px-5 py-2.5 text-sm font-semibold text-paper"
            >
              {signedIn ? "Complete verification" : "Sign in"}
            </a>
          </div>
        )}
      </section>

      {/* Bid feed */}
      <section className="rounded-card bg-paper p-6 shadow-card hairline">
        <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-ink/55">Bid history</h2>
        {bids.length === 0 ? (
          <p className="mt-4 text-sm text-ink/55">No bids yet. The floor is {formatNgnFromKobo(BigInt(state.floorPriceKobo))}.</p>
        ) : (
          <ol className="mt-4 space-y-2">
            {bids.map((b, i) => (
              <li key={b.id} className={`flex items-center justify-between rounded-field px-4 py-2.5 text-sm ${i === 0 ? "bg-kith-green/10" : "bg-sand/50"}`}>
                <span className="font-mono text-[11px] text-ink/55">{b.label ?? b.studentId.slice(0, 8)}</span>
                <span className={`tabular font-semibold ${i === 0 ? "text-kith-green-deep" : "text-ink/70"}`}>{formatNgnFromKobo(BigInt(b.amountKobo))}</span>
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}

function BidForm({ onSubmit, min, pending }: { onSubmit: (amount: bigint) => void; min: bigint; pending: boolean }) {
  const [value, setValue] = useState("");
  const parsed = /^\d{4,12}$/.test(value) ? BigInt(value) * 100n : 0n; // input in naira
  const valid = parsed >= min;
  return (
    <form
      className="mt-3 flex gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        if (valid) onSubmit(parsed);
      }}
    >
      <label className="sr-only" htmlFor="custom-bid">Custom bid in naira</label>
      <input
        id="custom-bid"
        inputMode="numeric"
        placeholder="Custom amount (₦)"
        value={value}
        onChange={(e) => setValue(e.target.value.replace(/\D/g, ""))}
        className="tabular w-full rounded-field bg-paper px-4 py-3 text-sm text-ink hairline"
      />
      <button
        type="submit"
        disabled={!valid || pending}
        className="rounded-field bg-kith-green px-5 py-3 text-sm font-semibold text-white disabled:opacity-40"
      >
        {pending ? "Bidding…" : "Bid"}
      </button>
    </form>
  );
}
