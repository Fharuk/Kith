/**
 * Maintenance domain rules with no server imports, so the reporting form (client) and the
 * landlord console (server) agree on categories, SLA windows and what "overdue" means.
 */
export type MaintenanceCategory = "security" | "plumbing" | "electrical" | "structural" | "pest" | "other";

export const MAINTENANCE_SLA_HOURS: Record<MaintenanceCategory, number> = {
  security: 4,
  plumbing: 24,
  electrical: 24,
  structural: 72,
  pest: 48,
  other: 48,
};

export const MAINTENANCE_CATEGORIES: { value: MaintenanceCategory; label: string }[] = [
  { value: "security", label: "Security (gate, lock, break-in)" },
  { value: "plumbing", label: "Water or plumbing" },
  { value: "electrical", label: "Power or electrical" },
  { value: "structural", label: "Roof, wall, damp" },
  { value: "pest", label: "Pests" },
  { value: "other", label: "Something else" },
];

/** When this ticket becomes overdue. */
export function slaDueAt(category: MaintenanceCategory, createdAt: Date): Date {
  const hours = MAINTENANCE_SLA_HOURS[category] ?? MAINTENANCE_SLA_HOURS.other;
  return new Date(createdAt.getTime() + hours * 3_600_000);
}

export function isOverdue(
  ticket: { status: string; acknowledgedAt: Date | null; createdAt: Date },
  category: MaintenanceCategory,
  now = Date.now(),
): boolean {
  if (ticket.status === "resolved" || ticket.acknowledgedAt) return false;
  return slaDueAt(category, ticket.createdAt).getTime() < now;
}
