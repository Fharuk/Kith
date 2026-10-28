import type { Metadata } from "next";
import Link from "next/link";
import { SiteNav } from "@/components/site-nav";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Sign in", description: "Sign in to your Kith account." };

const demoAccounts = [
  ["student@demo.kith.ng", "Verified student with a live booking"],
  ["landlord@demo.kith.ng", "Three listings, escrow revenue"],
  ["porter@demo.kith.ng", "Check-in terminal + inspection queue"],
  ["admin@demo.kith.ng", "Verification queue, disputes, audit"],
];

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ callbackUrl?: string }> }) {
  const { callbackUrl } = await searchParams;
  return (
    <>
      <SiteNav />
      <main id="main" className="mx-auto grid max-w-6xl gap-14 px-6 py-20 lg:grid-cols-[1fr_0.9fr]">
        <div>
          <h1 className="text-4xl sm:text-5xl">Welcome back.</h1>
          <p className="mt-4 max-w-md text-base leading-relaxed text-ink/70">
            Your passes, bids and listings are where you left them.
          </p>
          <LoginForm callbackUrl={callbackUrl} />
          <p className="mt-6 text-sm text-ink/60">
            New to Kith?{" "}
            <Link href="/register" className="font-semibold text-navy underline decoration-kith-green decoration-2 underline-offset-4">
              Create an account
            </Link>
          </p>
        </div>
        <aside className="h-fit rounded-card bg-sand/60 p-8 hairline">
          <h2 className="font-sans text-sm font-semibold uppercase tracking-[0.14em] text-ink/60">Demo accounts</h2>
          <p className="mt-2 text-xs leading-relaxed text-ink/55">
            Every account uses the password <span className="font-mono font-semibold">demo1234</span>.
          </p>
          <ul className="mt-5 space-y-3">
            {demoAccounts.map(([email, blurb]) => (
              <li key={email} className="rounded-field bg-paper px-4 py-3">
                <p className="font-mono text-xs font-semibold text-navy">{email}</p>
                <p className="mt-0.5 text-xs text-ink/55">{blurb}</p>
              </li>
            ))}
          </ul>
        </aside>
      </main>
    </>
  );
}
