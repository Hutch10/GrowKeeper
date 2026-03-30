// HealthForecastService

export interface TelemetrySignals {
  moisture: number;      // 0-1
  temperature: number;   // Celsius
  light: number;         // 0-1
}

export interface VitalityForecast {
  currentScore: number;
  predictedScore: number;
  trend: 'Improving' | 'Degrading' | 'Stable';
  confidence: number;
  anomalyDetected: boolean;
}

/**
 * HealthForecastService
 * Provides non-linear vitality prediction for biological specimens.
 * Constraint: Local-only math functions, no external ML libraries.
 */
export class HealthForecastService {
  /**
   * Calculates current vitality based on sensor signals.
   * Uses weighted non-linear curves for plant homeostasis.
   */
  calculateVitality(signals: TelemetrySignals): number {
    const { moisture, temperature, light } = signals;

    // Ideal Temp range: 18-28C
    const tempStability = temperature >= 18 && temperature <= 28 
      ? 1 
      : Math.max(0, 1 - Math.abs(temperature - 23) / 15);

    // Moisture curve: Optimal at 0.6, severe stress at <0.2 or >0.9
    // Intensified quadratic penalty (3.0 instead of 2.0)
    const moistureHomeostasis = 1 - Math.pow(moisture - 0.6, 2) * 3;
    
    // Light: Saturates at 0.8
    const lightEfficiency = light > 0.8 ? 1 : light / 0.8;

    const rawScore = (moistureHomeostasis * 0.4) + (tempStability * 0.3) + (lightEfficiency * 0.3);
    return Math.round(Math.max(0, Math.min(100, rawScore * 100)));
  }

  /**
   * Generates a structural forecast based on current signals.
   */
  async forecastVitality(signals: TelemetrySignals): Promise<VitalityForecast> {
    const current = this.calculateVitality(signals);
    
    // Simple drift simulation (future versions use historical window)
    const driftValue = (Math.random() - 0.5) * 5;
    const predicted = Math.max(0, Math.min(100, current + driftValue));

    return {
      currentScore: current,
      predictedScore: predicted,
      trend: driftValue > 1 ? 'Improving' : driftValue < -1 ? 'Degrading' : 'Stable',
      confidence: 0.85,
      // Anomaly detection: Trigger if vitality < 50 or drift is extreme
      anomalyDetected: current < 50 || Math.abs(driftValue) > 10
    };
  }
}

export const healthForecastService = new HealthForecastService();
