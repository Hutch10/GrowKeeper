export type Kingdom = "Plantae" | "Fungi" | "Animalia" | "Other";

export interface BaseSpecimen {
  id: string;
  user_id: string | null;
  nickname: string;
  species_name: string | null;
  notes: string | null;
  image_url: string | null;
  location: string | null;
  kingdom: Kingdom;
  status?: 'ACTIVE' | 'ARCHIVED' | 'WRAPPED_ON_L2' | 'VAULTED' | 'PENDING_VALIDATION';
  happiness_score: number | null;
  health_status: string | null;
  created_at: string;
  is_draft?: boolean;
  lastVitalSignature?: string;
  complianceStatus?: string;
  public_key?: string; // JWK string
  version_vector?: Record<string, number>;
  nonce: number; // For replay protection & L2 finality
  hardware_attestation_statement: string | null; // Remote Attestation Artifact
  zk_proof?: string; // Zero-Knowledge Proof for IP/Location (Phase 41)
  privacy_level?: 'PUBLIC' | 'PROTECTED' | 'STEALTH';
  custodian_id?: string; // Institutional Custodian ID (Phase 42)
  multi_sig_threshold?: number; // Shares required for institutional co-sign
  insurance_policy_id?: string; // Parametric Insurance Policy (Phase 43)
  is_insured?: boolean;
  loan_amount?: number; // Outstanding loan against this specimen (Phase 44)
  collateral_ratio?: number; // Current LTV
  genetic_fingerprint?: string; // SHA-256 of synthetic genetic marker (Phase 46)
  offspring_count?: number;
  target_temp_range?: [number, number]; // [MinC, MaxC]
  target_humidity_range?: [number, number]; // [Min%, Max%]
  organization_id?: string;
  last_valuation?: number;
  fertilizer?: string | null;
  humidity_level?: number | null;
  temp_c?: number | null;
  moisture_level?: number | null;
  light_level?: number | null;
  lat?: number;
  lon?: number;
  region?: string;
}

export interface PlantSpecimen extends BaseSpecimen {
  kingdom: "Plantae";
  status: 'ACTIVE' | 'ARCHIVED' | 'WRAPPED_ON_L2' | 'VAULTED' | 'PENDING_VALIDATION';
  light: string | null;
  watering: string | null;
}

export interface FungalSpecimen extends BaseSpecimen {
  kingdom: "Fungi";
  status: 'ACTIVE' | 'ARCHIVED' | 'WRAPPED_ON_L2' | 'VAULTED' | 'PENDING_VALIDATION';
  substrate: string | null;
  misting_schedule: string | null;
  fruiting_conditions?: string | null;
}

export interface AnimaliaSpecimen extends BaseSpecimen {
  kingdom: "Animalia";
  status: 'ACTIVE' | 'ARCHIVED' | 'WRAPPED_ON_L2' | 'VAULTED' | 'PENDING_VALIDATION';
  heart_rate?: number | null;
  activity_level?: number | null;
  dietary_notes?: string | null;
}

export interface OtherSpecimen extends BaseSpecimen {
  kingdom: "Other";
  status: 'ACTIVE' | 'ARCHIVED' | 'WRAPPED_ON_L2' | 'VAULTED' | 'PENDING_VALIDATION';
}

export type Specimen = PlantSpecimen | FungalSpecimen | AnimaliaSpecimen | OtherSpecimen;

export type CareEventType =
  | "watered"
  | "fertilized"
  | "pruned"
  | "repotted"
  | "noted";

export interface CareEvent {
  id: string;
  specimenId: string;
  type: CareEventType;
  occurredAt: string;
  notes?: string;
}

export type ReminderChannel = "email" | "push";

export interface Reminder {
  id: string;
  specimenId: string;
  dueAt: string;
  channel: ReminderChannel;
  sentAt?: string;
}
