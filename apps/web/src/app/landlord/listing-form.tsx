"use client";

import { useActionState, useState } from "react";
import { createListing, type ListingState } from "@/app/actions/listing-actions";
import { AMENITIES, TIERS } from "@kith/domain";

const field = "mt-1 w-full rounded-field bg-paper px-3 py-2.5 text-sm text-ink hairline";
const label = "text-[11px] font-semibold uppercase tracking-[0.1em] text-ink/55";

const NAIRA = (kobo: bigint) => Number(kobo / 100n).toLocaleString("en-NG");

/**
 * One listing at a time, with the tier's rules stated before the landlord types a price —
 * the server enforces them anyway, but a form that lets you type ₦20k for an Elite room and
 * then rejects you is just rude.
 */
export function ListingForm() {
  const [state, formAction, pending] = useActionState<ListingState, FormData>(async (_p, fd) => createListing(null, fd), null);
  const [tier, setTier] = useState<"circle" | "market" | "elite">("market");
  const [open, setOpen] = useState(false);

  const spec = TIERS[tier];
  const isAuction = spec.saleMode === "auction";
  const lo = NAIRA(spec.bandKobo[0]);
  const hi = NAIRA(spec.bandKobo[1]);

  if (state?.ok) {
    return (
      <div className="rounded-card bg-kith-green/10 p-6 hairline">
        <p className="font-display text-2xl text-navy">Listed.</p>
        <p className="mt-1 text-sm text-ink/70">
          {isAuction ? "Your auction is live for 12 minutes from listing." : "Your room is live in search."} A porter visit has been queued to verify the property.
        </p>
        <button onClick={() => setOpen(false)} className="mt-4 text-xs font-semibold text-navy underline underline-offset-4">List another room</button>
      </div>
    );
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="rounded-full bg-navy px-6 py-3 text-sm font-semibold text-paper hover:bg-navy-soft">
        + List a room
      </button>
    );
  }

  return (
    <form action={formAction} className="rounded-card bg-paper p-6 shadow-card hairline">
      <div className="flex items-center justify-between">
        <h2 className="font-sans text-sm font-semibold uppercase tracking-[0.14em] text-ink/55">New listing</h2>
        <button type="button" onClick={() => setOpen(false)} className="text-xs text-ink/50 hover:text-ink">Cancel</button>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className={label} htmlFor="title">Property name</label>
          <input id="title" name="title" required minLength={4} placeholder="Sunrise Court, Block B" className={field} />
        </div>
        <div className="sm:col-span-2">
          <label className={label} htmlFor="description">Description</label>
          <textarea id="description" name="description" required minLength={40} rows={3} placeholder="Self-contained room, 24/7 water, tiled floors, 6 minutes' walk to the campus gate." className={field} />
        </div>
        <div>
          <label className={label} htmlFor="address">Street address</label>
          <input id="address" name="address" required placeholder="14 Kola Adeyemi Street" className={field} />
        </div>
        <div>
          <label className={label} htmlFor="city">City</label>
          <input id="city" name="city" required defaultValue="Abeokuta" className={field} />
        </div>
        <div>
          <label className={label} htmlFor="state">State</label>
          <input id="state" name="state" required defaultValue="Ogun" className={field} />
        </div>
        <fieldset className="sm:col-span-2">
          <legend className={label}>Amenities</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {AMENITIES.map((a) => (
              <label key={a} className="cursor-pointer rounded-full bg-sand/60 px-3.5 py-1.5 text-xs font-semibold text-ink/70 has-checked:bg-navy has-checked:text-paper hairline">
                <input type="checkbox" name="amenities" value={a} className="sr-only" />
                {a}
              </label>
            ))}
          </div>
        </fieldset>

        <div>
          <label className={label} htmlFor="roomNumber">Room number</label>
          <input id="roomNumber" name="roomNumber" required placeholder="B3" className={field} />
        </div>
        <div>
          <label className={label} htmlFor="roomType">Room type</label>
          <input id="roomType" name="roomType" required placeholder="Self-contained" className={field} />
        </div>
        <div>
          <label className={label} htmlFor="capacity">Capacity</label>
          <input id="capacity" name="capacity" type="number" min={1} max={8} defaultValue={1} className={field} />
        </div>
        <div>
          <label className={label} htmlFor="tier">Tier</label>
          <select id="tier" name="tier" value={tier} onChange={(e) => setTier(e.target.value as typeof tier)} className={field}>
            <option value="circle">Circle — live auction</option>
            <option value="market">Market — fixed price</option>
            <option value="elite">Elite — fixed price, premium</option>
          </select>
        </div>

        <div>
          <label className={label} htmlFor="priceNaira">{isAuction ? "Opening price (₦)" : "Price (₦)"}</label>
          <input id="priceNaira" name="priceNaira" type="number" required min={1} placeholder={lo} className={field} />
          <p className="mt-1 text-[11px] text-ink/45">{spec.label} band: ₦{lo}–₦{hi}. {spec.blurb}</p>
        </div>

        {isAuction && (
          <>
            <div>
              <label className={label} htmlFor="floorNaira">Reserve floor (₦)</label>
              <input id="floorNaira" name="floorNaira" type="number" min={1} placeholder={lo} className={field} />
            </div>
            <div>
              <label className={label} htmlFor="incrementNaira">Minimum increment (₦)</label>
              <input id="incrementNaira" name="incrementNaira" type="number" min={1} defaultValue={1000} className={field} />
            </div>
          </>
        )}
      </div>

      <div className="mt-5 flex items-center gap-4">
        <button type="submit" disabled={pending} className="rounded-full bg-navy px-6 py-3 text-sm font-semibold text-paper hover:bg-navy-soft disabled:opacity-60">
          {pending ? "Listing…" : isAuction ? "Open auction" : "Publish room"}
        </button>
        <p className="text-[11px] text-ink/45">Every new property starts unverified until a Kith porter visits.</p>
      </div>

      {state?.error && <p className="mt-4 rounded-field bg-danger/10 px-4 py-3 text-xs font-semibold text-danger">{state.error}</p>}
    </form>
  );
}
