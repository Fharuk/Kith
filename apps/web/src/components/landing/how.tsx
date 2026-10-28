import { IconScanFace, IconGavel, IconLock, IconKey } from "@/components/icons";

const steps = [
  {
    icon: IconScanFace,
    title: "Verify once",
    body: "NIN, institutional email, matric number and a liveness check. Ten minutes, once, and you are Kith-verified for your whole degree.",
  },
  {
    icon: IconGavel,
    title: "Bid or book",
    body: "Circle rooms run live soft-close auctions. Market and Elite rooms are fixed price. Every price you see is the price you pay — no agency fees, no 'caution' surprises.",
  },
  {
    icon: IconLock,
    title: "Pay into escrow",
    body: "Paystack holds your money. The landlord sees 85% earmarked; Kith takes 15%. Nobody touches the funds until you are inside.",
  },
  {
    icon: IconKey,
    title: "Walk in with your pass",
    body: "A rotating guest pass opens your check-in. A porter confirms it at the door, escrow releases, and your tenancy begins on paper you both signed.",
  },
];

export function How() {
  return (
    <section id="how" className="scroll-mt-20 bg-navy text-paper">
      <div className="mx-auto max-w-6xl px-6 py-24">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-kith-blue">The Kith way</p>
          <h2 className="mt-3 text-3xl text-paper sm:text-4xl">
            From &ldquo;room available&rdquo; to keys in hand — without a single handshake deal.
          </h2>
        </div>
        <ol className="mt-14 grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          {steps.map(({ icon: Icon, title, body }, i) => (
            <li key={title} className="relative">
              <div className="flex items-center gap-4">
                <span className="tabular font-mono text-sm text-kith-blue">0{i + 1}</span>
                <span className="h-px flex-1 bg-paper/15" aria-hidden />
                <Icon width={22} height={22} className="text-kith-green" />
              </div>
              <h3 className="mt-5 font-sans text-lg font-semibold text-paper">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-paper/65">{body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
