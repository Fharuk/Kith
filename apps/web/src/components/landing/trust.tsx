import { IconMailCheck, IconScanFace, IconShieldCheck, IconHomeCheck } from "@/components/icons";

const gates = [
  {
    icon: IconShieldCheck,
    title: "NIMC identity",
    body: "11-digit NIN matched against the national register. We store a hash — never the number.",
  },
  {
    icon: IconMailCheck,
    title: "Institutional email",
    body: "Your university email domain, confirmed by magic link. funaab.edu.ng, unilag.edu.ng.",
  },
  {
    icon: IconScanFace,
    title: "Biometric liveness",
    body: "A 3-second liveness check ties the face to the record. No proxies, no borrowed IDs.",
  },
  {
    icon: IconHomeCheck,
    title: "Porter-inspected homes",
    body: "Every listing is walked, photographed and geo-stamped by a Kith porter before it goes live.",
  },
];

export function Trust() {
  return (
    <section className="border-y border-hairline bg-sand/40">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <h2 className="max-w-lg text-3xl sm:text-4xl">
            Trust is a process, not a badge. Ours has four gates.
          </h2>
          <p className="max-w-sm text-sm leading-relaxed text-ink/60">
            Until all four pass, an account can browse but never bid or pay. The same rules bind
            students, landlords and porters.
          </p>
        </div>
        <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {gates.map(({ icon: Icon, title, body }, i) => (
            <li key={title} className="rounded-card bg-paper p-6 shadow-card">
              <div className="flex items-center justify-between">
                <Icon width={26} height={26} className="text-kith-green-deep" />
                <span className="tabular font-mono text-xs text-ink/40">0{i + 1}</span>
              </div>
              <h3 className="mt-4 font-sans text-base font-semibold text-navy">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink/65">{body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
