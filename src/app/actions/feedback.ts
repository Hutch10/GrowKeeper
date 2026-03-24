"use server";

import { createClient } from "@/lib/supabase-server";
import { getAuthenticatedUser } from "@/lib/auth-server";
import { checkMutationGuard } from "@/lib/mutation-utility";
import { normalizeActionError } from "@/lib/error-normalization";

import { ActionResult } from "@/app/actions/types";

export interface FeedbackInput {
  route: string;
  action?: string;
  note: string;
  errorContext?: string;
}

export async function sendFeedback(data: FeedbackInput): Promise<ActionResult<null>> {
  const auth = await getAuthenticatedUser();
  if (!auth.success) {
    return { success: false, data: null, error: "Authentication required to send feedback." };
  }

  // Phase 1: Mutation Guard (Spam Protection)
  const guard = await checkMutationGuard(auth.data.id, "sendFeedback", data);
  if (!guard.allowed) {
    return { success: false, data: null, error: guard.error || "Action restricted." };
  }

  const supabase = createClient();
  
  const payload = {
    user_id: auth.data.id,
    route: data.route,
    action_attempted: data.action,
    content: data.note,
    error_context: data.errorContext,
    created_at: new Date().toISOString(),
  };

  try {
    const { error } = await supabase
      .from("tester_feedback")
      .insert(payload);

    if (error) {
       return { success: false, data: null, error: normalizeActionError(error).message };
    }

    return { success: true, data: null, error: null };
  } catch (err) {
    return { success: false, data: null, error: normalizeActionError(err).message };
  }
}
