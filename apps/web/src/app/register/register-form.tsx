"use client";

import { useActionState, useState } from "react";
import { registerAction } from "@/app/actions/auth-actions";

const roles = [
  ["student", "Student", "Find, bid and book verified rooms"],
  ["landlord", "Landlord", "List properties and get paid via escrow"],
  ["porter", "Porter", "Inspect homes and run check-ins"],
] as const;

const inputCls =
  "mt-1.5 w-full rounded-field bg-paper px-4 py-3 text-sm shadow-[inset_0_0_0_1px_var(--color-hairline)] outline-none transition-shadow focus:shadow-[inset_0_0_0_2px_var(--color-kith-blue)]";

export function RegisterForm({ initialRole, referralCode }: { initialRole: "student" | "landlord" | "porter"; referralCode?: string }) {
  const [role, setRole] = useState(initialRole);
  const [state, action, pending] = useActionState(registerAction, null as { error?: string } | null);

  return (
    <form action={action} className="mt-10 space-y-6">
      {referralCode && <input type="hidden" name="ref" value={referralCode} />}
      <fieldset>
        <legend className="text-sm font-medium text-ink">I am a…</legend>
        <div className="mt-2 grid gap-3 sm:grid-cols-3">
          {roles.map(([value, label, blurb]) => (
            <label
              key={value}
              className={`cursor-pointer rounded-card p-4 transition-all ${
                role === value ? "bg-navy text-paper shadow-lift" : "bg-sand/60 hairline hover:bg-sand"
              }`}
            >
              <input
                type="radio" name="role" value={value} checked={role === value}
                onChange={() => setRole(value)} className="sr-only"
              />
              <span className="block font-semibold">{label}</span>
              <span className={`mt-1 block text-xs leading-snug ${role === value ? "text-paper/70" : "text-ink/55"}`}>{blurb}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="firstName" className="text-sm font-medium text-ink">First name</label>
          <input id="firstName" name="firstName" required minLength={2} className={inputCls} />
        </div>
        <div>
          <label htmlFor="lastName" className="text-sm font-medium text-ink">Last name</label>
          <input id="lastName" name="lastName" required minLength={2} className={inputCls} />
        </div>
      </div>
      <div>
        <label htmlFor="email" className="text-sm font-medium text-ink">Email</label>
        <input id="email" name="email" type="email" required autoComplete="email" className={inputCls} />
      </div>
      <div>
        <label htmlFor="password" className="text-sm font-medium text-ink">Password</label>
        <input id="password" name="password" type="password" required minLength={10} autoComplete="new-password" className={inputCls} />
        <p className="mt-1.5 text-xs text-ink/50">At least 10 characters. We hash with argon2id — we never store it.</p>
      </div>

      {state?.error && (
        <p role="alert" className="rounded-field bg-danger/10 px-4 py-2.5 text-sm font-medium text-danger">{state.error}</p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-navy px-6 py-3.5 text-base font-semibold text-paper shadow-card transition-all hover:bg-navy-soft hover:shadow-lift disabled:opacity-50"
      >
        {pending ? "Creating account…" : "Create account"}
      </button>
    </form>
  );
}
