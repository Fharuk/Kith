"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { submitInspection, type InspectionState } from "@/app/actions/inspection-actions";
import { INSPECTION_CHECKLIST } from "@/lib/inspection-checklist";
import { PhotoUploader } from "@/components/photo-uploader";

/**
 * The on-site inspection sheet. Ten weighted checks, optional notes per line, photos and a GPS
 * stamp; the score and the public report are computed server-side so a porter cannot tune the
 * headline number.
 */
export function PorterTaskCard({
  taskId, type, title, address, notes,
}: {
  taskId: string; type: string; title: string; address: string; notes: string | null;
}) {
  const [state, formAction, pending] = useActionState<InspectionState, FormData>(submitInspection, null);
  const [gps, setGps] = useState<{ lat: number; lng: number } | null>(null);
  const [gpsError, setGpsError] = useState<string | null>(null);

  if (state?.ok) {
    return (
      <div className="rounded-card bg-kith-green/10 p-5 hairline">
        <p className="text-sm font-semibold text-kith-green-deep">
          Report filed — scored {state.score}/100.
        </p>
        {state.slug && (
          <Link href={`/reports/${state.slug}`} className="mt-2 inline-block text-sm font-semibold text-navy underline decoration-kith-green decoration-2 underline-offset-4">
            View the public Proof of Room page →
          </Link>
        )}
      </div>
    );
  }

  return (
    <form action={formAction} className="rounded-card bg-paper p-5 shadow-card hairline">
      <input type="hidden" name="taskId" value={taskId} />
      <input type="hidden" name="gpsLat" value={gps?.lat ?? ""} />
      <input type="hidden" name="gpsLng" value={gps?.lng ?? ""} />

      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink/50">{type.replace("_", " ")}</p>
      <p className="mt-1 font-semibold text-navy">{title}</p>
      <p className="text-xs text-ink/55">{address}</p>
      {notes && <p className="mt-1 text-[11px] text-ink/45">{notes}</p>}

      <fieldset className="mt-4 grid gap-2 sm:grid-cols-2">
        <legend className="sr-only">Inspection checklist</legend>
        {INSPECTION_CHECKLIST.map((item) => (
          <label key={item.key} className="flex items-start gap-2 rounded-field bg-sand/40 px-3 py-2 text-xs">
            <input type="checkbox" name={`item_${item.key}`} className="mt-0.5 accent-kith-green" />
            <span>
              <span className="font-medium text-ink">{item.label}</span>
              <span className="mt-0.5 block text-[11px] text-ink/50">{item.hint}</span>
            </span>
          </label>
        ))}
      </fieldset>

      <label htmlFor={`notes-${taskId}`} className="mt-4 block text-[11px] font-medium text-ink/60">
        Notes for the student (optional)
      </label>
      <textarea
        id={`notes-${taskId}`}
        name="notes"
        rows={2}
        placeholder="Landlord's caretaker was present; tank is filled every morning."
        className="mt-1 w-full rounded-field bg-paper px-3 py-2 text-xs text-ink hairline"
      />

      <div className="mt-4">
        <PhotoUploader context="inspection" label="Add photos" max={4} />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => {
            if (!navigator.geolocation) return setGpsError("This device has no location support");
            navigator.geolocation.getCurrentPosition(
              (pos) => { setGps({ lat: pos.coords.latitude, lng: pos.coords.longitude }); setGpsError(null); },
              () => setGpsError("Location was not shared — the report is still valid"),
              { timeout: 8000 },
            );
          }}
          className="rounded-full bg-sand px-4 py-2 text-xs font-semibold text-navy hover:bg-sand/70"
        >
          {gps ? `Location captured · ${gps.lat.toFixed(3)}, ${gps.lng.toFixed(3)}` : "Attach my location"}
        </button>
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-kith-green px-4 py-2 text-xs font-semibold text-paper hover:bg-kith-green-deep disabled:opacity-60"
        >
          {pending ? "Filing…" : "File Proof of Room"}
        </button>
      </div>
      {gpsError && <p className="mt-2 text-[11px] text-ink/50">{gpsError}</p>}
      {state?.error && <p className="mt-2 text-[11px] font-semibold text-danger">{state.error}</p>}
    </form>
  );
}
