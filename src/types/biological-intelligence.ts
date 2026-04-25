import { Json } from "./database";

export type KingdomType = 'Plantae' | 'Fungi' | 'Animalia' | 'Protista' | 'Monera' | string;

export type ProvenanceSource = 
  | 'USER' 
  | 'SENTINEL_RULE' 
  | 'ENVIRONMENTAL_AGENT' 
  | 'SYSTEM_SYNC' 
  | 'RECOVERY_REPLAY'
  | 'LOCAL_BUFFER';

export type SyncStatus =
  | 'QUEUED_LOCAL'
  | 'BUFFERED_LOCAL'
  | 'SYNCING'
  | 'SYNCED_CLOUD'
  | 'REPLAYED'
  | 'CONFLICT'
  | 'FAILED';

/**
 * Atomic Biological Specimen (v2.4.0)
 * Unified structure for all biological entities to ensure 100% type reliability.
 */
export interface BiologicalSpecimen {
  id: string;
  user_id?: string | null;
  nickname: string;
  kingdom: KingdomType;
  genus?: string | null;
  species_name?: string | null;
  notes?: string | null;
  image_url?: string | null;
  location?: string | null;
  health: number;
  telemetry: {
    moisture?: number;
    temperature?: number;
    light?: number;
    humidity?: number;
  };
  
  // SOVEREIGN INFRASTRUCTURE: Hardened Provenance & Integrity
  provenance: ProvenanceSource;
  confidence_score: number; // 0-100
  sync_status: SyncStatus;
  
  _is_buffered?: boolean;
  _last_sync_attempt?: string;
  _sync_error?: string;

  happiness_score?: number | null;
  health_status?: string | null;
  compliance_status?: string | null;
  hardware_attestation_statement?: string | null;
  last_vital_signature?: string | null;
  created_at: string;
  last_modified?: string | null;
  environment?: 'indoor' | 'outdoor' | 'greenhouse' | null;
  lat?: number | null;
  lon?: number | null;
  custodian_id?: string | null;
  last_action_type?: string | null;
  source?: string | null; // Deprecating in favor of provenance
  acquisition_date?: string | null;
  status?: string | null;
  zk_proof?: string | null;
  offspring_count?: number | null;
  last_valuation?: number | null;
  loan_amount?: number | null;
  collateral_ratio?: number | null;
  privacy_level?: 'PUBLIC' | 'PRIVATE' | 'MASKED' | 'STEALTH' | null;
  target_temp_range?: [number, number] | null;
  target_humidity_range?: [number, number] | null;
  is_insured?: boolean | null;
  insurance_policy_id?: string | null;
  region?: string | null;
  nonce?: number | null;
  version_vector?: Record<string, number> | null;
  public_key?: string | null;

  // Kingdom-Specific (Optional Bridge)
  moisture_level?: number | null;
  light_level?: number | null;
  temp_c?: number | null;
  soil_type?: string | null;
  watering?: string | null;
  fertilizer?: string | null;
  light?: string | null;
  substrate?: string | null;
  misting_schedule?: string | null;
  humidity_level?: number | null;
  heart_rate?: number | null;
  activity_level?: number | null;
  dietary_notes?: string | null;
}

export type CompleteSpecimen = BiologicalSpecimen;
export type BotanicalSpecimen = BiologicalSpecimen & { kingdom: 'Plantae' };
export type MycologySpecimen = BiologicalSpecimen & { kingdom: 'Fungi' };
export type AnimaliaSpecimen = BiologicalSpecimen & { kingdom: 'Animalia' };

export interface AuditEvent {
  id: string;
  created_at: string;
  user_id: string | null;
  specimen_id?: string | null;
  event_type: string;
  notes?: string | null;
  source_type?: string | null;
  confidence?: number | null;
  metadata: Json | null;
  route?: string | null;
}
