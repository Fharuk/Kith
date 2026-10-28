"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { getDb, users, landlordProfiles, auditLogs } from "@kith/database";
import { requireUser } from "@/lib/session";
import { getPaystack } from "@/lib/paystack";
import { retryPayout, cancelPayout, processPayout, queueMissingPayouts } from "@/lib/payouts";
import { notifyUser } from "@/lib/providers/notify";

/**
 * Payout destination management.
 *
 * A landlord cannot be paid until their NUBAN resolves to a name at their bank. We resolve
 * through Paystack BEFORE storing anything, mint the transfer recipient at the same time,
 * and record who verified what (audit trail). Changing a bank account re-verifies and
 * re-mints the recipient.
 */
const bankSchema = z.object({
  bankCode: z.string().min(2).max(12),
  bankName: z.string().min(2).max(80),
  accountNumber: z.string().regex(/^\d{10}$/, "Account number must be 10 digits"),
});

export async function savePayoutAccount(_prev: unknown, formData: FormData) {
  const user = await requireUser();
  if (user.role !== "landlord") return { error: "Only landlords can set a payout account" };

  const parsed = bankSchema.safeParse({
    bankCode: String(formData.get("bankCode") ?? ""),
    bankName: String(formData.get("bankName") ?? ""),
    accountNumber: String(formData.get("accountNumber") ?? "").replace(/\s/g, ""),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid bank details" };

  const db = getDb();
  const profile = (await db.select().from(landlordProfiles).where(eq(landlordProfiles.userId, user.id)))[0];
  if (!profile) return { error: "Landlord profile not found" };

  const { driver } = getPaystack();
  let resolved;
  try {
    resolved = await driver.resolveAccount(parsed.data.accountNumber, parsed.data.bankCode);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Could not verify this account with your bank" };
  }

  // Only the bank's own answer is stored — never a name the landlord typed.
  const recipient = await driver.createRecipient({
    name: resolved.accountName,
    accountNumber: parsed.data.accountNumber,
    bankCode: parsed.data.bankCode,
  });

  await db.update(landlordProfiles).set({
    bankCode: parsed.data.bankCode,
    bankName: parsed.data.bankName,
    bankAccountNumber: parsed.data.accountNumber,
    bankAccountName: resolved.accountName,
    paystackRecipientCode: recipient.recipientCode,
    bankVerifiedAt: new Date(),
  }).where(eq(landlordProfiles.userId, user.id));

  await db.insert(auditLogs).values({
    actorId: user.id,
    actionType: "verify",
    targetResourceType: "landlord_payout_account",
    targetResourceId: profile.id,
    oldValues: { bankAccountNumber: profile.bankAccountNumber ? `••••${profile.bankAccountNumber.slice(-4)}` : null },
    newValues: {
      bankAccountNumber: `••••${parsed.data.accountNumber.slice(-4)}`,
      bankName: parsed.data.bankName,
      accountName: resolved.accountName,
    },
  });

  await notifyUser({
    userId: user.id,
    type: "payout_account_verified",
    payload: { bankName: parsed.data.bankName, last4: parsed.data.accountNumber.slice(-4) },
    message: `Kith: payout account verified — ${parsed.data.bankName} ••••${parsed.data.accountNumber.slice(-4)} (${resolved.accountName}).`,
    email: user.email,
    emailSubject: "Payout account verified — Kith",
  });

  revalidatePath("/landlord");
  return { ok: true, accountName: resolved.accountName };
}

/* ── admin controls ──────────────────────────────────────────────────── */

async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== "admin") throw new Error("admin only");
  return user;
}

export async function adminRetryPayout(payoutId: string) {
  const admin = await requireAdmin();
  await retryPayout(payoutId, admin.id);
  await processPayout(payoutId); // attempt immediately, don't wait for the worker tick
  revalidatePath("/admin");
  return { ok: true };
}

export async function adminCancelPayout(payoutId: string, reason: string) {
  const admin = await requireAdmin();
  await cancelPayout(payoutId, admin.id, reason || "cancelled by ops");
  revalidatePath("/admin");
  return { ok: true };
}

/** Admin: toggle the payout hold on a landlord (fraud review, KYC dispute). */
export async function adminTogglePayoutHold(landlordId: string, hold: boolean, reason: string) {
  const admin = await requireAdmin();
  const db = getDb();
  await db.update(landlordProfiles).set({ payoutHold: hold }).where(eq(landlordProfiles.userId, landlordId));
  await db.insert(auditLogs).values({
    actorId: admin.id,
    actionType: hold ? "reject" : "approve",
    targetResourceType: "landlord_profiles",
    targetResourceId: landlordId,
    oldValues: { payoutHold: !hold },
    newValues: { payoutHold: hold, reason },
  });
  const landlord = (await db.select().from(users).where(eq(users.id, landlordId)))[0];
  if (landlord) {
    await notifyUser({
      userId: landlordId,
      type: hold ? "payout_hold_on" : "payout_hold_off",
      payload: { reason },
      message: hold
        ? `Kith: payouts on your account are paused pending review — ${reason || "compliance review"}.`
        : `Kith: payouts on your account have resumed.`,
      email: landlord.email,
    });
  }
  revalidatePath("/admin");
  return { ok: true };
}

/** Admin: run the reconciliation + payout pass on demand. */
export async function adminRunPayoutPass() {
  await requireAdmin();
  const queued = await queueMissingPayouts();
  revalidatePath("/admin");
  return { ok: true, ...queued };
}
