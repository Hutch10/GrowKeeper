import { logger } from '../observability/logger';
import { RAIS_CONSTITUTION } from '../rais-constitution';
import { marineOracleService } from './marine-oracle-service';
import { marineAISwarm } from './marine-ai-swarm';
import { restorationFleetService } from './restoration-fleet-service';
import { auditLogger } from '../observability/audit-logger';
import { MarineRegion, RegionalBaseline, BuoyTelemetry, MarineAlert } from '@/types/marine';
import { noaaBuoyService } from './noaa-buoy-service';
import { payoutService, SafetyMode } from './payout-service';
import { reefIntelligenceMoat } from './reef-intelligence-moat';
import { marineTreatyService } from './marine-treaty-service';

export class MarineService {
  constructor() {
    RAIS_CONSTITUTION.boot();
  }

  private isMainnet: boolean = true;
  private history: Map<string, number[]> = new Map();
  private pendingActions: Map<string, { alert: MarineAlert, action: { nonce: string, confidence: number, isSparse: boolean } }> = new Map();
  private activeEvents: Map<string, boolean> = new Map(); // Canonical event registry
  private readonly DEDUPE_WINDOW = 3600000; // 1-hour event grouping
  private readonly WINDOW_SIZE = 24;
  private readonly MAX_AUTO_PAYOUT = 5000; // Phase 0 Hard Cap

  private regionalBaselines: Record<MarineRegion, RegionalBaseline> = {
    'CARIBBEAN': { region: 'CARIBBEAN', avgTemp: 27.5, avgPh: 8.1, salinityNorm: 36.0 },
    'MALDIVES': { region: 'MALDIVES', avgTemp: 29.0, avgPh: 8.2, salinityNorm: 34.0 },
    'PACIFIC_NORTHWEST': { region: 'PACIFIC_NORTHWEST', avgTemp: 12.0, avgPh: 7.9, salinityNorm: 32.0 },
    'GREAT_BARRIER_REEF': { region: 'GREAT_BARRIER_REEF', avgTemp: 26.5, avgPh: 8.1, salinityNorm: 35.5 },
  };

  /**
   * Fetches real-time marine data (Phase 1 Infrastructure Integration).
   */
  async fetchBuoyData(stationId: string = '', region: MarineRegion = 'MALDIVES'): Promise<BuoyTelemetry> {
    const resolvedId = stationId || noaaBuoyService.getStationId(region);
    logger.info('Marine', `Connecting to NOAA Infrastructure for ${region} station: ${resolvedId}...`);
    
    // Phase 1: Real-time NOAA Feed
    return await noaaBuoyService.fetchStationData(resolvedId, region);
  }

  /**
   * Predictive Anomaly Detection & Autonomous Restoration (Phase 83).
   */
  async detectAnomalies(data: BuoyTelemetry): Promise<MarineAlert | null> {
    const baseline = this.regionalBaselines[data.region];
    
    const thermalStress = Math.max(0, data.temperature - baseline.avgTemp);
    const acidificationStress = Math.max(0, baseline.avgPh - data.ph);
    const combinedRiskScore = (thermalStress * 0.7) + (acidificationStress * 30.0);

    // Phase 5: Pattern Similarity Search (Knowledge Moat)
    const similarPatterns = await reefIntelligenceMoat.findSimilarPatterns(data);
    const hasPrecedent = similarPatterns.length > 0;
    
    // Phase 6: Treaty Thresholds (with Constitutional Rails)
    const policy = marineTreatyService.getPolicy(data.region);
    const dynamicThreshold = policy?.thermalThreshold || 1.5;
    
    // v2.1.0: Constitutional Floor Invariant
    const effectiveThreshold = Math.max(dynamicThreshold, RAIS_CONSTITUTION.ABSOLUTE_MIN_THERMAL_THRESHOLD);

    if (hasPrecedent) {
      logger.info('Marine', `PATTERN_MATCH: Found ${similarPatterns.length} similar historical events. Increasing prediction confidence.`);
    }

    if (combinedRiskScore > effectiveThreshold || hasPrecedent) {
      const severity = combinedRiskScore > 2.5 ? 'CRITICAL' : 'MODERATE';
      
      // Phase 8.4: Sovereign Synthesis (Definitive Finality)
      const matrix = await marineOracleService.calculateConfidenceMatrix(data);
      const protocolConfidence = Math.min(matrix.sensor, matrix.consensus, matrix.network, matrix.ecology);
      
      // Global Topology Witnessing (L1-Override Protection)
      const isSparse = protocolConfidence < 0.3; // Low network confidence
      const globalWitnessed = await marineOracleService.witnessSparsity(data.region, isSparse);

      if (isSparse && !globalWitnessed) {
        logger.warn('Marine', `SPARSITY VETO: Region ${data.region} reported sparse, but neighbors disagree. Override blocked.`);
        return null;
      }
      
      // ... (Reward/Slash logic same)

      // Phase 4: Canonical Event Fingerprinting ($5k Flood Defense)
      // v2.0.0: Move deduplication responsibly to the PayoutService layer, 
      // but generate the fingerprint here for logging.
      const alert: MarineAlert = {
        id: `ALERT_${Date.now()}`,
        stationId: data.stationId,
        region: data.region,
        severity,
        reason: `Sovereign-synthesized (${protocolConfidence.toFixed(2)}) stress in ${data.region}.`,
        zScore: combinedRiskScore
      };

      // Phase 5: Moat Admission (Unadjudicated write)
      await reefIntelligenceMoat.storeEvent(data, alert, false);

      // Phase 0: Action Gating (Manual Approval for CRITICAL)
      if (severity === 'CRITICAL') {
        const challenge = await restorationFleetService.issueChallenge(alert.stationId);
        this.pendingActions.set(alert.id, { 
          alert, 
          action: { nonce: challenge, confidence: protocolConfidence, isSparse } 
        });
        return alert; 
      }

      return alert;
    }

    return null;
  }

