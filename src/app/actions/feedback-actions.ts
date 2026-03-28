"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase-server";
import { getAuthenticatedUser } from "@/lib/auth-server";
import { normalizeActionError } from "@/lib/error-normalization";
import { checkMutationGuard } from "@/lib/mutation-utility";
import type { ActionResult } from "./types";

export interface FeedbackInput {
  route: string;
  content: string;
  action_attempted?: string;
  error_context?: string;
}

export async function submitFeedback(data: FeedbackInput): Promise<ActionResult<null>> {
  const auth = await getAuthenticatedUser();
  if (!auth.success) {
    return { success: false, data: null, error: "Authentication required to submit feedback." };
  }

  // Phase 1: Mutation Guard (Spam Protection)
  const guard = await checkMutationGuard(auth.data.id, "submitFeedback", data);
  if (!guard.allowed) {
    return { success: false, data: null, error: guard.error || "Action restricted." };
  }

  const supabase = createClient();

  try {
    const { error } = await supabase.from("tester_feedback").insert({
      user_id: auth.data.id,
      route: data.route,
      content: data.content,
      action_attempted: data.action_attempted || null,
      error_context: data.error_context || null,
    });

    if (error) {
      return { success: false, data: null, error: normalizeActionError(error).message };
    }

    revalidatePath("/dashboard");
    return { success: true, data: null, error: null };
  } catch (error) {
    return { success: false, data: null, error: normalizeActionError(error).message };
  }
}
