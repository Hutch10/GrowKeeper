"use server";

import { revalidatePath } from "next/cache";
import type { Database, CareEventType } from "@/types/database";
import type { ActionResult, SpecimenEventRow } from "@/app/actions/types";
import { getAuthenticatedUser } from "@/lib/auth-server";
import { createClient } from "@/lib/supabase-server";
import { GUEST_ID } from "./shared-memory";

type SpecimenEventInsert = Database["public"]["Tables"]["plant_events"]["Insert"];

type SpecimenOwnershipCheckResult =
  | { ok: true }
  | { ok: false; error: string };

async function verifySpecimenOwnership(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  specimenId: string,
): Promise<SpecimenOwnershipCheckResult> {
  if (userId === GUEST_ID) return { ok: true };

  const { data: specimen, error } = await supabase
    .from("plants")
    .select("id")
    .eq("id", specimenId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error("Error verifying specimen event ownership:", error);
    return { ok: false, error: "Unable to verify specimen ownership." };
  }

  if (!specimen) {
    return { ok: false, error: "Specimen not found or not owned by the current user." };
  }

  return { ok: true };
}

import { z } from "zod";

const addSpecimenEventSchema = z.object({
  specimen_id: z.string().uuid().or(z.string().startsWith("guest-specimen-")),
  event_type: z.enum(["Watering", "Fertilizing", "Pruning", "Repotting", "Misting", "Other"]),
  notes: z.string().max(1000).optional().nullable(),
});

export interface AddSpecimenEventInput {
  specimen_id: string;
  event_type: CareEventType;
  notes?: string;
}

export async function addSpecimenEvent(data: AddSpecimenEventInput): Promise<ActionResult<SpecimenEventRow>> {
  const validated = addSpecimenEventSchema.safeParse(data);
  if (!validated.success) {
    return { success: false, data: null, error: validated.error.issues[0].message };
  }
  const auth = await getAuthenticatedUser();

  if (!auth.success) {
    return { success: false, data: null, error: "Not signed in" };
  }

  const supabase = createClient();
  const ownership = await verifySpecimenOwnership(supabase, auth.data.id, data.specimen_id);

  if (!ownership.ok) {
    return { success: false, data: null, error: ownership.error };
  }

  const payload: SpecimenEventInsert = {
    user_id: auth.data.id,
    plant_id: data.specimen_id, // SQL column remains plant_id
    event_type: data.event_type,
    notes: data.notes?.trim() || null,
  };

  try {
    const { data: event, error } = await supabase
      .from("plant_events")
      .insert(payload)
      .select()
      .single();

    if (error) {
      console.error("Error adding specimen event:", error);
      return { success: false, data: null, error: error.message };
    }

    revalidatePath("/dashboard");
    revalidatePath(`/plants/${data.specimen_id}`);
    return { success: true, data: event as SpecimenEventRow, error: null };
  } catch (error) {
    console.error("Unexpected error:", error);
    return { success: false, data: null, error: "Failed to add care event" };
  }
}

export async function getSpecimenEvents(specimenId: string): Promise<ActionResult<SpecimenEventRow[]>> {
  const auth = await getAuthenticatedUser();

  if (!auth.success) {
    return { success: false, data: null, error: "Not signed in" };
  }

  const supabase = createClient();

  try {
    const { data: events, error } = await supabase
      .from("plant_events")
      .select("id, user_id, plant_id, event_type, notes, created_at")
      .eq("plant_id", specimenId)
      .eq("user_id", auth.data.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching specimen events:", error);
      return { success: false, data: null, error: error.message };
    }

    return { success: true, data: (events ?? []) as unknown as SpecimenEventRow[], error: null };
  } catch (error) {
    console.error("Unexpected error:", error);
    return { success: false, data: null, error: "Failed to fetch care events" };
  }
}

export async function deleteSpecimenEvent(eventId: string, specimenId: string): Promise<ActionResult<null>> {
  const auth = await getAuthenticatedUser();

  if (!auth.success) {
    return { success: false, data: null, error: "Not signed in" };
  }

  const supabase = createClient();
  const ownership = await verifySpecimenOwnership(supabase, auth.data.id, specimenId);

  if (!ownership.ok) {
    return { success: false, data: null, error: ownership.error };
  }

  try {
    const { error } = await supabase
      .from("plant_events")
      .delete()
      .eq("id", eventId)
      .eq("user_id", auth.data.id)
      .eq("plant_id", specimenId);

    if (error) {
      console.error("Error deleting specimen event:", error);
      return { success: false, data: null, error: error.message };
    }

    revalidatePath("/dashboard");
    revalidatePath(`/plants/${specimenId}`);
    return { success: true, data: null, error: null };
  } catch (error) {
    console.error("Unexpected error:", error);
    return { success: false, data: null, error: "Failed to delete care event" };
  }
}

export async function updateSpecimenEvent(
  eventId: string,
  specimenId: string,
  data: Partial<AddSpecimenEventInput>,
): Promise<ActionResult<SpecimenEventRow>> {
  const auth = await getAuthenticatedUser();

  if (!auth.success) {
    return { success: false, data: null, error: "Not signed in" };
  }

  const supabase = createClient();
  const ownership = await verifySpecimenOwnership(supabase, auth.data.id, specimenId);

  if (!ownership.ok) {
    return { success: false, data: null, error: ownership.error };
  }

  try {
    const { data: event, error } = await supabase
      .from("plant_events")
      .update({
        event_type: data.event_type,
        notes: data.notes?.trim() || null,
      })
      .eq("id", eventId)
      .eq("user_id", auth.data.id)
      .eq("plant_id", specimenId)
      .select()
      .single();

    if (error) {
      console.error("Error updating specimen event:", error);
      return { success: false, data: null, error: error.message };
    }

    revalidatePath("/dashboard");
    revalidatePath(`/plants/${specimenId}`);
    return { success: true, data: event as SpecimenEventRow, error: null };
  } catch (error) {
    console.error("Unexpected error:", error);
    return { success: false, data: null, error: "Failed to update care event" };
  }
}
