// - [x] Phase 6.1: Kingdom-Agnostic Refactor & Terminology Cleanup
// - [x] Phase 6.2: Robust Guest Mode (IndexedDB + Unified Data Layer)
// - [/] Phase 6.3: Multi-Kingdom Specialized UI (Fungi/Botany differentiation)
//     - [/] Kingdom Selection in AddSpecimenForm
//     - [ ] Dynamic Care Terminology (Watering vs Misting)
//     - [ ] Specialized Fungal Care Fields (Substrate, Humidity)
//     - [ ] Kingdom-aware Dashboard Detail Panel
// - [ ] Phase 6.4: Regional Optimization & Scalability

export type ActionResult<T> =
  | {
      success: true;
      data: T;
      error: null;
      retryable?: boolean;
    }
  | {
      success: false;
      data: null;
      error: string;
      retryable?: boolean;
    };

import { BiologicalSpecimen, BotanicalSpecimen, MycologySpecimen, AnimaliaSpecimen, KingdomType } from "@/types/biological-intelligence";

export type SpecimenRow = BiologicalSpecimen;
export type { BotanicalSpecimen, MycologySpecimen, AnimaliaSpecimen };
export type Kingdom = KingdomType;

// Payload for actions like listing a specimen for sale
export interface SpecimenActionPayload {
  specimenId: string;
  price: number; // price in platform credits
  // Additional optional fields can be added as needed
}

export interface SpecimenEventRow {
  id: string;
  user_id: string | null;
  specimen_id: string;
  event_type: string;
  notes: string | null;
  hardware_attestation?: string | null;
  hardware_signature?: string | null;
  created_at: string;
}
