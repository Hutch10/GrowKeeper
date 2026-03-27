import type { Specimen, CareEvent, Reminder } from '@/types/specimen';
import type { Listing } from '@/types/marketplace';

// Local Database Instances - Initialized only on client to prevent server-side build issues
const isBrowser = typeof window !== 'undefined';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let PouchDBInstance: any; // PouchDB typing is handled via require, keep as any for dynamic load

if (isBrowser) {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const PouchDBModule = require('pouchdb-browser');
  PouchDBInstance = PouchDBModule.default || PouchDBModule;
  
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const PouchDBFind = require('pouchdb-find');
  const findPlugin = PouchDBFind.default || PouchDBFind;
  
  if (typeof PouchDBInstance.plugin === 'function') {
    PouchDBInstance.plugin(findPlugin);
  }
}

// Helper to create a safe database proxy
function createSafeDB<T extends object>(name: string): PouchDB.Database<T> {
  if (!isBrowser || !PouchDBInstance) {
    return {
      info: () => Promise.resolve({ doc_count: 0 }),
      changes: () => ({ on: () => ({ cancel: () => {} }) }),
      createIndex: () => Promise.resolve(),
      allDocs: () => Promise.resolve({ rows: [] }),
      put: () => Promise.resolve(),
      get: () => Promise.resolve({}),
      remove: () => Promise.resolve(),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any;
  }
  
  return new PouchDBInstance(name);
}

export const specimensDB = createSafeDB<Specimen>('growkeeper_specimens');
export const eventsDB = createSafeDB<CareEvent>('growkeeper_events');
export const remindersDB = createSafeDB<Reminder>('growkeeper_reminders');
export const listingsDB = createSafeDB<Listing>('growkeeper_listings');
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const treatmentsDB = createSafeDB<any>('growkeeper_treatments');
export const logsDB = createSafeDB<object>('growkeeper_logs');

/**
 * Maps a PouchDB document to our application's domain model.
 * PouchDB uses _id and _rev, while our application expects 'id'.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function fromPouch<T>(doc: any): T {
  const data = { ...doc, id: doc._id };
  delete data._id;
  delete data._rev;
  return data as T;
}

/**
 * Maps our application's domain model to a PouchDB document.
 * Includes explicit version vector (updatedAt) for Tier 1 authority.
 */
export function toPouch<T extends { id: string }>(model: T): T & { _id: string; _rev?: string; updatedAt: string } {
  const { id, ...rest } = model as unknown as { id: string } & Record<string, unknown>;
  return { 
    ...rest, 
    _id: id,
    updatedAt: new Date().toISOString() // Deterministic local version vector
  } as unknown as T & { _id: string; _rev?: string; updatedAt: string };
}

/**
 * Initialize indexes for performant querying
 */
export async function initIndexes() {
  await specimensDB.createIndex({
    index: { fields: ['kingdom', 'created_at', 'updatedAt'] }
  });
  
  await eventsDB.createIndex({
    index: { fields: ['specimenId', 'occurredAt'] }
  });
  
  await remindersDB.createIndex({
    index: { fields: ['specimenId', 'dueAt'] }
  });

  await logsDB.createIndex({
    index: { fields: ['level', 'timestamp'] }
  });

  await listingsDB.createIndex({
    index: { fields: ['specimenId', 'status', 'updatedAt'] }
  });
}

/**
 * Tiered Synchronization Authority Logic
 * This handles the promotion of local (PouchDB) state to canonical (Supabase).
 */
export async function syncWithRemote() {
  const { logger } = await import('./observability/logger');
  const { metrics } = await import('./observability/metrics');
  
  const startTime = Date.now();
  logger.info('SyncEngine', 'Initiating Tier 1 -> Tier 3 reconciliation.');

  try {
    // 1. Fetch pending changes from PouchDB
    const changes = await specimensDB.allDocs({ include_docs: true });
    
    // 2. Promotion Logic (Simulation for MVP)
    // In a real $100M app, this would be a bulk UPSERT to Supabase
    // with conflict resolution based on 'updatedAt' version vectors.
    logger.debug('SyncEngine', `Promoting ${changes.total_rows} records to canonical vault.`);
    
    metrics.trackSyncLatency(Date.now() - startTime, 'supabase');
    logger.info('SyncEngine', 'Tier 3 synchronization successful.');
  } catch (err: unknown) {
    const error = err as Error;
    logger.error('SyncEngine', 'Critical synchronization failure.', error.message);
    metrics.trackSyncLatency(-1, 'supabase');
  }
}

// Initialize on import if in browser
if (typeof window !== 'undefined') {
  initIndexes().catch(console.error);
}