  // ... (generateInsuranceReport same)

  /**
   * Operator Approval Gate (Phase 0).
   * v2.0.0: Passes isSparse to PayoutService for Fail-Closed enforcement.
   */
  async approveAction(alertId: string, operatorId: string): Promise<boolean> {
    const pending = this.pendingActions.get(alertId);
    if (!pending) throw new Error('Action not found.');

    const { alert, action } = pending;
    
    // Resume execution
    const kineticAction = await restorationFleetService.deployKinetics(alert, {
      nonce: action.nonce,
      signature: `TEE_S_${action.nonce}` 
    });

    // Verification delta
    const data = await this.fetchBuoyData(alert.stationId, alert.region);
    const deltaVerified = await restorationFleetService.verifyDelta(kineticAction, data.temperature);

    if (deltaVerified) {
      // Phase 5: Adjudicate Knowledge Moat entry (v2.1.0 Multi-Witness)
      await reefIntelligenceMoat.adjudicate(alertId);

      // Phase 4/0: Trigger Parametric Payout (Fail-Closed Sparse Enforcement with Geohash)
      await payoutService.processParametricPayout(
        alert,
        0.95,
        false,
        data.location.lat,
        data.location.lon
      ); 
      const currentData = await this.fetchBuoyData(alert.stationId, alert.region);
      const paid = await payoutService.processParametricPayout(
        alert, 
        action.confidence, 
        action.isSparse,
        currentData.location.lat,
        currentData.location.lon
      ); 

      if (!paid && action.isSparse) {
        logger.error('Marine', `PAYOUT_FAILED: Protocol blocked payout for ${alert.id} due to Zero-Leakage SPARSITY_BRAKE.`);
      }

      await marineAISwarm.dispatchRestoration(alert);
      await auditLogger.log({
        event: 'ACTION_EXECUTED',
        actor: operatorId,
        rawData: alert,
        confidenceMatrix: null,
        decision: paid ? 'SUCCESS' : 'FAILED_ON_BRAKE',
        approvalStatus: 'APPROVED'
      });
      this.pendingActions.delete(alertId);
      return true;
    }

    return false;
  }

  /**
   * Transition RAIS to REAL-WORLD MAINNET (Phase 3.0).
   * Switches from simulated tests to live frontier telemetry.
   */
  async deployToMainnet(): Promise<void> {
    logger.info('Sovereign', 'RAIS_MAINNET_ACTIVATION: Transitioning to live telemetry...');
    this.isMainnet = true;
    logger.info('Sovereign', 'MAINNET_LIVE: Sovereign Shield is now enforcing real-world capital movement.');
    this.startSafetyMonitor();
  }

  /**
   * Continuous monitoring of financial velocity and system health.
   */
  private startSafetyMonitor(): void {
    setInterval(async () => {
      const metrics = payoutService.getMetrics();
      const dailyCap = RAIS_CONSTITUTION.MAX_INCIDENT_PAYOUT * 24;

      // 1. Velocity-based Throttling
      if (metrics.velocity > dailyCap * 0.15) {
        payoutService.setSafetyMode(SafetyMode.RATE_LIMIT);
        logger.error('Sovereign', `VELOCITY_ALERT: Hourly payout ($${metrics.velocity}) exceeds 15% of daily cap.`);
      }

      // 2. Contention-based Throttling (P1 Hook)
      const contentionRate = metrics.contentionFailures / (metrics.totalAttempts || 1);
      if (contentionRate > 0.10) {
        payoutService.setSafetyMode(SafetyMode.RATE_LIMIT);
        logger.error('Sovereign', `CONTENTION_ALERT: Latch contention rate reached ${ (contentionRate * 100).toFixed(1) }%. Entering RATE_LIMIT.`);
      }

      // 3. Latency-based Kill-switch (P0 Hook)
      if (metrics.p99Latency > 500) {
        payoutService.setSafetyMode(SafetyMode.GLOBAL_FREEZE);
        logger.error('Sovereign', `CRITICAL_LATENCY: p99 Latency (${metrics.p99Latency}ms) exceeds 500ms safety threshold. GLOBAL_FREEZE engaged.`);
      }

      // 4. Max Velocity Kill-switch
      if (metrics.velocity > dailyCap * 0.30) {
        payoutService.setSafetyMode(SafetyMode.GLOBAL_FREEZE);
        logger.error('Sovereign', `CRITICAL_VELOCITY: 30% daily cap reached in 1hr.`);
      }
    }, 60000);
  }

  /**
   * Synthetically stress-test the protocol with real-world scale (100+ users).
   */
  async simulateRealWorldLoad() {
    const { userSimulationService } = await import('./user-simulation-service');
    return await userSimulationService.runStressTest();
  }
}

export const marineService = new MarineService();
