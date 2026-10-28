import type { Server } from "socket.io";
import { fromKobo } from "@kith/domain";
import type { AuctionEngine, Principal } from "./engine";
import { toWireState } from "./wire";

const OPPONENTS: Principal[] = [
  { id: "sim-1", label: "KH-4T7Q", verified: true },
  { id: "sim-2", label: "KH-9M2C", verified: true },
  { id: "sim-3", label: "KH-1X8V", verified: true },
];

const SETTLE_TICK_MS = 1000;
const RESTART_DELAY_MS = 15_000;

/**
 * Demo-only: simulated verified opponents + rolling settlement so the public
 * demo auction is always live. Production opponents are real students; settlement
 * is a BullMQ worker (playbook 01), not an interval.
 */
export function startDemoAuction(io: Server, engine: AuctionEngine, auctionId: string) {
  const room = `auction:${auctionId}`;

  const bidderLoop = setInterval(async () => {
    const state = await engine.state(auctionId);
    if (!state || (state.status !== "active" && state.status !== "extended")) return;
    if (Date.now() > state.actualEndTime - 500) return;
    if (Math.random() < 0.45) return; // breathing room between opponent bids
    const opponent = OPPONENTS[Math.floor(Math.random() * OPPONENTS.length)];
    if (opponent.id === state.winningStudentId) return; // never bid against yourself
    const steps = 1n + BigInt(Math.floor(Math.random() * 3));
    const amount = state.currentPriceKobo + state.minIncrementKobo * steps;
    const outcome = await engine.placeBid(opponent, {
      auctionId,
      amountKobo: amount,
      idempotencyKey: `sim-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    });
    if (outcome.ok) {
      io.to(room).emit("bid_placed", { state: toWireState(outcome.state), record: outcome.record });
      if (outcome.extended) io.to(room).emit("auction_extended", { auctionId, newEndTime: outcome.state.actualEndTime });
    }
  }, 8000);

  const settleLoop = setInterval(async () => {
    const state = await engine.state(auctionId);
    if (!state || state.status === "completed") return;
    if (Date.now() < state.actualEndTime) return;
    const final = { ...state, status: "completed" as const };
    await engine["store"].setState(auctionId, final).catch(() => undefined);
    io.to(room).emit("auction_ended", {
      auctionId,
      winnerLabel: state.winningStudentId ? labelFor(state.winningStudentId) : null,
      finalPriceKobo: state.currentPriceKobo.toString(),
      totalBids: state.totalBids,
    });
    clearInterval(bidderLoop);
    clearInterval(settleLoop);
    setTimeout(() => void restart(io, engine, auctionId), RESTART_DELAY_MS);
  }, SETTLE_TICK_MS);
}

function labelFor(id: string) {
  return OPPONENTS.find((o) => o.id === id)?.label ?? "KH-DEMO-1";
}

async function restart(io: Server, engine: AuctionEngine, auctionId: string) {
  const now = Date.now();
  const fresh = {
    id: auctionId,
    roomId: "room-demo-1",
    landlordId: "landlord-demo",
    currentPriceKobo: fromKobo(5_000_000),
    floorPriceKobo: fromKobo(4_500_000),
    minIncrementKobo: fromKobo(50_000),
    scheduledEndTime: now + 12 * 60_000,
    actualEndTime: now + 12 * 60_000,
    status: "active" as const,
    winningStudentId: null,
    totalBids: 0,
    version: 1,
  };
  await engine["store"].setState(auctionId, fresh);
  io.to(`auction:${auctionId}`).emit("auction_state", { state: toWireState(fresh), bids: [] });
  startDemoAuction(io, engine, auctionId);
}
