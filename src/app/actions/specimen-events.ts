"use server";

import { revalidatePath } from "next/cache";
import type { Database } from "@/types/database";
import type { ActionResult } from "@/app/actions/types";
import { getAuthenticatedUser } from "@/lib/auth-server";
import { createClient } from "@/lib/supabase-server";
import { checkMutationGuard } from "@/lib/mutation-utility";
import { normalizeActionError } from "@/lib/error-normalization";

type SpecimenEventRow = Database["public"]["Tables"]["specimen_events"]["Row"];
type SpecimenEventInsert = Database["public"]["Tables"]["specimen_events"]["Insert"];
type SpecimenEventUpdate = Database["public"]["Tables"]["specimen_events"]["Update"];

async function verifySpecimenOwnership(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  specimenId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const { data: specimen, error } = await supabase
    .from("specimens")
    .select("id")
    .eq("id", specimenId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    return { ok: false, error: "Unable to verify specimen ownership." };
  }

  if (!specimen) {
    return { ok: false, error: "Specimen not found or access denied." };
  }

  return { ok: true };
}

export async function addSpecimenEvent(
  specimenId: string,
  data: Partial<SpecimenEventInsert>,
): Promise<ActionResult<SpecimenEventRow>> {
  const auth = await getAuthenticatedUser();

  if (!auth.success) {
    return { success: false, data: null, error: "Authentication required." };
  }

  // Phase 1: Mutation Guard
  const guard = await checkMutationGuard(auth.data.id, "addSpecimenEvent", { specimenId, ...data });
  if (!guard.allowed) {
    return { success: false, data: null, error: guard.error || "Action restricted." };
  }

  if (!specimenId.trim()) {
    return { success: false, data: null, error: "Invalid specimen id." };
  }

  const supabase = createClient();
  const ownership = await verifySpecimenOwnership(supabase, auth.data.id, specimenId);

  if (!ownership.ok) {
    return { success: false, data: null, error: ownership.ok ? "" : ownership.error };
  }

  const payload: SpecimenEventInsert = {
    user_id: auth.data.id,
    specimen_id: specimenId,
    event_type: data.event_type || "observation",
    notes: data.notes?.trim() || null,
    created_at: new Date().toISOString(),
    last_modified: new Date().toISOString(),
    last_action_type: "CREATE",
  };

  try {
    const { data: event, error } = await supabase
      .from("specimen_events")
      .insert(payload)
      .select()
      .single();

    if (error) {
      return { success: false, data: null, error: normalizeActionError(error).message };
    }

    revalidatePath(`/plants/${specimenId}`);
    return { success: true, data: event as SpecimenEventRow, error: null };
  } catch (err) {
    return { success: false, data: null, error: normalizeActionError(err).message };
  }
}

export async function getSpecimenEvents(specimenId: string): Promise<ActionResult<SpecimenEventRow[]>> {
  const auth = await getAuthenticatedUser();

  if (!auth.success) {
    return { success: false, data: null, error: "Authentication required." };
  }

  if (!specimenId.trim()) {
    return { success: false, data: null, error: "Invalid specimen id." };
  }

  const supabase = createClient();

  try {
    const { data, error } = await supabase
      .from("specimen_events")
      .select("*")
      .eq("specimen_id", specimenId)
      .eq("user_id", auth.data.id)
      .order("created_at", { ascending: false });

    if (error) {
      return { success: false, data: null, error: normalizeActionError(error).message };
    }

    return { success: true, data: (data ?? []) as SpecimenEventRow[], error: null };
  } catch (err) {
    return { success: false, data: null, error: normalizeActionError(err).message };
  }
}

export async function updateSpecimenEvent(
  eventId: string,
  specimenId: string,
  data: Partial<SpecimenEventUpdate>,
): Promise<ActionResult<SpecimenEventRow>> {
  const auth = await getAuthenticatedUser();

  if (!auth.success) {
    return { success: false, data: null, error: "Authentication required." };
  }

  // Phase 1: Mutation Guard
  const guard = await checkMutationGuard(auth.data.id, "updateSpecimenEvent", { eventId, specimenId, data });
  if (!guard.allowed) {
    return { success: false, data: null, error: guard.error || "Action restricted." };
  }

  if (!eventId.trim() || !specimenId.trim()) {
    return { success: false, data: null, error: "Invalid event update request." };
  }

  const supabase = createClient();
  const ownership = await verifySpecimenOwnership(supabase, auth.data.id, specimenId);

  if (!ownership.ok) {
    return { success: false, data: null, error: ownership.error };
  }

  const payload: SpecimenEventUpdate = {
    ...data,
    last_modified: new Date().toISOString(),
    last_action_type: "UPDATE",
  };

  try {
    const { data: updatedEvent, error } = await supabase
      .from("specimen_events")
      .update(payload)
      .eq("id", eventId)
      .eq("specimen_id", specimenId)
      .eq("user_id", auth.data.id)
      .select()
      .maybeSingle();

    if (error) {
      return { success: false, data: null, error: normalizeActionError(error).message };
    }

    if (!updatedEvent) {
      return { success: false, data: null, error: "Event not found or unauthorized access." };
    }

    revalidatePath(`/plants/${specimenId}`);
    return { success: true, data: updatedEvent as SpecimenEventRow, error: null };
  } catch (err) {
    return { success: false, data: null, error: normalizeActionError(err).message };
  }
}

export async function deleteSpecimenEvent(
  eventId: string,
  specimenId: string,
): Promise<ActionResult<null>> {
  const auth = await getAuthenticatedUser();

  if (!auth.success) {
    return { success: false, data: null, error: "Authentication required." };
  }

  if (!eventId.trim() || !specimenId.trim()) {
    return { success: false, data: null, error: "Invalid delete request." };
  }

  const supabase = createClient();

  try {
    const { error } = await supabase
      .from("specimen_events")
      .delete()
      .eq("id", eventId)
      .eq("specimen_id", specimenId)
      .eq("user_id", auth.data.id);

    if (error) {
      return { success: false, data: null, error: normalizeActionError(error).message };
    }

    revalidatePath(`/plants/${specimenId}`);
    return { success: true, data: null, error: null };
  } catch (err) {
    return { success: false, data: null, error: normalizeActionError(err).message };
  }
}
