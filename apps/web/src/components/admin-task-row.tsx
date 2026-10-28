"use client";

import { useActionState } from "react";
import { assignTaskAction } from "@/app/actions/porter-task-actions";

type State = { ok?: boolean; error?: string } | null;

/** Ops assignment control for one open task. */
export function AdminTaskRow({
  taskId, label, detail, porters, currentPorterId,
}: {
  taskId: string; label: string; detail: string;
  porters: { id: string; name: string }[]; currentPorterId: string | null;
}) {
  const [state, formAction, pending] = useActionState<State, FormData>(async (_p, fd) => assignTaskAction(null, fd), null);

  return (
    <form action={formAction} className="flex flex-wrap items-center justify-between gap-3 rounded-card bg-paper p-4 shadow-card hairline">
      <input type="hidden" name="taskId" value={taskId} />
      <div>
        <p className="text-sm font-semibold text-navy">{label}</p>
        <p className="text-[11px] text-ink/55">{detail}</p>
      </div>
      <div className="flex items-center gap-2">
        <label className="sr-only" htmlFor={`porter-${taskId}`}>Assign to porter</label>
        <select id={`porter-${taskId}`} name="porterId" defaultValue={currentPorterId ?? ""}
          className="rounded-field bg-paper px-3 py-1.5 text-xs text-ink hairline">
          <option value="">Choose porter…</option>
          {porters.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <button type="submit" disabled={pending}
          className="rounded-full bg-navy px-3.5 py-1.5 text-xs font-semibold text-paper hover:bg-navy-soft disabled:opacity-60">
          {pending ? "…" : state?.ok ? "Assigned" : "Assign"}
        </button>
        {state?.error && <span className="text-[11px] font-semibold text-danger">{state.error}</span>}
      </div>
    </form>
  );
}
