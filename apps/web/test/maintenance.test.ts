import { describe, expect, it } from "vitest";
import { MAINTENANCE_SLA_HOURS, isOverdue, slaDueAt } from "@/lib/maintenance-config";

const created = new Date("2026-01-01T08:00:00.000Z");

describe("maintenance SLA", () => {
  it("escalates security fastest and structural work slowest", () => {
    expect(MAINTENANCE_SLA_HOURS.security).toBeLessThan(MAINTENANCE_SLA_HOURS.plumbing);
    expect(MAINTENANCE_SLA_HOURS.structural).toBeGreaterThan(MAINTENANCE_SLA_HOURS.plumbing);
  });

  it("computes the due time from the category", () => {
    expect(slaDueAt("security", created).toISOString()).toBe("2026-01-01T12:00:00.000Z");
    expect(slaDueAt("structural", created).toISOString()).toBe("2026-01-04T08:00:00.000Z");
  });

  it("is not overdue inside the window, and is after it", () => {
    const ticket = { status: "open", acknowledgedAt: null, createdAt: created };
    expect(isOverdue(ticket, "plumbing", created.getTime() + 3_600_000)).toBe(false);
    expect(isOverdue(ticket, "plumbing", created.getTime() + 25 * 3_600_000)).toBe(true);
  });

  it("stops the clock once the landlord acknowledges or it is resolved", () => {
    const late = created.getTime() + 96 * 3_600_000;
    expect(isOverdue({ status: "in_progress", acknowledgedAt: new Date(created.getTime() + 3_600_000), createdAt: created }, "plumbing", late)).toBe(false);
    expect(isOverdue({ status: "resolved", acknowledgedAt: null, createdAt: created }, "plumbing", late)).toBe(false);
  });
});
