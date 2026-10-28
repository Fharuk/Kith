"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/session";
import { createInspectionReport } from "@/lib/inspection";
import { INSPECTION_CHECKLIST, type ChecklistAnswers } from "@/lib/inspection-checklist";

export type InspectionState = { ok?: boolean; slug?: string; score?: number; error?: string } | null;

/**
 * Porter-side submission. Every checklist key is read from the form, so an unchecked box is a
 * recorded "no" rather than a missing answer — a report must be complete to be worth sharing.
 */
export async function submitInspection(_prev: InspectionState, formData: FormData): Promise<InspectionState> {
  const user = await requireUser();
  if (user.role !== "porter" && user.role !== "admin") return { error: "Only porters can file a report" };

  const taskId = String(formData.get("taskId") ?? "");
  if (!/^[0-9a-f-]{36}$/.test(taskId)) return { error: "Missing task" };

  const notes = String(formData.get("notes") ?? "").trim();
  const answers: ChecklistAnswers = {};
  for (const item of INSPECTION_CHECKLIST) {
    const note = String(formData.get(`note_${item.key}`) ?? "").trim();
    answers[item.key] = {
      ok: formData.get(`item_${item.key}`) === "on",
      ...(note ? { note } : {}),
    };
  }

  const photoIds = String(formData.get("photoIds") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const lat = formData.get("gpsLat");
  const lng = formData.get("gpsLng");
  const gps =
    typeof lat === "string" && typeof lng === "string" && lat && lng
      ? { lat: Number(lat), lng: Number(lng) }
      : null;

  try {
    const report = await createInspectionReport({
      taskId,
      porterId: user.id,
      answers,
      notes,
      photoIds,
      gps: gps && Number.isFinite(gps.lat) && Number.isFinite(gps.lng) ? gps : null,
    });
    revalidatePath("/porter");
    revalidatePath(`/reports/${report.slug}`);
    return { ok: true, slug: report.slug, score: report.score };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Could not file the report" };
  }
}
