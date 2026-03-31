import { describe, it, expect } from 'vitest';
import { calculateForecast } from './forecast-engine';
import { Database } from '@/types/database';
import { WeatherData } from '@/app/actions/weather';

type SpecimenRow = Database["public"]["Tables"]["specimens"]["Row"];

describe('Biological Forecast Engine', () => {
  const mockSpecimen: SpecimenRow = {
    id: 'spec-123',
    user_id: 'user-123',
    nickname: 'Test Specimen',
    species_name: 'Monstera Deliciosa',
    kingdom: 'Botanical',
    happiness_score: 80,
    moisture_level: 0.5,
    temp_c: 22,
    light_level: 0.5,
    created_at: new Date().toISOString(),
    last_modified: null,
    last_action_type: null,
    source: 'manual',
    acquisition_date: null,
    image_url: null,
    location: 'Office',
    notes: null,
    soil_type: 'Peat',
    environment: 'indoor',
    lat: null,
    lon: null,
    substrate: null,
    misting_schedule: null,
    heart_rate: null,
    activity_level: null,
    dietary_notes: null,
    hardware_attestation_statement: null,
    last_vital_signature: null,
    compliance_status: 'none',
    light: 'bright indirect',
    watering: 'weekly',
    fertilizer: 'monthly',
    health_status: 'healthy'
  };

  it('calculates a positive trend for healthy specimens', () => {
    const result = calculateForecast(mockSpecimen, null);
    expect(result.survivalProbability).toBeGreaterThan(0);
    expect(result.simulatedHistory.length).toBe(24);
  });

  it('handles environmental stressors in the forecast', () => {
    const hotWeather: WeatherData = { 
      temp: 35, 
      condition: 'Sunny', 
      humidity: 20,
      uvIndex: 8,
      impact: 'HIGH_THERMAL_STRESS',
      recommendation: 'Stabilize internal climate immediately.',
      location: 'Central Registry',
      lastUpdated: new Date().toISOString()
    };
    const result = calculateForecast(mockSpecimen, hotWeather);
     // In the current logic, weather impact is mostly on recommendations and trend
    expect(result.recommendations.some(r => r.includes("Thermal Stress"))).toBe(true);
  });

  it('handles low moisture critical alerts', () => {
    const parched = { ...mockSpecimen, moisture_level: 0.1 };
    const result = calculateForecast(parched, null);
    expect(result.recommendations.some(r => r.includes("Urgent"))).toBe(true);
  });
});
