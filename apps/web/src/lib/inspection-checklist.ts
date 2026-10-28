/**
 * The checklist itself, kept free of server-only imports so the porter's form (a client
 * component) and the public report page (server) render from one definition.
 */
export interface ChecklistItem {
  key: string;
  label: string;
  hint: string;
  weight: number;
}

export const INSPECTION_CHECKLIST: ChecklistItem[] = [
  { key: "access", label: "Safe access to the room", hint: "Lit street, lockable gate, no flood path", weight: 3 },
  { key: "water", label: "Running water in the room", hint: "Tap or tank, now", weight: 3 },
  { key: "power", label: "Power supply", hint: "Grid, inverter or generator; note hours", weight: 3 },
  { key: "security", label: "Building security", hint: "Guard, fence, gate, CCTV", weight: 2 },
  { key: "toilet", label: "Toilet and bathroom", hint: "Flush, cleanliness, shared or private", weight: 2 },
  { key: "kitchen", label: "Kitchen", hint: "Shared or private, working cooker point", weight: 2 },
  { key: "drainage", label: "Drainage and damp", hint: "No standing water, no mould", weight: 2 },
  { key: "network", label: "Network reception", hint: "Signal indoors, not just on the street", weight: 1 },
  { key: "furniture", label: "Furniture as advertised", hint: "Bed, wardrobe, desk match the listing", weight: 1 },
  { key: "cleanliness", label: "Cleanliness", hint: "Room and shared areas", weight: 1 },
];

const TOTAL_WEIGHT = INSPECTION_CHECKLIST.reduce((sum, item) => sum + item.weight, 0);

export type ChecklistAnswers = Record<string, { ok: boolean; note?: string }>;

/** Weighted 0–100. Pure, so the headline number on a public page is unit-tested. */
export function scoreChecklist(answers: ChecklistAnswers): number {
  const earned = INSPECTION_CHECKLIST.reduce((sum, item) => sum + (answers[item.key]?.ok ? item.weight : 0), 0);
  return Math.round((earned / TOTAL_WEIGHT) * 100);
}

export function reportSummary(score: number): { label: string; tone: "good" | "mixed" | "poor" } {
  if (score >= 85) return { label: "Matches the listing", tone: "good" };
  if (score >= 60) return { label: "Mostly as described", tone: "mixed" };
  return { label: "Significant gaps", tone: "poor" };
}
