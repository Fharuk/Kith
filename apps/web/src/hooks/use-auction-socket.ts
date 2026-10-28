"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";
import { resolveSocketUrl } from "@/lib/socket-url";
import type { WireAuctionState, WireBid } from "@/lib/auction-wire";

export type ConnState = "connecting" | "live" | "offline";

export interface AuctionFeed {
  state: WireAuctionState | null;
  bids: WireBid[];
  conn: ConnState;
  presence: number;
  flash: "up" | null;
  extension: number | null; // epoch ms of latest soft-close extension
  ended: { winnerLabel: string | null; finalPriceKobo: string; totalBids: number } | null;
  rejection: string | null;
  placeBid: (amountKobo: bigint) => void;
}

export function useAuctionSocket(auctionId: string): AuctionFeed {
  const [state, setState] = useState<WireAuctionState | null>(null);
  const [bids, setBids] = useState<WireBid[]>([]);
  const [conn, setConn] = useState<ConnState>("connecting");
  const [presence, setPresence] = useState(0);
  const [flash, setFlash] = useState<"up" | null>(null);
  const [extension, setExtension] = useState<number | null>(null);
  const [ended, setEnded] = useState<AuctionFeed["ended"]>(null);
  const [rejection, setRejection] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const prevPrice = useRef<string | null>(null);

  useEffect(() => {
    const socket = io(resolveSocketUrl(), { transports: ["websocket", "polling"], reconnectionDelay: 800 });
    socketRef.current = socket;
    setConn("connecting");

    socket.on("connect", () => {
      setConn("live");
      socket.emit("join_auction", { auctionId });
    });
    socket.on("disconnect", () => setConn("offline"));
    socket.on("connect_error", () => setConn("offline"));

    socket.on("auction_state", (payload: { state: WireAuctionState; bids: WireBid[] }) => {
      setState(payload.state);
      setBids(payload.bids);
      setEnded(null);
      prevPrice.current = payload.state.currentPriceKobo;
    });
    const onBid = (payload: { state: WireAuctionState; record: WireBid }) => {
      setState(payload.state);
      setBids((b) => [payload.record, ...b].slice(0, 40));
      if (prevPrice.current && BigInt(payload.state.currentPriceKobo) > BigInt(prevPrice.current)) {
        setFlash("up");
        setTimeout(() => setFlash(null), 350);
      }
      prevPrice.current = payload.state.currentPriceKobo;
    };
    socket.on("bid_placed", onBid);
    socket.on("bid_accepted", onBid);
    socket.on("bid_rejected", (payload: { code: string }) => setRejection(payload.code));
    socket.on("auction_extended", (payload: { newEndTime: number }) => setExtension(payload.newEndTime));
    socket.on("auction_ended", (payload: { winnerLabel: string | null; finalPriceKobo: string; totalBids: number }) =>
      setEnded(payload));
    socket.on("presence_update", (payload: { count: number }) => setPresence(payload.count));

    return () => {
      socket.emit("leave_auction");
      socket.disconnect();
    };
  }, [auctionId]);

  const placeBid = useCallback((amountKobo: bigint) => {
    setRejection(null);
    socketRef.current?.emit("place_bid", {
      auctionId,
      amountKobo: amountKobo.toString(),
      idempotencyKey: `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
    });
  }, [auctionId]);

  return { state, bids, conn, presence, flash, extension, ended, rejection, placeBid };
}
