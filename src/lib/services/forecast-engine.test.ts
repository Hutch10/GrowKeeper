import { describe, it, expect } from 'vitest';
import { calculateForecast } from './forecast-engine';
import { BaseSpecimen } from '@/types/specimen';

describe('Biological Forecast Engine', () => {
  const mockSpecimen: BaseSpecimen = {
    id: 'spec-123',
    nickname: 'Test Specimen',
    kingdom: 'Plantae',
    health: 80,
    telemetry: {
      moisture: 0.5,
      temperature: 22,
      light: 0.5
    },
    created_at: new Date().toISOString()
  };

  it('calculates a positive trend for healthy specimens with no overdue tasks', () => {
    const result = calculateForecast(mockSpecimen, [], null);
    expect(result.trend).toBeGreaterThan(0);
    expect(result.survivalProbability).toBe(80);
    expect(result.simulatedHistory.length).toBe(24);
  });

  it('penalizes health and trend for overdue tasks', () => {
    const tasks = [{
      id: 'task-1',
      specimen_id: 'spec-123',
      task_type: 'watered',
      due_date: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
      completed: false
    }];
    const result = calculateForecast(mockSpecimen, tasks as any, null);
    expect(result.trend).toBeLessThan(0);
    expect(result.survivalProbability).toBeLessThan(80);
  });

  it('handles heat stress for Plantae', () => {
    const hotWeather = { temp: 35, condition: 'Sunny', humidity: 20 } as any;
    const result = calculateForecast(mockSpecimen, [], hotWeather);
    expect(result.trend).toBeLessThan(0);
    expect(result.recommendations).toContain("Predictive decline detected. Enhanced monitoring and environmental stabilization required.");
  });

  it('handles low moisture critical alerts', () => {
    const parched = { ...mockSpecimen, telemetry: { ...mockSpecimen.telemetry, moisture: 0.1 } };
    const result = calculateForecast(parched, [], null);
    expect(result.trend).toBeLessThan(-15);
    expect(result.recommendations[0]).toContain("Hydration levels reaching critical baseline");
  });
});
