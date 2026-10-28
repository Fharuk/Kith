"use client";

import { useActionState } from "react";
import { loginAction } from "@/app/actions/auth-actions";

export function LoginForm({ callbackUrl }: { callbackUrl?: string }) {
  const [state, action, pending] = useActionState(loginAction, null as { error?: string } | null);

  return (
    <form action={action} className="mt-8 max-w-md space-y-5">
      <input type="hidden" name="callbackUrl" value={callbackUrl ?? ""} />
      <div>
        <label htmlFor="email" className="text-sm font-medium text-ink">Email</label>
        <input
          id="email" name="email" type="email" required autoComplete="email"
          placeholder="you@stu.unilag.edu.ng"
          className="mt-1.5 w-full rounded-field bg-paper px-4 py-3 text-sm shadow-[inset_0_0_0_1px_var(--color-hairline)] outline-none transition-shadow focus:shadow-[inset_0_0_0_2px_var(--color-kith-blue)]"
        />
      </div>
      <div>
        <label htmlFor="password" className="text-sm font-medium text-ink">Password</label>
        <input
          id="password" name="password" type="password" required minLength={8} autoComplete="current-password"
          className="mt-1.5 w-full rounded-field bg-paper px-4 py-3 text-sm shadow-[inset_0_0_0_1px_var(--color-hairline)] outline-none transition-shadow focus:shadow-[inset_0_0_0_2px_var(--color-kith-blue)]"
        />
      </div>
      {state?.error && (
        <p role="alert" className="rounded-field bg-danger/10 px-4 py-2.5 text-sm font-medium text-danger">{state.error}</p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-navy px-6 py-3.5 text-base font-semibold text-paper shadow-card transition-all hover:bg-navy-soft hover:shadow-lift disabled:opacity-50"
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
