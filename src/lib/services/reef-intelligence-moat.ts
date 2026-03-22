import { logger } from '../observability/logger';
import { BuoyTelemetry, MarineAlert } from '@/types/marine';

interface MoatEntry {
  vector: number[]; // Simplified embedding: [temp, ph, salinity, zScore]
  alert: MarineAlert;
  timestamp: number;
  adjudicated: boolean; // MUST be true to be used in similarity search
}

export class ReefIntelligenceMoat {
  private index: MoatEntry[] = [];
  private readonly SIMILARITY_THRESHOLD = 0.95;

  /**
   * Adds a new event to the Knowledge Moat.
   */
  async storeEvent(data: BuoyTelemetry, alert: MarineAlert, adjudicated: boolean = false): Promise<void> {
    const vector = [data.temperature, data.ph, data.salinity, alert.zScore];
    this.index.push({ vector, alert, timestamp: Date.now(), adjudicated });
    logger.info('Intelligence', `MOAT_UPDATE: Added pattern for ${alert.id}. Adjudicated: ${adjudicated}. Total: ${this.index.length}`);
  }

  /**
   * Searches for similar historical patterns (Cosines Similarity equivalent).
   * Only returns ADJUDICATED patterns (Anti-Poisoning).
   */
  async findSimilarPatterns(data: BuoyTelemetry): Promise<MarineAlert[]> {
    const input = [data.temperature, data.ph, data.salinity, 0];
    
    return this.index
      .filter(entry => entry.adjudicated) // CRITICAL: Anti-Poisoning Filter
      .filter(entry => {
        const dotProduct = input.reduce((acc, val, i) => acc + val * entry.vector[i], 0);
        const mag1 = Math.sqrt(input.reduce((acc, val) => acc + val * val, 0));
        const mag2 = Math.sqrt(entry.vector.reduce((acc, val) => acc + val * val, 0));
        const similarity = dotProduct / (mag1 * mag2);
        return similarity > this.SIMILARITY_THRESHOLD;
      })
      .map(entry => entry.alert);
  }

  /**
   * Marks an existing pattern as adjudicated after operator/quorum approval.
   */
  async adjudicate(alertId: string): Promise<void> {
    const entry = this.index.find(e => e.alert.id === alertId);
    if (entry) {
      entry.adjudicated = true;
      logger.info('Intelligence', `MOAT_ADJUDICATED: Pattern for ${alertId} now blessed as Truth.`);
    }
  }
}

export const reefIntelligenceMoat = new ReefIntelligenceMoat();
