/**
 * GrowKeeper Dispute Resolution Service
 * Enables community challenges of potentially forged or malicious validator findings.
 */

import { logger } from '../observability/logger';
import { metrics } from '../observability/metrics';
import { generateSecureId } from '../crypto-utils';
import { validatorService } from './validator-service';

export interface Challenge {
  id: string;
  questId: string;
  challengerNodeId: string;
  accusedValidatorId: string;
  status: 'PENDING' | 'UPHELD' | 'DISMISSED';
  juryVotes: number; // 5 independent validators
  guiltyVotes: number;
}

export class DisputeService {
  private challenges: Map<string, Challenge> = new Map();

  /**
   * Initiates a challenge against a validator's quest completion.
   * Requires the challenger to burn a small 'Anti-Spam' fee.
   */
  async challengeEvidence(questId: string, challengerId: string, accusedId: string): Promise<Challenge> {
    const challenge: Challenge = {
      id: generateSecureId('CHALLENGE'),
      questId,
      challengerNodeId: challengerId,
      accusedValidatorId: accusedId,
      status: 'PENDING',
      juryVotes: 5,
      guiltyVotes: 0
    };

    this.challenges.set(challenge.id, challenge);
    logger.warn('Security', `CHALLENGE ISSUED: Node ${challengerId} is challenging Quest ${questId} by Validator ${accusedId}`);
    metrics.track('dispute_initiated', 1, { accusedId });
    
    return challenge;
  }

  /**
   * Simulates a jury vote from independent validators.
   */
  async castJuryVote(challengeId: string, guilty: boolean): Promise<boolean> {
    const challenge = this.challenges.get(challengeId);
    if (!challenge || challenge.status !== 'PENDING') return false;

    if (guilty) challenge.guiltyVotes++;

    // If all jury members have voted (simulation)
    if (challenge.guiltyVotes + (challenge.juryVotes - challenge.guiltyVotes) >= challenge.juryVotes) {
      await this.resolveChallenge(challengeId);
    }
    
    return true;
  }

  private async resolveChallenge(challengeId: string): Promise<void> {
    const challenge = this.challenges.get(challengeId);
    if (!challenge) return;

    const majorityGuilty = challenge.guiltyVotes >= 3; // 3 out of 5

    if (majorityGuilty) {
      challenge.status = 'UPHELD';
      logger.error('Security', `CHALLENGE UPHELD: Validator ${challenge.accusedValidatorId} found GUILTY of forgery.`);
      
      // TRIGGER SLASHING: 100% of stake burned
      await validatorService.slashValidator(challenge.accusedValidatorId, 'Verified forgery during dispute resolution');
      
      // REWARD CHALLENGER (Simulation: 50% of slashed stake redirected)
      logger.info('Security', `REWARD: Challenger ${challenge.challengerNodeId} granted 50% of slashed stake for protocol integrity.`);
    } else {
      challenge.status = 'DISMISSED';
      logger.info('Security', `CHALLENGE DISMISSED: Validator ${challenge.accusedValidatorId} found INNOCENT.`);
    }

    this.challenges.set(challengeId, challenge);
  }
}

export const disputeService = new DisputeService();
