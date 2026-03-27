export type Kingdom = 'Plantae' | 'Fungi' | 'Animalia' | 'Other';

export interface SpecimenTelemetry {
  moisture: number;
  temperature: number;
  light: number;
}

export interface BaseSpecimen {
  id: string;
  nickname: string;
  species_name?: string | null;
  kingdom: Kingdom;
  health: number;
  telemetry: SpecimenTelemetry;
  created_at: string;
  image_url?: string | null;
  notes?: string | null;
  location?: string | null;
  compliance_status?: string | null;
  hardware_attestation_statement?: string | null;
  last_vital_signature?: string | null;
  custodian_id?: string | null;
  is_draft?: boolean;
  status?: 'ACTIVE' | 'VAULTED' | 'TRANSIT' | 'DRAFT' | 'ARCHIVED' | 'WRAPPED_ON_L2';
  zk_proof?: string | null;
  health_status?: string | null;
  user_id?: string | null;
  offspring_count?: number;
  last_valuation?: number;
  loan_amount?: number;
  collateral_ratio?: number;
  target_temp_range?: [number, number];
  target_humidity_range?: [number, number];
  is_insured?: boolean;
  insurance_policy_id?: string | null;
  lat?: number;
  lon?: number;
  region?: string | null;
  nonce?: number;
  version_vector?: Record<string, number>;
  privacy_level?: 'PUBLIC' | 'PRIVATE' | 'STEALTH';
  public_key?: string | null;
  updated_at?: string | null;
}

export type Specimen = BaseSpecimen;

export interface CareEvent {
  id: string;
  specimen_id: string;
  event_type: string;
  timestamp: string;
  notes?: string | null;
}

export interface Reminder {
  id: string;
  specimen_id: string;
  title: string;
  due_date: string;
  completed: boolean;
}
