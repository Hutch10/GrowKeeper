"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { toast } from "sonner";

export type SyncStatus = "idle" | "pending" | "error" | "syncing";

interface SyncStatusContextType {
  status: SyncStatus;
  setStatus: (status: SyncStatus) => void;
  lastError: string | null;
  setLastError: (error: string | null) => void;
}

const SyncStatusContext = createContext<SyncStatusContextType | undefined>(undefined);

export function SyncStatusProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<SyncStatus>("idle");
  const [lastError, setLastError] = useState<string | null>(null);

  useEffect(() => {
    // Initialize Operation Queue Sync
    const initSync = async () => {
      const { operationQueue } = await import("@/lib/services/operation-queue");
      
      // Initial process if online
      if (navigator.onLine) {
        operationQueue.processQueue();
      }

      const handleOnline = () => {
        toast.success("Network connection restored. Syncing field operations...");
        operationQueue.processQueue();
      };

      window.addEventListener('online', handleOnline);
      return () => window.removeEventListener('online', handleOnline);
    };

    const cleanupPromise = initSync();
    return () => {
      cleanupPromise.then(cleanup => cleanup && cleanup());
    };
  }, []);

  return (
    <SyncStatusContext.Provider value={{ status, setStatus, lastError, setLastError }}>
      {children}
    </SyncStatusContext.Provider>
  );
}

export function useSyncStatus() {
  const context = useContext(SyncStatusContext);
  if (context === undefined) {
    throw new Error("useSyncStatus must be used within a SyncStatusProvider");
  }
  return context;
}
