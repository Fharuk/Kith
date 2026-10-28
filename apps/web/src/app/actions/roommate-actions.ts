"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { getDb, roommateProfiles, studentProfiles } from "@kith/database";
import { requireUser } from "@/lib/session";

const profileSchema = z.object({
  budgetMinNaira: z.coerce.number().int().min(20_000).max(2_000_000),
  budgetMaxNaira: z.coerce.number().int().min(20_000).max(2_000_000),
  gender: z.enum(["female", "male", "other", "prefer_not_to_say"]).optional(),
  genderPreference: z.enum(["any", "female", "male"]).default("any"),
  sleepSchedule: z.enum(["early_bird", "night_owl", "flexible"]).default("flexible"),
  cleanliness: z.coerce.number().int().min(1).max(5).default(3),
  smoker: z.coerce.boolean().default(false),
  guests: z.enum(["never", "sometimes", "often"]).default("sometimes"),
  course: z.string().max(80).optional(),
  bio: z.string().max(600).optional(),
});

export type RoommateState = { ok?: boolean; error?: string } | null;

export async function saveRoommateProfile(_prev: RoommateState, formData: FormData): Promise<RoommateState> {
  const user = await requireUser();
  if (user.role !== "student") return { error: "Roommate matching is for student accounts" };

  const parsed = profileSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Check the form" };
  const v = parsed.data;
  if (v.budgetMinNaira > v.budgetMaxNaira) return { error: "Minimum budget cannot exceed the maximum" };

  const db = getDb();
  const [student] = await db.select({ universityId: studentProfiles.universityId }).from(studentProfiles).where(eq(studentProfiles.userId, user.id));
  const values = {
    userId: user.id,
    universityId: student?.universityId ?? null,
    budgetMinKobo: BigInt(v.budgetMinNaira) * 100n,
    budgetMaxKobo: BigInt(v.budgetMaxNaira) * 100n,
    gender: v.gender ?? null,
    genderPreference: v.genderPreference,
    sleepSchedule: v.sleepSchedule,
    cleanliness: v.cleanliness,
    smoker: v.smoker,
    guests: v.guests,
    course: v.course || null,
    bio: v.bio || null,
    updatedAt: new Date(),
  };

  const [existing] = await db.select({ id: roommateProfiles.id }).from(roommateProfiles).where(eq(roommateProfiles.userId, user.id));
  if (existing) {
    await db.update(roommateProfiles).set(values).where(eq(roommateProfiles.userId, user.id));
  } else {
    await db.insert(roommateProfiles).values(values);
  }
  revalidatePath("/roommates");
  return { ok: true };
}

export async function setLooking(formData: FormData): Promise<void> {
  const user = await requireUser();
  const looking = formData.get("looking") === "true";
  await getDb().update(roommateProfiles).set({ looking, updatedAt: new Date() }).where(eq(roommateProfiles.userId, user.id));
  revalidatePath("/roommates");
}
