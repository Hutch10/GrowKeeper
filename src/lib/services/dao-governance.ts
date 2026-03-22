/**
 * GrowKeeper Autonomous Bio-DAO Service
 * Enables $GC holders to govern protocol parameters and standards.
 */

import { logger } from '../observability/logger';
import { metrics } from '../observability/metrics';
import { generateSecureId } from '../crypto-utils';

export interface DAOProposal {
  id: string;
  title: string;
  description: string;
  proposerNodeId: string;
  parameterToChange: 'REWARD_RATE' | 'VALUATION_THRESHOLD' | 'VALIDATOR_STAKE';
  newValue: number | string;
  votesFor: number; // $GC weight
  votesAgainst: number;
  deadline: string;
  status: 'PENDING' | 'PASSED' | 'FAILED' | 'EXECUTED';
}

export class DAOGovernanceService {
  private proposals: Map<string, DAOProposal> = new Map();

  /**
   * Submits a new governance proposal.
   */
  async submitProposal(
    nodeId: string, 
    title: string, 
    param: DAOProposal['parameterToChange'], 
    value: number | string
  ): Promise<DAOProposal> {
    const proposal: DAOProposal = {
      id: generateSecureId('PROP'),
      title,
      description: `Adjusting ${param} to ${value}`,
      proposerNodeId: nodeId,
      parameterToChange: param,
      newValue: value,
      votesFor: 0,
      votesAgainst: 0,
      deadline: new Date(Date.now() + 604800000).toISOString(), // 7 days
      status: 'PENDING'
    };

    this.proposals.set(proposal.id, proposal);
    logger.info('Governance', `DAO Proposal ${proposal.id} SUBMITTED by ${nodeId}: ${title}`);
    metrics.track('dao_proposal_submitted', 1, { param });
    
    return proposal;
  }

  /**
   * Casts a QUADRATIC + REPUTATION-WEIGHTED vote.
   * Voting Power = SquareRoot(Balance) * ReputationMultiplier
   */
  async castVote(
    proposalId: string, 
    nodeId: string, 
    gcBalance: number, 
    reputation: number, // 0.0 to 1.0 (performance history)
    support: boolean
  ): Promise<boolean> {
    const proposal = this.proposals.get(proposalId);
    if (!proposal || proposal.status !== 'PENDING') return false;

    // Reputation Multiplier: [0.5, 1.5]
    const repMultiplier = 0.5 + reputation; 
    const quadraticWeight = Math.sqrt(gcBalance) * repMultiplier;

    if (support) {
      proposal.votesFor += quadraticWeight;
    } else {
      proposal.votesAgainst += quadraticWeight;
    }

    this.proposals.set(proposalId, proposal);
    logger.info('Governance', `Reputation-Weighted Vote CAST on ${proposalId}. Power: ${quadraticWeight.toFixed(2)} VP (Rep: ${reputation.toFixed(2)})`);
    
    return true;
  }

  /**
   * Executes a passed proposal, updating protocol parameters.
   */
  async executeProposal(proposalId: string): Promise<boolean> {
    const proposal = this.proposals.get(proposalId);
    if (!proposal || proposal.status !== 'PASSED') return false;

    // Simulation: Automated parameter enforcement
    proposal.status = 'EXECUTED';
    this.proposals.set(proposalId, proposal);
    
    logger.info('Governance', `DAO Proposal ${proposalId} EXECUTED. Parameter ${proposal.parameterToChange} updated to ${proposal.newValue}`);
    metrics.track('dao_proposal_executed', 1, { param: proposal.parameterToChange });
    
    return true;
  }
}

export const daoGovernance = new DAOGovernanceService();
