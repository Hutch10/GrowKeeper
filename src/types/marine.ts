/**
 * Marine Types: Geographic and Telemetry definitions for RAIS.
 * Part of Phase 75.
 */

export type MarineRegion = 'CARIBBEAN' | 'MALDIVES' | 'PACIFIC_NORTHWEST' | 'GREAT_BARRIER_REEF';

export interface RegionalBaseline {
  region: MarineRegion;
  avgTemp: number;
  avgPh: number;
  salinityNorm: number;
}

export interface BuoyTelemetry {
  stationId: string;
  region: MarineRegion;
  temperature: number;
  salinity: number;
  ph: number;
  turbidity: number;
  timestamp: number;
  location: { lat: number, lon: number };
  eDNAConcentration?: number; // Phase 82: Noah Ark Protocol
}

export interface MarineAlert {
  id: string;
  stationId: string;
  region: MarineRegion;
  severity: 'LOW' | 'MODERATE' | 'CRITICAL';
  reason: string;
  zScore: number;
  tempDelta?: number;
  phDelta?: number;
  confidence?: number;
  lat?: number;
  lng?: number;
}
