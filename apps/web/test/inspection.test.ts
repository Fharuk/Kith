import { describe, expect, it } from "vitest";
import { INSPECTION_CHECKLIST, reportSummary, scoreChecklist } from "@/lib/inspection-checklist";
import { newReportSlug } from "@/lib/inspection";

describe("inspection scoring", () => {
  it("scores a fully passing checklist at 100", () => {
    const all = Object.fromEntries(INSPECTION_CHECKLIST.map((i) => [i.key, { ok: true }]));
    expect(scoreChecklist(all)).toBe(100);
  });

  it("scores an empty checklist at 0 (a missing key is a fail, never a skip)", () => {
    expect(scoreChecklist({})).toBe(0);
  });

  it("weights water, power and access above cosmetics", () => {
    expect(scoreChecklist({ water: { ok: true } })).toBeGreaterThan(scoreChecklist({ cleanliness: { ok: true } }));
  });

  it("rounds to a whole number a student can read", () => {
    // access + water + power carry 9 of 20 weight points.
    expect(scoreChecklist({ access: { ok: true }, water: { ok: true }, power: { ok: true } })).toBe(45);
  });

  it("labels the score honestly in all three bands", () => {
    expect(reportSummary(100).tone).toBe("good");
    expect(reportSummary(85).tone).toBe("good");
    expect(reportSummary(70).tone).toBe("mixed");
    expect(reportSummary(59).tone).toBe("poor");
  });

  it("issues share handles in the documented shape, and never the same one twice", () => {
    const slugs = new Set(Array.from({ length: 50 }, () => newReportSlug()));
    expect(slugs.size).toBe(50);
    for (const slug of slugs) expect(slug).toMatch(/^KRT-[A-Z2-9]{4}-[A-Z2-9]{4}$/);
  });
});
