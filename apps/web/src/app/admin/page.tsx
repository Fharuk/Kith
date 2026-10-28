import { eq, desc } from "drizzle-orm";
import { getDb, users, userVerifications, transactions, auditLogs, universities, studentProfiles } from "@kith/database";
import { formatNgn } from "@kith/domain";
import { requireUser } from "@/lib/session";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { AdminDisputeCard } from "@/components/admin-dispute-card";
import { openDisputes } from "@/lib/disputes";
import { openTaskQueue } from "@/lib/porter-tasks";
import { AdminTaskRow } from "@/components/admin-task-row";

export const metadata = { title: "Admin" };

export default async function AdminPage() {
  const user = await requireUser();
  const db = getDb();
  const [allUsers, pendingVerifications, txs, audits, unis, students] = await Promise.all([
    db.select().from(users),
    db.select().from(userVerifications).where(eq(userVerifications.status, "pending")),
    db.select().from(transactions).orderBy(desc(transactions.createdAt)),
    db.select().from(auditLogs).orderBy(desc(auditLogs.createdAt)),
    db.select().from(universities),
    db.select().from(studentProfiles),
  ]);

  const byRole = (r: string) => allUsers.filter((u) => u.role === r).length;
  const gmv = txs.reduce((a, t) => a + (t.amountKobo ?? 0n), 0n);
  const fees = txs.reduce((a, t) => a + (t.platformFeeKobo ?? 0n), 0n);
  const disputeQueue = await openDisputes();
  const taskQueue = await openTaskQueue();
  const unverifiedStudents = students.filter((s) => !(s.nimcVerified && s.matricVerified && s.biometricVerified)).length;
  void pendingVerifications;

  return (
    <>
      <SiteNav />
      <main id="main" className="mx-auto max-w-6xl px-6 py-16">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-clay">Signed in as {user.email}</p>
        <h1 className="mt-2 text-4xl">Platform overview.</h1>

        <div className="mt-10 grid gap-6 sm:grid-cols-4">
          <Card label="Students" value={String(byRole("student"))} />
          <Card label="Landlords" value={String(byRole("landlord"))} />
          <Card label="Porters" value={String(byRole("porter"))} />
          <Card label="Students mid-verification" value={String(unverifiedStudents)} />
        </div>
        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          <Card label="Gross booking value" value={formatNgn(gmv)} />
          <Card label="Platform fees (15%)" value={formatNgn(fees)} />
        </div>

        <section className="mt-12 grid gap-10 lg:grid-cols-2">
          <div>
            <h2 className="font-sans text-sm font-semibold uppercase tracking-[0.14em] text-ink/55">Recent transactions</h2>
            <ul className="mt-4 space-y-2">
              {txs.slice(0, 8).map((t) => (
                <li key={t.id} className="flex items-center justify-between gap-3 rounded-field bg-sand/60 px-4 py-2.5 text-sm">
                  <span className="font-mono text-xs text-ink/55">{t.paystackReference}</span>
                  <span className="text-xs uppercase text-ink/50">{t.escrowStatus}</span>
                  <span className="tabular font-semibold text-navy">{formatNgn(t.amountKobo ?? 0n)}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="font-sans text-sm font-semibold uppercase tracking-[0.14em] text-ink/55">Audit log</h2>
            <ul className="mt-4 space-y-2">
              {audits.slice(0, 8).map((a) => (
                <li key={a.id} className="flex items-center justify-between gap-3 rounded-field bg-sand/60 px-4 py-2.5 text-sm">
                  <span className="text-xs uppercase tracking-wide text-ink/60">{a.actionType}</span>
                  <span className="text-xs text-ink/50">{a.targetResourceType}</span>
                  <span className="tabular text-xs text-ink/45">{new Date(a.createdAt).toLocaleDateString("en-NG")}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="mt-12">
          <div className="flex items-center justify-between">
            <h2 className="font-sans text-sm font-semibold uppercase tracking-[0.14em] text-ink/55">Porter work queue</h2>
            <span className="text-xs text-ink/50">{taskQueue.tasks.length} open · {taskQueue.porters.length} porters</span>
          </div>
          <div className="mt-4 space-y-2">
            {taskQueue.tasks.length === 0 && (
              <p className="rounded-card bg-sand/60 p-6 text-sm text-ink/60 hairline">No open tasks. New listings queue a property visit automatically.</p>
            )}
            {taskQueue.tasks.map((t) => {
              const property = taskQueue.props.find((p) => p.id === t.propertyId);
              const porter = taskQueue.porters.find((p) => p.id === t.porterId);
              return (
                <AdminTaskRow
                  key={t.id}
                  taskId={t.id}
                  label={`${t.type.replace("_", " ")}${property ? ` · ${property.title}` : ""}`}
                  detail={`${property ? `${property.address}, ${property.city}` : "No property"} · ${t.status}${porter ? ` · ${porter.firstName} ${porter.lastName}` : ""}`}
                  porters={taskQueue.porters.map((p) => ({ id: p.id, name: `${p.firstName} ${p.lastName}` }))}
                  currentPorterId={t.porterId}
                />
              );
            })}
          </div>
        </section>

        <section className="mt-12">
          <div className="flex items-center justify-between">
            <h2 className="font-sans text-sm font-semibold uppercase tracking-[0.14em] text-ink/55">Open disputes</h2>
            <span className="text-xs text-ink/50">{disputeQueue.length} awaiting settlement</span>
          </div>
          {disputeQueue.length === 0 ? (
            <p className="mt-4 rounded-card bg-sand/60 p-6 text-sm text-ink/60 hairline">
              No open cases. Disputed payments are frozen here until you settle them.
            </p>
          ) : (
            <div className="mt-4 space-y-3">
              {disputeQueue.map(({ dispute, transaction }) => (
                <AdminDisputeCard
                  key={dispute.id}
                  disputeId={dispute.id}
                  reason={dispute.reason}
                  amountLabel={formatNgn(transaction?.amountKobo ?? 0n)}
                  landlordNetLabel={formatNgn(transaction?.landlordNetKobo ?? 0n)}
                  openedLabel={new Date(dispute.createdAt).toLocaleDateString("en-NG", { day: "numeric", month: "short" })}
                />
              ))}
            </div>
          )}
        </section>

        <section className="mt-12">
          <h2 className="font-sans text-sm font-semibold uppercase tracking-[0.14em] text-ink/55">Campuses</h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {unis.map((u) => (
              <li key={u.id} className="rounded-card bg-paper p-5 shadow-card hairline">
                <p className="font-semibold text-navy">{u.name}</p>
                <p className="mt-1 text-xs text-ink/55">{u.city} · {u.emailDomains.join(", ")}</p>
                <p className="mt-1 font-mono text-xs text-ink/45">{u.matricPattern}</p>
              </li>
            ))}
          </ul>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

function Card({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-card bg-paper p-6 shadow-card hairline">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink/50">{label}</p>
      <p className="tabular mt-2 font-display text-3xl text-navy">{value}</p>
    </div>
  );
}
