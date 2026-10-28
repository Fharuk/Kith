"use client";

import { useActionState, useState } from "react";
import { savePayoutAccount } from "@/app/actions/payout-actions";

export interface Bank {
  code: string;
  name: string;
}

type State = { ok?: boolean; error?: string; accountName?: string } | null;

/**
 * Payout destination form. The account name is never typed by the landlord — it comes back
 * from the bank resolution, so a landlord cannot point payouts at an account they do not own.
 */
export function PayoutAccountForm({
  banks,
  current,
}: {
  banks: Bank[];
  current: { bankName: string | null; last4: string | null; accountName: string | null; verifiedAt: Date | null; hold: boolean } | null;
}) {
  const [state, formAction, pending] = useActionState<State, FormData>(async (_prev, fd) => savePayoutAccount(null, fd), null);
  const [bankCode, setBankCode] = useState("");

  return (
    <div className="rounded-card bg-paper p-6 shadow-card hairline">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-sans text-sm font-semibold uppercase tracking-[0.14em] text-ink/55">Payout account</h2>
          <p className="mt-1 text-xs text-ink/55">
            {current?.last4
              ? `${current.bankName} ••••${current.last4} — ${current.accountName ?? "verified"}`
              : "Add a verified bank account to receive escrow releases."}
          </p>
        </div>
        {current?.hold && (
          <span className="rounded-full bg-clay/15 px-3 py-1 text-[11px] font-semibold text-clay">Payouts on hold</span>
        )}
        {!current?.hold && current?.verifiedAt && (
          <span className="rounded-full bg-kith-green/15 px-3 py-1 text-[11px] font-semibold text-kith-green-deep">Verified</span>
        )}
      </div>

      {current?.hold ? (
        <p className="mt-4 rounded-field bg-clay/10 px-4 py-3 text-xs text-ink/70">
          Payouts are paused on this account pending a Kith compliance review. Escrow keeps accruing —
          nothing is lost, transfers resume once the review clears.
        </p>
      ) : (
        <form action={formAction} className="mt-4 space-y-3">
          <div>
            <label htmlFor="bankCode" className="text-xs font-medium text-ink/70">Bank</label>
            <select
              id="bankCode"
              name="bankCode"
              required
              value={bankCode}
              onChange={(e) => setBankCode(e.target.value)}
              className="mt-1 w-full rounded-field bg-paper px-3 py-2.5 text-sm text-ink hairline"
            >
              <option value="">Select your bank</option>
              {banks.map((b) => (
                <option key={b.code} value={b.code}>{b.name}</option>
              ))}
            </select>
            <input type="hidden" name="bankName" value={banks.find((b) => b.code === bankCode)?.name ?? ""} />
          </div>

          <div>
            <label htmlFor="accountNumber" className="text-xs font-medium text-ink/70">Account number (NUBAN)</label>
            <input
              id="accountNumber"
              name="accountNumber"
              inputMode="numeric"
              maxLength={10}
              required
              placeholder="0123456789"
              className="tabular mt-1 w-full rounded-field bg-paper px-3 py-2.5 text-sm text-ink hairline"
            />
            <p className="mt-1 text-[11px] text-ink/45">We verify the name with your bank — you cannot type it yourself.</p>
          </div>

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-full bg-navy px-5 py-2.5 text-sm font-semibold text-paper transition-colors hover:bg-navy-soft disabled:opacity-60"
          >
            {pending ? "Verifying with your bank…" : current?.last4 ? "Update account" : "Verify & save account"}
          </button>

          {state?.error && <p className="rounded-field bg-danger/10 px-4 py-2.5 text-xs font-semibold text-danger">{state.error}</p>}
          {state?.ok && <p className="rounded-field bg-kith-green/10 px-4 py-2.5 text-xs font-semibold text-kith-green-deep">Account verified — {state.accountName}</p>}
        </form>
      )}
    </div>
  );
}
