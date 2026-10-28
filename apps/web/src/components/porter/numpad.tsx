"use client";

import { useState } from "react";

type Guest = { label: string; name: string; property: string; room: string; checkIn: string };
type Phase = "idle" | "checking" | "granted" | "denied" | "confirmed" | "error";

/** 10-ft UI: 56px+ targets, sunlight contrast, gloved-hand friendly (playbook 04). */
export function Numpad() {
  const [code, setCode] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [guest, setGuest] = useState<Guest | null>(null);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const press = (d: string) => {
    if (phase === "granted" || phase === "confirmed") return;
    setPhase("idle");
    setCode((c) => (c.length >= 6 ? c : c + d));
  };
  const back = () => { setCode((c) => c.slice(0, -1)); setPhase("idle"); };
  const clear = () => { setCode(""); setGuest(null); setBookingId(null); setPhase("idle"); setMessage(null); };

  const submit = async () => {
    if (code.length !== 6) return;
    setPhase("checking");
    const res = await fetch("/api/porter/verify-code", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code }),
    });
    const json = (await res.json()) as { granted?: boolean; reason?: string; bookingId?: string; guest?: Guest };
    if (json.granted && json.guest) {
      setGuest(json.guest); setBookingId(json.bookingId ?? null); setPhase("granted");
    } else {
      setPhase("denied"); setMessage(json.reason ?? "denied");
    }
  };

  const confirm = async () => {
    if (!bookingId) return;
    setPhase("checking");
    const res = await fetch("/api/porter/confirm-check-in", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ bookingId }),
    });
    const json = (await res.json()) as { ok?: boolean; error?: string };
    if (json.ok) setPhase("confirmed");
    else { setPhase("error"); setMessage(json.error ?? "failed"); }
  };

  const banner =
    phase === "granted" ? { text: "ACCESS GRANTED", cls: "bg-kith-green text-navy" }
    : phase === "confirmed" ? { text: "CHECK-IN COMPLETE · ESCROW RELEASED", cls: "bg-kith-green text-navy" }
    : phase === "denied" ? { text: "ACCESS DENIED", cls: "bg-danger text-paper" }
    : phase === "error" ? { text: message ?? "ERROR", cls: "bg-danger text-paper" }
    : null;

  return (
    <div className="rounded-card bg-navy p-8 text-paper shadow-lift">
      <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-paper/60">Guest pass code</p>
      <p className="tabular mt-3 text-center font-mono text-6xl tracking-[0.25em]" aria-live="polite">
        {code.padEnd(6, "·")}
      </p>

      {banner && (
        <p role="status" className={`mt-5 rounded-field px-5 py-3 text-center text-sm font-bold tracking-wide ${banner.cls}`}>
          {banner.text}
        </p>
      )}

      {guest && (phase === "granted" || phase === "checking") && (
        <div className="mt-5 rounded-field bg-paper/10 p-5">
          <p className="font-display text-2xl">{guest.name}</p>
          <p className="mt-1 text-sm text-paper/70">{guest.property} · Room {guest.room}</p>
          <p className="mt-1 font-mono text-xs text-paper/55">{guest.label}</p>
          <button
            onClick={confirm}
            disabled={phase !== "granted"}
            className="mt-4 w-full rounded-full bg-kith-green px-6 py-4 text-base font-bold text-navy transition-colors hover:bg-kith-green-deep hover:text-paper disabled:opacity-50"
          >
            Confirm check-in & release escrow
          </button>
        </div>
      )}

      <div className="mt-6 grid grid-cols-3 gap-3">
        {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((d) => (
          <button
            key={d}
            onClick={() => press(d)}
            className="tabular rounded-field bg-paper/10 py-5 font-mono text-2xl font-semibold transition-colors hover:bg-paper/20 active:bg-paper/30"
          >
            {d}
          </button>
        ))}
        <button onClick={clear} className="rounded-field bg-paper/5 py-5 text-sm font-semibold text-paper/70 hover:bg-paper/15">CLEAR</button>
        <button onClick={() => press("0")} className="tabular rounded-field bg-paper/10 py-5 font-mono text-2xl font-semibold hover:bg-paper/20">0</button>
        <button onClick={back} className="rounded-field bg-paper/5 py-5 text-sm font-semibold text-paper/70 hover:bg-paper/15">⌫</button>
      </div>
      <button
        onClick={submit}
        disabled={code.length !== 6 || phase === "checking"}
        className="mt-4 w-full rounded-full bg-kith-blue-deep px-6 py-4 text-base font-bold text-paper transition-colors hover:bg-navy-soft disabled:opacity-40"
      >
        {phase === "checking" ? "Checking…" : "Verify pass"}
      </button>
      {phase === "confirmed" && (
        <button onClick={clear} className="mt-3 w-full rounded-full px-6 py-3 text-sm font-semibold text-paper/70 hairline hover:bg-paper/10">
          Next guest
        </button>
      )}
    </div>
  );
}
