import { eq } from "drizzle-orm";
import { createHash } from "node:crypto";
import { getDb, runMigrations, hashPassword, generatePseudonymizedId } from "./index";
import * as s from "./schema";

const DEMO_PASSWORD = "demo1234";
const day = 86_400_000;

async function main() {
  await runMigrations();
  const db = getDb();

  const existing = await db.select().from(s.users).limit(1);
  if (existing.length > 0) {
    console.log("[seed] database already seeded — skipping");
    return;
  }

  const hash = await hashPassword(DEMO_PASSWORD);

  /* universities */
  const [funaab] = await db.insert(s.universities).values({
    code: "funaab", name: "Federal University of Agriculture, Abeokuta", city: "Abeokuta",
    emailDomains: ["funaab.edu.ng", "stu.funaab.edu.ng"], matricPattern: "^U\\d{2}/[A-Z]{2,5}/\\d{3,4}$",
  }).returning();
  const [unilag] = await db.insert(s.universities).values({
    code: "unilag", name: "University of Lagos", city: "Lagos",
    emailDomains: ["stu.unilag.edu.ng", "unilag.edu.ng"], matricPattern: "^\\d{2}[A-Z]{2,5}\\d{4,7}$",
  }).returning();

  /* users */
  const mk = async (role: s.User["role"], email: string, firstName: string, lastName: string) =>
    (await db.insert(s.users).values({
      role, email, firstName, lastName, phone: "08012345678",
      passwordHash: hash, pseudonymizedId: generatePseudonymizedId(),
      isVerified: role !== "student" ? true : true,
    }).returning())[0];

  const student = await mk("student", "student@demo.kith.ng", "Adunola", "Okafor");
  const landlord = await mk("landlord", "landlord@demo.kith.ng", "Alhaji", "Balogun");
  const porter = await mk("porter", "porter@demo.kith.ng", "Emeka", "Nwosu");
  const admin = await mk("admin", "admin@demo.kith.ng", "Kith", "Admin");

  await db.insert(s.studentProfiles).values({
    userId: student.id, universityId: funaab.id, matricNumber: "U22/AGR/001",
    studentEmail: "okaforadunola@stu.funaab.edu.ng", level: "400", faculty: "Agriculture",
    ninHash: createHash("sha256").update("12345678901+demo-pepper").digest("hex"),
    nimcVerified: true, matricVerified: true, biometricVerified: true,
    livenessScore: "0.950", currentStep: "review",
  });
  await db.insert(s.landlordProfiles).values({
    userId: landlord.id, businessName: "Balogun Estates", cacNumber: "RC-1234567", kycStatus: "approved",
  });
  await db.insert(s.porterProfiles).values({ userId: porter.id, zone: "UNILAG — Akoka", campusCode: "unilag" });

  /* properties + rooms */
  const p1 = (await db.insert(s.properties).values({
    landlordId: landlord.id, title: "Freedom Hall Residences",
    description: "Purpose-built student blocks five minutes from the FUNAAB main gate, with 24h security and a dedicated study floor.",
    address: "12 Alabata Road", city: "Abeokuta", state: "Ogun",
    isPhysicallyVerified: true, verifiedByPorterId: porter.id, verifiedAt: new Date(Date.now() - 12 * day),
    amenities: ["WiFi", "Security", "Generator", "Laundry"],
  }).returning())[0];
  const p2 = (await db.insert(s.properties).values({
    landlordId: landlord.id, title: "Akoka Grove Suites",
    description: "Quiet serviced suites behind UNILAG's Akoka campus, walking distance to the faculty of science.",
    address: "4 Grove Close, Akoka", city: "Lagos", state: "Lagos",
    isPhysicallyVerified: true, verifiedByPorterId: porter.id, verifiedAt: new Date(Date.now() - 8 * day),
    amenities: ["WiFi", "AC", "Kitchen", "Security", "Parking"],
  }).returning())[0];
  const p3 = (await db.insert(s.properties).values({
    landlordId: landlord.id, title: "Palm Court Studios",
    description: "Elite concierge studios with gym, pool and guaranteed power — for students who want hotel-grade calm.",
    address: "22 Palm Avenue, Yaba", city: "Lagos", state: "Lagos",
    isPhysicallyVerified: true, verifiedByPorterId: porter.id, verifiedAt: new Date(Date.now() - 3 * day),
    amenities: ["WiFi", "AC", "Gym", "Pool", "Security"],
  }).returning())[0];

  const room = async (propertyId: string, roomNumber: string, roomType: string, tier: s.Room["tier"],
    saleMode: s.Room["sale_mode"], priceKobo: bigint | null, floor: bigint | null, inc: bigint | null, capacity = 1) =>
    (await db.insert(s.rooms).values({
      propertyId, roomNumber, roomType, capacity, tier, saleMode, priceKobo, floorPriceKobo: floor, minIncrementKobo: inc,
    }).returning())[0];

  const rCircle1 = await room(p1.id, "R-101", "Single self-contain", "circle", "auction", null, 4_500_000n, 50_000n);
  await room(p1.id, "R-102", "Single self-contain", "market", "fixed", 7_500_000n, null, null);
  const rCircle2 = await room(p2.id, "R-201", "Room & parlour", "circle", "auction", null, 5_000_000n, 50_000n, 2);
  await room(p2.id, "R-202", "Single self-contain", "market", "fixed", 9_000_000n, null, null);
  await room(p3.id, "R-301", "Executive studio", "elite", "fixed", 15_000_000n, null, null);
  await room(p3.id, "R-302", "Executive studio (pool view)", "elite", "fixed", 17_500_000n, null, null);

  /* media (webp, served from apps/web/public/img) */
  const mediaRows = [
    { ownerType: "property", ownerId: p1.id, url: "/img/hero-campus.webp", alt: "Freedom Hall courtyard" },
    { ownerType: "property", ownerId: p2.id, url: "/img/room-market.webp", alt: "Akoka Grove suite interior" },
    { ownerType: "property", ownerId: p3.id, url: "/img/room-elite.webp", alt: "Palm Court studio interior" },
    { ownerType: "room", ownerId: rCircle1.id, url: "/img/hero-campus.webp", alt: "R-101 block exterior" },
    { ownerType: "room", ownerId: rCircle2.id, url: "/img/room-market.webp", alt: "R-201 interior" },
  ];
  await db.insert(s.media).values(mediaRows.map((m, i) => ({ ...m, format: "webp", sort: i })));

  /* live auction on a Circle room */
  const now = Date.now();
  await db.insert(s.auctions).values({
    roomId: rCircle1.id, landlordId: landlord.id,
    currentPriceKobo: 5_000_000n, floorPriceKobo: 4_500_000n, minIncrementKobo: 50_000n,
    scheduledEndTime: new Date(now + 45 * 60_000), actualEndTime: new Date(now + 45 * 60_000),
    status: "active", totalBids: 0,
  });

  /* confirmed booking + guest pass + escrowed transaction for the demo student */
  const [booking] = await db.insert(s.bookings).values({
    roomId: (await db.select().from(s.rooms).where(eq(s.rooms.roomNumber, "R-202")))[0].id,
    studentId: student.id, landlordId: landlord.id,
    bookedPriceKobo: 9_000_000n,
    checkInDate: new Date(now + 3 * day), checkOutDate: new Date(now + 368 * day),
    status: "confirmed",
    signedAgreementHash: createHash("sha256").update("licence-to-occupy-v1+demo").digest("hex"),
  }).returning();

  await db.insert(s.guestPasses).values({
    bookingId: booking.id,
    codeHash: createHash("sha256").update("rotating-demo-code").digest("hex"),
    totpSecretEnc: "enc:demo-secret",
    expiresAt: new Date(now + 368 * day),
  });

  await db.insert(s.transactions).values({
    bookingId: booking.id, studentId: student.id, landlordId: landlord.id,
    amountKobo: 9_000_000n, platformFeeKobo: 1_350_000n, landlordNetKobo: 7_650_000n,
    transactionType: "booking", status: "completed", escrowStatus: "held",
    paystackReference: "KTH-DEMO-0001", autoReleaseAt: new Date(now + 3 * day + day),
  });

  /* porter work queue */
  await db.insert(s.porterTasks).values([
    { type: "check_in", porterId: porter.id, bookingId: booking.id, status: "assigned" },
    { type: "verify_property", porterId: porter.id, propertyId: p3.id, status: "done", completedAt: new Date(now - 3 * day) },
  ]);

  /* notifications + audit trail */
  await db.insert(s.notifications).values([
    { userId: student.id, channel: "in_app", type: "booking_confirmed", payload: { bookingId: booking.id } },
    { userId: student.id, channel: "email", type: "verification_complete", payload: {} },
    { userId: landlord.id, channel: "in_app", type: "escrow_held", payload: { amountKobo: "9000000" } },
  ]);
  await db.insert(s.auditLogs).values({
    actorId: admin.id, actionType: "approve", targetResourceType: "landlord_kyc",
    targetResourceId: landlord.id, newValues: { kycStatus: "approved" },
  });

  console.log("[seed] done — demo logins: student@ / landlord@ / porter@ / admin@demo.kith.ng · password", DEMO_PASSWORD);
}

main().catch((e) => {
  console.error("[seed] failed", e);
  process.exit(1);
});
