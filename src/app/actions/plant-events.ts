"use server";

import { revalidatePath } from "next/cache";
import type { Database, CareEventType } from "@/types/database";
import type { ActionResult } from "@/app/actions/types";
import { getAuthenticatedUser } from "@/lib/auth-server";
import { createServerSupabaseClient } from "@/lib/supabase-server";

type PlantEventInsert = Database["public"]["Tables"]["plant_events"]["Insert"];
type PlantEventRow = Database["public"]["Tables"]["plant_events"]["Row"];

type PlantOwnershipCheckResult =
  | { ok: true }
  | { ok: false; error: string };

async function verifyPlantOwnership(
  supabase: ReturnType<typeof createServerSupabaseClient>,
  userId: string,
  plantId: string,
): Promise<PlantOwnershipCheckResult> {
  const { data: plant, error } = await supabase
    .from("plants")
    .select("id")
    .eq("id", plantId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error("Error verifying plant event ownership:", error);
    return { ok: false, error: "Unable to verify plant ownership." };
  }

  if (!plant) {
    return { ok: false, error: "Plant not found or not owned by the current user." };
  }

  return { ok: true };
}

export interface AddPlantEventInput {
  plant_id: string;
  event_type: CareEventType;
  notes?: string;
}

export async function addPlantEvent(data: AddPlantEventInput): Promise<ActionResult<PlantEventRow>> {
  const auth = await getAuthenticatedUser();

  if (!auth.success) {
    return { success: false, data: null, error: "Not signed in" };
  }

  if (!data.plant_id.trim()) {
    return { success: false, data: null, error: "Invalid plant id." };
  }

  const supabase = createServerSupabaseClient();

  const ownership = await verifyPlantOwnership(supabase, auth.data.id, data.plant_id);

  if (!ownership.ok) {
    return { success: false, data: null, error: ownership.error };
  }

  const payload: PlantEventInsert = {
    user_id: auth.data.id,
    plant_id: data.plant_id,
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
      console.error("Error adding plant event:", error);
      return { success: false, data: null, error: error.message };
    }

    revalidatePath("/dashboard");
    revalidatePath(`/plants/${data.plant_id}`);
    return { success: true, data: event as PlantEventRow, error: null };
  } catch (error) {
    console.error("Unexpected error:", error);
    return { success: false, data: null, error: "Failed to add care event" };
  }
}

export async function getPlantEvents(plantId: string): Promise<ActionResult<PlantEventRow[]>> {
  const auth = await getAuthenticatedUser();

  if (!auth.success) {
    return { success: false, data: null, error: "Not signed in" };
  }

  const supabase = createServerSupabaseClient();

  try {
    const { data: events, error } = await supabase
      .from("plant_events")
      .select("id, user_id, plant_id, event_type, notes, created_at")
      .eq("plant_id", plantId)
      .eq("user_id", auth.data.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching plant events:", error);
      return { success: false, data: null, error: error.message };
    }

    return { success: true, data: (events ?? []) as PlantEventRow[], error: null };
  } catch (error) {
    console.error("Unexpected error:", error);
    return { success: false, data: null, error: "Failed to fetch care events" };
  }
}
