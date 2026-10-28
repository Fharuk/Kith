"use server";

import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { getDb, users, auditLogs } from "@kith/database";
import { requireUser } from "@/lib/session";
import { decryptSecret, encryptSecret } from "@/lib/crypto";
import { formatSecretForDisplay, generateTotpSecret, otpauthUrl, verifyTotp } from "@/lib/twofactor";
import { forgetSessionCache } from "@/lib/session-revocation";
import { verifyStepUp } from "@/lib/step-up";

/**
 * Account security: authenticator enrolment, disabling, and "sign out everywhere".
 *
 * Enrolment writes the encrypted seed immediately but leaves `two_factor_enabled` false until a
 * live code proves the user's authenticator app is actually set up — a half-finished enrolment
 * must never lock anyone out.
 */

export type EnrolState = { secret?: string; otpauth?: string; error?: string; ok?: boolean } | null;

export async function startTotpEnrolment(): Promise<EnrolState> {
  const user = await requireUser();
  const db = getDb();
  const [row] = await db.select({ enabled: users.twoFactorEnabled }).from(users).where(eq(users.id, user.id));
  if (row?.enabled) return { error: "Two-factor is already on. Turn it off first to re-enrol." };

  const secret = generateTotpSecret();
  await db.update(users).set({ totpSecretEnc: encryptSecret(secret) }).where(eq(users.id, user.id));
  return { secret: formatSecretForDisplay(secret), otpauth: otpauthUrl({ secret, email: user.email }) };
}

export async function confirmTotpEnrolment(_prev: EnrolState, formData: FormData): Promise<EnrolState> {
  const user = await requireUser();
  const code = String(formData.get("code") ?? "").trim();
  if (!/^\d{6}$/.test(code)) return { error: "Enter the 6-digit code from your app" };

  const db = getDb();
  const [row] = await db.select().from(users).where(eq(users.id, user.id));
  if (!row?.totpSecretEnc) return { error: "Start enrolment again — no seed was saved" };

  let secret: string;
  try {
    secret = decryptSecret(row.totpSecretEnc);
  } catch {
    return { error: "Could not read your enrolment — start again" };
  }
  if (!verifyTotp(secret, code)) return { error: "That code did not match. Check your clock and try the next one." };

  await db.update(users).set({ twoFactorEnabled: true }).where(eq(users.id, user.id));
  await db.insert(auditLogs).values({
    actorId: user.id,
    actionType: "update",
    targetResourceType: "user",
    targetResourceId: user.id,
    newValues: { twoFactorEnabled: true },
  });
  return { ok: true };
}

export async function disableTwoFactor(_prev: EnrolState, formData: FormData): Promise<EnrolState> {
  const user = await requireUser();
  const password = String(formData.get("password") ?? "");
  const code = String(formData.get("code") ?? "").trim();

  const stepUp = await verifyStepUp(user.id, { password, code });
  if (!stepUp.ok) return { error: stepUp.error };

  const db = getDb();
  const [row] = await db.select({ sessionVersion: users.sessionVersion }).from(users).where(eq(users.id, user.id));
  await db
    .update(users)
    .set({ twoFactorEnabled: false, totpSecretEnc: null, sessionVersion: (row?.sessionVersion ?? 0) + 1 })
    .where(eq(users.id, user.id));
  await db.insert(auditLogs).values({
    actorId: user.id,
    actionType: "update",
    targetResourceType: "user",
    targetResourceId: user.id,
    newValues: { twoFactorEnabled: false, sessionsRevoked: true },
  });
  forgetSessionCache(user.id);
  // Removing a second factor is a downgrade: every existing session is dropped.
  redirect("/login?reason=security");
}

export async function signOutEverywhere() {
  const user = await requireUser();
  const db = getDb();
  const [row] = await db.select({ sessionVersion: users.sessionVersion }).from(users).where(eq(users.id, user.id));
  await db.update(users).set({ sessionVersion: (row?.sessionVersion ?? 0) + 1 }).where(eq(users.id, user.id));
  await db.insert(auditLogs).values({
    actorId: user.id,
    actionType: "login",
    targetResourceType: "user",
    targetResourceId: user.id,
    newValues: { allSessions: true },
  });
  forgetSessionCache(user.id);
  redirect("/login?reason=signed_out");
}
