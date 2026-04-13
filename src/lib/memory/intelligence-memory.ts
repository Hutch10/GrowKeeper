import { memoryDB, IntelligenceMemoryDoc, fromPouch, toPouch } from '@/lib/pouchdb';
import { createClient } from '@/lib/supabase-server';
import { recordAuditEntry } from '@/lib/services/audit-ledger';
import { AuditSentinel } from '@/lib/agents/audit-sentinel';

/**
 * Intelligence Memory Manager
 * Handles the hybrid persistence lifecycle for the deterministic intelligence stack.
 */

export class IntelligenceMemoryManager {
  /**
   * Persists a memory record to both local PouchDB and Cloud Supabase (canonical).
   * ENFORCEMENT: Defaults to BUFFERED_LOCAL. Certified only after verified cloud write.
   */
  static async persist(
    doc: Omit<IntelligenceMemoryDoc, '_id' | '_rev' | 'created_at' | 'updated_at' | 'sync_status'>,
    correlation_id: string
  ): Promise<boolean> {
    const now = new Date().toISOString();
    const id = crypto.randomUUID();
    
    // 1. Initialize as BUFFERED_LOCAL (Enforced lock)
    const docToBuffer: IntelligenceMemoryDoc = {
      ...doc,
      _id: id,
      sync_status: 'BUFFERED_LOCAL',
      created_at: now,
      updated_at: now,
      correlation_id
    };

    try {
      // Step A: Local Mirror Initial Write
      await memoryDB.put(docToBuffer as any);

      // Step B: Attempt Cloud Canonical Write
      const supabase = createClient();
      const tableName = this.mapDocTypeToTable(doc.doc_type);
      
      const { error } = await supabase.from(tableName).insert({
        ...doc.payload,
        id,
        user_id: (await supabase.auth.getUser()).data.user?.id,
        correlation_id,
        specimen_id: doc.specimen_id,
        provenance: doc.provenance,
        sync_status: 'SYNCED_CLOUD', // The cloud record is certified by definition upon creation
        created_at: now,
        updated_at: now
      });

      if (error) {
        console.warn(`[MEMORY_SYNC_DEFERRED] ${doc.doc_type} remains BUFFERED_LOCAL.`, error.message);
        return false;
      }

      // Step C: Verified Promotion to SYNCED_CLOUD in Local Mirror
      const latest = await memoryDB.get(id);
      await memoryDB.put({ ...latest, sync_status: 'SYNCED_CLOUD' });
      
      await recordAuditEntry({
        action: "UPDATE",
        target: "registry",
        targetId: doc.specimen_id,
        metadata: { type: "MEMORY_CERTIFIED", doc_type: doc.doc_type, id },
        provenance: "SYSTEM"
      });

      return true;

    } catch (err) {
      console.error("[MEMORY_PERSIST_FAULT] Record remains uncertified in local authority.", err);
      return false;
    }
  }

  /**
   * Retrieves the integrity timeline for a specimen (merged local + cloud).
   */
  static async getIntegrityTimeline(specimen_id: string): Promise<IntelligenceMemoryDoc[]> {
    // In Alpha, we query the local mirror as the primary UI source for performance,
    // assuming periodic reconciliation keeps it fresh.
    const result = await memoryDB.find({
      selector: {
        specimen_id
      },
      sort: [{ 'created_at': 'desc' }]
    });

    return result.docs.map(doc => fromPouch<IntelligenceMemoryDoc>(doc));
  }

  /**
   * Reconciles the local backlog by replaying uncertified records to the cloud.
   * ENFORCEMENT: Only promotes to SYNCED_CLOUD after verified Supabase success.
   */
  static async reconcileBacklog(): Promise<{ processed: number; success: number; failed: number }> {
    const result = { processed: 0, success: 0, failed: 0 };
    
    try {
      // 1. Fetch all uncertified records
      const backlog = await memoryDB.find({
        selector: { sync_status: 'BUFFERED_LOCAL' }
      });

      result.processed = backlog.docs.length;

      for (const doc of backlog.docs) {
        const memoryDoc = fromPouch<IntelligenceMemoryDoc>(doc);
        
        try {
          const supabase = createClient();
          const tableName = this.mapDocTypeToTable(memoryDoc.doc_type);
          
          // id-based upsert ensures idempotency
          AuditSentinel.validateTransition(memoryDoc.sync_status, 'SYNCED_CLOUD', 'REPLAY_CERTIFICATION');

          // Integrity check: If this is a specimen update, ensure causality
          if (memoryDoc.doc_type === 'integrity_timeline_entry') {
             // In a more complex sync, we would fetch the cloud version here and use reconciliation.reconcile()
             // For now, we rely on the AuditSentinel and the unique correlation_id to prevent redundant transitions.
          }
          
          const { error } = await supabase.from(tableName).upsert({
            ...memoryDoc.payload,
            id: memoryDoc.id,
            user_id: (await supabase.auth.getUser()).data.user?.id,
            correlation_id: memoryDoc.correlation_id,
            specimen_id: memoryDoc.specimen_id,
            provenance: memoryDoc.provenance,
            sync_status: 'SYNCED_CLOUD',
            created_at: memoryDoc.created_at,
            updated_at: new Date().toISOString()
          });

          if (error) {
            console.warn(`[REPLAY_FAILED] Record ${memoryDoc.id} remain uncertified.`, error.message);
            result.failed++;
            continue;
          }

          // Step C: Verified Promotion (Context-Aware should be checked if we had complex logic, 
          // but here we just update the local mirror status)
          await memoryDB.put({
            ...doc,
            sync_status: 'SYNCED_CLOUD',
            updated_at: new Date().toISOString()
          });
          
          result.success++;

        } catch (err) {
          console.error(`[REPLAY_FAULT] Interruption during record ${memoryDoc.id} replay.`, err);
          result.failed++;
        }
      }
    } catch (err) {
      console.error("[BACKLOG_RECONCILE_PANIC] Master replay loop interrupted.", err);
    }

    return result;
  }

  private static mapDocTypeToTable(type: string): string {
    switch (type) {
      case 'conflict_history': return 'conflict_history';
      case 'operator_intervention': return 'operator_interventions';
      case 'integrity_timeline_entry': return 'integrity_timeline';
      default: return 'alpha_events';
    }
  }
}
