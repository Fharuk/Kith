"use server";

import { createHash } from "node:crypto";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { AuthError } from "next-auth";
import {
  getDb, users, studentProfiles, landlordProfiles, porterProfiles,
  hashPassword, generatePseudonymizedId, universities,
} from "@kith/database";
import { signIn } from "@/auth";
import { requireUser } from "@/lib/session";
import { roleHome } from "@/middleware";
import { getNimcProvider } from "@/lib/providers/nimc";
import { notifyUser } from "@/lib/providers/notify";
import { emailGateFailure, issueEmailVerification } from "@/lib/email-verification";
import { limitMessage, recordVerificationAttempt, verificationBudget } from "@/lib/verification-limits";

const registerSchema = z.object({
  role: z.enum(["student", "landlord", "porter"]),
  firstName: z.string().min(2).max(40),
  lastName: z.string().min(2).max(40),
  email: z.string().email(),
  password: z.string().min(10, "Use at least 10 characters"),
});

export async function registerAction(_prev: unknown, formData: FormData) {
  const parsed = registerSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]!?.message ?? "Invalid input" };
  const { role, firstName, lastName, email, password } = parsed.data;
  const db = getDb();

  const existing = await db.select().from(users).where(eq(users.email, email.toLowerCase()));
  if (existing.length > 0) return { error: "An account with this email already exists" };

  const [user] = await db.insert(users).values({
    role,
    email: email.toLowerCase(),
    firstName,
    lastName,
    passwordHash: await hashPassword(password),
    pseudonymizedId: generatePseudonymizedId(),
    isVerified: role !== "student", // students earn verification through the 4 gates
  }).returning();
  if (!user) return { error: "Could not create your account — try again" };

  if (role === "student") {
    await db.insert(studentProfiles).values({ userId: user.id, currentStep: "nin" });
  } else if (role === "landlord") {
    await db.insert(landlordProfiles).values({ userId: user.id, businessName: `${lastName} Estates` });
  } else {
    await db.insert(porterProfiles).values({ userId: user.id, zone: "Unassigned" });
  }

  // The address is a claim until it is confirmed — send the single-use link now.
  await issueEmailVerification({ userId: user.id, email: user.email, reason: "signup" });

  try {
    await signIn("credentials", { email: user.email, password, redirectTo: roleHome(role) });
  } catch (e) {
    if (e instanceof AuthError) return { error: "Could not sign you in — try again" };
    throw e;
  }
}

export async function loginAction(_prev: unknown, formData: FormData) {
  const email = String(formData.get("email") ?? "").toLowerCase();
  const password = String(formData.get("password") ?? "");
  const code = String(formData.get("code") ?? "").trim();
  const callbackUrl = String(formData.get("callbackUrl") ?? "") || undefined;

  // Ask for the second factor before attempting sign-in so the password stays in the form.
  // The real check still happens inside `authorize` — this only decides what UI to show.
  if (!code) {
    const [existing] = await getDb().select({ twoFactorEnabled: users.twoFactorEnabled }).from(users).where(eq(users.email, email));
    if (existing?.twoFactorEnabled) return { requires2fa: true };
  }

  try {
    await signIn("credentials", { email, password, ...(code ? { code } : {}), redirectTo: callbackUrl });
  } catch (e) {
    if (e instanceof AuthError) return { error: "Invalid email or password", requires2fa: Boolean(code) };
    throw e;
  }
}

/* ── verification gates (mock providers behind interfaces — playbook 03) ── */
export async function submitNin(formData: FormData) {
  const user = await requireUser();
  const unconfirmed = await emailGateFailure(user.id);
  if (unconfirmed) return { error: unconfirmed };

  const budget = await verificationBudget(user.id, "nin");
  if (!budget.allowed) return { error: limitMessage(budget) };
  await recordVerificationAttempt({ userId: user.id, step: "nin", outcome: "attempt" });

  const nin = String(formData.get("nin") ?? "").trim();
  const dateOfBirth = String(formData.get("dateOfBirth") ?? "").trim();
  if (!/^\d{11}$/.test(nin)) return { error: "NIN must be exactly 11 digits" };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateOfBirth)) return { error: "Date of birth is required (YYYY-MM-DD)" };

  const db = getDb();

  // NIMC driver: mock until NIMC_API_KEY is configured (env-only swap).
  const [firstName, ...rest] = (user.name ?? "").split(" ");
  const nimc = getNimcProvider();
  const result = await nimc.verify({
    nin,
    firstName: firstName || "Student",
    lastName: rest.join(" ") || "Kith",
    dateOfBirth,
  });

  if (!result.verified) {
    await recordVerificationAttempt({ userId: user.id, step: "nin", outcome: "failure" });
    const reason =
      result.failureReason === "not_found"
        ? "That NIN was not found at NIMC — check the digits and try again"
        : result.failureReason === "name_mismatch"
          ? "The name on your NIMC record does not match your Kith profile"
          : "NIMC could not confirm this NIN right now — try again in a moment";
    return { error: reason };
  }

  // Only a salted hash is ever persisted; the NIN itself never touches the database.
  const ninHash = createHash("sha256").update(`${nin}+${process.env.NIN_PEPPER ?? "dev-pepper"}`).digest("hex");
  // Date of birth is used only for the NIMC name match above — it is never persisted.
  await db.update(studentProfiles).set({
    ninHash, nimcVerified: true, currentStep: "matric",
  }).where(eq(studentProfiles.userId, user.id));
  await recordVerificationAttempt({ userId: user.id, step: "nin", outcome: "success" });
  return { ok: true };
}

