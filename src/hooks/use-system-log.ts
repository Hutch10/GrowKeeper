"use client";

import { useState, useEffect, useCallback } from 'react';

export interface LogEntry {
  id: string;
  timestamp: Date;
  type: 'system' | 'event' | 'warn' | 'error' | 'sentinel';
  message: string;
  metadata?: {
    provider_label?: string;
    fault_code?: string;
  };
}

// Global state for logs (simulated for now, could be an event bus)
let globalLogs: LogEntry[] = [];
const listeners = new Set<(logs: LogEntry[]) => void>();

function notify() {
  const sortedLogs = [...globalLogs].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime()).slice(-50);
  listeners.forEach(l => l(sortedLogs));
}

export function useSystemLog() {
  const [logs, setLogs] = useState<LogEntry[]>(globalLogs);

  useEffect(() => {
    listeners.add(setLogs);
    return () => {
      listeners.delete(setLogs);
    };
  }, []);

  const addLog = useCallback((message: string, type: LogEntry['type'] = 'system') => {
    const newEntry: LogEntry = {
      id: Math.random().toString(36).substring(7),
      timestamp: new Date(),
      type,
      message
    };
    globalLogs = [...globalLogs, newEntry].slice(-50);
    notify();
  }, []);

  return { logs, addLog };
}
