import type { SpecimenRow } from '@/app/actions/types';
import type { ProvenanceSource, SyncStatus } from '@/types/biological-intelligence';
import type { CareEvent, Reminder } from '@/types/specimen';
import type { Listing } from '@/types/marketplace';
import type { LogPouchDoc } from '@/types/observability';

export interface BiologicalOperation {
  id: string; // The target specimen ID or a unique op ID
  action: 'CREATE' | 'UPDATE' | 'DELETE';
  status: SyncStatus;
  payload: any;
  provenance: ProvenanceSource;
  timestamp: string;
  retry_count: number;
  last_error?: string;
  correlation_id: string; // MANDATORY: For idempotent replay
  last_sync_attempt?: string;
}

export interface IntelligenceMemoryDoc {
  _id: string; // Unified local ID
  _rev?: string;
  doc_type: 'conflict_history' | 'operator_intervention' | 'integrity_timeline_entry';
  correlation_id: string; // MANDATORY: For cross-referencing
  specimen_id: string;
  payload: any;
  provenance: ProvenanceSource;
  sync_status: SyncStatus;
  created_at: string;
  updated_at: string;
  metadata?: Record<string, any>;
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

export const specimensDB = createSafeDB<SpecimenRow>('growkeeper_specimens');
export const eventsDB = createSafeDB<CareEvent>('growkeeper_events');
export const remindersDB = createSafeDB<Reminder>('growkeeper_reminders');
export const listingsDB = createSafeDB<Listing>('growkeeper_listings');
export const treatmentsDB = createSafeDB<BiologicalTreatment>('growkeeper_treatments');
export const logsDB = createSafeDB<LogPouchDoc>('growkeeper_logs');
export const operationsDB = createSafeDB<BiologicalOperation>('growkeeper_operations');
export const syncMutexDB = createSafeDB<{ _id: string; locked_at: string; holder_id: string }>('growkeeper_sync_mutex');
export const memoryDB = createSafeDB<IntelligenceMemoryDoc>('operations_memory');

/**
 * Maps a PouchDB document to our application's domain model.
 * PouchDB uses _id and _rev, while our application expects 'id'.
 */
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
    index: { fields: ['kingdom', 'created_at', 'updatedAt', 'sync_status'] }
  });
  
  await operationsDB.createIndex({
    index: { fields: ['status', 'timestamp', 'action'] }
  });

  await eventsDB.createIndex({
    index: { fields: ['specimenId', 'occurredAt'] }
  });

  await memoryDB.createIndex({
    index: { fields: ['doc_type', 'correlation_id', 'specimen_id', 'sync_status'] }
  });
}

/**
 * Sync Mutex Logic
 * Ensures only one reconciliation process runs across all tabs using PouchDB.
 */
const TAB_ID = Math.random().toString(36).substring(7);

export async function acquireSyncLock(): Promise<boolean> {
  if (!isBrowser) return false;
  try {
    const existing = await syncMutexDB.get('sync_mutex').catch(() => null);
    
    // If lock exists and is younger than 30 seconds, consider it held
    if (existing && (Date.now() - new Date(existing.locked_at).getTime() < 30000)) {
      return false;
    }

    const lockDoc = {
      _id: 'sync_mutex',
      _rev: existing?._rev,
      locked_at: new Date().toISOString(),
      holder_id: TAB_ID
    };

    await syncMutexDB.put(lockDoc);
    return true;
  } catch (err) {
    return false;
  }
}

export async function releaseSyncLock(): Promise<void> {
  if (!isBrowser) return;
  try {
    const existing = await syncMutexDB.get('sync_mutex');
    if (existing.holder_id === TAB_ID) {
      await syncMutexDB.remove(existing);
    }
  } catch (_err) {
    // Silent fail
  }
}

/**
 * Manual trigger for remote synchronization.
 * In Alpha, this initiates a registry reconciliation heartbeat.
 */
export async function syncWithRemote(): Promise<void> {
  if (!isBrowser) return;
  console.log("[SENTINEL] Manual sync triggered from dashboard.");
  // Peer-to-peer and cloud sync logic would be triggered here.
  // We can also trigger the syncEngine if imported, 
  // but for now we provide the interface to unblock the build.
}

// Initialize on import if in browser
if (typeof window !== 'undefined') {
  initIndexes().catch(console.error);
}
