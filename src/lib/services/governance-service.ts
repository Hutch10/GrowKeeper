import { logger } from "../observability/logger";
import { metrics } from "../observability/metrics";
import { liquidityPool } from "./liquidity-pool";
import { strategicReserve } from "./strategic-reserve";

export interface ProtocolProposal {
  id: string;
  title: string;
  description: string;
  status: "ACTIVE" | "PASSED" | "REJECTED" | "EXPIRED";
  votesFor: number;
  votesAgainst: number;
  threshold: number;
  expiry: string;
}

class GovernanceService {
  private proposals: ProtocolProposal[] = [
    {
      id: "prop_001",
      title: "Adjust Reserve Target to 45%",
      description: "Increase over-collateralization to counter simulated volatility spikes.",
      status: "ACTIVE",
      votesFor: 1250000,
      votesAgainst: 450000,
      threshold: 2000000,
      expiry: new Date(Date.now() + 86400000 * 3).toISOString()
    },
    {
      id: "prop_002",
      title: "Enable Yield Optimizer V2",
      description: "Deploy the new risk-adjusted rebalancing algorithm.",
      status: "ACTIVE",
      votesFor: 2800000,
      votesAgainst: 120000,
      threshold: 3000000,
      expiry: new Date(Date.now() + 86400000 * 5).toISOString()
    }
  ];

  /**
   * Calculates voting power based on active positions and seniority vouchers.
   */
  async calculateVotingPower(custodianId: string): Promise<number> {
    const positions = await liquidityPool.getCustodianPositions(custodianId);
    const vouchers = await strategicReserve.getVouchers(custodianId);

    const basePower = positions.reduce((acc, p) => acc + p.amount, 0);
    const seniorityBonus = vouchers.reduce((acc, v) => acc + (v.amount * 1.5), 0); // 50% bonus for vesting

    return basePower + seniorityBonus;
  }

  async getProposals(): Promise<ProtocolProposal[]> {
    return this.proposals;
  }

  async castVote(proposalId: string, custodianId: string, support: boolean): Promise<boolean> {
    const proposal = this.proposals.find(p => p.id === proposalId);
    if (!proposal || proposal.status !== "ACTIVE") return false;

    const power = await this.calculateVotingPower(custodianId);
    if (support) proposal.votesFor += power;
    else proposal.votesAgainst += power;

    logger.info('Governance', `${custodianId} cast ${power} votes ${support ? 'FOR' : 'AGAINST'} ${proposalId}.`);
    metrics.track('governance_vote', power, { proposalId, support: support.toString() });

    return true;

  }
}

export const governanceService = new GovernanceService();
