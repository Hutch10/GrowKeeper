import { operationsDB } from "../pouchdb";
import { toast } from "sonner";

export type OperationType = 'water' | 'fertilize' | 'add_specimen' | 'complete_task';

export interface QueuedOperation {
  id: string;
  type: OperationType;
  payload: Record<string, unknown>;
  timestamp: string;
  status: 'pending' | 'syncing' | 'failed';
  error?: string;
  retryCount: number;
}

class OperationQueue {
  private isSyncing = false;

  /**
   * Enqueue a new operation for offline persistence
   */
  async enqueue(type: OperationType, payload: Record<string, unknown>) {
    const operation: QueuedOperation = {
      id: `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      payload,
      timestamp: new Date().toISOString(),
      status: 'pending',
      retryCount: 0
    };

    try {
      await operationsDB.put({
        ...operation,
        _id: operation.id
      });
      
      console.log(`[OperationQueue] Enqueued ${type}:`, operation.id);
      
      // Attempt immediate sync if online
      if (typeof window !== 'undefined' && navigator.onLine) {
        this.processQueue();
      }
      
      return operation.id;
    } catch (err) {
      console.error("[OperationQueue] Failed to enqueue operation:", err);
      throw err;
    }
  }

  /**
   * Process all pending operations in the queue
   */
  async processQueue() {
    if (this.isSyncing) return;
    this.isSyncing = true;

    try {
      const result = await operationsDB.allDocs({ include_docs: true });
      const pendingOps = result.rows
        .map(row => row.doc as unknown as QueuedOperation & { _id: string, _rev: string })
        .filter(doc => !!doc && (doc.status === 'pending' || doc.status === 'failed'))
        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

      if (pendingOps.length === 0) {
        this.isSyncing = false;
        return;
      }

      console.log(`[OperationQueue] Processing ${pendingOps.length} pending operations...`);
      
      for (const op of pendingOps) {
        await this.syncOperation(op);
      }
      
    } catch (err) {
      console.error("[OperationQueue] Queue processing error:", err);
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Sync a single operation to the server actions
   */
  private async syncOperation(op: QueuedOperation & { _id: string, _rev: string }) {
    try {
      // Mark as syncing
      await operationsDB.put({ ...op, status: 'syncing' });

      let success = false;
      let errorMsg = null;

      // Map operation to actual server actions
      switch (op.type) {
        case 'water':
        case 'fertilize':
          const { addSpecimenEvent } = await import("@/app/actions/specimen-events");
          const { markTaskComplete: markComplete } = await import("@/app/actions/tasks");
          
          // 1. Log Event
          const eventRes = await addSpecimenEvent(op.payload.specimenId as string, {
            event_type: op.type === 'water' ? 'watered' : 'fertilized',
            notes: (op.payload.notes as string) || "Offline field operation synchronized."
          });
          
          if (eventRes.success) {
            // 2. Mark Task Complete
            const taskRes = await markComplete(op.payload.taskId as string, op.payload.specimenId as string);
            success = taskRes.success;
            errorMsg = taskRes.error;
          } else {
            success = false;
            errorMsg = eventRes.error;
          }
          break;

        case 'complete_task':
          const { markTaskComplete } = await import("@/app/actions/tasks");
          const res = await markTaskComplete(op.payload.taskId as string, op.payload.specimenId as string);
          success = res.success;
          errorMsg = res.error;
          break;
        
        case 'add_specimen':
          const { addSpecimen } = await import("@/app/actions/specimen-actions");
          // Reconstruct FormData for addSpecimen
          const formData = new FormData();
          Object.entries(op.payload).forEach(([key, value]) => {
            if (value !== null && value !== undefined) {
              formData.append(key, String(value));
            }
          });
          const addRes = await addSpecimen(formData);
          success = addRes.success;
          errorMsg = addRes.error;
          break;
      }

      if (success) {
        await operationsDB.remove(op);
        console.log(`[OperationQueue] Successfully synced ${op.type}:`, op.id);
      } else {
        throw new Error(errorMsg || "Unknown sync error");
      }

    } catch (err: unknown) {
      console.error(`[OperationQueue] Sync failed for ${op.id}:`, err);
      
      const updatedOp = {
        ...op,
        status: 'failed' as const,
        error: err instanceof Error ? err.message : "Unknown error",
        retryCount: op.retryCount + 1
      };

      if (updatedOp.retryCount > 5) {
        // Permanent failure handling could go here
        console.error(`[OperationQueue] Max retries reached for ${op.id}`);
      }

      await operationsDB.put(updatedOp);
    }
  }
}

export const operationQueue = new OperationQueue();

// Auto-sync listener
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    toast.info("Connection restored. Promoting field operations...");
    operationQueue.processQueue();
  });
}
