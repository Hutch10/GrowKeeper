import { logger } from '../observability/logger';

export interface SimulationResult {
  dayOffset: number;
  planetaryVitality: number;
  biomassDelta: number;
  co2Sequestration: number;
  biodiversityIndex: number;
  driftAlerts: string[];
}

class BiosphereSimulatorService {
  private baseVitality = 88.4;
  private baseCO2 = 420; // ppm baseline

  async getSimulationData(dayOffset: number): Promise<SimulationResult> {
    logger.info('BiosphereSimulator', `Calculating planetary drift for ${dayOffset} days...`);

    // Simulated non-linear projection logic
    const factor = dayOffset / 365;
    const vitalityShift = Math.sin(factor * Math.PI) * 10 - (factor * 5); // Some seasonality + long term decline
    const biomassDelta = factor * 2.4; // Projected metric tons
    
    const planetaryVitality = Math.max(0, Math.min(100, this.baseVitality + vitalityShift));
    const biodiversityIndex = Math.max(0, Math.min(1, 0.92 - (factor * 0.05)));
    const co2Sequestration = this.baseCO2 - (biomassDelta * 0.1);

    const alerts = [];
    if (planetaryVitality < 70) alerts.push("Critical biodiversity collapse projected in Indo-Pacific.");
    if (dayOffset > 180 && dayOffset < 270) alerts.push("Seasonal mycelial dormancy baseline exceeded.");

    return {
      dayOffset,
      planetaryVitality,
      biomassDelta,
      co2Sequestration,
      biodiversityIndex,
      driftAlerts: alerts
    };
  }

  async getHistoricalState(daysAgo: number): Promise<SimulationResult> {
    // Return a slightly simpler "past" state
    return {
      dayOffset: -daysAgo,
      planetaryVitality: 91.2,
      biomassDelta: -1.2,
      co2Sequestration: 418.5,
      biodiversityIndex: 0.95,
      driftAlerts: ["Pre-mesh synchronization baseline"]
    };
  }
}

export const biosphereSimulatorService = new BiosphereSimulatorService();
