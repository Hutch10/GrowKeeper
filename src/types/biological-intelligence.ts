export type KingdomType = 'Botanical' | 'Mycology' | 'Animalia';

export interface BaseBiologicalSpecimen {
  id: string;
  user_id?: string | null;
  nickname: string;
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
}

export interface BotanicalSpecimen extends BaseBiologicalSpecimen {
  kingdom: 'Botanical';
  moisture_level?: number | null;
  light_level?: number | null;
  temp_c?: number | null;
  soil_type?: string | null;
  watering?: string | null;
  fertilizer?: string | null;
  light?: string | null;
}

export interface MycologySpecimen extends BaseBiologicalSpecimen {
  kingdom: 'Mycology';
  substrate?: string | null;
  misting_schedule?: string | null;
  humidity_level?: number | null;
  temp_c?: number | null;
}

export interface AnimaliaSpecimen extends BaseBiologicalSpecimen {
  kingdom: 'Animalia';
  heart_rate?: number | null;
  activity_level?: number | null;
  dietary_notes?: string | null;
  temp_c?: number | null;
}

export type BiologicalSpecimen = BotanicalSpecimen | MycologySpecimen | AnimaliaSpecimen;

// Bridge type for legacy services that expect all possible properties
export type CompleteSpecimen = BaseBiologicalSpecimen & Partial<BotanicalSpecimen & MycologySpecimen & AnimaliaSpecimen>;

export interface AuditEvent {
  id: string;
  created_at: string;
  user_id: string | null;
  event_type: string;
  metadata: Record<string, unknown> | null;
  route: string | null;
}
