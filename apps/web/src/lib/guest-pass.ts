import { createHash, randomBytes } from "node:crypto";
import { eq } from "drizzle-orm";
import { getDb, guestPasses } from "@kith/database";

/**
 * Guest pass minting — happens ONLY after payment confirmation (webhook), never at
 * reserve time. The TOTP secret is stored with an `enc:` prefix (mocks-first envelope
 * encryption seam); the porter terminal recomputes codes from it. One pass per booking
 * (unique constraint), 300s step, ±1 window grace at verification.
 */
export async function createGuestPass(bookingId: string, ttlDays = 368) {
  const db = getDb();
  const existing = (await db.select().from(guestPasses).where(eq(guestPasses.bookingId, bookingId)))[0];
  if (existing) return existing; // idempotent — webhooks can repeat
  const secret = randomBytes(20).toString("hex");
  const [pass] = await db
    .insert(guestPasses)
    .values({
      bookingId,
      codeHash: createHash("sha256").update(secret).digest("hex"),
      totpSecretEnc: `enc:${secret}`,
      stepSeconds: 300,
      status: "active",
      expiresAt: new Date(Date.now() + ttlDays * 86_400_000),
    })
    .returning();
  return pass;
}
