"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/session";
import { assignTask, verifyProperty, PorterTaskError } from "@/lib/porter-tasks";

/** Porter: close a property-verification task after actually standing in the room. */
export async function verifyTaskAction(_prev: unknown, formData: FormData) {
  const user = await requireUser();
  if (user.role !== "porter") return { error: "Porter role required" };

  const taskId = String(formData.get("taskId") ?? "");
  const outcome = String(formData.get("outcome") ?? "");
  const notes = String(formData.get("notes") ?? "");
  if (outcome !== "verified" && outcome !== "failed") return { error: "Choose verified or problem found" };

  try {
    await verifyProperty({ taskId, porterUserId: user.id, outcome, notes });
    revalidatePath("/porter");
    revalidatePath("/rooms");
    revalidatePath("/admin");
    return { ok: true };
  } catch (e) {
    return { error: e instanceof PorterTaskError ? e.message : "Could not close this task" };
  }
}

/** Ops: put a task on a specific porter (or move it off one). */
export async function assignTaskAction(_prev: unknown, formData: FormData) {
  const admin = await requireUser();
  if (admin.role !== "admin") return { error: "Admin only" };
  const taskId = String(formData.get("taskId") ?? "");
  const porterId = String(formData.get("porterId") ?? "");
  if (!porterId) return { error: "Choose a porter" };
  try {
    await assignTask({ taskId, porterId, actorId: admin.id, reason: "assigned by ops" });
    revalidatePath("/admin");
    revalidatePath("/porter");
    return { ok: true };
  } catch (e) {
    return { error: e instanceof PorterTaskError ? e.message : "Could not assign this task" };
  }
}
