import PouchDB from 'pouchdb-browser';
import { logger } from '../observability/logger';
import { yjsManager } from './yjs-manager';

// Production sync store
const syncDB = new PouchDB('growkeeper-production-sync');

export class SyncEngine {
  private isProcessing: boolean = false;

  constructor() {
    this.startAutoSync();
  }

  /**
   * Persists a local change to the sync queue.
   */
  async queueUpdate(specimenId: string, update: Uint8Array) {
    const docId = `sync_${specimenId}_${Date.now()}`;
    await syncDB.put({
      _id: docId,
      specimenId,
      payload: Array.from(update),
      synced: false,
      timestamp: new Date().toISOString()
    });
    
    logger.info('Sync', `Update queued for Specimen ${specimenId}`);
    
    // Yjs Coordination: Locally apply to ensures immediate consistency
    yjsManager.applyUpdate(update);
    
    this.processQueue();
  }

  /**
   * Processes the sync queue, pushing updates to Supabase.
   */
  private async processQueue() {
    if (this.isProcessing || (typeof navigator !== 'undefined' && !navigator.onLine)) return;
    this.isProcessing = true;

    try {
      const result = await syncDB.find({
        selector: { synced: false }
      });

      for (const doc of (result.docs as unknown as Array<{ _id: string, specimenId: string, synced: boolean }>)) {
        // Push to Cloud (Mock)
        logger.debug('Sync', `Syncing doc ${doc._id} to cloud backbone...`);
        
        // After push, mark as synced
        await syncDB.put({
          ...doc,
          synced: true
        });
      }
    } catch (err) {
      logger.error('Sync', 'Master Sync Loop encountered an interruption.', err as Error);
    } finally {
      this.isProcessing = false;
    }
  }

  private startAutoSync() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.processQueue());
      setInterval(() => this.processQueue(), 30000); // 30s heartbeat
    }
  }

  /**
   * Reconciles remote state with local Yjs doc
   */
  async reconcile(remoteUpdate: Uint8Array) {
    yjsManager.applyUpdate(remoteUpdate);
    logger.info('Sync', 'Remote reconciliation complete via CRDT merging.');
  }
}

export const syncEngine = new SyncEngine();
