"use client";

import { useRouter } from "next/navigation";
import { reserveRoom } from "@/app/actions/auth-actions";

export function ReserveForm({ roomId, available }: { roomId: string; available: boolean }) {
  const router = useRouter();
  return (
    <form
      action={async (fd) => {
        const res = await reserveRoom(fd);
        if (res?.error) {
          // server action redirects on success; surface gate errors by bouncing to the gate
          router.push(res.error.includes("verification") ? "/verify" : "/login?callbackUrl=" + encodeURIComponent(`/rooms/${roomId}`));
        }
      }}
      className="mt-6"
    >
      <input type="hidden" name="roomId" value={roomId} />
      <button
        type="submit"
        disabled={!available}
        className="w-full rounded-full bg-navy px-6 py-3.5 text-base font-semibold text-paper shadow-card transition-all hover:bg-navy-soft hover:shadow-lift disabled:opacity-40"
      >
        {available ? "Book with escrow protection" : "Room taken"}
      </button>
      <p className="mt-3 text-center text-xs text-ink/50">
        Requires a verified student account · agreement e-signed at booking
      </p>
    </form>
  );
}
