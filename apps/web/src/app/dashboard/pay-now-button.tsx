"use client";

import { useState } from "react";

/** Resume an unpaid checkout: re-initializes Paystack with the same reference and redirects. */
export function PayNowButton({ bookingId }: { bookingId: string }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function go() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId }),
      });
      const data = (await res.json()) as { ok?: boolean; url?: string; error?: string };
      if (!res.ok || !data.ok || !data.url) throw new Error(data.error ?? "could not start checkout");
      window.location.href = data.url;
    } catch (e) {
      setBusy(false);
      setError(e instanceof Error ? e.message : "could not start checkout");
    }
  }

  return (
    <span className="inline-flex flex-col items-end gap-1">
      <button
        onClick={go}
        disabled={busy}
        className="inline-flex items-center gap-1.5 rounded-full bg-navy px-4 py-2 text-xs font-semibold text-paper transition-colors hover:bg-navy-soft disabled:opacity-60"
      >
        {busy ? "Opening checkout…" : "Complete payment"}
      </button>
      {error && <span className="text-[11px] font-semibold text-danger">{error}</span>}
    </span>
  );
}
