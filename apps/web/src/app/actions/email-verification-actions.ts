"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { getDb, users } from "@kith/database";
import { requireUser } from "@/lib/session";
import { consumeEmailToken, issueEmailVerification } from "@/lib/email-verification";
import { notifyUser } from "@/lib/providers/notify";

/** Consume the single-use link. Deliberately a POST, so mail scanners can't burn the token. */
export async function verifyEmailAction(_prev: unknown, formData: FormData) {
  const token = String(formData.get("token") ?? "");
  const result = await consumeEmailToken(token);
  if (!result.ok) return { error: result.error };

  const db = getDb();
  const [user] = await db.select().from(users).where(eq(users.id, result.userId));
  if (user) {
    await notifyUser({
      userId: user.id,
      type: "email_verified",
      payload: { email: result.email },
      message: "Kith: your email address is confirmed. You can continue with verification.",
      email: result.email,
      emailSubject: "Email confirmed — Kith",
    });
  }
  revalidatePath("/dashboard");
  revalidatePath("/verify");
  return { ok: true, email: result.email };
}

/** Send the link again. Cooldown-limited so it cannot be used to spam an inbox. */
export async function resendVerificationAction() {
  const user = await requireUser();
  const db = getDb();
  const [row] = await db.select().from(users).where(eq(users.id, user.id));
  if (!row) return { error: "Account not found" };
  if (row.emailVerifiedAt) return { ok: true, alreadyVerified: true };

  const issued = await issueEmailVerification({ userId: row.id, email: row.email, reason: "resend" });
  if (!issued.ok) return { error: issued.error };
  return { ok: true };
}
