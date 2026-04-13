/**
 * Audit Narrative Skill
 * Generates a concise, high-signal summary of a specimen's integrity timeline.
 * Adheres to the 15-event sliding window rule.
 */

export interface NarrativeEvent {
  id: string;
  timestamp: string;
  type: string;
  description: string;
  provenance: string;
  is_integrity_event: boolean;
  sync_status: 'BUFFERED_LOCAL' | 'SYNCED_CLOUD';
}

export interface NarrativeSummary {
  timeline: NarrativeEvent[];
  summary: string;
  unresolved_integrity_issues: string[];
  confidence_label: 'HIGH' | 'MEDIUM' | 'LOW';
}

export class AuditNarrative {
  /**
   * Generates a narrative summary from a list of raw events.
   * ENFORCEMENT: Critical unresolved issues take priority over windowing.
   */
  static generate(events: any[]): NarrativeSummary {
    // 1. Identify ALL unresolved issues first (no initial cap)
    const unresolvedIssues = events.filter(e => 
      e.event_type === 'AUDIT_CONFLICT' || 
      e.event_type === 'AUDIT_FAILURE' ||
      e.payload?.event_type === 'CONFLICT' ||
      e.payload?.event_type === 'FAILURE'
    );

    // 2. Filter for significant events for the timeline
    // Prioritize integrity events in the 15-event sliding window
    const significantEvents = events
      .filter(e => this.isSignificant(e))
      .sort((a, b) => {
        // Prioritize integrity events to ensure they survive the slice
        const aIsCrit = this.isCritical(a);
        const bIsCrit = this.isCritical(b);
        if (aIsCrit && !bIsCrit) return -1;
        if (!aIsCrit && bIsCrit) return 1;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      })
      .slice(0, 15)
      .map(e => this.mapToNarrativeEvent(e));

    // 3. Map issues (Cap at 10 for readability, but ensure they are the most recent)
    const issues = unresolvedIssues
      .slice(0, 10)
      .map(e => e.metadata?.directive || e.metadata?.reason || e.payload?.description || "Unspecified integrity fault.");

    // 3. Determine confidence
    const confidence = this.calculateConfidence(significantEvents);

    // 4. Generate summary text
    let summary = `Stewardship remains within ${confidence.toLowerCase()} confidence parameters. `;
    if (significantEvents.length > 0) {
      const latest = significantEvents[0];
      summary += `Last significant transition: ${latest.description} (${new Date(latest.timestamp).toLocaleDateString()}).`;
    } else {
      summary += "No significant integrity transitions detected in the current window.";
    }

    return {
      timeline: significantEvents,
      summary,
      unresolved_integrity_issues: [...new Set(issues)],
      confidence_label: confidence
    };
  }

  private static isCritical(event: any): boolean {
    const critTypes = ['AUDIT_CONFLICT', 'AUDIT_FAILURE'];
    const payloadType = event.payload?.event_type;
    return critTypes.includes(event.event_type) || payloadType === 'CONFLICT' || payloadType === 'FAILURE';
  }

  private static isSignificant(event: any): boolean {
    const types = [
      'AUDIT_CREATE', 'AUDIT_PROVENANCE_CHANGE', 'AUDIT_SYNC_TRANSITION', 
      'AUDIT_CONFLICT', 'AUDIT_INTERVENTION', 'AUDIT_ENV_SIGNAL', 'AUDIT_FAILURE'
    ];
    return types.includes(event.event_type);
  }

  private static mapToNarrativeEvent(event: any): NarrativeEvent {
    return {
      id: event.id,
      timestamp: event.created_at || new Date().toISOString(),
      type: event.event_type,
      description: event.metadata?.summary || event.metadata?.directive || event.payload?.description || `Event: ${event.event_type}`,
      provenance: event.metadata?.provenance || event.provenance || "SYSTEM",
      is_integrity_event: ['AUDIT_CONFLICT', 'AUDIT_FAILURE'].includes(event.event_type) || event.payload?.event_type === 'FAILURE',
      sync_status: event.sync_status || 'SYNCED_CLOUD' // Default to Cloud if using legacy audit log
    };
  }

  private static calculateConfidence(events: NarrativeEvent[]): 'HIGH' | 'MEDIUM' | 'LOW' {
    const integrityIssues = events.filter(e => e.is_integrity_event).length;
    if (integrityIssues === 0) return 'HIGH';
    if (integrityIssues < 3) return 'MEDIUM';
    return 'LOW';
  }
}
