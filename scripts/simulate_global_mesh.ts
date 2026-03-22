import { marineService } from '../src/lib/services/marine-service';
import { noaaBuoyService } from '../src/lib/services/noaa-buoy-service';
import { logger } from '../src/lib/observability/logger';
import { MarineRegion } from '../src/types/marine';

async function runGlobalSimulation() {
  logger.info('Sim', '--- RAIS GLOBAL MESH SIMULATION STARTING ---');

  const regions: MarineRegion[] = ['MALDIVES', 'CARIBBEAN', 'PACIFIC_NORTHWEST', 'GREAT_BARRIER_REEF'];

  for (const region of regions) {
    logger.info('Sim', `Testing Region: ${region}...`);
    
    // 1. Fetch live data
    const data = await marineService.fetchBuoyData('SIM_01', region);
    
    // 2. Inject artificial stress (bypass real NOAA for now for sim)
    data.temperature += 4.5; // Trigger CRITICAL
    
    // 3. Detect Anomaly
    const alert = await marineService.detectAnomalies(data);
    
    if (alert) {
      logger.info('Sim', `SUCCESS: Alert ${alert.id} generated for ${region} with ${alert.severity} severity.`);
    } else {
      logger.warn('Sim', `FAILURE: No alert generated for ${region}. Check confidence/sparsity logic.`);
    }
  }

  logger.info('Sim', '--- RAIS GLOBAL MESH SIMULATION COMPLETE ---');
}

// In a real env, we'd use ts-node to run this
// runGlobalSimulation();
