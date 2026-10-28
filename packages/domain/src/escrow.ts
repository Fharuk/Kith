export const ESCROW_STATUSES = ["pending", "held", "released", "disputed", "refunded"] as const;
export type EscrowStatus = (typeof ESCROW_STATUSES)[number];

export const ESCROW_ACTORS = ["paystack", "porter", "worker", "admin"] as const;
export type EscrowActor = (typeof ESCROW_ACTORS)[number];

export class EscrowError extends Error {
  constructor(from: EscrowStatus, to: EscrowStatus, actor: EscrowActor) {
    super(`Illegal escrow transition ${from} -> ${to} by ${actor}`);
    this.name = "EscrowError";
  }
}

/** Allowed transitions with the only actors permitted to perform them. */
const TRANSITIONS: Record<EscrowStatus, Partial<Record<EscrowStatus, readonly EscrowActor[]>>> = {
  pending: { held: ["paystack"] },
  held: { released: ["porter", "worker"], disputed: ["admin"] },
  disputed: { released: ["admin"], refunded: ["admin"] },
  released: {},
  refunded: {},
};

export function canTransition(from: EscrowStatus, to: EscrowStatus, actor: EscrowActor): boolean {
  return (TRANSITIONS[from]?.[to] ?? []).includes(actor);
}

export function transition(from: EscrowStatus, to: EscrowStatus, actor: EscrowActor): EscrowStatus {
  if (!canTransition(from, to, actor)) throw new EscrowError(from, to, actor);
  return to;
}

export const AUTO_RELEASE_AFTER_CHECKIN_MS = 24 * 60 * 60 * 1000;
