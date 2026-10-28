"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/session";
import {
  MaintenanceError, acknowledgeTicket, raiseTicket, resolveTicket, type MaintenanceCategory,
} from "@/lib/maintenance";

export type MaintenanceState = { ok?: boolean; error?: string } | null;

function categoryOf(value: unknown): MaintenanceCategory {
  const allowed: MaintenanceCategory[] = ["security", "plumbing", "electrical", "structural", "pest", "other"];
  return allowed.includes(value as MaintenanceCategory) ? (value as MaintenanceCategory) : "other";
}

export async function raiseTicketAction(_prev: MaintenanceState, formData: FormData): Promise<MaintenanceState> {
  const user = await requireUser();
  if (user.role !== "student") return { error: "Only students can report maintenance" };
  const bookingId = String(formData.get("bookingId") ?? "");
  const description = String(formData.get("description") ?? "").trim();
  const photoIds = String(formData.get("photoIds") ?? "").split(",").map((s) => s.trim()).filter(Boolean);

  try {
    await raiseTicket({ studentId: user.id, bookingId, category: categoryOf(formData.get("category")), description, photoIds });
    revalidatePath("/dashboard");
    revalidatePath("/landlord");
    return { ok: true };
  } catch (e) {
    return { error: e instanceof MaintenanceError ? e.message : "Could not open the ticket" };
  }
}

export async function acknowledgeTicketAction(_prev: MaintenanceState, formData: FormData): Promise<MaintenanceState> {
  const user = await requireUser();
  if (user.role !== "landlord") return { error: "Landlord account required" };
  try {
    await acknowledgeTicket({ ticketId: String(formData.get("ticketId") ?? ""), landlordId: user.id });
    revalidatePath("/landlord");
    return { ok: true };
  } catch (e) {
    return { error: e instanceof MaintenanceError ? e.message : "Could not update the ticket" };
  }
}

export async function resolveTicketAction(_prev: MaintenanceState, formData: FormData): Promise<MaintenanceState> {
  const user = await requireUser();
  if (user.role !== "landlord") return { error: "Landlord account required" };
  const note = String(formData.get("note") ?? "").trim();
  if (note.length < 4) return { error: "Say what was done so the tenant has a record" };
  try {
    await resolveTicket({ ticketId: String(formData.get("ticketId") ?? ""), landlordId: user.id, note });
    revalidatePath("/landlord");
    return { ok: true };
  } catch (e) {
    return { error: e instanceof MaintenanceError ? e.message : "Could not resolve the ticket" };
  }
}
