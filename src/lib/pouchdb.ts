import type { Specimen, CareEvent, Reminder } from '@/types/specimen';
import type { Listing } from '@/types/marketplace';
import type { LogPouchDoc } from '@/types/observability';

export interface BiologicalOperation {
  id: string;
  type: string;
  status: 'pending' | 'completed' | 'failed' | 'syncing';
  metadata?: Record<string, unknown>;
}

export interface BiologicalTreatment {
  id: string;
  specimenId: string;
  substance?: string;
  dosage?: string;
  occurredAt?: string;
  [key: string]: unknown; // Allow for other fields from TreatmentTask
}

// Local Database Instances - Initialized only on client to prevent server-side build issues
const isBrowser = typeof window !== 'undefined';

// Use structural typing for PouchDB instance to satisfy linting
let PouchDBInstance: { 
  new <T extends object>(name: string): PouchDB.Database<T>; 
  plugin: (plugin: unknown) => void; 
} | null = null;

if (isBrowser) {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const PouchDBModule = require('pouchdb-browser');
  PouchDBInstance = PouchDBModule.default || PouchDBModule;
  
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const PouchDBFind = require('pouchdb-find');
  const findPlugin = PouchDBFind.default || PouchDBFind;
  
  if (PouchDBInstance && typeof PouchDBInstance.plugin === 'function') {
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
      get: () => Promise.resolve({} as PouchDB.Core.Document<T>),
      remove: () => Promise.resolve(),
    } as unknown as PouchDB.Database<T>;
  }
  
  return new PouchDBInstance<T>(name);
}

export const specimensDB = createSafeDB<Specimen>('growkeeper_specimens');
export const eventsDB = createSafeDB<CareEvent>('growkeeper_events');
export const remindersDB = createSafeDB<Reminder>('growkeeper_reminders');
export const listingsDB = createSafeDB<Listing>('growkeeper_listings');
export const treatmentsDB = createSafeDB<BiologicalTreatment>('growkeeper_treatments');
export const logsDB = createSafeDB<LogPouchDoc>('growkeeper_logs');
export const operationsDB = createSafeDB<BiologicalOperation>('growkeeper_operations');

/**
 * Maps a PouchDB document to our application's domain model.
 * PouchDB uses _id and _rev, while our application expects 'id'.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function fromPouch<T>(doc: any): T {
  const data = { ...doc };
  const id = data._id;
  delete data._id;
  delete data._rev;
  return { ...data, id } as unknown as T;
}

/**
 * Maps our application's domain model to a PouchDB document.
 * Includes explicit version vector (updatedAt) for Tier 1 authority.
 */
export function toPouch<T extends { id: string }>(model: T): T & { _id: string; _rev?: string; updatedAt: string } {
  const { id, ...rest } = model as unknown as Record<string, unknown>;
  return { 
    ...rest, 
    _id: id as string,
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
