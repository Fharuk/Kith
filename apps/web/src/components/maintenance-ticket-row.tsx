"use client";

import { useActionState } from "react";
import {
  acknowledgeTicketAction, resolveTicketAction, type MaintenanceState,
} from "@/app/actions/maintenance-actions";

export interface TicketView {
  id: string;
  category: string;
  description: string;
  status: string;
  createdAt: string;
  acknowledgedAt: string | null;
  resolutionNote: string | null;
  propertyTitle: string;
  overdue: boolean;
  photoCount: number;
}

/** One ticket as the landlord sees it: acknowledge stops the SLA clock, resolve closes it. */
export function MaintenanceTicketRow({ ticket }: { ticket: TicketView }) {
  const [ackState, ackAction, ackPending] = useActionState<MaintenanceState, FormData>(acknowledgeTicketAction, null);
  const [resState, resAction, resPending] = useActionState<MaintenanceState, FormData>(resolveTicketAction, null);
  const closed = ticket.status === "resolved";

  return (
    <li className="rounded-card bg-paper p-5 shadow-card hairline">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink/50">
            {ticket.category} · {ticket.propertyTitle}
          </p>
          <p className="mt-1 text-sm text-ink/80">{ticket.description}</p>
          <p className="mt-1 text-[11px] text-ink/45">
            Opened {ticket.createdAt.slice(0, 10)}
            {ticket.photoCount > 0 ? ` · ${ticket.photoCount} photo${ticket.photoCount > 1 ? "s" : ""}` : ""}
            {ticket.acknowledgedAt ? ` · acknowledged ${ticket.acknowledgedAt.slice(0, 10)}` : ""}
          </p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-[11px] font-semibold ${
            closed ? "bg-kith-green/10 text-kith-green-deep"
              : ticket.overdue ? "bg-danger/10 text-danger"
                : ticket.status === "in_progress" ? "bg-clay/10 text-clay" : "bg-sand text-navy"
          }`}
        >
          {closed ? "Resolved" : ticket.overdue ? "Past SLA" : ticket.status === "in_progress" ? "In progress" : "Open"}
        </span>
      </div>

      {ticket.resolutionNote && <p className="mt-2 rounded-field bg-sand/60 px-3 py-2 text-xs text-ink/70">Fix: {ticket.resolutionNote}</p>}

      {!closed && (
        <div className="mt-4 flex flex-wrap items-center gap-3">
          {!ticket.acknowledgedAt && (
            <form action={ackAction}>
              <input type="hidden" name="ticketId" value={ticket.id} />
              <button type="submit" disabled={ackPending}
                className="rounded-full bg-sand px-4 py-2 text-xs font-semibold text-navy hover:bg-sand/70 disabled:opacity-60">
                {ackPending ? "Saving…" : "I have seen this"}
              </button>
            </form>
          )}
          <form action={resAction} className="flex flex-1 flex-wrap items-center gap-2">
            <input type="hidden" name="ticketId" value={ticket.id} />
            <input name="note" required minLength={4} maxLength={500} placeholder="Plumber replaced the pump on Friday"
              className="min-w-[14rem] flex-1 rounded-field bg-paper px-3 py-2 text-xs hairline" />
            <button type="submit" disabled={resPending}
              className="rounded-full bg-kith-green px-4 py-2 text-xs font-semibold text-paper hover:bg-kith-green-deep disabled:opacity-60">
              {resPending ? "Closing…" : "Mark resolved"}
            </button>
          </form>
        </div>
      )}
      {(ackState?.error || resState?.error) && (
        <p role="alert" className="mt-2 text-xs font-medium text-danger">{ackState?.error ?? resState?.error}</p>
      )}
    </li>
  );
}
