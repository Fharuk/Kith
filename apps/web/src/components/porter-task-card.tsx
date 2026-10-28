"use client";

import { useActionState } from "react";
import { verifyTaskAction } from "@/app/actions/porter-task-actions";

type State = { ok?: boolean; error?: string } | null;

/** One verification job, with the two outcomes a porter can actually report. */
export function PorterTaskCard({
  taskId, type, title, address, notes,
}: {
  taskId: string; type: string; title: string; address: string; notes: string | null;
}) {
  const [state, formAction, pending] = useActionState<State, FormData>(async (_p, fd) => verifyTaskAction(null, fd), null);

  if (state?.ok) {
    return (
      <div className="rounded-card bg-kith-green/10 p-5 hairline">
        <p className="text-sm font-semibold text-kith-green-deep">Task closed — the landlord has been notified.</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="rounded-card bg-paper p-5 shadow-card hairline">
      <input type="hidden" name="taskId" value={taskId} />
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink/50">{type.replace("_", " ")}</p>
          <p className="mt-1 font-semibold text-navy">{title}</p>
          <p className="text-xs text-ink/55">{address}</p>
          {notes && <p className="mt-1 text-[11px] text-ink/45">{notes}</p>}
        </div>
      </div>

      <label htmlFor={`notes-${taskId}`} className="mt-3 block text-[11px] font-medium text-ink/60">
        What did you find? (optional for verified, required for a problem)
      </label>
      <input id={`notes-${taskId}`} name="notes" placeholder="Room B3 matches the listing; water running; gate has a guard."
        className="mt-1 w-full rounded-field bg-paper px-3 py-2 text-xs text-ink hairline" />

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button type="submit" name="outcome" value="verified" disabled={pending}
          className="rounded-full bg-kith-green px-4 py-2 text-xs font-semibold text-paper hover:bg-kith-green-deep disabled:opacity-60">
          {pending ? "Saving…" : "Verified on site"}
        </button>
        <button type="submit" name="outcome" value="failed" disabled={pending}
          className="rounded-full bg-clay/15 px-4 py-2 text-xs font-semibold text-clay hover:bg-clay/25 disabled:opacity-60">
          Problem found
        </button>
        {state?.error && <span className="text-[11px] font-semibold text-danger">{state.error}</span>}
      </div>
    </form>
  );
}
