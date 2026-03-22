import { useState, useEffect, useCallback } from 'react';
import { specimensDB, fromPouch, toPouch } from '@/lib/pouchdb';
import { p2pSync } from '@/lib/p2p-sync';
import type { Specimen } from '@/types/specimen';

export function useSpecimens(initialData: Specimen[] = []) {
  const [specimens, setSpecimens] = useState<Specimen[]>(initialData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Load from PouchDB
  const loadLocal = useCallback(async () => {
    try {
      const result = await specimensDB.allDocs({
        include_docs: true,
        descending: true
      });
      const localSpecimens = result.rows
        .filter((row): row is { doc: PouchDB.Core.ExistingDocument<Specimen>; id: string; key: string; value: { rev: string } } => !!row.doc)
        .map(row => fromPouch<Specimen>(row.doc));
      
      // If we have local data, use it. Otherwise use initialData (from server).
      if (localSpecimens.length > 0) {
        setSpecimens(localSpecimens);
      } else if (initialData.length > 0) {
        // Hydrate PouchDB with initial server data if empty
        for (const s of initialData) {
          await specimensDB.put(toPouch(s)).catch(() => {}); // Ignore existing
        }
        setSpecimens(initialData);
      }
    } catch (err) {
      console.error('Error loading local specimens:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [initialData]);

  useEffect(() => {
    loadLocal();
    
    // Listen for changes in PouchDB
    const changes = specimensDB.changes({
      since: 'now',
      live: true,
      include_docs: true
    }).on('change', (change) => {
      if (change.doc) {
        const updatedSpecimen = fromPouch<Specimen>(change.doc);
        setSpecimens(prev => {
          const index = prev.findIndex(s => s.id === updatedSpecimen.id);
          if (change.deleted) {
            return prev.filter(s => s.id !== change.id);
          }
          if (index > -1) {
            const next = [...prev];
            next[index] = updatedSpecimen;
            return next;
          }
          return [updatedSpecimen, ...prev];
        });
      }
    });

    return () => changes.cancel();
  }, [loadLocal]);

  const addSpecimenLocal = async (specimen: Specimen) => {
    await specimensDB.put(toPouch(specimen));
    p2pSync.broadcastSpecimen(specimen);
  };

  const updateSpecimenLocal = async (specimen: Specimen) => {
    const doc = await specimensDB.get(specimen.id);
    const updated = {
      ...toPouch(specimen),
      _rev: doc._rev
    };
    await specimensDB.put(updated);
    p2pSync.broadcastSpecimen(fromPouch<Specimen>(updated));
  };

  const deleteSpecimenLocal = async (id: string) => {
    const doc = await specimensDB.get(id);
    await specimensDB.remove(doc);
    // Note: Yjs map deletion could also be handled here
  };

  return {
    specimens,
    loading,
    error,
    addSpecimenLocal,
    updateSpecimenLocal,
    deleteSpecimenLocal,
    reload: loadLocal
  };
}
