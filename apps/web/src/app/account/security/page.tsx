import type { Metadata } from "next";
import { eq } from "drizzle-orm";
import { getDb, users } from "@kith/database";
import { requireUser } from "@/lib/session";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { TwoFactorPanel, SignOutEverywhereButton } from "./two-factor-panel";

export const metadata: Metadata = { title: "Account security", description: "Two-factor authentication and session control." };

export default async function SecurityPage() {
  const user = await requireUser();
  const [row] = await getDb()
    .select({ twoFactorEnabled: users.twoFactorEnabled })
    .from(users)
    .where(eq(users.id, user.id));

  return (
    <>
      <SiteNav />
      <main id="main" className="mx-auto max-w-3xl px-6 py-16">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-clay">Account</p>
        <h1 className="mt-2 text-4xl">Security</h1>
        <p className="mt-3 max-w-xl text-base leading-relaxed text-ink/70">
          Signed in as <span className="font-medium text-ink">{user.email}</span>. Codes, sessions and
          sign-out controls live here.
        </p>

        <div className="mt-10 space-y-6">
          <TwoFactorPanel enabled={Boolean(row?.twoFactorEnabled)} />

          <section className="rounded-card bg-paper p-6 shadow-card hairline">
            <h2 className="text-lg">Sessions</h2>
            <p className="mt-1 text-sm text-ink/65">
              Signing out everywhere ends every existing session, including this one. Use it if a
              device is lost or a password may have been shared.
            </p>
            <div className="mt-5">
              <SignOutEverywhereButton />
            </div>
          </section>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
