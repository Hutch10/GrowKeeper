import { addHours, subHours, formatISO } from 'date-fns';
import { BiologicalSpecimen } from '@/types/biological-intelligence';
import { WeatherData } from '@/app/actions/weather';
import { deriveSpecimenState, ProjectedState } from './biological-engine';
import { getNormsForSpecies } from '../constants/biological-norms';

export interface ForecastResult {
  trend: number; // -100 to 100
  survivalProbability: number; // 0 to 100
  nextActionWindow: [Date, Date];
  recommendations: string[];
  simulatedHistory: {
    timestamp: string;
    moisture: number;
    temperature: number;
  }[];
  projectedState?: ProjectedState;
}

/**
 * Deterministic Biological Forecast Engine: Phase 2
 * Integrates biological norms with event-sourced state derivation.
 */
export function calculateForecast(
  specimen: BiologicalSpecimen,
  weather?: WeatherData | null
): ForecastResult {
  const now = new Date();
  
  // 1. Derive Current State from Timeline (Phase 1 Logic)
  const state = deriveSpecimenState(specimen, [], { 
    temp: weather?.temp || 22, 
    humidity: 50 // Default for now
  });

  // 2. Fetch Biological Norms (Phase 2 Determinism)
  const norms = getNormsForSpecies(specimen.species_name ?? null);

  // 3. Vitality Trend Calculation
  const trend = state.vitalityTrend === 'OPTIMIZING' ? 15 : 
                state.vitalityTrend === 'DECLINING' ? -10 : 
                state.vitalityTrend === 'CRITICAL' ? -35 : 0;

  // 4. Survival Probability
  const survivalProbability = Math.min(100, Math.max(0, state.health * (state.confidence || 0.8)));

  // 5. Generate Truth-Enforced Recommendations
  const recommendations: string[] = [];
  if (state.moisture < norms.moisture_threshold) {
    recommendations.push(`Urgent: Sub-optimal hydration level (${(state.moisture * 100).toFixed(0)}%) detected for ${specimen.nickname}.`);
  }
  if (weather && weather.temp > norms.temp_range_c[1]) {
    recommendations.push(`Thermal Stress: Ambient temperature exceeds genus threshold of ${norms.temp_range_c[1]}°C.`);
  }
  if (state.stress_signals.length > 0) {
    recommendations.push(...state.stress_signals.map(s => `Biological Stress: ${s}`));
  }

  // 6. Generate Synthetic History (48h back) for UI Sparklines
  const simulatedHistory = Array.from({ length: 24 }).map((_, i) => {
    const ts = subHours(now, (23 - i) * 2);
    const baseMoisture = state.moisture;
    const baseTemp = (specimen.temp_c as number) || 21;
    
    return {
      timestamp: formatISO(ts),
      moisture: Math.max(0, Math.min(1, baseMoisture + (Math.sin(i / 2) * 0.05) - (i * 0.003))),
      temperature: baseTemp + (Math.cos(i / 3) * 1.5),
    };
  });

  return {
    trend,
    survivalProbability,
    nextActionWindow: [addHours(now, 2), addHours(now, 8)],
    recommendations,
    simulatedHistory,
    projectedState: state,
  };
}
