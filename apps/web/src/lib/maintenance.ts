import { and, desc, eq, inArray, isNull } from "drizzle-orm";
import {
  getDb, maintenanceTickets, bookings, rooms, properties, users, auditLogs, notifications,
} from "@kith/database";
import { attachMedia } from "./media";
import { notifyUser } from "./providers/notify";
import { MAINTENANCE_SLA_HOURS, isOverdue, type MaintenanceCategory } from "./maintenance-config";

/**
 * MOVE-IN → MAINTENANCE LOOP.
 *
 * Escrow ends at check-in, which is exactly when a landlord stops having to care. This keeps a
 * clock running afterwards: every ticket has an SLA by category, the landlord's first reply
 * stops the response clock, and overdue tickets are visible to ops. Students get a record they
 * can point at — that record is also what a dispute is built from.
 */

export {
  MAINTENANCE_CATEGORIES, MAINTENANCE_SLA_HOURS, isOverdue, slaDueAt,
} from "./maintenance-config";
export type { MaintenanceCategory } from "./maintenance-config";

export class MaintenanceError extends Error {
  constructor(message: string, readonly code: "not_found" | "forbidden" | "invalid") {
    super(message);
    this.name = "MaintenanceError";
  }
}

export async function raiseTicket(input: {
  studentId: string;
  bookingId: string;
  category: MaintenanceCategory;
  description: string;
  photoIds?: string[];
}) {
  if (input.description.trim().length < 10) throw new MaintenanceError("Describe the problem in a sentence", "invalid");
  const db = getDb();

  const [booking] = await db.select().from(bookings).where(eq(bookings.id, input.bookingId));
  if (!booking) throw new MaintenanceError("Booking not found", "not_found");
  if (booking.studentId !== input.studentId) throw new MaintenanceError("That booking is not yours", "forbidden");
  if (!["confirmed", "checked_in"].includes(booking.status)) {
    throw new MaintenanceError("Maintenance applies once your booking is confirmed", "invalid");
  }

  const [room] = await db.select().from(rooms).where(eq(rooms.id, booking.roomId));
  if (!room) throw new MaintenanceError("Room not found", "not_found");
  const [property] = await db.select().from(properties).where(eq(properties.id, room.propertyId));
  if (!property) throw new MaintenanceError("Property not found", "not_found");

  const [ticket] = await db
    .insert(maintenanceTickets)
    .values({
      bookingId: booking.id,
      propertyId: property.id,
      roomId: room.id,
      raisedBy: input.studentId,
      landlordId: property.landlordId,
      category: input.category,
      description: input.description.slice(0, 2000),
      photoIds: [],
    })
    .returning();
  if (!ticket) throw new MaintenanceError("Could not open the ticket", "invalid");

  if (input.photoIds?.length) {
    const attached = await attachMedia({
      mediaIds: input.photoIds,
      userId: input.studentId,
      ownerType: "maintenance",
      ownerId: ticket.id,
      visibility: "private",
    });
    if (attached.length) await db.update(maintenanceTickets).set({ photoIds: attached }).where(eq(maintenanceTickets.id, ticket.id));
  }

  const [landlord] = await db.select().from(users).where(eq(users.id, property.landlordId));
  await notifyUser({
    userId: property.landlordId,
    type: "maintenance_raised",
    payload: { ticketId: ticket.id, category: input.category, propertyId: property.id },
    message: `Kith: a tenant at ${property.title} reported a ${input.category} problem. Respond within ${MAINTENANCE_SLA_HOURS[input.category]} hours.`,
    email: landlord?.email,
    emailSubject: `Maintenance ticket — ${property.title}`,
  });

  await db.insert(auditLogs).values({
    actorId: input.studentId,
    actionType: "create",
    targetResourceType: "maintenance_ticket",
    targetResourceId: ticket.id,
    newValues: { category: input.category, propertyId: property.id },
  });

  return ticket;
}

