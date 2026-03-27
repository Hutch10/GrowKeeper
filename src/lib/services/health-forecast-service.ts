"use client";

export interface ForecastPoint {
  day: string;
  vitality: number;
  confidence: number;
}

export interface HealthForecast {
  specimenId: string;
  points: ForecastPoint[];
  criticalFailureRisk: number; // 0 to 1
  predictedFailureDate?: string;
  neuralInsight: string;
}

class HealthForecastService {
  generateForecast(specimenId: string, currentVitality: number, kingdom: string, envFactors?: { moisture?: number, light?: number, temp?: number }): HealthForecast {
    const points: ForecastPoint[] = [];
    const now = new Date();
    
    // Simulate a 7-day forecast with multi-variable drift
    let simulatedVitality = currentVitality;
    const volatility = kingdom === 'Plantae' ? 2 : kingdom === 'Animalia' ? 6 : 4;
    
    // Environmental "Stress" calculation
    const moistureStress = envFactors?.moisture && envFactors.moisture < 40 ? (40 - envFactors.moisture) / 10 : 0;
    const thermalStress = envFactors?.temp && (envFactors.temp > 30 || envFactors.temp < 15) ? 1.5 : 0;
    const baseDrift = -0.4;
    const totalDrift = baseDrift - moistureStress - thermalStress;

    for (let i = 0; i <= 7; i++) {
      const date = new Date(now);
      date.setDate(now.getDate() + i);
      
      // Non-linear acceleration of drift if stress is high
      const acceleration = 1 + (i * 0.1);
      const noise = (Math.random() - 0.5) * volatility;
      
      simulatedVitality = Math.max(0, Math.min(100, simulatedVitality + (totalDrift * acceleration) + noise));

      points.push({
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        vitality: Math.round(simulatedVitality),
        confidence: Math.round(Math.max(10, 95 - (i * 12) - (moistureStress * 5))) 
      });
    }

    const finalVitality = points[points.length - 1].vitality;
    const risk = finalVitality < 30 ? 0.9 : finalVitality < 50 ? 0.6 : finalVitality < 75 ? 0.3 : 0.05;

    let insight = "Neural pathways indicate high-probability biological stability.";
    if (risk > 0.8) {
      insight = `CRITICAL PROPHECY: Biological collapse imminent within ${points.findIndex(p => p.vitality < 30) || '3'} days. Entropy levels exceeding restoration threshold.`;
    } else if (risk > 0.5) {
      insight = "MODERATE DRIFT: Negative vitality trend detected. Mycelial/Vascular pressure dropping. Pre-emptive hydration sequence advised.";
    } else if (risk > 0.2) {
      insight = "MINOR ANOMALY: Subtle physiological shift. Environmental resonance slightly out of phase.";
    }

    return {
      specimenId,
      points,
      criticalFailureRisk: risk,
      predictedFailureDate: risk > 0.5 ? points[points.findIndex(p => p.vitality < 50) || 7].day : undefined,
      neuralInsight: insight
    };
  }
}

export const healthForecastService = new HealthForecastService();
