import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";

type Doc = { title: string; updated: string; intro: string; sections: { heading: string; body: string }[] };

const DOCS: Record<string, Doc> = {
  "licence-to-occupy": {
    title: "Digital Licence to Occupy",
    updated: "v1 · effective at launch",
    intro:
      "This licence governs every Kith booking. It is a licence to occupy student accommodation — not a tenancy transfer — and it binds the student, the landlord and Kith Solutions Ltd as platform operator and escrow agent.",
    sections: [
      { heading: "1. The parties and the property", body: "The Licensor is the verified landlord named on the listing. The Licensee is the verified student holding the booking. The Property is the specific room identified in the booking, as inspected and photographed by a Kith porter. Any material difference between the inspected condition and the handed-over condition is a dispute event." },
      { heading: "2. Term and permitted use", body: "The licence runs from the confirmed check-in date to the check-out date (one academic session by default). The Property may be occupied only by the Licensee and guests recorded at booking. Subletting, re-letting or 'caretaker' arrangements void the licence and freeze escrow." },
      { heading: "3. Rent, escrow and the platform fee", body: "Rent is paid in full at booking through Paystack and held in escrow. Kith remits 85% to the landlord's subaccount and retains 15% as the platform fee. Escrow releases on porter-confirmed check-in, or automatically 24 hours after the check-in window opens if the porter confirmation is missing through no fault of the student." },
      { heading: "4. Check-in and the guest pass", body: "The Licensee presents a rotating guest pass code at the property. The porter's confirmation of that code constitutes handover. Refusal of a valid pass is a priority incident under the Kith incident SOP and triggers escrow protection for the Licensee." },
      { heading: "5. Deposits, utilities and caution fees", body: "No cash deposits, caution fees or utility prepayments may be demanded outside the Kith checkout. Any off-platform payment request should be reported; listings that make them are removed." },
      { heading: "6. Disputes and refunds", body: "Either party may open a dispute before escrow release. While disputed, funds are frozen. Kith admin adjudicates with the porter report, photo/geo evidence and the audit log. Outcomes are release, partial release or refund via Paystack." },
      { heading: "7. Termination", body: "The licence terminates on check-out, on agreed early termination, or on material breach (violence, illegal use, unauthorised occupants, falsified verification). Termination for landlord breach refunds the unused period; termination for student breach follows the dispute path." },
    ],
  },
  "guest-agreement": {
    title: "Master Guest & Property Management Agreement",
    updated: "v1 · effective at launch",
    intro:
      "The framework agreement between Kith Solutions Ltd and each landlord partner, governing listing standards, porter access, payout mechanics and conduct across the platform.",
    sections: [
      { heading: "1. Listing standards", body: "Landlords warrant that each listing is accurately described, legally lettable, and physically accessible for porter inspection. Photos are captured or confirmed at inspection; stale or misleading imagery is grounds for delisting." },
      { heading: "2. Porter access and verification", body: "Landlords grant Kith porters reasonable access for inspection and for check-in/check-out confirmation. Porter reports are shared with both parties and form part of the dispute record." },
      { heading: "3. Payout mechanics", body: "Payouts follow the escrow rules in the Digital Licence to Occupy: 85/15 split at charge time, release on confirmed check-in, daily reconciliation against Paystack settlement records." },
      { heading: "4. Conduct and safety", body: "Landlords must maintain structural safety, working locks, and the advertised utilities. Retaliatory lock-outs, utility cut-offs or harassment of verified guests are material breaches with immediate delisting and escrow freeze." },
      { heading: "5. Data and photographs", body: "Inspection photographs and geo-stamps are processed for verification and dispute resolution only, retained per the privacy policy, and never sold." },
    ],
  },
  privacy: {
    title: "Privacy Policy (NDPR)",
    updated: "v1 · Nigeria Data Protection Regulation aligned",
    intro:
      "Kith processes the minimum personal data needed to make student housing safe. This policy explains what we hold, why, and for how long.",
    sections: [
      { heading: "1. What we collect", body: "Account data (name, email, phone, role), verification data (NIN hash, institutional email, matric number, liveness score), booking and payment references, and porter inspection evidence (photos, geo-stamps, timestamps)." },
      { heading: "2. What we deliberately do not store", body: "We never store your raw NIN — only a salted hash used for duplicate detection. Biometric captures are reduced to a liveness score and a selfie hash; originals are discarded after scoring. Passwords exist only as argon2id hashes." },
      { heading: "3. Lawful bases and purpose limitation", body: "Verification data is processed to prevent fraud and protect physical safety — the core of the service. Payment data is processed by Paystack as controller; Kith stores references and amounts only." },
      { heading: "4. Retention", body: "Verification hashes and biometric hashes are purged 90 days after account deletion. Booking and escrow records are retained for six years for tax and dispute-defence purposes, then anonymised." },
      { heading: "5. Your rights", body: "Access, rectification, erasure (subject to legal retention), portability and objection. Requests go to privacy@kith.ng and are answered within 30 days per NDPR." },
      { heading: "6. Sharing", body: "We share the minimum: landlords see your pseudonymised ID and booking facts, never your NIN or biometrics; porters see your guest pass validity and name at check-in; regulators see what law requires." },
    ],
  },
};

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const doc = DOCS[slug];
  return doc ? { title: doc.title } : { title: "Not found" };
}

export default async function LegalPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const doc = DOCS[slug];
  if (!doc) notFound();
  return (
    <>
      <SiteNav />
      <main id="main" className="mx-auto max-w-3xl px-6 py-16">
        <nav aria-label="Legal documents" className="flex flex-wrap gap-2 text-xs">
          {Object.entries(DOCS).map(([key, d]) => (
            <Link
              key={key}
              href={`/legal/${key}`}
              className={`rounded-full px-4 py-2 font-semibold transition-colors ${key === slug ? "bg-navy text-paper" : "bg-sand/60 text-ink/60 hairline hover:bg-sand"}`}
            >
              {d.title.split(" (")[0]}
            </Link>
          ))}
        </nav>
        <h1 className="mt-8 text-4xl">{doc.title}</h1>
        <p className="mt-2 text-xs uppercase tracking-[0.14em] text-ink/50">{doc.updated}</p>
        <p className="mt-6 text-base leading-relaxed text-ink/75">{doc.intro}</p>
        <div className="mt-10 space-y-8">
          {doc.sections.map((s) => (
            <section key={s.heading}>
              <h2 className="font-sans text-lg font-semibold text-navy">{s.heading}</h2>
              <p className="mt-2 text-sm leading-relaxed text-ink/70">{s.body}</p>
            </section>
          ))}
        </div>
        <p className="mt-12 rounded-card bg-sand/60 p-6 text-xs leading-relaxed text-ink/60 hairline">
          These pages are the plain-language operational summary of the executed PDF agreements held by Kith
          Solutions Ltd. In case of conflict, the executed agreements prevail. E-signature hashes of the version
          you accepted are stored against each booking.
        </p>
      </main>
      <SiteFooter />
    </>
  );
}
