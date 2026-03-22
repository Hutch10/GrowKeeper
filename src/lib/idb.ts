import { openDB, type IDBPDatabase } from 'idb';
import type { SpecimenRow, SpecimenEventRow } from '@/app/actions/types';

const DB_NAME = 'growkeeper_guest_db';
const DB_VERSION = 1;

export interface GuestTask {
  id: string;
  specimen_id: string;
  task_type: string;
  due_date: string | null;
  completed: boolean;
  created_at: string;
}

let dbPromise: Promise<IDBPDatabase> | null = null;

export async function getDB() {
  if (typeof window === 'undefined') return null;
  
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Specimens store
        if (!db.objectStoreNames.contains('specimens')) {
          const store = db.createObjectStore('specimens', { keyPath: 'id' });
          store.createIndex('kingdom', 'kingdom');
          store.createIndex('created_at', 'created_at');
        }
        
        // Events store
        if (!db.objectStoreNames.contains('events')) {
          const store = db.createObjectStore('events', { keyPath: 'id' });
          store.createIndex('specimen_id', 'specimen_id');
          store.createIndex('created_at', 'created_at');
        }
        
        // Tasks store
        if (!db.objectStoreNames.contains('tasks')) {
          const store = db.createObjectStore('tasks', { keyPath: 'id' });
          store.createIndex('specimen_id', 'specimen_id');
          store.createIndex('completed', 'completed');
          store.createIndex('due_date', 'due_date');
        }
      },
    });
  }
  return dbPromise;
}

// Specimen Operations
export async function saveGuestSpecimen(specimen: SpecimenRow) {
  const db = await getDB();
  if (!db) return;
  await db.put('specimens', specimen);
}

export async function getGuestSpecimens(): Promise<SpecimenRow[]> {
  const db = await getDB();
  if (!db) return [];
  return db.getAllFromIndex('specimens', 'created_at');
}

export async function deleteGuestSpecimen(id: string) {
  const db = await getDB();
  if (!db) return;
  const tx = db.transaction(['specimens', 'events', 'tasks'], 'readwrite');
  await tx.objectStore('specimens').delete(id);
  
  // Cleanup related events and tasks
  const eventStore = tx.objectStore('events');
  const taskStore = tx.objectStore('tasks');
  
  const events = await eventStore.index('specimen_id').getAllKeys(id);
  for (const eventId of events) await eventStore.delete(eventId);
  
  const tasks = await taskStore.index('specimen_id').getAllKeys(id);
  for (const taskId of tasks) await taskStore.delete(taskId);
  
  await tx.done;
}

// Event Operations
export async function saveGuestEvent(event: SpecimenEventRow) {
  const db = await getDB();
  if (!db) return;
  await db.put('events', event);
}

export async function getGuestEvents(specimenId?: string): Promise<SpecimenEventRow[]> {
  const db = await getDB();
  if (!db) return [];
  if (specimenId) {
    return db.getAllFromIndex('events', 'specimen_id', specimenId);
  }
  return db.getAll('events');
}

// Task Operations
export async function saveGuestTask(task: GuestTask) {
  const db = await getDB();
  if (!db) return;
  await db.put('tasks', task);
}

export async function getGuestTasks(): Promise<GuestTask[]> {
  const db = await getDB();
  if (!db) return [];
  return db.getAll('tasks');
}
