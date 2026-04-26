"use client";

import { Bell, User, ChevronDown, Menu, WifiOff, RefreshCw, Cloud } from "lucide-react";
import { useState, useEffect } from "react";
import { syncWithRemote } from "@/lib/pouchdb";

interface DashboardHeaderProps {
  title?: string;
  className?: string;
  onMenuClick?: () => void;
}

export function DashboardHeader({ title, className, onMenuClick }: DashboardHeaderProps) {
  const [isOnline, setIsOnline] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsOnline(navigator.onLine);
      const handleOnline = () => setIsOnline(true);
      const handleOffline = () => setIsOnline(false);
      window.addEventListener("online", handleOnline);
      window.addEventListener("offline", handleOffline);
      return () => {
        window.removeEventListener("online", handleOnline);
        window.removeEventListener("offline", handleOffline);
      };
    }
  }, []);

  const handleSync = async () => {
    setIsSyncing(true);
    await syncWithRemote();
    // Simulate a bit of delay for UX
    setTimeout(() => setIsSyncing(false), 1000);
  };
  return (
    <header className={`flex items-center justify-between mb-8 ${className || ""}`}>
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick}
          aria-label="Open Menu"
          className="lg:hidden p-2 -ml-2 text-brand-dark/60 hover:text-brand-dark hover:bg-brand-dark/5 rounded-lg transition-all"
        >
          <Menu className="w-6 h-6" />
        </button>
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="p-1 bg-orange-100 rounded text-orange-600">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M11 3a1 1 0 10-2 0h2zm-1.707 3.293a1 1 0 00-1.414 1.414L9.586 9l-1.707 1.707a1 1 0 001.414 1.414L11 10.414V17a1 1 0 102 0V10.414l1.707 1.707a1 1 0 001.414-1.414L11 9l1.707-1.707a1 1 0 10-1.414-1.414L11 7.586V6a1 1 0 00-1-1z" />
              </svg>
            </span>
            <h1 className="text-xl font-bold text-brand-dark">{title || "Welcome Back!"}</h1>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="hidden md:flex items-center gap-4 text-xs font-black uppercase tracking-widest">
          {isOnline ? (
            <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100 shadow-sm shadow-emerald-500/10">
              <Cloud className="w-3 h-3" />
              <span>Cloud: Active</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-100">
              <WifiOff className="w-3 h-3" />
              <span>Offline Mode</span>
            </div>
          )}
          
          <button 
            onClick={handleSync}
            disabled={isSyncing || !isOnline}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all ${
              isSyncing 
                ? "bg-slate-100 text-slate-400 border-slate-200" 
                : "bg-white text-brand-dark hover:bg-slate-50 border-slate-200 active:scale-95"
            } disabled:opacity-50`}
          >
            <RefreshCw className={`w-3 h-3 ${isSyncing ? "animate-spin" : ""}`} />
            <span>{isSyncing ? "Syncing..." : "Sync Vault"}</span>
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button 
            aria-label="View Notifications"
            className="p-2 text-brand-dark/40 hover:text-brand-dark transition-colors relative"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-brand-pink border-2 border-white rounded-full" />
          </button>
          
          <div className="flex items-center gap-2 pl-4 border-l border-brand-dark/10">
            <div className="w-8 h-8 rounded-full bg-brand-green/10 flex items-center justify-center border border-brand-green/20 overflow-hidden">
               <User className="w-5 h-5 text-brand-green" />
            </div>
            <ChevronDown className="w-4 h-4 text-brand-dark/40" />
          </div>
        </div>
      </div>
    </header>
  );
}
