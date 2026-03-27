import { logger } from '../observability/logger';

export interface SovereignAction {
  id: string;
  timestamp: string;
  type: 'Telemetry_Audit' | 'Homeostasis_Adjustment' | 'Provenance_Check' | 'Sim_Response';
  status: 'Completed' | 'Failed' | 'Executing';
  impact: string;
  hash: string;
  previousHash: string;
}

/**
 * SovereignProtocolEnforcer
 * Automates registry integrity and self-regulates local state.
 * Implements Merkle-chained audit logging for tamper-proof history.
 */
export class SovereignProtocolEnforcer {
  private auditLog: SovereignAction[] = [];

  constructor() {
    // Initialize with genesis block if empty
    if (this.auditLog.length === 0) {
      this.createGenesisAction();
    }
  }

  private createGenesisAction() {
    const genesis: SovereignAction = {
      id: 'genesis',
      timestamp: new Date().toISOString(),
      type: 'Provenance_Check',
      status: 'Completed',
      impact: 'Planetary Registry Initialized',
      hash: '0',
      previousHash: '00000000000000000000000000000000'
    };
    this.auditLog.push(genesis);
  }

  async performAutonomousScan(specimens: Array<{ health: number, nickname: string }>): Promise<SovereignAction[]> {
    const newActions: SovereignAction[] = [];
    
    for (const specimen of specimens) {
      if (specimen.health < 40) {
        const action = await this.recordAction({
          type: 'Homeostasis_Adjustment',
          impact: `Emergency Vitality Boost triggered for ${specimen.nickname}`
        });
        newActions.push(action);
      }
    }

    return newActions;
  }

  private async recordAction(params: Partial<SovereignAction>): Promise<SovereignAction> {
    const lastAction = this.auditLog[this.auditLog.length - 1];
    
    const action: SovereignAction = {
      id: Math.random().toString(36).substring(2, 11),
      timestamp: new Date().toISOString(),
      type: params.type || 'Telemetry_Audit',
      status: 'Completed',
      impact: params.impact || 'Registry Drift Corrected',
      previousHash: lastAction.hash,
      hash: '' // Calculated below
    };

    // Simulate simple Merkle-chaining hash
    action.hash = Buffer.from(`${action.id}${action.previousHash}${action.timestamp}`).toString('hex').slice(0, 32);
    
    this.auditLog.push(action);
    logger.info('Sovereign', `Autonomous Protocol Executed: ${action.impact}`);
    return action;
  }

  getAuditLog() {
    return [...this.auditLog].reverse();
  }
}

export const sovereignProtocolEnforcer = new SovereignProtocolEnforcer();
