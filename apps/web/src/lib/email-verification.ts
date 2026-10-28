import { randomBytes, createHash } from "node:crypto";
import { and, desc, eq, gt, isNull } from "drizzle-orm";
import { getDb, emailVerifications, users, auditLogs } from "@kith/database";
import { getNotifier } from "./providers/notify";

/**
 * EMAIL VERIFICATION.
 *
 * Registration is open, so the address someone types is a claim until they prove it. This
 * issues a single-use, hashed, expiring token and emails the link; consuming it stamps
 * `users.emailVerifiedAt`, which gates the expensive, abusable actions (verification gates,
 * bidding, booking, listing).
 *
 * Only the SHA-256 of the token is stored: a database leak must not hand out working links.
 * Tokens expire in 24 hours, older tokens are invalidated on re-issue, and resends are
 * cooldown-limited so the endpoint cannot be used to spam an inbox.
 */

export const TOKEN_TTL_MS = 24 * 60 * 60 * 1000;
export const RESEND_COOLDOWN_MS = 2 * 60 * 1000;

export function hashToken(raw: string) {
  return createHash("sha256").update(raw).digest("hex");
}

export function appUrl() {
  return (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(/\/$/, "");
}

/** Pure: is this issue time still inside the resend cooldown? */
export function inResendCooldown(lastIssuedAt: Date | null | undefined, now = Date.now()) {
  if (!lastIssuedAt) return false;
  return now - lastIssuedAt.getTime() < RESEND_COOLDOWN_MS;
}

export async function issueEmailVerification(input: { userId: string; email: string; reason: "signup" | "resend" }) {
  const db = getDb();

  if (input.reason === "resend") {
    const [latest] = await db.select().from(emailVerifications)
      .where(eq(emailVerifications.userId, input.userId))
      .orderBy(desc(emailVerifications.createdAt))
      .limit(1);
    if (latest && inResendCooldown(latest.createdAt)) {
      return { ok: false as const, error: "Please wait a moment before requesting another email" };
    }
  }

  const raw = randomBytes(32).toString("hex");
  await db.insert(emailVerifications).values({
    userId: input.userId,
    email: input.email,
    tokenHash: hashToken(raw),
    expiresAt: new Date(Date.now() + TOKEN_TTL_MS),
  });

  const link = `${appUrl()}/verify-email?token=${raw}`;
  const notifier = getNotifier();
  const html = `<p>Welcome to Kith.</p><p>Confirm your email address to finish setting up your account:</p><p><a href="${link}">Verify my email</a></p><p>This link expires in 24 hours. If you didn't create a Kith account, ignore this message.</p>`;
  const result = await notifier.email(input.email, "Confirm your email — Kith", html);
  if (!result.ok) console.error("[email-verification] send failed", result.error);

  await db.insert(auditLogs).values({
    actorId: input.userId,
    actionType: "create",
    targetResourceType: "email_verification",
    targetResourceId: input.userId,
    newValues: { email: input.email, reason: input.reason, provider: result.providerMessageId },
  });

  return { ok: true as const, link };
}

export type VerifyEmailResult =
  | { ok: true; userId: string; email: string }
  | { ok: false; error: string };

export async function consumeEmailToken(rawToken: string): Promise<VerifyEmailResult> {
  if (!/^[a-f0-9]{64}$/.test(rawToken)) return { ok: false, error: "This link is not valid" };
  const db = getDb();
  const hash = hashToken(rawToken);

  const row = (await db.select().from(emailVerifications).where(and(
    eq(emailVerifications.tokenHash, hash),
    isNull(emailVerifications.consumedAt),
    gt(emailVerifications.expiresAt, new Date()),
  )))[0];

  if (!row) return { ok: false, error: "This link has expired or was already used. Request a new one." };

  // Single use: consume first, then stamp the user.
  await db.update(emailVerifications).set({ consumedAt: new Date() }).where(eq(emailVerifications.id, row.id));

  const [user] = await db.select().from(users).where(eq(users.id, row.userId));
  if (!user) return { ok: false, error: "Account not found" };
  if (!user.emailVerifiedAt) {
    await db.update(users).set({ emailVerifiedAt: new Date() }).where(eq(users.id, user.id));
  }

  await db.insert(auditLogs).values({
    actorId: user.id,
    actionType: "verify",
    targetResourceType: "user_email",
    targetResourceId: user.id,
    newValues: { email: row.email },
  });

  return { ok: true, userId: user.id, email: row.email };
}

/**
 * Does this account still owe us an email confirmation? Accounts that already completed the
 * KYC gates were verified through stronger means than an email link, and seeded/demo
 * accounts are grandfathered, so they are not blocked.
 */
export function needsEmailConfirmation(user: { emailVerifiedAt?: Date | null; isVerified?: boolean | null }) {
  if (user.emailVerifiedAt) return false;
  if (user.isVerified) return false;
  return true;
}

/** Gate helper for server actions: returns an error string, or null when allowed. */
export async function emailGateFailure(userId: string): Promise<string | null> {
  const db = getDb();
  const [u] = await db.select({ emailVerifiedAt: users.emailVerifiedAt, isVerified: users.isVerified })
    .from(users).where(eq(users.id, userId));
  if (!u) return "Account not found";
  return needsEmailConfirmation(u)
    ? "Confirm your email address first — we sent a link to your inbox when you signed up."
    : null;
}
