/**
 * ROOMPARTNER COMPATIBILITY.
 *
 * Students arriving in a new city often cannot afford a room alone, and the informal route —
 * a WhatsApp group of strangers — is exactly where fraud and bad matches happen. This scores
 * two profiles on the things that actually break a share: money, sleep, cleanliness, guests.
 *
 * The score is deliberately explainable. Every point comes with a reason string, because a
 * number nobody can justify is just a horoscope. Pure functions: no database, no clock.
 */

export interface RoommateProfileShape {
  userId: string;
  universityId: string | null;
  budgetMinKobo: number;
  budgetMaxKobo: number;
  gender: string | null;
  genderPreference: string;
  sleepSchedule: string;
  cleanliness: number; // 1–5
  smoker: boolean;
  guests: string; // never | sometimes | often
  course: string | null;
}

export interface MatchResult {
  score: number; // 0–100
  reasons: string[];
  blockers: string[];
}

const clamp = (n: number, min = 0, max = 100) => Math.max(min, Math.min(max, n));

/** Do their budgets overlap at all? Returns the overlap in kobo, or 0. */
export function budgetOverlap(a: RoommateProfileShape, b: RoommateProfileShape): number {
  return Math.max(0, Math.min(a.budgetMaxKobo, b.budgetMaxKobo) - Math.max(a.budgetMinKobo, b.budgetMinKobo));
}

function genderAccepts(profile: RoommateProfileShape, other: RoommateProfileShape): boolean {
  const pref = profile.genderPreference;
  if (pref === "any" || !other.gender) return true;
  return pref === other.gender;
}

export function compatibilityScore(a: RoommateProfileShape, b: RoommateProfileShape): MatchResult {
  const reasons: string[] = [];
  const blockers: string[] = [];

  // Hard blockers first: a share that fails these should never be suggested.
  if (!genderAccepts(a, b) || !genderAccepts(b, a)) {
    blockers.push("One of you has a gender preference this match does not satisfy");
  }
  const overlap = budgetOverlap(a, b);
  if (overlap <= 0) blockers.push("Your budgets do not overlap");

  let score = 0;

  if (a.universityId && a.universityId === b.universityId) {
    score += 25;
    reasons.push("Same university");
  }

  if (overlap > 0) {
    score += 30;
    const mid = (Math.max(a.budgetMinKobo, b.budgetMinKobo) + Math.min(a.budgetMaxKobo, b.budgetMaxKobo)) / 2;
    reasons.push(`Budgets overlap around ${Math.round(mid / 100).toLocaleString("en-NG")} naira`);
  }

  if (a.sleepSchedule === b.sleepSchedule && a.sleepSchedule !== "flexible") {
    score += 15;
    reasons.push(`Both ${a.sleepSchedule.replace("_", " ")}`);
  } else if (a.sleepSchedule === "flexible" || b.sleepSchedule === "flexible") {
    score += 8;
    reasons.push("One of you is flexible on sleep");
  }

  const tidiness = 5 - Math.abs(a.cleanliness - b.cleanliness);
  score += clamp(tidiness, 0, 5) * 3; // up to 15
  if (Math.abs(a.cleanliness - b.cleanliness) <= 1) reasons.push("Similar standards of tidiness");

  if (a.smoker === b.smoker) {
    score += 8;
    reasons.push(a.smoker ? "Both smoke" : "Both non-smokers");
  } else {
    blockers.push("One of you smokes and the other does not");
  }

  if (a.guests === b.guests) {
    score += 7;
    reasons.push(`Same guest habits (${a.guests})`);
  }

  if (a.course && b.course && a.course.toLowerCase() === b.course.toLowerCase()) {
    reasons.push("Same course");
  }

  return {
    score: blockers.length > 0 ? 0 : clamp(Math.round(score)),
    reasons,
    blockers,
  };
}

/** Sort a set of candidates for one student, dropping matches disqualified by a blocker. */
export function rankMatches<T extends RoommateProfileShape>(
  me: RoommateProfileShape,
  candidates: T[],
  limit = 12,
): Array<{ candidate: T; match: MatchResult }> {
  return candidates
    .filter((c) => c.userId !== me.userId)
    .map((candidate) => ({ candidate, match: compatibilityScore(me, candidate) }))
    .filter((m) => m.match.blockers.length === 0)
    .sort((x, y) => y.match.score - x.match.score)
    .slice(0, limit);
}
