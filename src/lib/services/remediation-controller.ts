
import { SpecimenRow as Specimen } from '@/app/actions/types';
import { logger } from '../observability/logger';
import { metrics } from '../observability/metrics';

export interface RemediationStatus {
  hasDrift: boolean;
  warnings: string[];
  suggestedAction?: string;
}

export class RemediationController {
  private readonly MOISTURE_FLOOR_PLANT = 35;
  private readonly MOISTURE_FLOOR_FUNGI = 60;
  private readonly MAX_SIGNATURE_AGE_HOURS = 48;

  /**
   * Evaluates a specimen for protocol drift and triggers emergency remediation if necessary.
   */
  async evaluateSpecimen(specimen: Specimen): Promise<RemediationStatus> {
    const warnings: string[] = [];
    let suggestedAction: string | undefined;

    // 1. Environmental Drift Check
    const moisture = (specimen.telemetry?.moisture || 1) * 100;
    if (specimen.kingdom === 'Plantae' && moisture < this.MOISTURE_FLOOR_PLANT) {
      warnings.push('CRITICAL_MOISTURE_DEFICIT');
      suggestedAction = 'Trigger Emergency Irrigation';
    } else if (specimen.kingdom === 'Fungi' && moisture < this.MOISTURE_FLOOR_FUNGI) {
      warnings.push('CRITICAL_HUMIDITY_DROP');
      suggestedAction = 'Trigger Fog Cannon Deployment';
    }

    // 2. Cryptographic Drift Check (Audit Longevity)
    const lastSigDate = specimen.last_vital_signature ? new Date(specimen.created_at) : new Date(0); // Simplified for simulation
    const sigAgeHours = (Date.now() - lastSigDate.getTime()) / (1000 * 60 * 60);

    if (sigAgeHours > this.MAX_SIGNATURE_AGE_HOURS) {
      warnings.push('PROTOCOL_AUDIT_STALE');
      if (!suggestedAction) suggestedAction = 'Perform Secure Vital Attestation';
    }

    const hasDrift = warnings.length > 0;

    if (hasDrift) {
      logger.warn('Remediation', `Protocol Drift detected for ${specimen.id}: ${warnings.join(', ')}`);
      metrics.track('protocol_drift_detected', warnings.length, { specimenId: specimen.id });
      
      // AUTO-REMEDIATION: In a real system, this would queue a Task in the database
      // For this simulation, we log the intent.
      logger.info('Remediation', `Autonomous Task Queued: ${suggestedAction}`);
    }

    return {
      hasDrift,
      warnings,
      suggestedAction
    };
  }

  /**
   * Forces a remediation protocol on a specimen.
   */
  async triggerRemediation(specimenId: string): Promise<boolean> {
    logger.info('Remediation', `Manually triggering remediation protocol for ${specimenId}`);
    // Simulate successful task creation
    return true;
  }
}

export const remediationController = new RemediationController();
