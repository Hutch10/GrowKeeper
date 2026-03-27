"use client";

import { useSyncStatus } from "@/components/providers/sync-status-provider";
import { CheckCircle2, RefreshCw, AlertCircle } from "lucide-react";

export function SyncStatusIndicator() {
  const { status, lastError } = useSyncStatus();

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-pink-light/30 border border-brand-pink/20">
      {status === "idle" && (
        <>
          <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
          <span className="text-xs font-semibold text-brand-dark/70">Synced</span>
        </>
      )}
      {status === "pending" && (
        <>
          <RefreshCw className="w-3.5 h-3.5 text-brand-pink animate-spin" />
          <span className="text-xs font-semibold text-brand-dark/70">Syncing...</span>
        </>
      )}
      {status === "error" && (
        <div className="group relative flex items-center gap-2 cursor-help">
          <AlertCircle className="w-3.5 h-3.5 text-red-500" />
          <span className="text-xs font-semibold text-red-600">Sync Error</span>
          {lastError && (
            <div className="absolute top-full right-0 mt-2 w-48 p-2 bg-white border border-red-100 rounded-md shadow-lg text-[10px] text-red-500 opacity-0 group-hover:opacity-100 transition-opacity z-50">
              {lastError}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
