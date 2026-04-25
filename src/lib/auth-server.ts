import "server-only";

import type { ActionResult } from "@/app/actions/types";
import { createClient } from "@/lib/supabase-server";

type AuthUser = {
  id: string;
  email: string | null;
};

export async function getAuthenticatedUser(): Promise<ActionResult<AuthUser>> {
  if (process.env.NEXT_PUBLIC_SKIP_AUTH === "true" && process.env.NODE_ENV === "development") {
    return {
      success: true,
      data: {
        id: "guest-user",
        email: "guest@example.com",
      },
      error: null,
    };
  }

  try {
    const supabase = createClient();
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

/**
 * Centrally enforced authentication guard.
 * Throws an error or returns the user if authenticated.
 */
export async function requireUser(): Promise<AuthUser> {
  const auth = await getAuthenticatedUser();
  if (!auth.success) {
    throw new Error("Unauthorized access. Please sign in to continue.");
  }
  return auth.data;
}
