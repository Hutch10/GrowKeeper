"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

export type SyncStatus = "idle" | "pending" | "error";

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
