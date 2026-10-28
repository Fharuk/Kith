import type { AuctionState } from "@kith/domain";

export interface BidRecord {
  id: string;
  auctionId: string;
  bidderId: string;
  bidderLabel: string;
  amountKobo: string; // wire format: decimal string of bigint kobo
  at: number;
}

/**
 * Storage port for the auction engine.
 * - MemoryStore: dev/demo and tests (this sandbox has no Redis binary).
 * - RedisStore: production (ioredis), same contract — see playbook 01.
 * No code branches on NODE_ENV to choose; selection is by REDIS_URL presence at bootstrap.
 */
export interface AuctionStore {
  getState(id: string): Promise<AuctionState | null>;
  setState(id: string, state: AuctionState): Promise<void>;
  /** Lock with ownership token; release only deletes if token matches (Lua CAS in Redis impl). */
  acquireLock(id: string, token: string, ttlMs: number): Promise<boolean>;
  releaseLock(id: string, token: string): Promise<boolean>;
  pushBid(record: BidRecord): Promise<void>;
  recentBids(id: string, limit: number): Promise<BidRecord[]>;
  /** Drop the bid log for an auction (demo round restart; prod auctions get fresh ids). */
  clearBids(id: string): Promise<void>;
}

export class MemoryStore implements AuctionStore {
  private states = new Map<string, AuctionState>();
  private locks = new Map<string, { token: string; expires: number }>();
  private bids = new Map<string, BidRecord[]>();

  async getState(id: string) {
    return this.states.get(id) ?? null;
  }
  async setState(id: string, state: AuctionState) {
    this.states.set(id, state);
  }
  async acquireLock(id: string, token: string, ttlMs: number) {
    const now = Date.now();
    const held = this.locks.get(id);
    if (held && held.expires > now) return false;
    this.locks.set(id, { token, expires: now + ttlMs });
    return true;
  }
  async releaseLock(id: string, token: string) {
    const held = this.locks.get(id);
    if (!held || held.token !== token) return false; // ownership check — never blind delete
    this.locks.delete(id);
    return true;
  }
  async pushBid(record: BidRecord) {
    const list = this.bids.get(record.auctionId) ?? [];
    list.unshift(record);
    this.bids.set(record.auctionId, list.slice(0, 200));
  }
  async recentBids(id: string, limit: number) {
    return (this.bids.get(id) ?? []).slice(0, limit);
  }
  async clearBids(id: string) {
    this.bids.delete(id);
  }
}
