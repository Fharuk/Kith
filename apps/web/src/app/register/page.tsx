import type { Metadata } from "next";
import { SiteNav } from "@/components/site-nav";
import { RegisterForm } from "./register-form";

export const metadata: Metadata = { title: "Create your account", description: "Join Kith — students, landlords and porters." };

export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ role?: string }> }) {
  const { role } = await searchParams;
  return (
    <>
      <SiteNav />
      <main id="main" className="mx-auto max-w-2xl px-6 py-20">
        <h1 className="text-4xl sm:text-5xl">Join Kith.</h1>
        <p className="mt-4 text-base leading-relaxed text-ink/70">
          One account per person, tied to a real identity. Students complete four verification
          gates; landlords and porters are reviewed by our ops team.
        </p>
        <RegisterForm initialRole={role === "landlord" || role === "porter" ? role : "student"} />
      </main>
    </>
  );
}
