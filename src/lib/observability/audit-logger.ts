import { logger } from './logger';

export interface AuditEntry {
  id: string;
  timestamp: number;
  event: string;
  actor: string;
  rawData: unknown;
  confidenceMatrix: unknown;
  decision: string;
  approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | 'AUTO';
}

class AuditLogger {
  private logs: AuditEntry[] = [];

  constructor() {
    logger.info('Audit', 'Audit Trail initialized.');
  }

  async log(entry: Omit<AuditEntry, 'id' | 'timestamp'>) {
    const fullEntry: AuditEntry = {
      ...entry,
      id: `AUDIT_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      timestamp: Date.now()
    };

    this.logs.push(fullEntry);
    
    // In production, this would write to Supabase 'audit_logs' table
    logger.info('Audit', `Audit Trail Recorded: ${fullEntry.event} - Status: ${fullEntry.approvalStatus}`);
    
    return fullEntry;
  }

  getEntries() {
    return this.logs;
  }
}

export const auditLogger = new AuditLogger();
