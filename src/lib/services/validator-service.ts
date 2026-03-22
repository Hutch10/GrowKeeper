/**
 * GrowKeeper Validator Service
 * Manages the decentralized network of human/machine "Validators" who provide physical proof-of-life.
 */

import { SpecimenRow as Specimen } from '@/app/actions/types';
import { logger } from '../observability/logger';
import { metrics } from '../observability/metrics';
import { generateSecureId } from '../crypto-utils';
import { depinController } from './depin-controller';

export interface VerificationQuest {
  id: string;
  specimenId: string;
  requiredAngle: string;
  deadline: string;
  rewardGC: number;
  status: 'PENDING' | 'COMPLETED' | 'EXPIRED';
}

export class ValidatorService {
  private activeQuests: Map<string, VerificationQuest> = new Map();
  private readonly STAKE_REQUIRED = 500; // $GC

  /**
   * Registers a node as a Validator for a specific asset.
   * Enforces ADAPTIVE STAKING: minStake = max(500, assetValue * 0.10)
   */
  async registerValidator(nodeId: string, stakeAmount: number, targetAsset: Specimen): Promise<boolean> {
    const assetValue = targetAsset.last_valuation || 0;
    const requiredStake = Math.max(500, assetValue * 0.10);

    if (stakeAmount < requiredStake) {
      logger.error('Security', `Node ${nodeId} rejected as Validator: Insufficient adaptive stake. Required: ${requiredStake} $GC`);
      return false;
    }
    
    logger.info('Security', `Node ${nodeId} registered as INSTITUTIONAL VALIDATOR. Stake Locked: ${stakeAmount} $GC`);
    return true;
  }

  /**
   * Slashes a validator's stake for verified collusion or forgery.
   */
  async slashValidator(nodeId: string, reason: string): Promise<void> {
    const slashAmount = this.STAKE_REQUIRED; // Simplified for simulation
    logger.warn('Security', `SLASHING INITIATED: Node ${nodeId} stake burned due to: ${reason}`);
    
    // Route 25% to Insurance Pool (Phase 43)
    const insuranceContribution = slashAmount * 0.25;
    logger.debug('Insurance', `Routing ${insuranceContribution} $GC from slash to Global Insurance Pool.`);

    metrics.track('validator_slashed', 1, { nodeId, reason });
  }

  /**
   * Issues a "Physical Verification Quest" to the network.
   * This is the final defense against TF.js "Digital Forgery."
   */
  async issueVerificationQuest(specimen: Specimen): Promise<VerificationQuest> {
    const quest: VerificationQuest = {
      id: generateSecureId('QUEST'),
      specimenId: specimen.id,
      requiredAngle: 'Macro shot of leaf underside (45 degrees)',
      deadline: new Date(Date.now() + 3600000).toISOString(), // 1 hour
      rewardGC: 1.5,
      status: 'PENDING'
    };

    this.activeQuests.set(quest.id, quest);
    logger.info('Oracle', `Verification QUEST issued for ${specimen.id}. Challenge: ${quest.requiredAngle}`);
    
    return quest;
  }

  /**
   * Completes a quest and rewards the validator.
   */
  async submitVerification(questId: string, validatorNodeId: string, evidenceHash: string): Promise<boolean> {
    const quest = this.activeQuests.get(questId);
    if (!quest || quest.status !== 'PENDING') return false;

    quest.status = 'COMPLETED';
    this.activeQuests.set(questId, quest);
    
    // Distribute rewards via DePIN controller
    await depinController.processSubmission(validatorNodeId, true);
    
    metrics.track('validator_quest_completed', 1, { questId, validatorNodeId });
    logger.info('Oracle', `Validator ${validatorNodeId} SEALED quest ${questId}. Evidence: ${evidenceHash}`);
    
    return true;
  }
}

export const validatorService = new ValidatorService();
