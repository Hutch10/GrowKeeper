/**
 * Diagnostic Translator Skill
 * Translates technical telemetry and faults into actionable operator directives.
 */

export interface DiagnosticDirective {
  title: string;
  directive: string;
  severity: "CRITICAL" | "CAUTION" | "NOMINAL";
  action_label?: string;
  context_id?: string;
}

export class DiagnosticTranslator {
  /**
   * Translates a raw error or telemetry signal into a high-faith directive.
   */
  static translate(error: any): DiagnosticDirective {
    const message = error?.message || String(error);
    const code = error?.code;

    // 1. Connection / Registry DNS Faults
    if (message.includes("ENOTFOUND") || message.includes("fetch failed") || message.includes("Network Error")) {
      return {
        title: "REGISTRY_DISCONNECT",
        directive: "Uplink synchronization severed. Platform has shifted to Resilient Local Authority (PouchDB). Verify network availability and DNS resolution.",
        severity: "CAUTION",
        action_label: "CHECK CONNECTION"
      };
    }

    // 2. Auth / Protocol Expiration
    if (message.includes("JWT") || message.includes("unauthorized") || message.includes("session missing")) {
      return {
        title: "PROTOCOL_INVALID",
        directive: "Sovereign identity token has expired or is invalid. Secure re-authentication is required to authorize cloud-canonical writes.",
        severity: "CRITICAL",
        action_label: "RE-AUTHENTICATE"
      };
    }

    // 3. Sync Collision / Conflict
    if (code === "409" || message.includes("conflict") || message.includes("version mismatch")) {
      return {
        title: "SYNC_COLLISION",
        directive: "Divergent state detected between local mirror and cloud canonical record. Conflict Resolution Assistant required to verify authority.",
        severity: "CAUTION",
        action_label: "RESOLVE CONFLICT"
      };
    }

    // 4. Security / RLS Failures
    if (code === "42501" || message.includes("permission denied")) {
      return {
        title: "SECURITY_BLOCK",
        directive: "Action neutralized by Registry Authority (RLS). Ensure the operator has the necessary lineage permissions for this biological asset.",
        severity: "CRITICAL"
      };
    }

    // Default Fallback
    return {
      title: "OPERATIONAL_FAULT",
      directive: `System encountered an unclassified fault: ${message.substring(0, 100)}. Monitor Audit Sentinel for further integrity flags.`,
      severity: "CAUTION"
    };
  }
}
