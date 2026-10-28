"use client";

import { useActionState } from "react";
import { raiseTicketAction, type MaintenanceState } from "@/app/actions/maintenance-actions";
import { MAINTENANCE_CATEGORIES } from "@/lib/maintenance-config";
import { PhotoUploader } from "@/components/photo-uploader";

export function MaintenanceForm({ bookingId, propertyTitle }: { bookingId: string; propertyTitle: string }) {
  const [state, formAction, pending] = useActionState<MaintenanceState, FormData>(raiseTicketAction, null);

  if (state?.ok) {
    return (
      <div className="rounded-card bg-kith-green/10 p-5 hairline">
        <p className="text-sm font-semibold text-kith-green-deep">Reported. Your landlord has the details.</p>
        <p className="mt-1 text-xs text-ink/60">You will get a notification the moment they respond.</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="rounded-card bg-paper p-5 shadow-card hairline">
      <input type="hidden" name="bookingId" value={bookingId} />
      <h2 className="text-lg">Report a problem at {propertyTitle}</h2>
      <p className="mt-1 text-xs text-ink/60">
        Water, power, security or structure. Security issues are escalated fastest.
      </p>

      <label htmlFor="category" className="mt-4 block text-xs font-medium text-ink/65">What kind of problem?</label>
      <select id="category" name="category" required defaultValue="plumbing"
        className="mt-1 w-full rounded-field bg-paper px-3 py-2.5 text-sm hairline">
        {MAINTENANCE_CATEGORIES.map((c) => (
          <option key={c.value} value={c.value}>{c.label}</option>
        ))}
      </select>

      <label htmlFor="description" className="mt-3 block text-xs font-medium text-ink/65">What is happening?</label>
      <textarea id="description" name="description" rows={3} required minLength={10} maxLength={2000}
        placeholder="No water since Tuesday. The tap in the bathroom runs dry by 7am."
        className="mt-1 w-full rounded-field bg-paper px-3 py-2.5 text-sm hairline" />

      <div className="mt-3">
        <PhotoUploader context="maintenance" label="Add a photo" max={3} />
      </div>

      {state?.error && <p role="alert" className="mt-3 text-sm font-medium text-danger">{state.error}</p>}

      <button type="submit" disabled={pending}
        className="mt-4 rounded-full bg-navy px-5 py-2.5 text-sm font-semibold text-paper hover:bg-navy-soft disabled:opacity-60">
        {pending ? "Sending…" : "Report to landlord"}
      </button>
    </form>
  );
}
