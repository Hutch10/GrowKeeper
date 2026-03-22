import { logger } from '../observability/logger';
import { payoutService } from './payout-service';
import { MarineAlert } from '@/types/marine';

export interface SimulatedTester {
  id: string;
  lat: number;
  lon: number;
  region: string;
}

/**
 * User Simulation Service v3.0.0
 * Generates synthetic load to prove the Sovereign Latch under pressure.
 */
export class UserSimulationService {
  private testers: SimulatedTester[] = [];

  constructor(count: number = 50) {
    this.generateTesters(count);
  }

  private generateTesters(count: number) {
    for (let i = 0; i < count; i++) {
      this.testers.push({
        id: `TESTER_${i}`,
        lat: 4.0 + (Math.random() * 0.2), // Focused around Maldives lat
        lon: 73.0 + (Math.random() * 2.0), // Jittered across multiple cells
        region: 'MALDIVES'
      });
    }
  }

  /**
   * Executes a massive "Bleaching Event" simulation.
   */
  async runStressTest() {
    logger.info('Stress', `STARTING SYNTHETIC LOAD: ${this.testers.length} concurrent claimants.`);

    const tasks = this.testers.map(async (tester) => {
      const alert: MarineAlert = {
        id: `SIM_ALERT_${tester.id}`,
        region: tester.region as MarineAlert['region'],
        stationId: `V_STATION_${tester.id}`,
        severity: 'CRITICAL',
        reason: 'SIMULATED_BLEACHING_LOAD',
        zScore: 4.2
      };

      // Concurrent request to the Sovereign Gate
      return payoutService.processParametricPayout(alert, 0.9, false, tester.lat, tester.lon);
    });

    const results = await Promise.all(tasks);
    const successful = results.filter(r => r === true).length;
    const blocked = results.filter(r => r === false).length;

    logger.info('Stress', `LOAD TEST COMPLETE: ${successful} authorized, ${blocked} blocked by deduplicator.`);
    return { successful, blocked };
  }

  /**
   * Proves Strong Atomicity under Multi-Region Contention.
   */
  async runGlobalContentionTest() {
    const geohash = 'swbf1';
    logger.warn('Stress', `STARTING CONTENTION TEST: Multi-region latch battle for ${geohash}`);

    // Regions attempting to claim the SAME geohash simultaneously
    const regions = ['MALDIVES', 'CARIBBEAN', 'PACIFIC', 'MEDITERRANEAN'];
    const tasks = regions.map(region => {
      const alert: MarineAlert = { 
        id: `CONT_ALERT_${region}`, 
        region: region as MarineAlert['region'], 
        stationId: `S_${region}`, 
        severity: 'CRITICAL',
        reason: 'GLOBAL_CONTENTION_PRESSURE',
        zScore: 5.0
      };
      return payoutService.processParametricPayout(alert, 1.0, false, 4.1, 73.5);
    });

    const results = await Promise.all(tasks);
    const winners = results.filter(r => r === true).length;
    
    if (winners !== 1) {
      logger.error('Stress', `FATAL: Contention violation! ${winners} regions acquired the same latch.`);
    } else {
      logger.info('Stress', 'PASS: Contention resolved accurately. Only one region won the latch.');
    }
    return winners === 1;
  }
    
  /**
   * Generates synthetic waitlist interest for investor demos.
   */
  async generateWaitlistDemand() {
    const sectors = ['MALDIVES', 'CARIBBEAN', 'PACIFIC', 'MEDITERRANEAN'];
    for (let i = 0; i < 25; i++) {
      const region = sectors[Math.floor(Math.random() * sectors.length)];
      logger.info('Steward', `NEW_WAITLIST_SIGNUP: Sector_${region} // Lat: 0.00 Lon: 0.00`);
    }
    return { count: 25, status: 'BUFFERED_FOR_ROLLOUT' };
  }
}

export const userSimulationService = new UserSimulationService();
