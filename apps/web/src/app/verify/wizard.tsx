"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { submitNin, submitMatric, submitBiometric } from "@/app/actions/auth-actions";
import { IconMailCheck, IconScanFace, IconShieldCheck, IconHomeCheck } from "@/components/icons";

type Gates = { nin: boolean; matric: boolean; biometric: boolean };

const field =
  "mt-1.5 w-full rounded-field bg-paper px-4 py-3 text-sm shadow-[inset_0_0_0_1px_var(--color-hairline)] outline-none focus:shadow-[inset_0_0_0_2px_var(--color-kith-blue)]";

export function Wizard({ isVerified, gates, universities }: {
  isVerified: boolean;
  gates: Gates;
  universities: { code: string; name: string }[];
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const run = async (fn: () => Promise<unknown>) => {
    setBusy(true);
    setError(null);
    const res = (await fn()) as { error?: string } | undefined;
    setBusy(false);
    if (res?.error) setError(res.error);
    else router.refresh();
  };

  if (isVerified) {
    return (
      <div className="mt-12 rounded-card bg-kith-green/10 p-10 text-center">
        <IconHomeCheck width={40} height={40} className="mx-auto text-kith-green-deep" />
        <p className="mt-4 font-display text-3xl text-navy">You&rsquo;re fully verified.</p>
        <p className="mt-2 text-sm text-ink/65">Bid on Circle rooms, book Market and Elite, and collect your guest pass.</p>
        <button onClick={() => router.push("/rooms")} className="mt-6 rounded-full bg-navy px-7 py-3 text-sm font-semibold text-paper">
          Find your room
        </button>
      </div>
    );
  }

  return (
    <ol className="mt-12 space-y-6">
      <Gate n={1} done={gates.nin} icon={<IconShieldCheck width={22} height={22} />} title="NIMC identity">
        <form action={(fd) => run(() => submitNin(fd))} className="flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-52">
            <label className="text-xs font-medium text-ink/70" htmlFor="nin">National Identification Number</label>
            <input id="nin" name="nin" inputMode="numeric" maxLength={11} required placeholder="12345678901" className={field} />
          </div>
          <div className="flex-1 min-w-44">
            <label className="text-xs font-medium text-ink/70" htmlFor="dateOfBirth">Date of birth</label>
            <input id="dateOfBirth" name="dateOfBirth" type="date" required className={field} />
          </div>
          <button disabled={busy} className="rounded-full bg-navy px-6 py-3 text-sm font-semibold text-paper disabled:opacity-50">Verify with NIMC</button>
        </form>
        <p className="mt-2 text-xs text-ink/50">NIMC matches your name and date of birth. We store a salted hash — never the number itself, and never your date of birth.</p>
      </Gate>

      <Gate n={2} done={gates.matric} icon={<IconMailCheck width={22} height={22} />} title="University & matric">
        <form action={(fd) => run(() => submitMatric(fd))} className="space-y-3">
          <div>
            <label className="text-xs font-medium text-ink/70" htmlFor="university">University</label>
            <select id="university" name="university" required className={field}>
              {universities.map((u) => <option key={u.code} value={u.code}>{u.name}</option>)}
            </select>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="text-xs font-medium text-ink/70" htmlFor="matric">Matric number</label>
              <input id="matric" name="matric" required placeholder="U22/AGR/001" className={field} />
            </div>
            <div>
              <label className="text-xs font-medium text-ink/70" htmlFor="studentEmail">Institutional email</label>
              <input id="studentEmail" name="studentEmail" type="email" required placeholder="you@stu.funaab.edu.ng" className={field} />
            </div>
          </div>
          <button disabled={busy} className="rounded-full bg-navy px-6 py-3 text-sm font-semibold text-paper disabled:opacity-50">Save university details</button>
        </form>
      </Gate>

      <Gate n={3} done={gates.biometric} icon={<IconScanFace width={22} height={22} />} title="Biometric liveness">
        <p className="text-sm text-ink/65">A three-second liveness check ties your face to your record.</p>
        <button
          disabled={busy || !gates.matric}
          onClick={() => run(() => submitBiometric())}
          className="mt-3 rounded-full bg-navy px-6 py-3 text-sm font-semibold text-paper disabled:opacity-50"
        >
          Start camera & verify
        </button>
        {!gates.matric && <p className="mt-2 text-xs text-ink/50">Complete gate 2 first.</p>}
      </Gate>

      {error && <p role="alert" className="rounded-field bg-danger/10 px-4 py-2.5 text-sm font-medium text-danger">{error}</p>}
    </ol>
  );
}

function Gate({ n, done, icon, title, children }: { n: number; done: boolean; icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <li className={`rounded-card p-7 ${done ? "bg-kith-green/10 hairline" : "bg-paper shadow-card hairline"}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className={done ? "text-kith-green-deep" : "text-navy"}>{icon}</span>
          <h2 className="font-sans text-base font-semibold text-navy">Gate {n} — {title}</h2>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${done ? "bg-kith-green text-navy" : "bg-sand text-ink/60"}`}>
          {done ? "passed" : "pending"}
        </span>
      </div>
      <div className="mt-4">{children}</div>
    </li>
  );
}
