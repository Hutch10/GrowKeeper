"use server";

import { createClient } from "@/lib/supabase-server";
import { getAuthenticatedUser } from "@/lib/auth-server";

export interface ComplianceReport {
  totalActions: number;
  uniquecustodians: number;
  stewardshipConsistency: number; // 0-100
  geofenceAdherence: number; // 0-100
  criticalAlerts: number;
  lastAuditTimestamp: string;
}

/**
 * Compliance Reporting Service
 * Aggregates non-repudiable audit logs for institutional oversight.
 */
export async function generateComplianceReport(): Promise<ComplianceReport> {
  const auth = await getAuthenticatedUser();
  if (!auth.success) {
    throw new Error("Unauthorized to access institutional reports.");
  }

  const supabase = createClient();
  const now = new Date();
  const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();

  // 1. Fetch Audit Logs for the last 24h
  const { data: logs, error } = await supabase
    .from('alpha_events')
    .select('user_id, event_type, metadata, created_at')
    .ilike('event_type', 'AUDIT_%')
    .gte('created_at', twentyFourHoursAgo);

  if (error || !logs) {
    return {
      totalActions: 0,
      uniquecustodians: 0,
      stewardshipConsistency: 0,
      geofenceAdherence: 100,
      criticalAlerts: 0,
      lastAuditTimestamp: new Date().toISOString()
    };
  }

  // 2. Aggregate Metrics
  const uniqueCustodians = new Set(logs.map(l => l.user_id)).size;
  const totalActions = logs.length;
  
  // High-level consistency score logic (Simulated for Alpha)
  // In production, this would be based on task completion latency.
  const completionActions = logs.filter(l => l.event_type === 'AUDIT_COMPLETE').length;
  const stewardshipConsistency = totalActions > 0 
    ? Math.min(100, Math.round((completionActions / (totalActions * 0.4)) * 100)) 
    : 100;

  // Geofence adherence check
  const breaches = logs.filter(l => l.event_type === 'AUDIT_GEOFENCE_BREACH').length;
  const geofenceAdherence = Math.max(0, 100 - (breaches * 10));

  const criticalAlerts = logs.filter(l => {
    const meta = l.metadata as any;
    return meta?.compliance === 'Critical' || meta?.compliance === 'Danger';
  }).length;

  return {
    totalActions,
    uniquecustodians: uniqueCustodians,
    stewardshipConsistency,
    geofenceAdherence,
    criticalAlerts,
    lastAuditTimestamp: logs[0]?.created_at || new Date().toISOString()
  };
}

/**
 * Standardized Export Generator (JSON format for industrial audits)
 */
export async function exportAuditLedger() {
  const auth = await getAuthenticatedUser();
  if (!auth.success) return null;

  const supabase = createClient();
  const { data, error } = await supabase
    .from('alpha_events')
    .select('*')
    .ilike('event_type', 'AUDIT_%')
    .order('created_at', { ascending: false });

  if (error) return null;
  return data;
}
