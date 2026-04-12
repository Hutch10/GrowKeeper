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

  let friendlyMessage = "[CRITICAL] Unexpected operational failure. If this persists, re-authenticate or verify node status.";
  let isRetryable = false;

  // 2. Pattern Matching for Known Error Cases
  
  // PostgREST / Supabase Errors
  if (code) {
    switch (code) {
      case "23505": // Unique constraint violation
        friendlyMessage = "[REGISTRY_FAULT] Identity collision detected. This specimen identifier already exists in the ledger.";
        break;
      case "42501": // RLS / Permission denied
        friendlyMessage = "[SECURITY_ALERT] Access denied: This operation was neutralized by the sovereign layer.";
        break;
      case "23503": // Foreign key violation
        friendlyMessage = "[DEPENDENCY_FAULT] Missing link: The referenced biological resource does not exist.";
        break;
      case "P0001": // Custom RAISE EXCEPTION
        friendlyMessage = rawMessage || "[POLICY_VIOLATION] The action was rejected by the RAIS configuration.";
        break;
    }
  }

  // Network / Auth Errors
  if (rawMessage.includes("fetch failed")) {
    friendlyMessage = "[SENTINEL] Registry transmission failed. Please check your uplink connection.";
    isRetryable = true;
  }

  if (rawMessage.includes("JWT expired") || rawMessage.includes("Auth session missing")) {
    friendlyMessage = "[PROTOCOL_EXPIRED] Session invalidated: Re-authentication required for registry access.";
  }

  return {
    message: friendlyMessage,
    isRetryable,
    code,
  };
}
