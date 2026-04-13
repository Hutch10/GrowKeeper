import { ProvenanceSource } from "./biological-intelligence";

export type SignalSeverity = 'NOMINAL' | 'ELEVATED' | 'HIGH' | 'CRITICAL';

export type SignalStatus = 
  | 'ACTIVE' 
  | 'EXPIRED' 
  | 'SUPPRESSED' 
  | 'NO_COVERAGE';

export type EnvironmentalSignalType = 
  | 'FROST_RISK' 
  | 'HEAT_STRESS' 
  | 'UV_EXPOSURE' 
  | 'AIR_QUALITY_RISK'
  | 'DROUGHT_SIGNAL'
  | 'STORM_ADVISORY'
  | 'COVERAGE_CHECK';

/**
 * Deterministic Environmental Signal Entity
 * Anchored to the registry and audit-logged for provenance integrity.
 */
export interface EnvironmentalSentinelSignal {
  id: string; // UUID
  specimen_id: string; // Target specimen id (can be a cluster id / geofence)
  provider: 'NWS/NOAA' | 'OPENWEATHER' | 'SYSTEM';
  signal_type: EnvironmentalSignalType;
  advisory_code: string; // e.g. "NWS-2024-FROST"
  severity: SignalSeverity;
  confidence_score: number; // 0-100 deterministic scoring
  provenance: ProvenanceSource;
  status: SignalStatus;
  
  // Temporal Context
  observed_at: string;
  forecast_window_start: string;
  forecast_window_end: string;
  
  // Integrity metadata
  raw_source_ref: string; // URL or identifying reference
  source_hash: string; // Unique signature for duplicate suppression
  correlation_id: string; // ID of the sentinel run that generated this
  operator_summary: string; // Human-readable summary for Command Center
  
  created_at: string;
  updated_at?: string;
}

export interface RiskThresholds {
  frost_temp_c: number;
  heat_temp_c: number;
  uv_index_high: number;
}

export const DEFAULT_THRESHOLDS: RiskThresholds = {
  frost_temp_c: 2.0, // Start flagging risk at 2C
  heat_temp_c: 32.0, // High stress for many plants
  uv_index_high: 8.0,
};
