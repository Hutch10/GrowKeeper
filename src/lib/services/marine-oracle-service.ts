import { logger } from '../observability/logger';
import { BuoyTelemetry } from '@/types/marine';

export interface OracleAttestation {
  oracleId: string;
  stationId: string;
  agrees: boolean;
  signature: string;
}

export interface ConfidenceMatrix {
  sensor: number;
  consensus: number;
  network: number;
  ecology: number;
}

export class MarineOracleService {
  private epochHistory: Map<string, ConfidenceMatrix[]> = new Map();
  private isSlashingPaused = false;

  /**
   * Calculates a Componentized Confidence Matrix (Phase 8.4).
   * Prevents 'Confidence Laundering' by separating signal modalities.
   */
  async calculateConfidenceMatrix(data: BuoyTelemetry): Promise<ConfidenceMatrix> {
    const divergence = this.calculateDivergence(data);
    
    // Component 1: Sensor Integrity (ZK + Hardware lineage)
    const sensorBase = this.calculateIndependenceWeight(data.stationId); 
    
    // Component 2: Consensus Strength (Simulated as stable in Phase 0)
    const consensusBase = 1.0; 
    
    // Component 3: Network Topology
    const networkBase = 0.95; 
    
    // Gradient Decay Logic
    const decay = divergence > 0.15 ? Math.max(0, 1 - (divergence - 0.15) / 0.15) : 1.0;

    const currentMatrix: ConfidenceMatrix = {
      sensor: sensorBase * decay,
      consensus: consensusBase * decay,
      network: networkBase,
      ecology: 0.9 // Reality anchor (Satellite/EDNA)
    };

    // Phase 8.4: Multi-Epoch Persistence (Persistence over 3 epochs)
    this.updateEpochHistory(data.stationId, currentMatrix);
    return this.getPersistentMatrix(data.stationId, currentMatrix);
  }

  private calculateIndependenceWeight(nodeId: string): number {
    // Phase 8.4: Independence Scoring (Manufacturers/Operators)
    const knownCollusionGroup = ['ORCL_A1', 'ORCL_A2']; // Mock
    return knownCollusionGroup.includes(nodeId) ? 0.6 : 1.0;
  }

  private updateEpochHistory(nodeId: string, matrix: ConfidenceMatrix) {
    const history = this.epochHistory.get(nodeId) || [];
    history.push(matrix);
    if (history.length > 3) history.shift();
    this.epochHistory.set(nodeId, history);
  }

  private getPersistentMatrix(nodeId: string, current: ConfidenceMatrix): ConfidenceMatrix {
    const history = this.epochHistory.get(nodeId) || [];
    if (history.length < 3) return current;

    // Truth must persist. If any epoch was unstable, confidence drops.
    return {
      sensor: Math.min(...history.map(m => m.sensor)),
      consensus: Math.min(...history.map(m => m.consensus)),
      network: Math.min(...history.map(m => m.network)),
      ecology: Math.min(...history.map(m => m.ecology))
    };
  }

  /**
   * Global Topology Witnessing (Phase 8.4).
   * Prevents asymmetric perception via cross-region veto.
   */
  async witnessSparsity(region: string, localSparsity: boolean): Promise<boolean> {
    if (!localSparsity) return false;
    
    // Consensus: Do adjacent healthy regions confirm fragmentation?
    const witnesses = ['REG_NORTH', 'REG_SOUTH']; 
    const agreement = witnesses.length > 0 ? 1.0 : 0.0; // Mock witness verification

    logger.info('Oracle', `Global Topology Witness for ${region}: ${agreement * 100}% confirm sparsity.`);
    return agreement > 0.8; 
  }

  private calculateDivergence(source: BuoyTelemetry): number {
    const avgNeighborTemp = 28.6;
    return Math.abs(source.temperature - avgNeighborTemp) / avgNeighborTemp;
  }

  setSlashingStatus(paused: boolean): void {
    this.isSlashingPaused = paused;
  }

  getSlashingStatus(): boolean {
    return this.isSlashingPaused;
  }
}

export const marineOracleService = new MarineOracleService();
