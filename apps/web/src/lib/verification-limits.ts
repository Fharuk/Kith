import { and, eq, gte } from "drizzle-orm";
import { getDb, verificationAttempts } from "@kith/database";

/**
 * VERIFICATION ATTEMPT LIMITS.
 *
 * The KYC gates cost real money per call (NIMC lookup, liveness scoring), and they are also
 * the exact surface an identity thief would grind: someone holding a leaked NIN can keep
 * guessing date-of-birth/name combinations until one matches. So every attempt — pass or
 * fail — is recorded, and the budget is small, per user, and per step.
 *
 * Policy (documented in the deploy notes):
 *   NIN        5 attempts / hour
 *   matric     5 attempts / hour
 *   biometric  3 attempts / hour
 *   any step   12 attempts / hour across the board
 *
 * Attempts are written even when the provider call throws, because a failed call is still
 * an attempt at the gate.
 */
export type KycStep = "nin" | "matric" | "biometric" | "review";

export const HOUR_MS = 60 * 60 * 1000;

export const STEP_BUDGETS: Record<KycStep, { limit: number; windowMs: number }> = {
  nin: { limit: 5, windowMs: HOUR_MS },
  matric: { limit: 5, windowMs: HOUR_MS },
  biometric: { limit: 3, windowMs: HOUR_MS },
  review: { limit: 12, windowMs: HOUR_MS },
};

export const GLOBAL_BUDGET = { limit: 12, windowMs: HOUR_MS };

export interface BudgetState {
  allowed: boolean;
  used: number;
  limit: number;
  /** minutes until the oldest counted attempt ages out; 0 when allowed */
  retryAfterMinutes: number;
}

/** Pure fold so the rule can be tested without a database. */
export function evaluateBudget(attemptTimestamps: number[], policy: { limit: number; windowMs: number }, now: number): BudgetState {
  const inWindow = attemptTimestamps.filter((t) => now - t < policy.windowMs).sort((a, b) => a - b);
  const used = inWindow.length;
  if (used < policy.limit) return { allowed: true, used, limit: policy.limit, retryAfterMinutes: 0 };
  const oldest = inWindow[0] ?? now;
  const msLeft = Math.max(1000, oldest + policy.windowMs - now);
  return { allowed: false, used, limit: policy.limit, retryAfterMinutes: Math.max(1, Math.ceil(msLeft / 60_000)) };
}

/** Current budget for one user on one step (step + global cap). */
export async function verificationBudget(userId: string, step: KycStep, now = Date.now()): Promise<BudgetState> {
  const db = getDb();
  const since = new Date(now - HOUR_MS);
  // One row is written when an attempt starts ("attempt") and another when it resolves
  // ("success"/"failure"). Only the START rows count against the budget, otherwise a single
  // failed guess would burn two of the five slots the policy promises.
  const rows = (await db.select({ step: verificationAttempts.step, createdAt: verificationAttempts.createdAt, reason: verificationAttempts.reason })
    .from(verificationAttempts)
    .where(and(eq(verificationAttempts.userId, userId), gte(verificationAttempts.createdAt, since))))
    .filter((r) => r.reason === null || r.reason === "attempt");

  const stepState = evaluateBudget(
    rows.filter((r) => r.step === step).map((r) => r.createdAt.getTime()),
    STEP_BUDGETS[step] ?? GLOBAL_BUDGET,
    now,
  );
  if (!stepState.allowed) return stepState;

  return evaluateBudget(rows.map((r) => r.createdAt.getTime()), GLOBAL_BUDGET, now);
}

/**
 * Record an attempt. Called BEFORE the provider call so a crash still counts, and again on
 * the outcome so ops can see whether the failures cluster (a real bug vs someone guessing).
 */
export async function recordVerificationAttempt(input: {
  userId: string;
  step: KycStep;
  outcome: "attempt" | "success" | "failure";
}) {
  const db = getDb();
  await db.insert(verificationAttempts).values({
    userId: input.userId,
    step: input.step,
    succeeded: input.outcome === "success",
    reason: input.outcome === "success" ? null : input.outcome,
  });
}

/** Student-facing copy: never leak how close they are to a fraud flag, just the wait. */
export function limitMessage(budget: BudgetState) {
  return `Too many verification attempts. Try again in about ${budget.retryAfterMinutes} minute${budget.retryAfterMinutes === 1 ? "" : "s"} — this protects your identity record.`;
}
