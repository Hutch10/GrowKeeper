import * as Y from 'yjs';
import { logger } from '../observability/logger';

export interface SpecimenState {
  nickname: string;
  species_name: string;
  kingdom: string;
  health: number;
  lastUpdated: string;
}

class YjsManager {
  private doc: Y.Doc;
  private specimensMap: Y.Map<Y.Map<unknown>>;

  constructor() {
    this.doc = new Y.Doc();
    this.specimensMap = this.doc.getMap('specimens');
    
    // Observer for debugging/auditing state changes
    this.specimensMap.observe(event => {
      logger.debug('Sync', `Yjs State Changed: ${event.changes.keys.size} keys affected.`);
    });
  }

  /**
   * Update or create a specimen's CRDT state
   */
  updateSpecimenState(id: string, updates: Partial<SpecimenState>) {
    this.doc.transact(() => {
      let specimen = this.specimensMap.get(id);
      if (!specimen) {
        specimen = new Y.Map<unknown>();
        this.specimensMap.set(id, specimen);
      }
      
      for (const [key, value] of Object.entries(updates)) {
        if (value !== undefined) {
          specimen.set(key, value);
        }
      }
    });
    
    logger.info('Sync', `CRDT State Updated for Specimen ${id}`);
  }

  /**
   * Get the current state as a plain object for UI rendering
   */
  getSpecimenState(id: string): Partial<SpecimenState> | null {
    const specimen = this.specimensMap.get(id);
    return specimen ? (specimen.toJSON() as Partial<SpecimenState>) : null;
  }

  /**
   * Encode state for transmission/persistence (Version Vector)
   */
  encodeState(): Uint8Array {
    return Y.encodeStateAsUpdate(this.doc);
  }

  /**
   * Apply an incoming update from another peer/server
   */
  applyUpdate(update: Uint8Array) {
    Y.applyUpdate(this.doc, update);
    logger.info('Sync', 'Applied Yjs Update from Peer/Server');
  }

  getDoc() {
    return this.doc;
  }
}

export const yjsManager = new YjsManager();
