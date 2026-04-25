"use server";

import { getAuthenticatedUser } from "@/lib/auth-server";
import { createClient } from "@/lib/supabase-server";
import type { Json } from "@/types/database";

export type ProjectEventType = 
  | "sign_up"
  | "sign_in"
  | "specimen_created"
  | "specimen_image_uploaded"
  | "task_created"
  | "task_completed"
  | "ai_diagnosis_run"
  | "biological_event_logged"
  | "agent_proposal_submitted"
  | "agent_proposal_accepted"
  | "sensor_calibrated"
  | "system_error";

export async function trackAlphaEvent(
  eventType: ProjectEventType,
  metadata: Record<string, unknown> = {},
  route?: string
) {
  const auth = await getAuthenticatedUser();
  const userId = auth.success ? auth.data.id : null;

  const supabase = createClient();

  try {
    const { error } = await supabase.from("alpha_events").insert({
      user_id: userId,
      event_type: eventType,
      metadata: metadata as Json,
      route: route || null,
    });

    if (error) {
      // Log carefully but don't throw; we don't want telemetry to block core app flow
      console.warn("[Telemetry Warning] alpha_events insert failed:", error.message);
      if (error.code === '42P01') {
        console.warn("[Compliance Note] alpha_events table missing on remote. Institutional Audit Ledger will use local state.");
      }
    }
  } catch (err) {
    console.error("[Telemetry Exception] Silent failure in trackAlphaEvent:", err);
  }
}
