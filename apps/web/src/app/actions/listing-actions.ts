"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import {
  getDb, properties, rooms, auctions, porterTasks, landlordProfiles, auditLogs,
} from "@kith/database";
import { TIERS, priceWithinBand, normalizeAmenities, type RoomTier } from "@kith/domain";
import { requireUser } from "@/lib/session";
import { emailGateFailure } from "@/lib/email-verification";
import { notifyUser } from "@/lib/providers/notify";

/**
 * LANDLORD LISTING CREATION.
 *
 * A listing is a promise the platform has to keep, so the rules are enforced here and not in
 * the form: the tier decides the sale mode, the tier's guide band bounds the price, an
 * auction floor cannot exceed its own band, and every new property starts UNVERIFIED and
 * with an open porter task. Nothing reaches "physically verified" without a porter standing
 * in the room.
 */

const naira = z.coerce.number().int().positive();
const listingSchema = z.object({
  title: z.string().min(4, "Give the property a real name").max(120),
  description: z.string().min(40, "Describe the property in at least a sentence or two").max(2000),
  address: z.string().min(6, "Street address is required").max(200),
  city: z.string().min(2).max(60),
  state: z.string().min(2).max(60),
  roomNumber: z.string().min(1).max(20),
  roomType: z.string().min(2).max(40),
  capacity: z.coerce.number().int().min(1).max(8),
  tier: z.enum(["circle", "market", "elite"]),
  priceNaira: naira,
  floorNaira: z.coerce.number().int().positive().optional(),
  incrementNaira: z.coerce.number().int().positive().optional(),
});

export type ListingState = { ok?: boolean; error?: string; propertyId?: string } | null;

export async function createListing(_prev: unknown, formData: FormData): Promise<ListingState> {
  const user = await requireUser();
  if (user.role !== "landlord") return { error: "Only landlords can list rooms" };

  const unconfirmed = await emailGateFailure(user.id);
  if (unconfirmed) return { error: unconfirmed };

  const parsed = listingSchema.safeParse(Object.fromEntries(formData));
  const amenityValues = formData.getAll("amenities").map(String);
  const amenities = normalizeAmenities(amenityValues.length ? amenityValues : [String(formData.get("amenities") ?? "")]);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Check the listing details" };
  const input = parsed.data;

  const db = getDb();
  const profile = (await db.select().from(landlordProfiles).where(eq(landlordProfiles.userId, user.id)))[0];
  if (!profile) return { error: "Landlord profile missing — contact support" };
  if (profile.kycStatus === "rejected") return { error: "Your landlord verification was rejected — contact support before listing" };

  const spec = TIERS[input.tier as RoomTier];
  const priceKobo = BigInt(input.priceNaira) * 100n;
  const band = `${spec.bandKobo[0] / 100n}–${spec.bandKobo[1] / 100n}`;

  if (!priceWithinBand(input.tier as RoomTier, priceKobo)) {
    return { error: `${spec.label} rooms must be priced within ₦${Number(spec.bandKobo[0]) / 100}–₦${Number(spec.bandKobo[1]) / 100}. Your price is ₦${input.priceNaira.toLocaleString("en-NG")}.` };
  }
  void band;

  const isAuction = spec.saleMode === "auction";
  const floorKobo = isAuction ? BigInt(input.floorNaira ?? input.priceNaira) * 100n : null;
  const incrementKobo = isAuction ? BigInt(input.incrementNaira ?? 1000) * 100n : null;

  if (isAuction && floorKobo && !priceWithinBand(input.tier as RoomTier, floorKobo)) {
    return { error: `An auction floor must stay inside the ${spec.label} band (₦${Number(spec.bandKobo[0]) / 100}–₦${Number(spec.bandKobo[1]) / 100}).` };
  }

  const [property] = await db.insert(properties).values({
    landlordId: user.id,
    title: input.title.trim(),
    description: input.description.trim(),
    address: input.address.trim(),
    city: input.city.trim(),
    state: input.state.trim(),
    country: "NG",
    amenities,
    isPhysicallyVerified: false,
  }).returning();
  if (!property) return { error: "Could not create the property — try again" };

  const [room] = await db.insert(rooms).values({
    propertyId: property.id,
    roomNumber: input.roomNumber.trim().toUpperCase(),
    roomType: input.roomType.trim(),
    capacity: input.capacity,
    tier: input.tier as RoomTier,
    saleMode: spec.saleMode,
    priceKobo: isAuction ? null : priceKobo,
    floorPriceKobo: isAuction ? floorKobo : null,
    minIncrementKobo: isAuction ? incrementKobo : null,
    isAvailable: true,
  }).returning();
  if (!room) return { error: "Could not create the room — try again" };

  // A Circle room is only sellable while an auction is running: open one immediately.
  let auctionEnds: Date | null = null;
  if (isAuction && floorKobo) {
    auctionEnds = new Date(Date.now() + 12 * 60 * 1000);
    await db.insert(auctions).values({
      roomId: room.id,
      landlordId: user.id,
      currentPriceKobo: floorKobo,
      floorPriceKobo: floorKobo,
      minIncrementKobo: incrementKobo ?? 100_000n,
      scheduledEndTime: auctionEnds,
      actualEndTime: auctionEnds,
      status: "active",
    });
  }

  // Nothing is "verified" on a landlord's word: a porter visit is queued at creation.
  await db.insert(porterTasks).values({
    type: "verify_property",
    propertyId: property.id,
    status: "open",
    notes: `New listing: ${input.title.trim()}`,
  });

  await db.insert(auditLogs).values({
    actorId: user.id,
    actionType: "create",
    targetResourceType: "property",
    targetResourceId: property.id,
    newValues: {
      title: property.title, city: property.city, tier: input.tier,
      saleMode: spec.saleMode, priceKobo: priceKobo.toString(), roomId: room.id,
    },
  });

  await notifyUser({
    userId: user.id,
    type: "listing_created",
    payload: { propertyId: property.id, roomId: room.id, tier: input.tier },
    message: auctionEnds
      ? `Kith: "${property.title}" is live — ${spec.label} auction opened at ₦${Number(floorKobo) / 100} and closes ${auctionEnds.toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" })}. A porter will visit to verify the property.`
      : `Kith: "${property.title}" is live at ₦${input.priceNaira.toLocaleString("en-NG")}. A porter will visit to verify the property.`,
    email: user.email,
    emailSubject: "Your listing is live — Kith",
  });

  revalidatePath("/landlord");
  revalidatePath("/rooms");
  revalidatePath("/admin");
  return { ok: true, propertyId: property.id };
}