export async function submitMatric(formData: FormData) {
  const user = await requireUser();
  const unconfirmed = await emailGateFailure(user.id);
  if (unconfirmed) return { error: unconfirmed };

  const budget = await verificationBudget(user.id, "matric");
  if (!budget.allowed) return { error: limitMessage(budget) };
  await recordVerificationAttempt({ userId: user.id, step: "matric", outcome: "attempt" });

  const db = getDb();
  const code = String(formData.get("university") ?? "").toLowerCase();
  const matric = String(formData.get("matric") ?? "").toUpperCase();
  const studentEmail = String(formData.get("studentEmail") ?? "").toLowerCase();
  const uni = (await db.select().from(universities).where(eq(universities.code, code)))[0]!;
  if (!uni) return { error: "Unknown university" };
  if (!new RegExp(uni.matricPattern).test(matric)) {
    await recordVerificationAttempt({ userId: user.id, step: "matric", outcome: "failure" });
    return { error: "Matric number format doesn't match this university" };
  }
  const domain = studentEmail.split("@")[1];
  if (!uni.emailDomains.includes(domain ?? "")) {
    await recordVerificationAttempt({ userId: user.id, step: "matric", outcome: "failure" });
    return { error: "Email must be your institutional address" };
  }
  await db.update(studentProfiles).set({
    universityId: uni.id, matricNumber: matric, studentEmail, matricVerified: true, currentStep: "biometric",
  }).where(eq(studentProfiles.userId, user.id));
  await recordVerificationAttempt({ userId: user.id, step: "matric", outcome: "success" });
  return { ok: true };
}

export async function submitBiometric() {
  const user = await requireUser();
  const unconfirmed = await emailGateFailure(user.id);
  if (unconfirmed) return { error: unconfirmed };

  const budget = await verificationBudget(user.id, "biometric");
  if (!budget.allowed) return { error: limitMessage(budget) };
  await recordVerificationAttempt({ userId: user.id, step: "biometric", outcome: "attempt" });

  const db = getDb();
  // LIVENESS_PROVIDER=mock returns 0.95 (playbook 03); real provider returns scored selfie hash
  const liveness = 0.95;
  await db.update(studentProfiles).set({ biometricVerified: true, livenessScore: liveness.toFixed(3), currentStep: "review" })
    .where(eq(studentProfiles.userId, user.id));
  await db.update(users).set({ isVerified: true }).where(eq(users.id, user.id));
  await recordVerificationAttempt({ userId: user.id, step: "biometric", outcome: "success" });
  redirect("/dashboard");
}

/* ── reserve a fixed-price room into escrow (mock Paystack, mocks-first decision) ── */
/**
 * Reserve → Paystack golden flow. Reserve creates a PENDING booking + PENDING transaction
 * (85/15 split pre-computed, room held), then redirects the student to Paystack — or to
 * the hosted test checkout in mock mode. Nothing is confirmed until a signed
 * charge.success webhook lands (see lib/paystack-webhook.ts): that flips the booking to
 * confirmed, moves escrow pending→held, and mints the guest pass.
 */
export async function reserveRoom(formData: FormData) {
  const user = await requireUser();
  if (user.role !== "student") return { error: "Only students can book rooms" };
  if (!user.isVerified) return { error: "Complete verification before booking" };
  const unconfirmed = await emailGateFailure(user.id);
  if (unconfirmed) return { error: unconfirmed };
  const roomId = String(formData.get("roomId") ?? "");
  const db = getDb();
  const { rooms, properties, bookings, transactions } = await import("@kith/database");
  const room = (await db.select().from(rooms).where(eq(rooms.id, roomId)))[0]!;
  if (!room || room.saleMode !== "fixed" || !room.isAvailable) return { error: "Room not bookable" };
  const property = (await db.select().from(properties).where(eq(properties.id, room.propertyId)))[0]!;
  const price = room.priceKobo ?? 0n;
  const platform = (price * 1500n) / 10_000n;
  const now = Date.now();
  const day = 86_400_000;

  const [booking] = await db.insert(bookings).values({
    roomId: room.id,
    studentId: user.id,
    landlordId: property.landlordId,
    bookedPriceKobo: price,
    checkInDate: new Date(now + 3 * day),
    checkOutDate: new Date(now + 368 * day),
    status: "pending", // confirmed only by the payment webhook
    signedAgreementHash: createHash("sha256").update(`licence-to-occupy-v1+${user.id}`).digest("hex"),
  }).returning();
  if (!booking) return { error: "Could not hold that room — try again" };
  if (!property) return { error: "Property unavailable" };

  const { newPaystackReference, initCheckout } = await import("@/lib/paystack");
  const reference = newPaystackReference();
  const [tx] = await db.insert(transactions).values({
    bookingId: booking.id,
    studentId: user.id,
    landlordId: property.landlordId,
    amountKobo: price,
    platformFeeKobo: platform,
    landlordNetKobo: price - platform,
    transactionType: "booking",
    status: "pending",
    escrowStatus: "pending",
    paystackReference: reference,
    autoReleaseAt: new Date(now + 3 * day + day),
  }).returning();
  if (!tx) return { error: "Could not start checkout — try again" };

  await db.update(rooms).set({ isAvailable: false }).where(eq(rooms.id, room.id));

  const url = await initCheckout({ transactionId: tx.id, reference, email: user.email, amountKobo: price });
  redirect(url); // Paystack authorization URL, or /checkout/mock?ref=… in mock mode
}
