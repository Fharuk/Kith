"use client";

import { useActionState, useState } from "react";
import { loginAction } from "@/app/actions/auth-actions";

type LoginState = { error?: string; requires2fa?: boolean } | null;

export function LoginForm({ callbackUrl }: { callbackUrl?: string }) {
  const [state, action, pending] = useActionState(loginAction, null as LoginState);
  // Held in React state so asking for an authenticator code does not clear the password.
  const [password, setPassword] = useState("");

  const fieldClass =
    "mt-1.5 w-full rounded-field bg-paper px-4 py-3 text-sm shadow-[inset_0_0_0_1px_var(--color-hairline)] outline-none transition-shadow focus:shadow-[inset_0_0_0_2px_var(--color-kith-blue)]";

  return (
    <form action={action} className="mt-8 max-w-md space-y-5">
      <input type="hidden" name="callbackUrl" value={callbackUrl ?? ""} />
      <div>
        <label htmlFor="email" className="text-sm font-medium text-ink">Email</label>
        <input
          id="email" name="email" type="email" required autoComplete="email"
          placeholder="you@stu.unilag.edu.ng" className={fieldClass}
        />
      </div>
      <div>
        <label htmlFor="password" className="text-sm font-medium text-ink">Password</label>
        <input
          id="password" name="password" type="password" required minLength={8} autoComplete="current-password"
          className={fieldClass}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      {state?.requires2fa && (
        <div>
          <label htmlFor="code" className="text-sm font-medium text-ink">Authenticator code</label>
          <input
            id="code" name="code" inputMode="numeric" pattern="[0-9]{6}" maxLength={6} required autoFocus
            autoComplete="one-time-code" placeholder="123456" className={fieldClass}
          />
          <p className="mt-1.5 text-xs text-ink/60">
            Two-factor is on for this account. Enter the 6-digit code from your authenticator app.
          </p>
        </div>
      )}
      {state?.error && (
        <p role="alert" className="rounded-field bg-danger/10 px-4 py-2.5 text-sm font-medium text-danger">{state.error}</p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-navy px-6 py-3.5 text-base font-semibold text-paper shadow-card transition-all hover:bg-navy-soft hover:shadow-lift disabled:opacity-50"
      >
        {pending ? "Signing in…" : state?.requires2fa ? "Verify and sign in" : "Sign in"}
      </button>
    </form>
  );
}
