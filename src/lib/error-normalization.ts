/**
 * Error Normalization Utility
 * Maps technical/database errors to user-safe, human-readable messages.
 */

export interface NormalizedError {
  message: string;
  isRetryable: boolean;
  code?: string;
}

export function normalizeActionError(error: unknown): NormalizedError {
  // 1. Log the raw error for developer observability (server-side only)
  console.error("[ACTION_ERROR_AUDIT]", error);

  // Cast safely for property access
  const err = error as Record<string, unknown>;
  const rawMessage = typeof err?.message === "string" ? err.message : "";
  const code = typeof err?.code === "string" ? err.code : undefined;

  let friendlyMessage = "An unexpected error occurred. Please try again.";
  let isRetryable = false;

  // 2. Pattern Matching for Known Error Cases
  
  // PostgREST / Supabase Errors
  if (code) {
    switch (code) {
      case "23505": // Unique constraint violation
        friendlyMessage = "Nickname collision detected. This specimen identifier already exists in the registry.";
        break;
      case "42501": // RLS / Permission denied
        friendlyMessage = "Security protocol alert: Access denied or insufficient permissions for this operation.";
        break;
      case "23503": // Foreign key violation
        friendlyMessage = "Dependency missing: The referenced resource does not exist.";
        break;
      case "P0001": // Custom RAISE EXCEPTION
        friendlyMessage = rawMessage || "Registry policy violation: The action was rejected by the sovereign layer.";
        break;
    }
  }

  // Network / Auth Errors
  if (rawMessage.includes("fetch failed")) {
    friendlyMessage = "Registry transmission failed. Please check your uplink connection.";
    isRetryable = true;
  }

  if (rawMessage.includes("JWT expired") || rawMessage.includes("Auth session missing")) {
    friendlyMessage = "Protocol expired: Please sign in again to re-authenticate your session.";
  }

  return {
    message: friendlyMessage,
    isRetryable,
    code,
  };
}
