import { and, eq, inArray, isNotNull, sql } from "drizzle-orm";
import {
  getDb, porterTasks, porterProfiles, properties, users, auditLogs,
} from "@kith/database";
import { notifyUser } from "./providers/notify";

/**
 * PORTER WORK QUEUE.
 *
 * Verification is the product's whole claim — "walked by a porter" — so the work that makes
 * it true cannot be a list nobody owns. Tasks are created by the system (new listing,
 * check-in) and land on a named porter:
 *
 *  · auto-assignment picks the active porter with the fewest open jobs, so new listings do
 *    not stack on whoever happens to be first;
 *  · ops can reassign by hand;
 *  · only the assigned porter can close a task, and a "verified" outcome is the ONLY path
 *    that flips `properties.isPhysicallyVerified`.
 */

export class PorterTaskError extends Error {
  constructor(message: string, readonly code: "not_found" | "forbidden" | "conflict") {
    super(message);
    this.name = "PorterTaskError";
  }
}

/** Porter with the lightest load, or null when nobody is active. */
export async function pickPorter(): Promise<{ userId: string; zone: string } | null> {
  const db = getDb();
  const active = await db.select().from(porterProfiles).where(eq(porterProfiles.active, true));
  if (active.length === 0) return null;

  const loads = await db
    .select({ porterId: porterTasks.porterId, open: sql<number>`count(*)::int` })
    .from(porterTasks)
    .where(and(inArray(porterTasks.status, ["open", "assigned"]), isNotNull(porterTasks.porterId)))
    .groupBy(porterTasks.porterId);

  const loadByPorter = new Map(loads.map((l) => [l.porterId ?? "", l.open]));
  const [lightest] = [...active].sort((a, b) => (loadByPorter.get(a.userId) ?? 0) - (loadByPorter.get(b.userId) ?? 0));
  return lightest ? { userId: lightest.userId, zone: lightest.zone } : null;
}

/** Assign (or reassign) a task and tell the porter. */
export async function assignTask(input: { taskId: string; porterId: string; actorId: string; reason?: string }) {
  const db = getDb();
  const [task] = await db.select().from(porterTasks).where(eq(porterTasks.id, input.taskId));
  if (!task) throw new PorterTaskError("Task not found", "not_found");
  if (task.status === "done") throw new PorterTaskError("This task is already closed", "conflict");

  const [porter] = await db.select().from(users).where(eq(users.id, input.porterId));
  const [porterProfile] = await db.select().from(porterProfiles).where(eq(porterProfiles.userId, input.porterId));
  if (!porter || porter.role !== "porter" || !porterProfile) throw new PorterTaskError("That user is not a porter", "not_found");

  await db.update(porterTasks).set({ porterId: input.porterId, status: "assigned" }).where(eq(porterTasks.id, input.taskId));

  await db.insert(auditLogs).values({
    actorId: input.actorId,
    actionType: "update",
    targetResourceType: "porter_task",
    targetResourceId: input.taskId,
    oldValues: { porterId: task.porterId, status: task.status },
    newValues: { porterId: input.porterId, status: "assigned", reason: input.reason ?? null },
  });

  await notifyUser({
    userId: input.porterId,
    type: "task_assigned",
    payload: { taskId: input.taskId, type: task.type },
    message: `Kith: you have a new ${task.type.replace("_", " ")} task. Open your terminal to see the address.`,
    email: porter.email,
    emailSubject: "New task assigned — Kith porter terminal",
  });

  return { porterId: input.porterId };
}

/** Auto-assign a task at creation time. Returns the porter id, or null when nobody is active. */
export async function autoAssignTask(taskId: string, actorId: string) {
  const picked = await pickPorter();
  if (!picked) return null;
  try {
    await assignTask({ taskId, porterId: picked.userId, actorId, reason: "auto-assigned (lightest load)" });
    return picked.userId;
  } catch {
    return null;
  }
}

/**
 * Close a property-verification task. `verified` is the only path to a verified listing;
 * `failed` keeps the property visible-but-unverified and records why.
 */
export async function verifyProperty(input: {
  taskId: string;
  porterUserId: string;
  outcome: "verified" | "failed";
  notes?: string;
}) {
  const db = getDb();
  const [task] = await db.select().from(porterTasks).where(eq(porterTasks.id, input.taskId));
  if (!task) throw new PorterTaskError("Task not found", "not_found");
  if (task.type !== "verify_property") throw new PorterTaskError("Not a verification task", "conflict");
  if (task.porterId !== input.porterUserId) throw new PorterTaskError("This task is not assigned to you", "forbidden");
  if (task.status === "done") throw new PorterTaskError("Already closed", "conflict");
  if (!task.propertyId) throw new PorterTaskError("Task has no property", "conflict");

  const now = new Date();
  await db.update(porterTasks).set({
    status: input.outcome === "verified" ? "done" : "failed",
    completedAt: now,
    notes: input.notes?.trim() || task.notes,
  }).where(eq(porterTasks.id, input.taskId));

  const [property] = await db.select().from(properties).where(eq(properties.id, task.propertyId));

  if (input.outcome === "verified") {
    await db.update(properties).set({
      isPhysicallyVerified: true,
      verifiedByPorterId: input.porterUserId,
      verifiedAt: now,
    }).where(eq(properties.id, task.propertyId));
  }

  await db.insert(auditLogs).values({
    actorId: input.porterUserId,
    actionType: input.outcome === "verified" ? "verify" : "reject",
    targetResourceType: "property",
    targetResourceId: task.propertyId,
    oldValues: { isPhysicallyVerified: property?.isPhysicallyVerified ?? false },
    newValues: { isPhysicallyVerified: input.outcome === "verified", notes: input.notes ?? null, taskId: task.id },
  });

  if (property) {
    await notifyUser({
      userId: property.landlordId,
      type: input.outcome === "verified" ? "property_verified" : "property_verification_failed",
      payload: { propertyId: property.id, notes: input.notes ?? null },
      message: input.outcome === "verified"
        ? `Kith: "${property.title}" is now porter-verified and shows the verified badge in search.`
        : `Kith: our porter visited "${property.title}" and could not verify it${input.notes ? ` — ${input.notes}` : ""}. The listing stays live but unverified.`,
    });
  }

  return { propertyId: task.propertyId, outcome: input.outcome };
}

/** Ops view: every open/assigned task with its porter and property context. */
export async function openTaskQueue() {
  const db = getDb();
  const tasks = await db.select().from(porterTasks).where(inArray(porterTasks.status, ["open", "assigned"]));
  const porters = await db.select({ id: users.id, firstName: users.firstName, lastName: users.lastName, role: users.role }).from(users).where(eq(users.role, "porter"));
  const props = tasks.some((t) => t.propertyId) ? await db.select().from(properties) : [];
  return { tasks, porters, props };
}
