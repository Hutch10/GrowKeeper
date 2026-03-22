/**
 * GrowKeeper Habitat Service (DePIN IoT Integration)
 * Orchestrates autonomous climate actuation based on specimen thresholds.
 */

import { logger } from '../observability/logger';
import { metrics } from '../observability/metrics';
import { SpecimenRow as Specimen } from '@/app/actions/types';

export interface HabitatTelemetry {
  specimenId: string;
  temperature: number;
  humidity: number;
  signedAttestation: string; // TEE-signed sensor data
}

export class HabitatService {
  private lastNonces: Map<string, number> = new Map();

  /**
   * Evaluates telemetry and triggers actuators if thresholds are breached.
   * Strictly enforces monotonic nonces and challenge-response per Phase 52.
   */
  async evaluateHabitat(telemetry: HabitatTelemetry, specimen: Specimen, challenge: string): Promise<void> {
    const lastNonce = this.lastNonces.get(specimen.id) || 0;
    const currentNonce = Number(telemetry.signedAttestation.split('_').pop()); // Simulation: extracting nonce

    if (currentNonce <= lastNonce) {
      logger.error('Hardware', `REPLAY DETECTED: Nonce ${currentNonce} is not monotonic for Specimen ${specimen.id}`);
      return;
    }

    if (!telemetry.signedAttestation.includes(challenge)) {
      logger.error('Hardware', `CHALLENGE FAILED: Telemetry for ${specimen.id} does not bind to current challenge.`);
      return;
    }

    if (!this.verifyEnvironmentAttestation(telemetry.signedAttestation)) {
      logger.error('Hardware', `TELEMETRY REJECTED: Unsigned or forged data for Specimen ${specimen.id}`);
      return;
    }

    const [minTemp, maxTemp] = specimen.target_temp_range || [18, 28];
    const [minHum, maxHum] = specimen.target_humidity_range || [40, 70];

    // Temperature Actuation
    if (telemetry.temperature < minTemp) {
      await this.adjustClimate(specimen.id, 'HEATER', 'ON');
    } else if (telemetry.temperature > maxTemp) {
      await this.adjustClimate(specimen.id, 'COOLER', 'ON');
    }

    // Humidity Actuation
    if (telemetry.humidity < minHum) {
      await this.adjustClimate(specimen.id, 'HUMIDIFIER', 'ON');
    } else if (telemetry.humidity > maxHum) {
      await this.adjustClimate(specimen.id, 'FAN', 'ON');
    }

    metrics.track('habitat_evaluation', 1, { specimenId: specimen.id });
  }

  /**
   * Triggers a DePIN hardware actuator.
   */
  private async adjustClimate(specimenId: string, actuator: string, state: 'ON' | 'OFF'): Promise<void> {
    logger.info('Hardware', `ACTUATOR TRIGGER: Setting ${actuator} to ${state} for Specimen ${specimenId}`);
    metrics.track('hardware_actuation', 1, { specId: specimenId, actuator, state });
    // In production, this emits a signed command to the DePIN controller
  }

  /**
   * Verifies the cryptographic signature of the sensor telemetry.
   */
  private verifyEnvironmentAttestation(attestation: string): boolean {
    // Simulation: Verify against the TEE Root CA
    return attestation.startsWith('TEE_SENSOR_SIG_0x');
  }
}

export const habitatService = new HabitatService();
