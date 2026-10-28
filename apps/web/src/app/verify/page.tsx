import type { Metadata } from "next";
import { eq } from "drizzle-orm";
import { getDb, studentProfiles, universities, users } from "@kith/database";
import { requireUser } from "@/lib/session";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { Wizard } from "./wizard";

export const metadata: Metadata = { title: "Get verified" };

export default async function VerifyPage() {
  const user = await requireUser();
  const db = getDb();
  const profile = (await db.select().from(studentProfiles).where(eq(studentProfiles.userId, user.id)))[0];
  const unis = await db.select().from(universities);
  const me = (await db.select().from(users).where(eq(users.id, user.id)))[0];

  return (
    <>
      <SiteNav />
      <main className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="text-4xl sm:text-5xl">Four gates. Ten minutes. Once.</h1>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-ink/70">
          Verification is what makes Kith different: no anonymous bidders, no fake listings, no
          borrowed identities. Complete all four gates to unlock bidding and booking.
        </p>
        <Wizard
          isVerified={me?.isVerified ?? false}
          gates={{
            nin: profile?.nimcVerified ?? false,
            matric: profile?.matricVerified ?? false,
            biometric: profile?.biometricVerified ?? false,
          }}
          universities={unis.map((u) => ({ code: u.code, name: u.name }))}
        />
      </main>
      <SiteFooter />
    </>
  );
}
