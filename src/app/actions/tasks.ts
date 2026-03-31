"use server";

import { revalidatePath } from "next/cache";
import { trackAlphaEvent } from "@/lib/services/alpha-telemetry";
import { recordAuditEntry } from "@/lib/services/audit-ledger";
import type { Database, TaskType } from "@/types/database";
import type { ActionResult } from "@/app/actions/types";
import { getAuthenticatedUser } from "@/lib/auth-server";
import { createClient } from "@/lib/supabase-server";
import { checkMutationGuard } from "@/lib/mutation-utility";
import { normalizeActionError } from "@/lib/error-normalization";

type TaskInsert = Database["public"]["Tables"]["tasks"]["Insert"];
export type TaskRow = Database["public"]["Tables"]["tasks"]["Row"];

const TASK_TYPES: TaskType[] = ["watered", "fertilized", "prune", "repot", "inspect"];

type SpecimenOwnershipCheckResult =
  | { ok: true }
  | { ok: false; error: string };

async function verifySpecimenOwnership(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  specimenId: string,
): Promise<SpecimenOwnershipCheckResult> {
  const { data: specimen, error } = await supabase
    .from("specimens")
    .select("id")
    .eq("id", specimenId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error("Error verifying task specimen ownership:", error);
    return { ok: false, error: "Unable to verify specimen ownership." };
  }

  if (!specimen) {
    return { ok: false, error: "Specimen not found or not owned by the current user." };
  }

  return { ok: true };
}

export interface AddTaskInput {
  specimen_id: string;
  task_type: TaskType;
  due_date?: string;
}

export async function addSpecimenTask(input: AddTaskInput): Promise<ActionResult<TaskRow>> {
  const auth = await getAuthenticatedUser();

  if (!auth.success) {
    return { success: false, data: null, error: "Authentication required to manage tasks." };
  }

  // Phase 1: Mutation Guard
  const guard = await checkMutationGuard(auth.data.id, "addSpecimenTask", input);
  if (!guard.allowed) {
    return { success: false, data: null, error: guard.error || "Action restricted." };
  }

  if (!input.specimen_id.trim()) {
    return { success: false, data: null, error: "Invalid specimen id." };
  }

  if (!TASK_TYPES.includes(input.task_type)) {
    return { success: false, data: null, error: "Invalid task type." };
  }

  let dueDate: string | null = null;
  if (input.due_date?.trim()) {
    const parsed = new Date(input.due_date);
    if (Number.isNaN(parsed.getTime())) {
      return { success: false, data: null, error: "Invalid due date." };
    }
    dueDate = parsed.toISOString();
  }

  const payload: TaskInsert = {
    user_id: auth.data.id,
    specimen_id: input.specimen_id,
    task_type: input.task_type,
    due_date: dueDate,
    completed: false,
    last_modified: new Date().toISOString(),
    last_action_type: "CREATE",
  };

  const supabase = createClient();
  const ownership = await verifySpecimenOwnership(supabase, auth.data.id, input.specimen_id);

  if (!ownership.ok) {
    return { success: false, data: null, error: ownership.error };
  }

  try {
    const { data: task, error } = await supabase
      .from("tasks")
      .insert(payload)
      .select("id, created_at, specimen_id, task_type, due_date, completed")
      .single();

    if (error) {
      return { success: false, data: null, error: normalizeActionError(error).message };
    }

    // Phase 2: Audit Ledger anchoring
    await recordAuditEntry({
      action: "CREATE",
      target: "task",
      targetId: task.id,
      metadata: { 
        specimen_id: task.specimen_id,
        task_type: task.task_type
      },
      payload: task
    });

    // Track Alpha Event
    await trackAlphaEvent("task_created", { 
      id: task.id, 
      type: input.task_type, 
      specimen_id: input.specimen_id 
    }, "/tasks");

    revalidatePath("/dashboard");
    revalidatePath(`/plants/${input.specimen_id}`);
    return { success: true, data: task as TaskRow, error: null };
  } catch (error) {
    return { success: false, data: null, error: normalizeActionError(error).message };
  }
}

