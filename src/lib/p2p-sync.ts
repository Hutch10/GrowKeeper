import * as Y from 'yjs';
import { specimensDB } from './pouchdb';
import type { Specimen } from '@/types/specimen';

/**
 * P2P Swarm Synchronization Service
 * Uses Yjs (CRDT) over WebRTC for serverless field collaboration.
 */
class P2PSyncService {
  private doc: Y.Doc;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private provider: any = null; // WebrtcProvider lacks stable types in some versions
  private specimensMap: Y.Map<Record<string, unknown>>;
  private isInitialized = false;

  constructor() {
    this.doc = new Y.Doc();
    this.specimensMap = this.doc.getMap('specimens');
  }

  async init(roomName = 'growkeeper-swarm-tactical', retryCount = 0) {
    if (typeof window === 'undefined' || this.isInitialized) return;

    try {
      // Dynamic require to prevent server-side evaluation issues
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { WebRTCProvider } = require('y-webrtc');

      this.provider = new WebRTCProvider(roomName, this.doc, {
        signaling: [
          'wss://y-webrtc-signaling-eu.herokuapp.com', 
          'wss://y-webrtc-signaling-us.herokuapp.com',
          'ws://localhost:4444' 
        ],
      });

      // Observe changes from other peers and sync to local PouchDB
      this.specimensMap.observe(async (event) => {
        const { logger } = await import('./observability/logger');
        const { metrics } = await import('./observability/metrics');
        const start = Date.now();

        for (const [id, delta] of Array.from(event.changes.keys)) {
          const action = (delta as { action: string }).action;
          if (action === 'add' || action === 'update') {
            const specimenData = this.specimensMap.get(id) as Record<string, unknown>;
            if (specimenData) {
              logger.debug('P2P', `Inbound swarm update for specimen: ${id}`, specimenData);
              await this.syncToLocal(id, specimenData);
            }
          }
        }
        metrics.trackSyncLatency(Date.now() - start, 'yjs');
      });

      this.isInitialized = true;
      const { logger } = await import('./observability/logger');
      logger.info('P2P', `Swarm active in room: ${roomName}`);
    } catch (err: unknown) {
      const error = err as Error;
      const { logger } = await import('./observability/logger');
      logger.error('P2P', `Initialization Failed (Attempt ${retryCount + 1}):`, error.message);

      // Exponential backoff with jitter, capped at 60 seconds
      const maxDelay = 60000;
      const delay = Math.min(1000 * Math.pow(2, retryCount) + Math.random() * 1000, maxDelay);
      
      setTimeout(() => this.init(roomName, retryCount + 1), delay);
    }
  }

  private async syncToLocal(id: string, data: Record<string, unknown>) {
    const { logger } = await import('./observability/logger');
    try {
      // Fetch existing revision to avoid conflicts
      const existing = await specimensDB.get(id).catch(() => null);
      
      // AUTHORITY CHECK: Only sync if incoming data has a newer 'updatedAt' than local
      if (existing && (data.updatedAt as string) <= (existing as unknown as { updatedAt: string }).updatedAt) {
        logger.debug('P2P', `Ignoring stalled swarm update for ${id} (Local is newer)`);
        return;
      }

      const pouchDoc = {
        ...data,
        _id: id,
        _rev: existing?._rev,
      } as unknown as Specimen;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await specimensDB.put(pouchDoc as any);
      logger.info('P2P', `Reconciled swarm state for ${id} to Tier 1 local store.`);
    } catch (err: unknown) {
      const error = err as Error;
      logger.warn('P2P', `Failed to sync document ${id}:`, error.message);
    }
}

  /**
   * Broadcast a specimen update to all connected peers in the swarm.
   * This is Tier 2 (Session Collaboration).
   */
  async broadcastSpecimen(specimen: Specimen) {
    if (!this.isInitialized) return;
    const { logger } = await import('./observability/logger');
    
    // Deconstruct to avoid circular refs or PouchDB internal fields
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { _id, _rev, id, ...data } = specimen as unknown as Record<string, unknown>;
    
    // Ensure 'updatedAt' is present for remote authority checks
    const payload = {
      ...data,
      updatedAt: (specimen as unknown as { updatedAt?: string }).updatedAt || new Date().toISOString()
    };

    // Set in the shared Yjs map - this triggers 'observe' on other peers
    this.specimensMap.set(specimen.id, payload);
    logger.debug('P2P', `Broadcasted Tier 2 update for ${specimen.id}`);
  }

  getSwarmStatus() {
    return {
      active: this.isInitialized,
      connected: this.provider?.connected || false,
      room: this.provider?.roomName || 'offline',
      peers: this.provider?.webrtcConns?.size || 0,
    };
  }

  destroy() {
    if (this.provider) {
      this.provider.destroy();
      this.isInitialized = false;
    }
  }
}

export const p2pSync = new P2PSyncService();
