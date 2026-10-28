import { randomBytes } from "node:crypto";
import { eq, sql } from "drizzle-orm";
import { getDb, referralCodes, referrals, users, auditLogs } from "@kith/database";
import { notifyUser } from "./providers/notify";

/**
 * REFERRALS & CAMPUS AMBASSADORS.
 *
 * Students trust students, so the growth loop is a classmate's link, not an ad. The rules are
 * strict on purpose:
 *
 *  · A referral only *qualifies* when the referee's booking is actually paid — signups are free
 *    and worth nothing on their own, which stops farming empty accounts.
 *  · The reward is account credit (₦2,000), never cash, so it cannot be withdrawn and it comes
 *    back into the marketplace.
 *  · One referral per referee, and no self-referral, enforced by a unique index and a check.
 */

export const REFERRAL_REWARD_KOBO = 2_000_00n;

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function newReferralCode(prefix = "KITH"): string {
  const bytes = randomBytes(6);
  return `${prefix}-${Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join("")}`;
}

/** Idempotent: every student has exactly one code, created on first use. */
export async function ensureReferralCode(userId: string): Promise<string> {
  const db = getDb();
  const [existing] = await db.select().from(referralCodes).where(eq(referralCodes.userId, userId));
  if (existing) return existing.code;

  // Retry on the unique index rather than trusting randomness alone.
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = newReferralCode();
    try {
      const [row] = await db.insert(referralCodes).values({ userId, code }).returning();
      if (row) return row.code;
    } catch {
      const [again] = await db.select().from(referralCodes).where(eq(referralCodes.userId, userId));
      if (again) return again.code;
    }
  }
  throw new Error("Could not create a referral code");
}

/** Called at signup with whatever code the friend shared. Silently ignores bad codes. */
export async function applyReferralCode(input: { code: string; refereeId: string }): Promise<boolean> {
  const code = input.code.trim().toUpperCase();
  if (!code) return false;
  const db = getDb();
  const [owner] = await db.select().from(referralCodes).where(eq(referralCodes.code, code));
  if (!owner) return false;
  if (owner.userId === input.refereeId) return false; // no self-referral

  const [already] = await db.select().from(referrals).where(eq(referrals.refereeId, input.refereeId));
  if (already) return false;

  await db.insert(referrals).values({
    referrerId: owner.userId,
    refereeId: input.refereeId,
    code,
    status: "pending",
    rewardKobo: 0n,
  });
  return true;
}

/**
 * Runs when a referee's booking is paid. Credits the referrer and marks the referral rewarded.
 * Idempotent: a second call for the same referee is a no-op.
 */
export async function qualifyReferralForStudent(refereeId: string): Promise<{ credited: boolean }> {
  const db = getDb();
  const [referral] = await db.select().from(referrals).where(eq(referrals.refereeId, refereeId));
  if (!referral || referral.status === "rewarded") return { credited: false };

  const now = new Date();
  await db
    .update(referrals)
    .set({ status: "rewarded", rewardKobo: REFERRAL_REWARD_KOBO, qualifiedAt: referral.qualifiedAt ?? now, rewardedAt: now })
    .where(eq(referrals.id, referral.id));

  await db
    .update(users)
    .set({ creditKobo: sql`${users.creditKobo} + ${REFERRAL_REWARD_KOBO}` })
    .where(eq(users.id, referral.referrerId));

  const [referrer] = await db.select({ email: users.email }).from(users).where(eq(users.id, referral.referrerId));
  await notifyUser({
    userId: referral.referrerId,
    type: "referral_rewarded",
    payload: { refereeId, amountKobo: String(REFERRAL_REWARD_KOBO) },
    message: "Kith: your friend's first booking is paid — ₦2,000 credit is now on your account.",
    email: referrer?.email,
    emailSubject: "You earned ₦2,000 Kith credit",
  });
  await db.insert(auditLogs).values({
    actorId: referral.referrerId,
    actionType: "complete",
    targetResourceType: "referral",
    targetResourceId: referral.id,
    newValues: { creditedKobo: String(REFERRAL_REWARD_KOBO), refereeId },
  });

  return { credited: true };
}

export async function referralSummary(userId: string) {
  const db = getDb();
  const code = await ensureReferralCode(userId);
  const rows = await db.select().from(referrals).where(eq(referrals.referrerId, userId));
  const [me] = await db.select({ creditKobo: users.creditKobo }).from(users).where(eq(users.id, userId));
  return {
    code,
    creditKobo: me?.creditKobo ?? 0n,
    total: rows.length,
    rewarded: rows.filter((r) => r.status === "rewarded").length,
    pending: rows.filter((r) => r.status === "pending").length,
  };
}
