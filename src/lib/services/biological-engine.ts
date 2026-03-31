"use client";

import { differenceInDays } from 'date-fns';
import type { Database } from '@/types/database';
import type { EventRow } from '@/app/actions/events';

type SpecimenRow = Database["public"]["Tables"]["specimens"]["Row"];

export interface ProjectedState {
  health: number; // 0-100
  moisture: number; // 0-1 (normalized)
  vitalityTrend: 'STABLE' | 'OPTIMIZING' | 'DECLINING' | 'CRITICAL';
  confidence: number; // 0-1
  lastCareDate: Date | null;
  daysSinceWatering: number | null;
  stress_signals: string[];
}

/**
 * Biological Intelligence Engine: Phase 1 Projection
 * Derives current biological state from the immutable event timeline.
 */
export function deriveSpecimenState(
  specimen: SpecimenRow, 
  events: EventRow[],
  currentWeather?: { temp: number; humidity: number }
): ProjectedState {
  const now = new Date();
  const wateringEvents = events.filter(e => e.event_type === 'watered');
  const lastWatering = wateringEvents.length > 0 ? new Date(wateringEvents[0].created_at) : null;
  const daysSinceWatering = lastWatering ? differenceInDays(now, lastWatering) : null;

  // 1. Moisture Decay Model (Deterministic Baseline)
  // Base decay: 10% per day (indoor, loamy)
  let decayFactor = 0.1;
  if (specimen.environment === 'outdoor') decayFactor += 0.05;
  if (specimen.soil_type?.includes('Aroid')) decayFactor += 0.08; // Faster drainage
  
  // Weather impact (Simulated if no sensor)
  if (currentWeather && currentWeather.temp > 28) decayFactor += 0.03;
  if (currentWeather && currentWeather.humidity < 30) decayFactor += 0.04;

  const moistureRaw = lastWatering 
    ? Math.max(0, 1 - (daysSinceWatering! * decayFactor))
    : (specimen.moisture_level || 0.5);

  // 2. Health & Vitality Trend Analysis
  const recentEvents = events.slice(0, 5);
  
  let healthScore = specimen.happiness_score || 80;
  let vitalityTrend: ProjectedState['vitalityTrend'] = 'STABLE';
  const stressSignals: string[] = [];

  if (moistureRaw < 0.2) {
    vitalityTrend = 'CRITICAL';
    stressSignals.push('Critical Dehydration');
    healthScore -= 15;
  } else if (moistureRaw < 0.4) {
    vitalityTrend = 'DECLINING';
    stressSignals.push('Moisture Stress');
    healthScore -= 5;
  } else if (moistureRaw > 0.6 && daysSinceWatering && daysSinceWatering < 2) {
    vitalityTrend = 'OPTIMIZING';
  }

  // 3. Confidence Scoring
  // High confidence: Recent Sensor Events
  // Low confidence: Distant User-reported snapshots
  const sensorEvents = recentEvents.filter(e => e.source_type === 'sensor');
  const confidence = (sensorEvents.length > 0) ? 0.95 : 0.65;

  return {
    health: Math.min(100, Math.max(0, healthScore)),
    moisture: moistureRaw,
    vitalityTrend,
    confidence,
    lastCareDate: lastWatering,
    daysSinceWatering,
    stress_signals: stressSignals
  };
}

/**
 * Deterministic Task Generator: Phase 2
 * Determines the next Care Task based on biological thresholds.
 */
export function calculateNextCareRequirement(
  state: ProjectedState,
  genus_norms: { moisture_threshold: number } = { moisture_threshold: 0.3 }
): { action: 'watered' | null; urgency: number } {
  if (state.moisture < genus_norms.moisture_threshold) {
    const deficit = genus_norms.moisture_threshold - state.moisture;
    return { 
      action: 'watered', 
      urgency: Math.min(100, Math.floor(deficit * 200)) 
    };
  }
  return { action: null, urgency: 0 };
}
