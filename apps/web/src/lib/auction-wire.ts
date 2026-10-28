/** Wire DTOs shared by apps/web and apps/realtime (bigint travels as decimal string). */
export interface WireAuctionState {
  id: string;
  roomId: string;
  landlordId: string;
  currentPriceKobo: string;
  floorPriceKobo: string;
  minIncrementKobo: string;
  scheduledEndTime: number;
  actualEndTime: number;
  status: "active" | "extended" | "completed" | "cancelled";
  winningStudentId: string | null;
  totalBids: number;
  version: number;
}

export interface WireBid {
  id: string;
  auctionId: string;
  bidderId: string;
  bidderLabel: string;
  amountKobo: string;
  at: number;
}

export const kobo = (s: string) => BigInt(s);

export function formatNgnFromKobo(k: bigint): string {
  const naira = k / 100n;
  const rem = k % 100n;
  const grouped = naira.toLocaleString("en-NG");
  return rem === 0n ? `₦${grouped}` : `₦${grouped}.${rem.toString().padStart(2, "0")}`;
}

export function countdown(target: number, now: number): string {
  const ms = Math.max(0, target - now);
  const m = Math.floor(ms / 60_000);
  const s = Math.floor((ms % 60_000) / 1000);
  return `${m}:${s.toString().padStart(2, "0")}`;
}
