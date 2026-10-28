import { eq } from "drizzle-orm";
import { getDb, users, verifyPassword, auditLogs } from "@kith/database";
import { decryptSecret } from "./crypto";
import { verifyTotp } from "./twofactor";

/**
 * STEP-UP AUTHENTICATION.
 *
 * A 24-hour session cookie should not be able to redirect a landlord's escrow to a new bank
 * account, or let an ops session refund a payment. Those actions require the human to prove
 * presence again: password always, plus a TOTP code when 2FA is enabled.
 *
 * Failures are audited — repeated step-up failures on the same account are exactly the signal
 * an ops team wants to see before money moves.
 */
export class StepUpRequiredError extends Error {
  constructor(message: string, readonly reason: "password" | "totp" | "missing") {
    super(message);
    this.name = "StepUpRequiredError";
  }
}

export async function verifyStepUp(
  userId: string,
  input: { password?: string | null; code?: string | null },
): Promise<{ ok: true } | { ok: false; error: string; reason: "password" | "totp" | "missing" }> {
  const db = getDb();
  const [user] = await db.select().from(users).where(eq(users.id, userId));
  if (!user) return { ok: false, error: "Account not found", reason: "missing" };

  const password = input.password ?? "";
  if (!password) return { ok: false, error: "Confirm your password to continue", reason: "password" };

  const passwordOk = await verifyPassword(password, user.passwordHash);
  if (!passwordOk) {
    await db.insert(auditLogs).values({
      actorId: userId,
      actionType: "login",
      targetResourceType: "step_up",
      targetResourceId: userId,
      newValues: { result: "password_failed" },
    });
    return { ok: false, error: "That password is not correct", reason: "password" };
  }

  if (user.twoFactorEnabled) {
    const code = (input.code ?? "").trim();
    if (!code) return { ok: false, error: "Enter your authenticator code", reason: "totp" };
    if (!user.totpSecretEnc) {
      // Enabled without a seed is a broken state; fail closed rather than skip the factor.
      return { ok: false, error: "Two-factor is misconfigured — contact support", reason: "totp" };
    }
    let secret: string;
    try {
      secret = decryptSecret(user.totpSecretEnc);
    } catch {
      return { ok: false, error: "Two-factor is misconfigured — contact support", reason: "totp" };
    }
    if (!verifyTotp(secret, code)) {
      await db.insert(auditLogs).values({
        actorId: userId,
        actionType: "login",
        targetResourceType: "step_up",
        targetResourceId: userId,
        newValues: { result: "totp_failed" },
      });
      return { ok: false, error: "That authenticator code is not valid", reason: "totp" };
    }
  }

  return { ok: true };
}

/** Convenience for server actions: throws so the caller cannot forget to check. */
export async function requireStepUp(userId: string, input: { password?: string | null; code?: string | null }) {
  const result = await verifyStepUp(userId, input);
  if (!result.ok) throw new StepUpRequiredError(result.error, result.reason);
}
