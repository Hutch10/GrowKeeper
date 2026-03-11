import "server-only";

import type { ActionResult } from "@/app/actions/types";
import { createServerSupabaseClient } from "@/lib/supabase-server";

type AuthUser = {
  id: string;
  email: string | null;
};

export async function getAuthenticatedUser(): Promise<ActionResult<AuthUser>> {
  try {
    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase.auth.getUser();

    if (error || !data.user) {
      return { success: false, data: null, error: "Not signed in" };
    }

    return {
      success: true,
      data: {
        id: data.user.id,
        email: data.user.email ?? null,
      },
      error: null,
    };
  } catch (error) {
    const isDynamicServerUsageError =
      typeof error === "object" &&
      error !== null &&
      "digest" in error &&
      error.digest === "DYNAMIC_SERVER_USAGE";

    if (!isDynamicServerUsageError) {
      console.error("Auth initialization failure:", error);
    }

    return { success: false, data: null, error: "Not signed in" };
  }
}
