import { logger } from '../observability/logger';
import { MarineAlert } from '@/types/marine';
import { marineTreatyService } from './marine-treaty-service';
import { payoutService } from './payout-service';
import { supabase } from '../supabase';

/**
 * TreatyEnforcer Service (v4.6.7)
 * The 'Controller' for Commercial Sovereignty.
 * Bridges biological intelligence (Alerts) to financial finality (Payouts).
 */
export class TreatyEnforcer {
  /**
   * Processes an incoming Marine Alert against regional treaty policies.
   * If a breach is confirmed, triggers the payout pipeline.
   */
  async enforceTreaty(alert: MarineAlert): Promise<void> {
    const policy = marineTreatyService.getPolicy(alert.region);
    
    if (!policy) {
      logger.warn('Governance', `ENFORCEMENT_SKIP: No active treaty for region ${alert.region}.`);
      return;
    }

    if (!policy.autoPayoutEnabled) {
      logger.info('Governance', `ENFORCEMENT_MANUAL: Auto-payout disabled for ${alert.region}. Alert queued for operator review.`);
      return;
    }

    // 1. Threshold Breach Detection
    const thermalBreach = (alert.tempDelta ?? 0) > policy.thermalThreshold;
    const phBreach = (alert.phDelta ?? 0) > policy.phThreshold;

    if (thermalBreach || phBreach) {
      logger.info('Sovereign', `TREATY_BREACH_DETECTED: Region ${alert.region} exceeded legal limits. Initiating settlement...`);
      
      // 2. Trigger Payout Pipeline with Confidence Weighting
      // Confidence is derived from the alert's internal sensors and spatial parity
      const confidence = alert.confidence || 0.85; 
      
      const success = await payoutService.processParametricPayout(
        alert, 
        confidence, 
        false, // Sparse mode check handled inside PayoutService
        alert.lat, 
        alert.lng
      );

      if (success) {
        // 3. Log Enforcement Action to Substrate Registry
        await this.logEnforcementAction(alert, policy, 'AUTO_APPROVED');
      } else {
        await this.logEnforcementAction(alert, policy, 'REJECTED_BY_LATCH');
      }
    } else {
      logger.debug('Sovereign', `ENFORCEMENT_IDLE: Alert within regional limits for ${alert.region}.`);
    }
  }

  /**
   * Records the enforcement decision in the permanent audit registry.
   */
  private async logEnforcementAction(alert: MarineAlert, policy: { version: number, phThreshold: number, thermalThreshold: number }, decision: string): Promise<void> {
    // Cast to any to bypass missing audit_logs type in generated schema
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from('audit_logs')
      .insert({
        event_type: 'TREATY_ENFORCEMENT',
        actor_id: `SOVEREIGN_ENFORCER_v4.6.7`,
        decision: decision,
        approval_status: decision.includes('APPROVED') ? 'AUTO' : 'REJECTED',
        raw_data: {
          alert_id: alert.id,
          region: alert.region,
          tempDelta: alert.tempDelta,
          phDelta: alert.phDelta,
          treaty_version: policy.version
        },
        confidence_matrix: {
          confidence: alert.confidence,
          thermalThreshold: policy.thermalThreshold,
          phThreshold: policy.phThreshold
        }
      });

    if (error) {
      logger.error('Database', `AUDIT_LOG_FAILURE: Failed to record enforcement action for ${alert.id}. Error: ${error.message}`);
    } else {
      logger.info('Forensics', `ENFORCEMENT_AUDITED: Decision '${decision}' recorded for incident ${alert.id}.`);
    }
  }
}

export const treatyEnforcer = new TreatyEnforcer();
