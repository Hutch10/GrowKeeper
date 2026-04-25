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
    const handleOnline = () => {
      toast.success("Connection restored.");
      setStatus("idle");
    };
    const handleOffline = () => setStatus("error");
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
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
