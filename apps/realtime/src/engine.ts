import { randomUUID } from "node:crypto";
import {
  applyBid,
  evaluateBid,
  BID_REJECTION,
  type AuctionState,
  type BidRejectionCode,
} from "@kith/domain";
import type { AuctionStore, BidRecord } from "./store";

export interface Principal {
  id: string;
  label: string; // pseudonymized public label, e.g. "KH-7F3K"
  verified: boolean;
}

export interface PlaceBidInput {
  auctionId: string;
  amountKobo: bigint;
  idempotencyKey: string;
  now?: number;
}

export type PlaceBidOutcome =
  | { ok: true; state: AuctionState; extended: boolean; record: BidRecord }
  | { ok: false; code: BidRejectionCode | "contention" | "duplicate_bid"; state: AuctionState | null };

const LOCK_TTL_MS = 5000;
const LOCK_RETRIES = 3;
const LOCK_BACKOFF_MS = [50, 100, 150];
/** 10 bids/min per user per auction; 60/min global per user. */
const RATE_PER_AUCTION = 10;
const RATE_GLOBAL = 60;

export class AuctionEngine {
  private seen = new Map<string, PlaceBidOutcome>(); // idempotency cache (DB constraint in prod)
  private buckets = new Map<string, number[]>();

  constructor(private store: AuctionStore) {}

  private rateLimited(principalId: string, auctionId: string, now: number): boolean {
    const windowMs = 60_000;
    const check = (key: string, max: number) => {
      const hits = (this.buckets.get(key) ?? []).filter((t) => now - t < windowMs);
      if (hits.length >= max) {
        this.buckets.set(key, hits);
        return true;
      }
      hits.push(now);
      this.buckets.set(key, hits);
      return false;
    };
    return check(`a:${principalId}:${auctionId}`, RATE_PER_AUCTION) || check(`g:${principalId}`, RATE_GLOBAL);
  }

  async placeBid(principal: Principal, input: PlaceBidInput): Promise<PlaceBidOutcome> {
    const now = input.now ?? Date.now();
    const dup = this.seen.get(input.idempotencyKey);
    if (dup) return dup;

    if (this.rateLimited(principal.id, input.auctionId, now)) {
      return { ok: false, code: BID_REJECTION.RATE_LIMITED, state: await this.store.getState(input.auctionId) };
    }

    let acquired = false;
    const token = randomUUID();
    for (let attempt = 0; attempt < LOCK_RETRIES && !acquired; attempt++) {
      acquired = await this.store.acquireLock(input.auctionId, token, LOCK_TTL_MS);
      if (!acquired && attempt < LOCK_RETRIES - 1) {
        await new Promise((r) => setTimeout(r, LOCK_BACKOFF_MS[attempt]));
      }
    }
    if (!acquired) return { ok: false, code: "contention", state: await this.store.getState(input.auctionId) };

    try {
      const state = await this.store.getState(input.auctionId);
      if (!state) return { ok: false, code: BID_REJECTION.NOT_ACTIVE, state: null };

      const decision = evaluateBid(state, {
        bidderId: principal.id,
        amountKobo: input.amountKobo,
        now,
        isVerifiedStudent: principal.verified,
      });
      if (!decision.ok) {
        const out: PlaceBidOutcome = { ok: false, code: decision.code, state };
        this.seen.set(input.idempotencyKey, out);
        return out;
      }

      const next = applyBid(state, { bidderId: principal.id, amountKobo: input.amountKobo, now, isVerifiedStudent: principal.verified }, decision.newEndTime);
      const record: BidRecord = {
        id: randomUUID(),
        auctionId: state.id,
        bidderId: principal.id,
        bidderLabel: principal.label,
        amountKobo: input.amountKobo.toString(),
        at: now,
      };
      // write-through: durable log first, then hot state (playbook 01 §critical section)
      await this.store.pushBid(record);
      await this.store.setState(state.id, next);

      const out: PlaceBidOutcome = { ok: true, state: next, extended: decision.extended, record };
      this.seen.set(input.idempotencyKey, out);
      return out;
    } finally {
      await this.store.releaseLock(input.auctionId, token);
    }
  }

  async state(id: string) {
    return this.store.getState(id);
  }
  async bids(id: string, limit = 12) {
    return this.store.recentBids(id, limit);
  }
}
