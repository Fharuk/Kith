"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { getDb, users, userVerifications, studentProfiles, rooms, auditLogs } from "@kith/database";
import { requireUser } from "@/lib/session";
import { resolveDispute, DisputeError, type DisputeOutcome } from "@/lib/disputes";
import { notifyUser } from "@/lib/providers/notify";

/**
 * Ops actions. Every one of these changes what a real person can do or get paid, so each is
 * role-checked, audited, and notifies the person affected. No silent moderation.
 */

async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== "admin") throw new Error("admin only");
  return user;
}

export async function adminResolveDispute(_prev: unknown, formData: FormData) {
  const admin = await requireAdmin();
  const disputeId = String(formData.get("disputeId") ?? "");
  const outcome = String(formData.get("outcome") ?? "") as DisputeOutcome;
  const note = String(formData.get("note") ?? "");
  const refundNaira = Number(formData.get("refundNaira") ?? 0);
  if (!["refund", "release", "split"].includes(outcome)) return { error: "Choose an outcome" };
  if (outcome === "split" && (!Number.isFinite(refundNaira) || refundNaira <= 0)) {
    return { error: "Enter the amount to refund the student" };
  }

  try {
    const result = await resolveDispute({
      disputeId,
      adminId: admin.id,
      outcome,
      refundKobo: outcome === "split" ? BigInt(Math.round(refundNaira * 100)) : undefined,
      note,
    });
    revalidatePath("/admin");
    return { ok: true, outcome: result.outcome };
  } catch (e) {
    if (e instanceof DisputeError) return { error: e.message };
    return { error: e instanceof Error ? e.message : "Could not resolve this dispute" };
  }
}

export async function adminReviewVerification(_prev: unknown, formData: FormData) {
  const admin = await requireAdmin();
  const id = String(formData.get("verificationId") ?? "");
  const decision = String(formData.get("decision") ?? "");
  const reason = String(formData.get("reason") ?? "").trim();
  if (decision !== "approved" && decision !== "rejected") return { error: "Invalid decision" };
  if (decision === "rejected" && reason.length < 8) return { error: "Give a reason — the student sees it" };

  const db = getDb();
  const doc = (await db.select().from(userVerifications).where(eq(userVerifications.id, id)))[0];
  if (!doc) return { error: "Verification not found" };

  await db.update(userVerifications).set({
    status: decision,
    rejectionReason: decision === "rejected" ? reason : null,
    reviewedBy: admin.id,
    reviewedAt: new Date(),
  }).where(eq(userVerifications.id, id));

  // An approved document completes the KYC step it belongs to.
  if (decision === "approved" && doc.documentType === "nin") {
    await db.update(studentProfiles).set({ nimcVerified: true, currentStep: "matric" }).where(eq(studentProfiles.userId, doc.userId));
    await db.update(users).set({ isVerified: true }).where(eq(users.id, doc.userId));
  }

  await db.insert(auditLogs).values({
    actorId: admin.id,
    actionType: decision === "approved" ? "approve" : "reject",
    targetResourceType: "user_verification",
    targetResourceId: id,
    oldValues: { status: doc.status },
    newValues: { status: decision, reason: reason || null },
  });

  const student = (await db.select().from(users).where(eq(users.id, doc.userId)))[0];
  if (student) {
    await notifyUser({
      userId: student.id,
      type: decision === "approved" ? "verification_approved" : "verification_rejected",
      payload: { documentType: doc.documentType, reason },
      message: decision === "approved"
        ? `Kith: your ${doc.documentType.toUpperCase()} document was approved.`
        : `Kith: your ${doc.documentType.toUpperCase()} document was rejected — ${reason}`,
      email: student.email,
    });
  }

  revalidatePath("/admin");
  return { ok: true };
}

export async function adminSuspendUser(_prev: unknown, formData: FormData) {
  const admin = await requireAdmin();
  const userId = String(formData.get("userId") ?? "");
  const action = String(formData.get("action") ?? "");
  const reason = String(formData.get("reason") ?? "").trim();
  if (action !== "suspend" && action !== "restore") return { error: "Invalid action" };
  if (action === "suspend" && reason.length < 8) return { error: "Give a reason — it is shown to the user" };
  if (userId === admin.id) return { error: "You cannot suspend yourself" };

  const db = getDb();
  const target = (await db.select().from(users).where(eq(users.id, userId)))[0];
  if (!target) return { error: "User not found" };

  const suspend = action === "suspend";
  await db.update(users).set({
    suspendedAt: suspend ? new Date() : null,
    suspensionReason: suspend ? reason : null,
  }).where(eq(users.id, userId));

  await db.insert(auditLogs).values({
    actorId: admin.id,
    actionType: suspend ? "reject" : "approve",
    targetResourceType: "user",
    targetResourceId: userId,
    oldValues: { suspendedAt: target.suspendedAt?.toISOString() ?? null },
    newValues: { suspendedAt: suspend ? new Date().toISOString() : null, reason: reason || null },
  });

  await notifyUser({
    userId,
    type: suspend ? "account_suspended" : "account_restored",
    payload: { reason },
    message: suspend
      ? `Kith: your account has been suspended — ${reason}. Reply to this email to appeal.`
      : "Kith: your account has been restored. Welcome back.",
    email: target.email,
  });

  revalidatePath("/admin");
  return { ok: true };
}

/** Listing moderation: pull a room from search without deleting its history. */
export async function adminSetRoomAvailability(roomId: string, available: boolean, reason: string) {
  const admin = await requireAdmin();
  const db = getDb();
  const room = (await db.select().from(rooms).where(eq(rooms.id, roomId)))[0];
  if (!room) throw new Error("room not found");
  await db.update(rooms).set({ isAvailable: available }).where(eq(rooms.id, roomId));
  await db.insert(auditLogs).values({
    actorId: admin.id,
    actionType: available ? "approve" : "reject",
    targetResourceType: "room",
    targetResourceId: roomId,
    oldValues: { isAvailable: room.isAvailable },
    newValues: { isAvailable: available, reason },
  });
  revalidatePath("/admin");
  revalidatePath("/rooms");
  return { ok: true };
}
