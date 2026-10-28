"use client";

import { useActionState, useState } from "react";
import { openDisputeAction } from "@/app/actions/dispute-actions";

type State = { ok?: boolean; error?: string } | null;

/**
 * "Something went wrong" — deliberately quiet, deliberately specific.
 * The copy tells people exactly what happens next (money freezes, ops reviews) because a
 * dispute form that feels like a void is how chargebacks start.
 */
export function DisputeForm({ transactionId }: { transactionId: string }) {
  const [state, formAction, pending] = useActionState<State, FormData>(async (_p, fd) => openDisputeAction(null, fd), null);
  const [open, setOpen] = useState(false);

  if (state?.ok) {
    return (
      <p className="mt-3 rounded-field bg-clay/10 px-4 py-2.5 text-xs text-ink/70">
        Dispute opened. The payment is frozen while Kith operations reviews it — you will get an email with the outcome.
      </p>
    );
  }

  return (
    <div className="mt-3">
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="text-xs font-semibold text-clay underline-offset-4 hover:underline"
        >
          Something wrong with this stay? Report it
        </button>
      ) : (
        <form action={formAction} className="space-y-2">
          <input type="hidden" name="transactionId" value={transactionId} />
          <label htmlFor={`reason-${transactionId}`} className="text-[11px] font-medium text-ink/60">
            What happened? Be specific — dates, what you were promised, what you found.
          </label>
          <textarea
            id={`reason-${transactionId}`}
            name="reason"
            required
            minLength={12}
            rows={3}
            className="w-full rounded-field bg-paper px-3 py-2 text-xs text-ink hairline"
            placeholder="e.g. The room advertised a private bathroom but the porter confirmed it is shared."
          />
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={pending}
              className="rounded-full bg-navy px-4 py-1.5 text-xs font-semibold text-paper hover:bg-navy-soft disabled:opacity-60"
            >
              {pending ? "Sending…" : "Open dispute"}
            </button>
            <button type="button" onClick={() => setOpen(false)} className="text-xs text-ink/50 hover:text-ink">
              Cancel
            </button>
          </div>
          {state?.error && <p className="rounded-field bg-danger/10 px-3 py-2 text-[11px] font-semibold text-danger">{state.error}</p>}
        </form>
      )}
    </div>
  );
}
