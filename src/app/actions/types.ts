import { 
  BiologicalSpecimen, 
  KingdomType 
} from "@/types/biological-intelligence";
import type { EventRow } from "./events";

/**
 * Unified Specimen Row (v2.4.0)
 * All biological assets utilize this atomic structure for deterministic processing.
 */
export type SpecimenRow = BiologicalSpecimen;
export type Kingdom = KingdomType;

export type { EventRow };
export type SpecimenEventRow = EventRow;

// Payload for actions like listing a specimen for sale
export interface SpecimenActionPayload {
  specimenId: string;
  price: number; // price in platform credits
}

export type ActionResult<T = void> = 
  | { 
      success: true; 
      data: T; 
      error?: string | null; 
      sentinel_diagnostic?: {
        message: string;
        provider_label: string;
      };
    }
  | { 
      success: false; 
      data: null; 
      error: string; 
      sentinel_diagnostic?: {
        message: string;
        provider_label: string;
      };
    };
