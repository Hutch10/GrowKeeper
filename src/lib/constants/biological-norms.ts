"use client";

/**
 * Biological Norms Registry (Phase 2)
 * Canonical thresholds for genus-specific biological stewardship.
 */
export interface GenusNorms {
  moisture_threshold: number; // 0-1 (e.g. 0.3 = 30% moisture)
  temp_range_c: [number, number]; // [min, max]
  humidity_range: [number, number]; // [min, max]
  light_intensity: 'LOW' | 'MEDIUM' | 'HIGH';
  watering_interval_days: number;
}

export const BIOLOGICAL_NORMS: Record<string, GenusNorms> = {
  "Monstera": {
    moisture_threshold: 0.35,
    temp_range_c: [18, 30],
    humidity_range: [60, 90],
    light_intensity: 'MEDIUM',
    watering_interval_days: 9
  },
  "Sansevieria": {
    moisture_threshold: 0.15,
    temp_range_c: [15, 32],
    humidity_range: [30, 50],
    light_intensity: 'LOW',
    watering_interval_days: 21
  },
  "Ficus": {
    moisture_threshold: 0.4,
    temp_range_c: [16, 26],
    humidity_range: [50, 70],
    light_intensity: 'HIGH',
    watering_interval_days: 7
  },
  "Default": {
    moisture_threshold: 0.3,
    temp_range_c: [15, 30],
    humidity_range: [40, 80],
    light_intensity: 'MEDIUM',
    watering_interval_days: 10
  }
};

/**
 * Retreives normalized care requirements for a given species.
 */
export function getNormsForSpecies(speciesName: string | null): GenusNorms {
  if (!speciesName) return BIOLOGICAL_NORMS["Default"];
  
  // Simple substring matching for Genus
  const genus = speciesName.split(' ')[0];
  return BIOLOGICAL_NORMS[genus] || BIOLOGICAL_NORMS["Default"];
}
