import { sql } from "drizzle-orm";
import { getDb } from "@kith/database";

/**
 * SINGLE-FLIGHT GUARD FOR THE MONEY WORKER.
 *
 * Vercel Cron, a k8s CronJob and a manual "run now" click can all fire the same pass at the
 * same second. Every step of the pass is idempotent on its own, but two concurrent passes can
 * both read "escrow due to release" and race the same rows, so the cheap insurance is a
 * Postgres advisory lock: the first taker runs, everyone else returns "busy" immediately and
 * the next tick picks up the work. Session-scoped, released in `finally` (and by the server
 * closing the connection if the process dies).
 */
export const WORKER_LOCK_KEY = 1263814724; // 0x4B495448 — "KITH"

export type WorkerLockOutcome<T> =
  | { ran: true; result: T }
  | { ran: false; reason: "busy"; lockKey: number };

export async function withWorkerLock<T>(fn: () => Promise<T>): Promise<WorkerLockOutcome<T>> {
  const db = getDb();

  const attempts = 3;
  for (let i = 0; i < attempts; i++) {
    let acquired = false;
    try {
      const res = (await db.execute(sql`select pg_try_advisory_lock(${WORKER_LOCK_KEY}) as locked`)) as unknown as {
        rows?: Array<{ locked: boolean }>;
      };
      acquired = res.rows?.[0]?.locked === true;
    } catch {
      // A driver that cannot answer (locked engine, cold start) must not silently run the pass
      // unlocked — treat as busy and let the next tick try again.
      return { ran: false, reason: "busy", lockKey: WORKER_LOCK_KEY };
    }
    if (!acquired) return { ran: false, reason: "busy", lockKey: WORKER_LOCK_KEY };

    try {
      const result = await fn();
      return { ran: true, result };
    } finally {
      try {
        await db.execute(sql`select pg_advisory_unlock(${WORKER_LOCK_KEY})`);
      } catch {
        /* unlocking is best-effort; the session closes with the request */
      }
    }
  }
  return { ran: false, reason: "busy", lockKey: WORKER_LOCK_KEY };
}