export async function acknowledgeTicket(input: { ticketId: string; landlordId: string }) {
  const db = getDb();
  const [ticket] = await db.select().from(maintenanceTickets).where(eq(maintenanceTickets.id, input.ticketId));
  if (!ticket) throw new MaintenanceError("Ticket not found", "not_found");
  if (ticket.landlordId !== input.landlordId) throw new MaintenanceError("Not your ticket", "forbidden");
  if (ticket.acknowledgedAt) return ticket;

  const [updated] = await db
    .update(maintenanceTickets)
    .set({ status: "in_progress", acknowledgedAt: new Date() })
    .where(eq(maintenanceTickets.id, ticket.id))
    .returning();

  await db.insert(notifications).values({
    userId: ticket.raisedBy,
    channel: "in_app",
    type: "maintenance_acknowledged",
    body: "Your landlord has seen the maintenance report and is arranging a fix.",
    deliveredAt: new Date(),
    deliveryStatus: "sent",
    payload: { ticketId: ticket.id },
  });
  return updated ?? ticket;
}

export async function resolveTicket(input: { ticketId: string; landlordId: string; note: string }) {
  const db = getDb();
  const [ticket] = await db.select().from(maintenanceTickets).where(eq(maintenanceTickets.id, input.ticketId));
  if (!ticket) throw new MaintenanceError("Ticket not found", "not_found");
  if (ticket.landlordId !== input.landlordId) throw new MaintenanceError("Not your ticket", "forbidden");

  const [updated] = await db
    .update(maintenanceTickets)
    .set({
      status: "resolved",
      resolutionNote: input.note.slice(0, 1000),
      resolvedAt: new Date(),
      acknowledgedAt: ticket.acknowledgedAt ?? new Date(),
    })
    .where(eq(maintenanceTickets.id, ticket.id))
    .returning();

  await db.insert(notifications).values({
    userId: ticket.raisedBy,
    channel: "in_app",
    type: "maintenance_resolved",
    body: `Marked resolved: ${input.note.slice(0, 160)}`,
    deliveredAt: new Date(),
    deliveryStatus: "sent",
    payload: { ticketId: ticket.id },
  });
  await db.insert(auditLogs).values({
    actorId: input.landlordId,
    actionType: "complete",
    targetResourceType: "maintenance_ticket",
    targetResourceId: ticket.id,
    newValues: { note: input.note },
  });
  return updated ?? ticket;
}

/** Tickets a landlord should see: open first, oldest first — the ones burning SLA at the top. */
export async function landlordTickets(landlordId: string) {
  return getDb()
    .select({ ticket: maintenanceTickets, property: properties })
    .from(maintenanceTickets)
    .innerJoin(properties, eq(maintenanceTickets.propertyId, properties.id))
    .where(eq(maintenanceTickets.landlordId, landlordId))
    .orderBy(maintenanceTickets.status, desc(maintenanceTickets.createdAt));
}

export async function studentTickets(studentId: string) {
  return getDb()
    .select({ ticket: maintenanceTickets, property: properties })
    .from(maintenanceTickets)
    .innerJoin(properties, eq(maintenanceTickets.propertyId, properties.id))
    .where(eq(maintenanceTickets.raisedBy, studentId))
    .orderBy(desc(maintenanceTickets.createdAt));
}

/** Ops view: open tickets past their SLA. */
export async function overdueTickets(now = new Date()) {
  const db = getDb();
  const rows = await db
    .select({ ticket: maintenanceTickets, property: properties })
    .from(maintenanceTickets)
    .innerJoin(properties, eq(maintenanceTickets.propertyId, properties.id))
    .where(and(inArray(maintenanceTickets.status, ["open", "in_progress"]), isNull(maintenanceTickets.resolvedAt)));
  return rows.filter((r) => isOverdue({ status: r.ticket.status, acknowledgedAt: r.ticket.acknowledgedAt, createdAt: r.ticket.createdAt }, r.ticket.category as MaintenanceCategory, now.getTime()));
}
