"use client";

import { useActionState } from "react";
import Link from "next/link";
import { resendVerificationAction, verifyEmailAction } from "@/app/actions/email-verification-actions";

type State = { ok?: boolean; error?: string; email?: string; alreadyVerified?: boolean } | null;

export function VerifyEmailForm({ token }: { token: string }) {
  const [state, formAction, pending] = useActionState<State, FormData>(async (_p, fd) => verifyEmailAction(null, fd), null);

  if (state?.ok) {
    return (
      <div className="mt-8 rounded-card bg-kith-green/10 p-6">
        <p className="font-display text-2xl text-navy">Confirmed.</p>
        <p className="mt-1 text-sm text-ink/70">{state.email} is now verified. Continue with your identity checks.</p>
        <Link href="/verify" className="mt-4 inline-flex rounded-full bg-navy px-6 py-2.5 text-sm font-semibold text-paper">
          Continue verification
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="mt-8">
      <input type="hidden" name="token" value={token} />
      <button type="submit" disabled={pending} className="rounded-full bg-navy px-7 py-3 text-sm font-semibold text-paper hover:bg-navy-soft disabled:opacity-60">
        {pending ? "Confirming…" : "Confirm my email"}
      </button>
      {state?.error && <p className="mt-4 rounded-field bg-danger/10 px-4 py-3 text-xs font-semibold text-danger">{state.error}</p>}
    </form>
  );
}

export function ResendEmailButton() {
  const [state, formAction, pending] = useActionState<State, FormData>(async () => resendVerificationAction(), null);
  if (state?.ok) {
    return <p className="mt-6 rounded-field bg-kith-green/10 px-4 py-3 text-xs font-semibold text-kith-green-deep">
      {state.alreadyVerified ? "Your email is already confirmed." : "Sent — check your inbox (and spam folder)."}
    </p>;
  }
  return (
    <form action={formAction} className="mt-6">
      <button type="submit" disabled={pending} className="rounded-full bg-navy px-6 py-3 text-sm font-semibold text-paper hover:bg-navy-soft disabled:opacity-60">
        {pending ? "Sending…" : "Email me a new link"}
      </button>
      {state?.error && <p className="mt-3 text-xs font-semibold text-danger">{state.error}</p>}
    </form>
  );
}
