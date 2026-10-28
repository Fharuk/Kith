"use client";

import { useActionState } from "react";
import { adminResolveDispute } from "@/app/actions/admin-actions";

type State = { ok?: boolean; error?: string; outcome?: string } | null;

/** Ops resolution control for one open dispute. Refund, release, or split — money moves once. */
export function AdminDisputeCard({
  disputeId, amountLabel, landlordNetLabel, reason, openedLabel,
}: {
  disputeId: string; amountLabel: string; landlordNetLabel: string; reason: string; openedLabel: string;
}) {
  const [state, formAction, pending] = useActionState<State, FormData>(async (_p, fd) => adminResolveDispute(null, fd), null);

  if (state?.ok) {
    return (
      <div className="rounded-card bg-paper p-5 shadow-card hairline">
        <p className="text-xs font-semibold text-kith-green-deep">Resolved — {state.outcome}. Both parties notified.</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="rounded-card bg-paper p-5 shadow-card hairline">
      <input type="hidden" name="disputeId" value={disputeId} />
      <div className="flex flex-wrap items-start justify-between gap-2">
        <p className="max-w-md text-sm text-ink/80">{reason}</p>
        <span className="text-[11px] text-ink/45">{openedLabel}</span>
      </div>
      <p className="tabular mt-2 text-xs text-ink/55">{amountLabel} paid · {landlordNetLabel} would go to the landlord</p>

      <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
        <div>
          <label htmlFor={`outcome-${disputeId}`} className="text-[11px] font-medium text-ink/60">Outcome</label>
          <select id={`outcome-${disputeId}`} name="outcome" required className="mt-1 w-full rounded-field bg-paper px-3 py-2 text-xs text-ink hairline">
            <option value="">Choose…</option>
            <option value="refund">Refund the student in full</option>
            <option value="release">Release to the landlord</option>
            <option value="split">Split the money</option>
          </select>
        </div>
        <div>
          <label htmlFor={`note-${disputeId}`} className="text-[11px] font-medium text-ink/60">Finding (shown to both)</label>
          <input id={`note-${disputeId}`} name="note" required minLength={8} placeholder="What did you verify?"
            className="mt-1 w-full rounded-field bg-paper px-3 py-2 text-xs text-ink hairline" />
        </div>
        <div>
          <label htmlFor={`refund-${disputeId}`} className="text-[11px] font-medium text-ink/60">Refund ₦ (split only)</label>
          <input id={`refund-${disputeId}`} name="refundNaira" inputMode="decimal" placeholder="0"
            className="tabular mt-1 w-full rounded-field bg-paper px-3 py-2 text-xs text-ink hairline" />
        </div>
      </div>

      <div className="mt-3 flex items-center gap-3">
        <button type="submit" disabled={pending}
          className="rounded-full bg-navy px-4 py-1.5 text-xs font-semibold text-paper hover:bg-navy-soft disabled:opacity-60">
          {pending ? "Settling…" : "Resolve & settle"}
        </button>
        {state?.error && <span className="text-[11px] font-semibold text-danger">{state.error}</span>}
      </div>
    </form>
  );
}
