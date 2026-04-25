import { useState, useEffect, useCallback, useRef } from 'react';
import { createBrowserSupabaseClient } from '@/lib/supabase-browser';

export interface LogEntry {
  id: string;
  timestamp: Date;
  type: 'system' | 'event' | 'warn' | 'error' | 'sentinel' | 'audit' | 'sync';
  message: string;
  metadata?: {
    provider_label?: string;
    fault_code?: string;
    provenance?: string;
    sync_status?: string;
    payload_hash?: string;
  };
}

let globalLogs: LogEntry[] = [];
const listeners = new Set<(logs: LogEntry[]) => void>();

function notify() {
  const sortedLogs = [...globalLogs].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime()).slice(-100);
  listeners.forEach(l => l(sortedLogs));
}

export function useSystemLog() {
  const [logs, setLogs] = useState<LogEntry[]>(globalLogs);
  const isPollingRef = useRef(false);

  const addLog = useCallback((message: string, type: LogEntry['type'] = 'system', metadata?: LogEntry['metadata']) => {
    const newEntry: LogEntry = {
      id: Math.random().toString(36).substring(7),
      timestamp: new Date(),
      type,
      message,
      metadata
    };
    // Dedup by message + timestamp (within 1s)
    const exists = globalLogs.some(l => l.message === message && Math.abs(l.timestamp.getTime() - newEntry.timestamp.getTime()) < 1000);
    if (exists) return;

    globalLogs = [...globalLogs, newEntry].slice(-100);
    notify();
  }, []);

  const pollAuditLedger = useCallback(async () => {
     if (isPollingRef.current) return;
     isPollingRef.current = true;

     try {
       const supabase = createBrowserSupabaseClient();
       const { data, error } = await supabase
         .from('alpha_events')
         .select('*')
         .order('created_at', { ascending: false })
         .limit(5);
       
       if (data && !error) {
         (data as { event_type: string; metadata: unknown }[]).forEach(event => {
            const meta = event.metadata as any;
            addLog(
              `[AUDIT] ${event.event_type}: ${meta?.audit_target || 'System event'}`,
              event.event_type.startsWith('AUDIT_') ? 'audit' : 'event',
              {
                provenance: meta?.provenance,
                sync_status: 'SYNCED_CLOUD',
                payload_hash: meta?.payload_hash
              }
            );
         });
       }
     } catch (err) {
       // Silent failure for polling
     } finally {
       isPollingRef.current = false;
     }
  }, [addLog]);

  useEffect(() => {
    listeners.add(setLogs);
    const interval = setInterval(pollAuditLedger, 10000);
    return () => {
      listeners.delete(setLogs);
      clearInterval(interval);
    };
  }, [pollAuditLedger]);

  return { logs, addLog };
}
