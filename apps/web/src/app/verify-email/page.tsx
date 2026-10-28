import Link from "next/link";
import { currentUser } from "@/lib/session";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { VerifyEmailForm, ResendEmailButton } from "./verify-email-form";

export const metadata = { title: "Confirm your email" };

/**
 * Email confirmation landing page. The token is only consumed when the person presses the
 * button (a POST), so a link-preview bot scanning the inbox cannot invalidate the link.
 */
export default async function VerifyEmailPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  const user = await currentUser();

  return (
    <>
      <SiteNav />
      <main className="mx-auto flex max-w-xl flex-col justify-center px-6 py-24">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-clay">One last step</p>
        <h1 className="mt-2 font-display text-4xl text-navy">
          {token ? "Confirm it's you." : "Check your inbox."}
        </h1>

        {token ? (
          <>
            <p className="mt-4 text-sm leading-relaxed text-ink/70">
              Press the button below to confirm this address. The link is single-use and expires 24 hours after it was sent.
            </p>
            <VerifyEmailForm token={token} />
          </>
        ) : (
          <>
            <p className="mt-4 text-sm leading-relaxed text-ink/70">
              We send a confirmation link when you sign up. If it hasn&rsquo;t arrived, request another — links expire after 24 hours.
            </p>
            {user ? (
              <ResendEmailButton />
            ) : (
              <Link href="/login" className="mt-6 inline-flex w-fit rounded-full bg-navy px-6 py-3 text-sm font-semibold text-paper">
                Sign in to resend
              </Link>
            )}
          </>
        )}

        <p className="mt-10 text-xs text-ink/45">
          Kith never asks for your password or NIN by email. If a message does, it isn&rsquo;t from us.
        </p>
      </main>
      <SiteFooter />
    </>
  );
}
