import { io } from "socket.io-client";

const url = process.env.SOCKET_URL ?? "http://localhost:3001";
const s = io(url, { transports: ["websocket"] });
let state = null;
let accepted = 0;
let placed = 0;
const fail = (m) => {
  console.error("FAIL:", m);
  process.exit(1);
};
setTimeout(() => fail("timeout"), 15000);

s.on("connect", () => s.emit("join_auction", { auctionId: "demo" }));
s.on("auction_state", ({ state: st, bids }) => {
  state = st;
  console.log("joined. price=", st.currentPriceKobo, "status=", st.status, "bids=", bids.length);
  const inc = BigInt(st.minIncrementKobo);
  s.emit("place_bid", {
    auctionId: "demo",
    amountKobo: (BigInt(st.currentPriceKobo) + inc).toString(),
    idempotencyKey: "smoke-" + Date.now(),
  });
});
s.on("bid_accepted", ({ state: st }) => {
  accepted++;
  console.log("bid_accepted price=", st.currentPriceKobo, "v=", st.version);
});
s.on("bid_placed", () => {
  placed++;
});
s.on("bid_rejected", (r) => fail("rejected " + r.code));
s.on("auction_extended", () => console.log("extension event seen"));
s.on("connect_error", (e) => fail("connect_error " + e.message));

setTimeout(() => {
  if (!state) fail("no state");
  if (accepted < 1) fail("no accepted bid");
  if (placed < 1) fail("no broadcast");
  console.log("SMOKE OK accepted=", accepted, "placed=", placed);
  process.exit(0);
}, 4000);
