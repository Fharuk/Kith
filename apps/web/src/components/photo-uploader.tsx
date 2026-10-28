"use client";

import { useRef, useState } from "react";

type Uploaded = { id: string; url: string; blurDataUrl: string | null };

/**
 * Photo field for forms that post server actions.
 *
 * Files go to /api/uploads (magic-number checked, EXIF-stripped, re-encoded to WebP) and only
 * the resulting media ids travel with the form — a hidden input, so the server action receives
 * exactly the same shape whether the user added photos or not.
 */
export function PhotoUploader({
  name = "photoIds",
  context,
  label = "Add photos",
  max = 6,
  initial = [],
}: {
  name?: string;
  context: "inspection" | "maintenance" | "dispute" | "property" | "room" | "verification";
  label?: string;
  max?: number;
  initial?: Uploaded[];
}) {
  const [items, setItems] = useState<Uploaded[]>(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function upload(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true);
    setError(null);
    const room = max - items.length;
    for (const file of Array.from(files).slice(0, Math.max(room, 0))) {
      const body = new FormData();
      body.set("file", file);
      body.set("context", context);
      try {
        const res = await fetch("/api/uploads", { method: "POST", body });
        const json = (await res.json()) as { ok: boolean; media?: Uploaded; error?: string };
        if (!res.ok || !json.ok || !json.media) throw new Error(json.error ?? "Upload failed");
        setItems((prev) => [...prev, json.media!]);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Upload failed");
        break;
      }
    }
    setBusy(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div>
      <input type="hidden" name={name} value={items.map((i) => i.id).join(",")} />
      <div className="flex flex-wrap gap-3">
        {items.map((item) => (
          <figure key={item.id} className="relative h-24 w-24 overflow-hidden rounded-field bg-sand">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={item.url} alt="" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => setItems((prev) => prev.filter((p) => p.id !== item.id))}
              className="absolute right-1 top-1 rounded-full bg-navy/80 px-1.5 text-xs font-semibold text-paper"
              aria-label="Remove photo"
            >
              ×
            </button>
          </figure>
        ))}
        {items.length < max && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            className="flex h-24 w-24 flex-col items-center justify-center gap-1 rounded-field border border-dashed border-hairline text-xs font-medium text-ink/60 hover:border-kith-blue hover:text-navy disabled:opacity-50"
          >
            <span className="text-lg leading-none">+</span>
            {busy ? "Uploading" : label}
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="sr-only"
        onChange={(e) => void upload(e.target.files)}
      />
      {error && <p role="alert" className="mt-2 text-xs font-medium text-danger">{error}</p>}
      <p className="mt-2 text-xs text-ink/50">
        JPEG, PNG or WebP, up to 8MB each. Location data is stripped on upload.
      </p>
    </div>
  );
}