export async function getSpecimenTasks(specimenId: string): Promise<ActionResult<TaskRow[]>> {
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
      .from("tasks")
      .select("id, user_id, created_at, specimen_id, task_type, due_date, completed")
      .eq("specimen_id", specimenId)
      .eq("user_id", auth.data.id)
      .order("due_date", { ascending: true, nullsFirst: false })
      .order("created_at", { ascending: false });

    if (error) {
      return { success: false, data: null, error: normalizeActionError(error).message };
    }

    return { success: true, data: (data ?? []) as TaskRow[], error: null };
  } catch (error) {
    return { success: false, data: null, error: normalizeActionError(error).message };
  }
}

export async function getTasks(): Promise<ActionResult<TaskRow[]>> {
  const auth = await getAuthenticatedUser();

  if (!auth.success) {
    return { success: false, data: null, error: "Authentication required." };
  }

  const supabase = createClient();

  try {
    const { data, error } = await supabase
      .from("tasks")
      .select("id, user_id, created_at, specimen_id, task_type, due_date, completed")
      .eq("user_id", auth.data.id)
      .order("due_date", { ascending: true, nullsFirst: false })
      .order("created_at", { ascending: false });

    if (error) {
      return { success: false, data: null, error: normalizeActionError(error).message };
    }

    return { success: true, data: (data ?? []) as TaskRow[], error: null };
  } catch (error) {
    return { success: false, data: null, error: normalizeActionError(error).message };
  }
}

export async function markTaskComplete(taskId: string, specimenId: string): Promise<ActionResult<TaskRow>> {
  const auth = await getAuthenticatedUser();

  if (!auth.success) {
    return { success: false, data: null, error: "Authentication required." };
  }

  // Phase 1: Mutation Guard
  const guard = await checkMutationGuard(auth.data.id, "markTaskComplete", { taskId, specimenId });
  if (!guard.allowed) {
    return { success: false, data: null, error: guard.error || "Update restricted." };
  }

  if (!taskId.trim() || !specimenId.trim()) {
    return { success: false, data: null, error: "Invalid task update request." };
  }

  const supabase = createClient();
  const ownership = await verifySpecimenOwnership(supabase, auth.data.id, specimenId);

  if (!ownership.ok) {
    return { success: false, data: null, error: ownership.error };
  }

  try {
    const { data: existingTask } = await supabase
      .from("tasks")
      .select("completed")
      .eq("id", taskId)
      .eq("user_id", auth.data.id)
      .maybeSingle();

    if (existingTask?.completed) {
      return { success: true, data: null as unknown as TaskRow, error: null };
    }

    const { data: updatedTask, error } = await supabase
      .from("tasks")
      .update({ 
        completed: true,
        last_modified: new Date().toISOString(),
        last_action_type: "COMPLETE"
      })
      .eq("id", taskId)
      .eq("specimen_id", specimenId)
      .eq("user_id", auth.data.id)
      .select("id, user_id, created_at, specimen_id, task_type, due_date, completed, last_modified, last_action_type")
      .maybeSingle();

    if (error) {
      return { success: false, data: null, error: normalizeActionError(error).message };
    }

    if (!updatedTask) {
      return { success: false, data: null, error: "Task not found or unauthorized access." };
    }

    // Phase 2: Audit Ledger anchoring
    await recordAuditEntry({
      action: "COMPLETE",
      target: "task",
      targetId: updatedTask.id,
      metadata: { 
        specimen_id: updatedTask.specimen_id,
        task_type: updatedTask.task_type
      },
      payload: updatedTask
    });

    // Track Alpha Event
    await trackAlphaEvent("task_completed", { 
      id: updatedTask.id, 
      type: updatedTask.task_type, 
      specimen_id: updatedTask.specimen_id 
    }, "/tasks");

    revalidatePath("/dashboard");
    revalidatePath(`/plants/${specimenId}`);
    return { success: true, data: updatedTask as TaskRow, error: null };
  } catch (error) {
    return { success: false, data: null, error: normalizeActionError(error).message };
  }
}
