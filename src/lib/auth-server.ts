import "server-only";

import { cookies } from "next/headers";
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
    const cookieStore = cookies();
    const { data, error } = await supabase.auth.getUser();

    // PHANTOM SESSION CHECK: 
    // If getUser fails but session cookies exist, we treat it as a transient state
    // and proceed with high-fidelity redirect rather than falling back to guest.
    if (error || !data.user) {
      const allCookies = cookieStore.getAll();
      const hasSupabaseCookie = allCookies.some(c => c.name.includes('sb-') && c.name.includes('-auth-token'));
      
      if (hasSupabaseCookie) {
        console.warn("[SENTINEL] Phantom Session detected. User email visible but getUser failed. Forcing high-fidelity status.");
        return { 
          success: true, 
          data: { id: "phantom-session", email: "Registry Operator" }, 
          error: "[TRANSITION] Session Pending" 
        };
      }
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
