import { randomBytes } from "node:crypto";
import { eq } from "drizzle-orm";
import {
  getDb, inspectionReports, porterTasks, properties, rooms, bookings,
  landlordProfiles, notifications, auditLogs,
} from "@kith/database";
import { attachMedia } from "./media";
import { INSPECTION_CHECKLIST, scoreChecklist, reportSummary, type ChecklistAnswers } from "./inspection-checklist";

export { INSPECTION_CHECKLIST, scoreChecklist, reportSummary };
export type { ChecklistAnswers, ChecklistItem } from "./inspection-checklist";

/**
 * "PROOF OF ROOM" — the inspection report a porter files after standing in the room.
 *
 * This is the product's core trust artifact: a student in Lagos cannot fly to Abeokuta to check
 * whether the water runs before paying a year's rent. A named, verified porter walks the room,
 * answers a fixed checklist, photographs it, and the result is published on a shareable page
 * with a score. Nothing about it is marketing copy — every line is an observation with a time,
 * a place and a person attached.
 */

export function newReportSlug(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = randomBytes(8);
  const body = Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("");
  return `KRT-${body.slice(0, 4)}-${body.slice(4)}`;
}

export interface InspectionInput {
  taskId: string;
  porterId: string;
  answers: ChecklistAnswers;
  notes?: string;
  photoIds?: string[];
  gps?: { lat: number; lng: number } | null;
}

export async function createInspectionReport(input: InspectionInput) {
  const db = getDb();
  const [task] = await db.select().from(porterTasks).where(eq(porterTasks.id, input.taskId));
  if (!task) throw new Error("Task not found");
  if (task.porterId && task.porterId !== input.porterId) throw new Error("This task belongs to another porter");

  // A check-in task carries the booking; a property check carries the property directly.
  let propertyId = task.propertyId ?? null;
  let roomId: string | null = null;
  if (task.bookingId) {
    const [booking] = await db.select().from(bookings).where(eq(bookings.id, task.bookingId));
    if (booking) {
      roomId = booking.roomId;
      if (!propertyId) {
        const [room] = await db.select().from(rooms).where(eq(rooms.id, booking.roomId));
        propertyId = room?.propertyId ?? null;
      }
    }
  }
  if (!propertyId) throw new Error("This task is not linked to a property");

  const [property] = await db.select().from(properties).where(eq(properties.id, propertyId));
  if (!property) throw new Error("Property not found");

  const answers: ChecklistAnswers = {};
  for (const item of INSPECTION_CHECKLIST) {
    const raw = input.answers[item.key];
    answers[item.key] = { ok: Boolean(raw?.ok), ...(raw?.note ? { note: raw.note.slice(0, 300) } : {}) };
  }
  const score = scoreChecklist(answers);
  const slug = newReportSlug();

  const [report] = await db
    .insert(inspectionReports)
    .values({
      publicSlug: slug,
      propertyId,
      roomId,
      taskId: input.taskId,
      porterId: input.porterId,
      checklist: answers,
      notes: input.notes?.slice(0, 2000) ?? null,
      score,
      photoIds: [],
      gpsLat: input.gps ? String(input.gps.lat) : null,
      gpsLng: input.gps ? String(input.gps.lng) : null,
    })
    .returning();
  if (!report) throw new Error("Could not save the report");

  if (input.photoIds?.length) {
    const attached = await attachMedia({
      mediaIds: input.photoIds,
      userId: input.porterId,
      ownerType: "inspection",
      ownerId: report.id,
      visibility: "public",
    });
    if (attached.length) {
      await db.update(inspectionReports).set({ photoIds: attached }).where(eq(inspectionReports.id, report.id));
    }
  }

  await db.update(porterTasks).set({ status: "done", completedAt: new Date() }).where(eq(porterTasks.id, input.taskId));

  // The landlord profile carries the user id; notify the owner of the property.
  const [landlord] = await db.select().from(landlordProfiles).where(eq(landlordProfiles.userId, property.landlordId));
  await db.insert(notifications).values({
    userId: property.landlordId,
    channel: "in_app",
    type: "inspection_filed",
    body: `${property.title} inspected — ${score}/100. ${reportSummary(score).label}.`,
    deliveryStatus: "sent",
    deliveredAt: new Date(),
    payload: { title: "Proof of Room filed", reportId: report.id, slug, score },
  });
  void landlord;

  await db.insert(auditLogs).values({
    actorId: input.porterId,
    actionType: "verify",
    targetResourceType: "inspection_report",
    targetResourceId: report.id,
    newValues: { score, propertyId, slug },
  });

  return { id: report.id, slug, score };
}
