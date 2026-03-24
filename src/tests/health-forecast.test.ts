import { describe, it, expect } from 'vitest';
import { healthForecastService } from '../lib/services/health-forecast';

describe('HealthForecastService', () => {
  it('calculates 100% vitality for optimal conditions', () => {
    const optimal = { moisture: 0.6, temperature: 24, light: 0.8 };
    const score = healthForecastService.calculateVitality(optimal);
    expect(score).toBeGreaterThan(90);
  });

  it('drops vitality significantly for drought conditions', () => {
    const drought = { moisture: 0.1, temperature: 35, light: 0.9 };
    const score = healthForecastService.calculateVitality(drought);
    expect(score).toBeLessThan(50);
  });

  it('detects anomalies in forecasts', async () => {
    const stress = { moisture: 0.05, temperature: 40, light: 1.0 };
    const result = await healthForecastService.forecastVitality(stress);
    expect(result.anomalyDetected).toBe(true);
  });
});
