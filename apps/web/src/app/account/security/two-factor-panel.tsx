"use client";

import { useActionState, useState } from "react";
import {
  confirmTotpEnrolment,
  disableTwoFactor,
  startTotpEnrolment,
  signOutEverywhere,
  type EnrolState,
} from "@/app/actions/security-actions";

const inputClass =
  "mt-1.5 w-full rounded-field bg-paper px-4 py-3 text-sm shadow-[inset_0_0_0_1px_var(--color-hairline)] outline-none focus:shadow-[inset_0_0_0_2px_var(--color-kith-blue)]";
const buttonClass =
  "rounded-full bg-navy px-5 py-2.5 text-sm font-semibold text-paper hover:bg-navy-soft disabled:opacity-50";

export function TwoFactorPanel({ enabled }: { enabled: boolean }) {
  const [enrol, setEnrol] = useState<{ secret?: string; otpauth?: string } | null>(null);
  const [confirmState, confirmAction, confirming] = useActionState(confirmTotpEnrolment, null as EnrolState);
  const [disableState, disableAction, disabling] = useActionState(disableTwoFactor, null as EnrolState);
  const [busy, setBusy] = useState(false);

  if (enabled) {
    return (
      <div className="rounded-card bg-paper p-6 shadow-card hairline">
        <h2 className="text-lg">Authenticator app</h2>
        <p className="mt-1 text-sm text-ink/65">
          On. You will be asked for a 6-digit code at sign-in and before money-moving actions.
        </p>
        <form action={disableAction} className="mt-5 max-w-sm space-y-3">
          <label htmlFor="disable-password" className="text-sm font-medium text-ink">Confirm password</label>
          <input id="disable-password" name="password" type="password" required autoComplete="current-password" className={inputClass} />
          <input name="code" inputMode="numeric" maxLength={6} required placeholder="Current 6-digit code" className={inputClass} aria-label="Current authenticator code" />
          {disableState?.error && <p role="alert" className="text-sm font-medium text-danger">{disableState.error}</p>}
          <button type="submit" disabled={disabling} className="rounded-full bg-danger px-5 py-2.5 text-sm font-semibold text-paper disabled:opacity-50">
            {disabling ? "Turning off…" : "Turn off two-factor"}
          </button>
          <p className="text-xs text-ink/55">Turning it off signs you out on every device.</p>
        </form>
      </div>
    );
  }

  return (
    <div className="rounded-card bg-paper p-6 shadow-card hairline">
      <h2 className="text-lg">Authenticator app</h2>
      <p className="mt-1 text-sm text-ink/65">
        Off. Strongly recommended for landlords, porters and anyone who moves money.
      </p>

      {!enrol ? (
        <button
          type="button"
          disabled={busy}
          className={`mt-5 ${buttonClass}`}
          onClick={async () => {
            setBusy(true);
            try {
              const state = await startTotpEnrolment();
              if (state?.secret) setEnrol({ secret: state.secret, otpauth: state.otpauth });
            } finally {
              setBusy(false);
            }
          }}
        >
          {busy ? "Preparing…" : "Set up two-factor"}
        </button>
      ) : (
        <div className="mt-5 space-y-4">
          <ol className="list-decimal space-y-2 pl-5 text-sm text-ink/70">
            <li>Open your authenticator app (1Password, Authy, Google Authenticator).</li>
            <li>Add a new account and enter this key, or open the setup link below.</li>
            <li>Enter the 6-digit code it shows to finish.</li>
          </ol>
          <p className="select-all rounded-field bg-sand/70 px-4 py-3 font-mono text-sm tracking-[0.12em] text-navy">
            {enrol.secret}
          </p>
          {enrol.otpauth && (
            <a href={enrol.otpauth} className="text-sm font-semibold text-navy underline decoration-kith-green decoration-2 underline-offset-4">
              Open in authenticator app
            </a>
          )}
          <form action={confirmAction} className="max-w-xs space-y-3">
            <input name="code" inputMode="numeric" maxLength={6} required placeholder="123456" aria-label="Authenticator code" className={inputClass} />
            {confirmState?.error && <p role="alert" className="text-sm font-medium text-danger">{confirmState.error}</p>}
            {confirmState?.ok && <p className="text-sm font-medium text-kith-green">Two-factor is on.</p>}
            <button type="submit" disabled={confirming} className={buttonClass}>
              {confirming ? "Checking…" : "Confirm and turn on"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export function SignOutEverywhereButton() {
  return (
    <form action={signOutEverywhere}>
      <button type="submit" className="rounded-full bg-paper px-5 py-2.5 text-sm font-semibold text-navy shadow-card hairline hover:bg-sand/50">
        Sign out everywhere
      </button>
    </form>
  );
}
