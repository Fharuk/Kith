"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

/** "Simulate successful payment" — POSTs to the mock-pay endpoint which fires a properly signed webhook through the real handler. */
export function MockPayButton({ reference }: { reference: string }) {
  const router = useRouter();
  const [state, setState] = useState<"idle" | "paying" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function pay() {
    setState("paying");
    setError(null);
    try {
      const res = await fetch("/api/checkout/mock-pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) throw new Error(data.error ?? `payment failed (${res.status})`);
      router.push("/passes?paid=1");
      router.refresh();
    } catch (e) {
      setState("error");
      setError(e instanceof Error ? e.message : "payment failed");
    }
  }

  return (
    <div className="mt-6">
      <button
        type="button"
        onClick={pay}
        disabled={state === "paying"}
        className="w-full rounded-full bg-kith-green px-6 py-3.5 text-base font-semibold text-white shadow-card transition-all hover:bg-kith-green-deep hover:shadow-lift disabled:opacity-60"
      >
        {state === "paying" ? "Processing charge…" : "Simulate successful payment"}
      </button>
      {state === "error" && error && <p className="mt-3 text-center text-xs font-semibold text-danger">{error}</p>}
      <p className="mt-3 text-center text-[11px] text-ink/45">
        Test card equivalents: 4084 4084 4084 4081 (success) · 4084 4084 4084 4087 (declined)
      </p>
    </div>
  );
}
