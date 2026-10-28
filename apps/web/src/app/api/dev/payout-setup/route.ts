import { eq } from "drizzle-orm";
import { getDb, landlordProfiles } from "@kith/database";
import { getPaystack } from "@/lib/paystack";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * DEV/TEST ONLY — attach a verified payout account to the demo landlord so the payout path
 * is walkable without the UI. Uses the same resolve + recipient calls as the real action.
 * Account numbers ending in 00 fail at transfer time; ending in 99 stay pending (reversible).
 */
export async function POST(req: Request) {
  if (process.env.NODE_ENV === "production") {
    return Response.json({ ok: false, error: "not available" }, { status: 404 });
  }
  const body = (await req.json().catch(() => ({}))) as { accountNumber?: string; bankCode?: string; bankName?: string } | null;
  const accountNumber = body?.accountNumber ?? "0123456789";
  const bankCode = body?.bankCode ?? "058";
  const bankName = body?.bankName ?? "Guaranty Trust Bank";

  const db = getDb();
  const profile = (await db.select().from(landlordProfiles))[0];
  if (!profile) return Response.json({ ok: false, error: "no landlord profile" }, { status: 404 });

  const { driver } = getPaystack();
  try {
    const resolved = await driver.resolveAccount(accountNumber, bankCode);
    const recipient = await driver.createRecipient({ name: resolved.accountName, accountNumber, bankCode });
    await db.update(landlordProfiles).set({
      bankCode, bankName, bankAccountNumber: accountNumber,
      bankAccountName: resolved.accountName,
      paystackRecipientCode: recipient.recipientCode,
      bankVerifiedAt: new Date(),
    }).where(eq(landlordProfiles.userId, profile.userId));
    return Response.json({ ok: true, accountName: resolved.accountName, recipientCode: recipient.recipientCode, accountNumber });
  } catch (e) {
    return Response.json({ ok: false, error: e instanceof Error ? e.message : "resolve failed" }, { status: 400 });
  }
}
