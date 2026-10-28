"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/session";
import { openDispute, DisputeError } from "@/lib/disputes";

/** A student or landlord flagging a payment they are party to. */
export async function openDisputeAction(_prev: unknown, formData: FormData) {
  const user = await requireUser();
  if (user.role !== "student" && user.role !== "landlord") {
    return { error: "Only the student or landlord on a payment can dispute it" };
  }
  const transactionId = String(formData.get("transactionId") ?? "");
  const reason = String(formData.get("reason") ?? "");
  try {
    await openDispute({ transactionId, actorId: user.id, reason });
    revalidatePath("/dashboard");
    revalidatePath("/landlord");
    revalidatePath("/admin");
    return { ok: true };
  } catch (e) {
    return { error: e instanceof DisputeError ? e.message : "Could not open a dispute" };
  }
}
