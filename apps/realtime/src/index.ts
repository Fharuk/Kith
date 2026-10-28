import { createServer } from "node:http";
import express from "express";
import { Server, type Socket } from "socket.io";
import { z } from "zod";
import { DEFAULT_AUCTION_DURATION_MS, fromKobo, type AuctionState } from "@kith/domain";
import { AuctionEngine, type Principal } from "./engine";
import { MemoryStore } from "./store";
import { toWireState } from "./wire";
import { startDemoAuction } from "./demo";

const PORT = Number(process.env.PORT ?? 3001);
const CORS_ALLOW = (process.env.CORS_ORIGINS ?? "http://localhost:3000")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const isAllowedOrigin = (origin: string | undefined, cb: (err: Error | null, allow: boolean) => void) => {
  try {
    if (!origin) return cb(null, true); // non-browser clients (smoke harness, server-to-server)
    const { hostname } = new URL(origin);
    const allow =
      CORS_ALLOW.includes(origin) ||
      hostname.endsWith(".e2b.app") || // sandbox live previews (any port host)
      hostname === "localhost" ||
      hostname === "127.0.0.1";
    cb(null, allow);
  } catch {
    cb(null, false);
  }
};

const app = express();
app.get("/healthz", (_req, res) => res.json({ ok: true, service: "kith-realtime" }));

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: isAllowedOrigin, methods: ["GET", "POST"], credentials: true },
  transports: ["websocket", "polling"],
  pingInterval: 25_000,
  pingTimeout: 60_000,
  maxHttpBufferSize: 1e6,
});

const store = new MemoryStore(); // REDIS_URL present in prod -> RedisStore (same contract)
const engine = new AuctionEngine(store);

/**
 * Demo principal: the live demo page bids as a clearly-labelled verified demo student.
 * Production replaces this with handshake-verified NextAuth JWT principals — the engine
 * itself never trusts client-supplied identities (socket.data.principal only).
 */
const demoPrincipal: Principal = { id: "demo-student", label: "KH-DEMO-1", verified: true };

const JoinSchema = z.object({ auctionId: z.string().min(1) });
const BidSchema = z.object({
  auctionId: z.string().min(1),
  amountKobo: z.string().regex(/^\d+$/),
  idempotencyKey: z.string().min(8).max(64),
});

io.on("connection", (socket: Socket) => {
  socket.data.principal = demoPrincipal;
  let joined: string | null = null;

  socket.on("join_auction", async (raw: unknown) => {
    const parsed = JoinSchema.safeParse(raw);
    if (!parsed.success) return socket.emit("error", { message: "invalid join_auction" });
    const { auctionId } = parsed.data;
    const state = await engine.state(auctionId);
    if (!state) return socket.emit("error", { message: "auction_not_found" });
    await socket.join(`auction:${auctionId}`);
    joined = auctionId;
    socket.emit("auction_state", { state: toWireState(state), bids: await engine.bids(auctionId) });
    socket.to(`auction:${auctionId}`).emit("presence_update", { joined: true, count: io.sockets.adapter.rooms.get(`auction:${auctionId}`)?.size ?? 0 });
  });

  socket.on("place_bid", async (raw: unknown) => {
    const parsed = BidSchema.safeParse(raw);
    if (!parsed.success) return socket.emit("bid_rejected", { code: "invalid_payload" });
    if (joined !== parsed.data.auctionId) return socket.emit("bid_rejected", { code: "not_joined" });
    const principal: Principal = socket.data.principal;
    const outcome = await engine.placeBid(principal, {
      auctionId: parsed.data.auctionId,
      amountKobo: BigInt(parsed.data.amountKobo),
      idempotencyKey: parsed.data.idempotencyKey,
    });
    if (!outcome.ok) {
      socket.emit("bid_rejected", { code: outcome.code, state: outcome.state ? toWireState(outcome.state) : null });
      return;
    }
    const room = `auction:${parsed.data.auctionId}`;
    socket.emit("bid_accepted", { state: toWireState(outcome.state), record: outcome.record });
    io.to(room).emit("bid_placed", { state: toWireState(outcome.state), record: outcome.record });
    if (outcome.extended) {
      io.to(room).emit("auction_extended", { auctionId: parsed.data.auctionId, newEndTime: outcome.state.actualEndTime });
    }
  });

  socket.on("leave_auction", async () => {
    if (joined) await socket.leave(`auction:${joined}`);
    joined = null;
  });

  socket.on("disconnect", () => {
    if (joined) io.to(`auction:${joined}`).emit("presence_update", { joined: false, count: io.sockets.adapter.rooms.get(`auction:${joined}`)?.size ?? 0 });
  });
});

/** Rolling demo auction so the public page always has something live. */
const seedDemo = async () => {
  const now = Date.now();
  const state: AuctionState = {
    id: "demo",
    roomId: "room-demo-1",
    landlordId: "landlord-demo",
    currentPriceKobo: fromKobo(5_000_000),
    floorPriceKobo: fromKobo(4_500_000),
    minIncrementKobo: fromKobo(50_000),
    scheduledEndTime: now + DEFAULT_AUCTION_DURATION_MS,
    actualEndTime: now + DEFAULT_AUCTION_DURATION_MS,
    status: "active",
    winningStudentId: null,
    totalBids: 0,
    version: 1,
  };
  await store.setState(state.id, state);
  startDemoAuction(io, engine, state.id);
};

httpServer.listen(PORT, () => {
  console.log(`[kith-realtime] listening on :${PORT}`);
  void seedDemo();
});

const shutdown = (signal: string) => {
  console.log(`[kith-realtime] ${signal} — shutting down`);
  io.close();
  httpServer.close(() => process.exit(0));
  setTimeout(() => process.exit(1), 10_000).unref();
};
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
