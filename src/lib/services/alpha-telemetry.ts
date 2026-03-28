"use server";

import { createClient } from "@/lib/supabase-server";
import { getAuthenticatedUser } from "@/lib/auth-server";
import { normalizeActionError } from "@/lib/error-normalization";
import type { Json } from "@/types/database";

export type ProjectEventType = 
  | "sign_up"
  | "sign_in"
  | "specimen_created"
  | "specimen_image_uploaded"
  | "task_created"
  | "task_completed"
  | "ai_diagnosis_run"
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
      console.error("[Telemetry Error]", normalizeActionError(error).message);
    }
  } catch (err) {
    console.error("[Telemetry Exception]", err);
  }
}
