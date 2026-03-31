"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase-server";
import { getAuthenticatedUser } from "@/lib/auth-server";
import { checkMutationGuard } from "@/lib/mutation-utility";
import { recordAuditEntry } from "@/lib/services/audit-ledger";
import { trackAlphaEvent } from "@/lib/services/alpha-telemetry";
import { normalizeActionError } from "@/lib/error-normalization";
import type { Database, CareEventType, Json } from "@/types/database";
import type { ActionResult } from "@/app/actions/types";

type EventInsert = Database["public"]["Tables"]["specimen_events"]["Insert"];
export type EventRow = Database["public"]["Tables"]["specimen_events"]["Row"];

export interface LogBiologicalEventInput {
  specimen_id: string;
  event_type: CareEventType;
  notes?: string;
  source_type: "user" | "sensor" | "agent";
  confidence?: number;
  metadata?: Record<string, unknown>;
}

/**
 * The Event Collector (Phase 1)
 * Captures immutable lifecycle events for the Biological Intelligence System.
 */
export async function logBiologicalEvent(input: LogBiologicalEventInput): Promise<ActionResult<EventRow>> {
  const auth = await getAuthenticatedUser();

  if (!auth.success) {
    return { success: false, data: null, error: "Authentication required for biological logging." };
  }

  // Phase 1: Mutation Guard (Double-action protection)
  const guard = await checkMutationGuard(auth.data.id, `logEvent:${input.event_type}`, input);
  if (!guard.allowed) {
    return { success: false, data: null, error: guard.error || "Action restricted by system integrity guard." };
  }

  const supabase = createClient();

  const payload: EventInsert = {
    user_id: auth.data.id,
    specimen_id: input.specimen_id,
    event_type: input.event_type,
    notes: input.notes || null,
    source_type: input.source_type,
    confidence: input.confidence ?? 1.0,
    metadata: (input.metadata || {}) as Json,
    created_at: new Date().toISOString(),
    last_modified: new Date().toISOString(),
    last_action_type: "CREATE",
  };

  try {
    const { data: eventData, error: insertError } = await supabase
      .from("specimen_events")
      .insert(payload)
      .select("*")
      .single();

    if (insertError) {
      return { success: false, data: null, error: normalizeActionError(insertError).message };
    }

    const event = eventData as EventRow;

    // Phase 2: Audit Ledger anchoring
    await recordAuditEntry({
      action: "CREATE",
      target: "specimen_event",
      targetId: event.id,
      metadata: { 
        specimen_id: event.specimen_id,
        event_type: event.event_type,
        source: event.source_type
      },
      payload: event
    });

    // Track System Intelligence Event
    await trackAlphaEvent("biological_event_logged", { 
      id: event.id, 
      type: event.event_type, 
      specimen_id: event.specimen_id,
      source: input.source_type
    }, "/dashboard");

    revalidatePath("/dashboard");
    revalidatePath(`/specimens/${input.specimen_id}`);
    
    return { success: true, data: event, error: null };
  } catch (err) {
    console.error("[Biological Event Error]", err);
    return { success: false, data: null, error: "Critical failure in biological event ingestion." };
  }
}

/**
 * Retrieves the event timeline for a specimen.
 * Required for state projection.
 */
export async function getSpecimenTimeline(specimenId: string): Promise<ActionResult<EventRow[]>> {
  const auth = await getAuthenticatedUser();

  if (!auth.success) {
    return { success: false, data: null, error: "Authentication required." };
  }

  const supabase = createClient();

  try {
    const { data, error: fetchError } = await supabase
      .from("specimen_events")
      .select("*")
      .eq("specimen_id", specimenId)
      .eq("user_id", auth.data.id)
      .order("created_at", { ascending: false });

    if (fetchError) {
      return { success: false, data: null, error: normalizeActionError(fetchError).message };
    }

    return { success: true, data: (data ?? []) as EventRow[], error: null };
  } catch (err) {
    console.error("[Timeline Fetch Error]", err);
    return { success: false, data: null, error: "Unable to retrieve biological timeline." };
  }
}
