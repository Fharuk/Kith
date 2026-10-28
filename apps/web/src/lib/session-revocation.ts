import { eq } from "drizzle-orm";
import { getDb, users } from "@kith/database";

/**
 * SESSION REVOCATION.
 *
 * JWTs are self-contained, so "sign out everywhere" and "change password" have to reach back to
 * the database. We stamp `session_version` into the token at sign-in; bumping the column
 * invalidates every token issued before it.
 *
 * Checking on every request would be a query per asset, so results are cached briefly — a 15s
 * lag on revocation is the deliberate trade-off (a stolen cookie gets at most one more window).
 */
const CACHE_TTL_MS = 15_000;
const cache = new Map<string, { version: number; at: number }>();

export async function isSessionCurrent(userId: string, sessionVersion: number | undefined): Promise<boolean> {
  // Tokens minted before this feature shipped carry no version; treat them as current so an
  // upgrade does not log the whole platform out. They pick up a version on next sign-in.
  if (sessionVersion === undefined || sessionVersion === null) return true;
  const now = Date.now();
  const hit = cache.get(userId);
  if (hit && now - hit.at < CACHE_TTL_MS) return hit.version === sessionVersion;

  const db = getDb();
  const [row] = await db.select({ sessionVersion: users.sessionVersion, suspendedAt: users.suspendedAt }).from(users).where(eq(users.id, userId));
  if (!row) return false;
  cache.set(userId, { version: row.sessionVersion, at: now });
  if (row.suspendedAt) return false;
  return row.sessionVersion === sessionVersion;
}

/** Called after password change / 2FA change / forced sign-out. */
export function forgetSessionCache(userId: string) {
  cache.delete(userId);
}
