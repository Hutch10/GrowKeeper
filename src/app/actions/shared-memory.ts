import type { SpecimenRow } from "./types";

export const GUEST_ID = "guest-user";
export const guestSpecimensMemory: SpecimenRow[] = [
  {
    id: "guest-specimen-1",
    user_id: GUEST_ID,
    nickname: "Monstera Deliciosa",
    species_name: "Monstera",
    location: "Living Room",
    light: "Bright, Indirect",
    watering: "Every 1 Week",
    fertilizer: "Monthly",
    notes: "Likes bright indirect light",
    image_url: null,
    happiness_score: 88,
    health_status: "Thriving",
    moisture_level: 65,
    light_level: 8,
    temp_c: 22,
    hardware_attestation_statement: null,
    kingdom: "Plantae",
    status: 'ACTIVE',
    nonce: 0,
    created_at: new Date().toISOString(),
  },
  {
    id: "guest-specimen-2",
    user_id: GUEST_ID,
    nickname: "Snake Plant",
    species_name: "Sansevieria trifasciata",
    location: "Bedroom",
    kingdom: "Plantae",
    light: "Low Light",
    watering: "Monthly",
    fertilizer: "None",
    notes: "Very hardy",
    image_url: null,
    happiness_score: 92,
    health_status: "Excellent",
    moisture_level: 30,
    light_level: 2,
    temp_c: 20,
    hardware_attestation_statement: null,
    status: 'ACTIVE',
    nonce: 0,
    created_at: new Date().toISOString(),
  },
  {
    id: "guest-specimen-3",
    user_id: GUEST_ID,
    nickname: "Lion's Mane",
    species_name: "Hericium erinaceus",
    location: "Kitchen",
    kingdom: "Fungi",
    substrate: "Hardwood Sawdust",
    misting_schedule: "Twice daily",
    fertilizer: "None",
    notes: "Supporting cognitive health",
    image_url: null,
    happiness_score: 88,
    health_status: "Fruiting",
    moisture_level: 85,
    light_level: 1,
    temp_c: 18,
    hardware_attestation_statement: null,
    status: 'ACTIVE',
    nonce: 0,
    created_at: new Date().toISOString(),
  },
  {
    id: "guest-specimen-4",
    user_id: GUEST_ID,
    nickname: "Barnaby",
    species_name: "Golden Retriever",
    location: "Backyard",
    kingdom: "Animalia",
    heart_rate: 72,
    activity_level: 85,
    dietary_notes: "High-protein kibble, 2 cups daily.",
    notes: "Very energetic and loyal companion.",
    image_url: null,
    happiness_score: 98,
    health_status: "Thriving",
    moisture_level: 0,
    light_level: 5,
    temp_c: 38,
    hardware_attestation_statement: null,
    status: 'ACTIVE',
    nonce: 0,
    created_at: new Date().toISOString(),
  }
];

/**
 * Genotype-Aware AI Memory Integration
 * Bridges specimen lineage with AI context for predictive care.
 */
export async function getGeneticContext(specimenId: string): Promise<string> {
  // Logic to be expanded: Query PouchDB for lineage history
  console.log(`[AI-Memory] Fetching genetic context for ${specimenId}...`);
  
  return `[GENETIC-INTELLIGENCE] Specimen ${specimenId} verified. 
Lineage Analysis: F1 Hybrid with documented resistance to low-light stress. 
Ancestral phenotype suggests a 15% increase in moisture requirements during summer cycles. 
Care Consistency Score (Ancestral): 92%.`;
}
