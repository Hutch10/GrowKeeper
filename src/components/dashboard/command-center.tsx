"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  Terminal,
  Zap,
  Radio,
  LayoutGrid,
  Search,
  Plus
} from 'lucide-react';
import { SpecimenSummaryCard } from '../specimens/specimen-summary-card';
import { BulkWaterButton } from './bulk-water-button';
import { BulkFertilizeButton } from './bulk-fertilize-button';
import { GlowMesh } from '../ui/glow-mesh';
import { useSpecimenData } from '@/hooks/use-specimen-data';
import type { BaseSpecimen } from '@/types/specimen';
import type { SpecimenRow } from '@/app/actions/types';
import type { TaskRow } from '@/app/actions/tasks';
import { createBrowserSupabaseClient } from '@/lib/supabase-browser';
import { SovereignAction, sovereignProtocolEnforcer } from '@/lib/services/sovereign-enforcer';

function TabButton({ 
  active, 
  onClick, 
  icon: Icon, 
  label 
}: { 
  active: boolean, 
  onClick: () => void, 
  icon: React.ElementType, 
  label: string 
}) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-2.5 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
        active ? 'bg-white text-black' : 'text-white/40 hover:text-white'
      }`}
    >
      <Icon className="w-3.5 h-3.5" />
      {label}
    </button>
  );
}

export function CommandCenter({ 
  initialSpecimens,
  initialTasks = []
}: { 
  initialSpecimens?: BaseSpecimen[],
  initialTasks?: TaskRow[]
}) {
  const [activeTab, setActiveTab] = useState<'inventory' | 'simulation'>('inventory');
  const [isSovereignMode, setIsSovereignMode] = useState(false);
  const [auditLog, setAuditLog] = useState<Partial<SovereignAction>[]>(sovereignProtocolEnforcer.getAuditLog());
  
  // Use the hook for live updates, initialized with server-side data if available.
  const { specimens, loading } = useSpecimenData(initialSpecimens as SpecimenRow[]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMounted, setIsMounted] = useState(false);

  React.useEffect(() => {
    setIsMounted(true);
    const supabase = createBrowserSupabaseClient();
    
    const channel = supabase
      .channel('alpha_events')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'alpha_events' }, (payload: { new: { id: string; created_at: string; event_type: string } }) => {
        const newEvent = payload.new;
        const mappedAction: Partial<SovereignAction> = {
          id: newEvent.id,
          timestamp: newEvent.created_at,
          type: 'Telemetry_Audit',
          status: 'Completed',
          impact: `[REMOTE] ${newEvent.event_type.replace(/_/g, ' ')} signal received.`,
        };
        setAuditLog(prev => [mappedAction, ...prev].slice(0, 10));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const filteredSpecimens = (specimens as BaseSpecimen[]).filter(s => 
    (s.nickname?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
    (s.species_name?.toLowerCase() || "").includes(searchQuery.toLowerCase())
  );

  const runSovereignScan = async () => {
    const actions = await sovereignProtocolEnforcer.performAutonomousScan(
      filteredSpecimens.map(s => ({ health: s.health, nickname: s.nickname }))
    );
    console.log("Sovereign Actions Performed:", actions);
    setAuditLog(sovereignProtocolEnforcer.getAuditLog());
  };

  return (
    <div className="flex flex-col h-screen bg-[#050505] text-[#E0E0E0] overflow-hidden font-sans selection:bg-emerald-500/30 relative">
      {/* Ambient Glow Elements */}
      <div className="absolute top-[-10%] left-[-10%] opacity-20 pointer-events-none z-0">
        <GlowMesh status="Healthy" size={600} />
      </div>
      <div className="absolute bottom-[-20%] right-[-10%] opacity-10 pointer-events-none z-0">
        <GlowMesh status="Stressed" size={800} />
      </div>
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-4 border-b border-white/5 bg-[#080808]/80 backdrop-blur-xl z-50">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
              <Shield className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-xl font-medium tracking-tight bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                GrowKeeper <span className="text-emerald-500/80 font-bold ml-1">Sovereign Mode</span>
              </h1>
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/30 font-semibold">
                Autonomous Ecosystem Control • v2.0.4
              </p>
            </div>
          </div>

          <div className="h-6 w-px bg-white/10" />

          <nav className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/5">
            <TabButton 
              active={activeTab === 'inventory'} 
              onClick={() => setActiveTab('inventory')} 
              icon={LayoutGrid} 
              label="Inventory" 
            />
            <TabButton 
              active={activeTab === 'simulation'} 
              onClick={() => setActiveTab('simulation')} 
              icon={Terminal} 
              label="Simulation" 
            />
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg border border-white/10">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-medium text-white/60 uppercase tracking-wider">Cloud Backbone: Active</span>
          </div>
          <button 
            onClick={() => setIsSovereignMode(!isSovereignMode)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
              isSovereignMode ? 'bg-emerald-500 text-black' : 'bg-white/5 text-white/40'
            }`}
          >
            <Zap className={`w-3.5 h-3.5 ${isSovereignMode ? 'animate-pulse' : ''}`} />
            Sovereign Mode
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden p-8 flex gap-8">
        <div className="flex-1 flex flex-col gap-6">
          {/* Action Hub */}
          <div className="flex items-center justify-between">
            <div className="relative group flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-emerald-500 transition-colors" />
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Scan specimens..."
                className="w-full bg-white/5 border border-white/5 rounded-2xl py-3 pl-12 pr-4 text-xs font-medium focus:outline-none focus:border-emerald-500/50 transition-all"
              />
            </div>
            
            <div className="flex items-center gap-4">
              <BulkWaterButton 
                tasksToWater={initialTasks.filter(t => t.task_type === "watered" && !t.completed)} 
              />
              <BulkFertilizeButton 
                tasksToFertilize={initialTasks.filter(t => t.task_type === "fertilized" && !t.completed)} 
              />
              <button 
                onClick={runSovereignScan}
                className="flex items-center gap-2.5 px-6 py-3 bg-white text-black rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all shadow-[0_10px_30px_rgba(255,255,255,0.1)]"
              >
                <Plus className="w-4 h-4" />
                Add Specimen
              </button>
            </div>
          </div>

          {/* Dynamic Viewport */}
          <div className="flex-1 overflow-y-auto custom-scrollbar pr-4">
            <AnimatePresence mode="wait">
              {activeTab === 'inventory' ? (
                <motion.div 
                  key="inventory"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="w-full"
                >
                  {loading ? (
                    <div className="h-64 flex flex-col items-center justify-center bg-white/5 rounded-3xl border border-white/5 border-dashed">
                      <div className="w-12 h-12 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mb-4" />
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Synchronizing Registry...</p>
                    </div>
                  ) : filteredSpecimens.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredSpecimens.map(s => (
                        <SpecimenSummaryCard 
                          key={s.id} 
                          specimen={s} 
                          onClick={() => {}} 
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="p-16 text-center bg-white/5 rounded-[3rem] border border-dashed border-white/10 shadow-2xl">
                      <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-8 relative">
                        <div className="absolute inset-0 bg-emerald-500/20 rounded-full animate-ping" />
                        <Shield className="w-10 h-10 text-emerald-400 relative z-10" />
                      </div>
                      <h3 className="text-3xl font-black text-white mb-3 tracking-tight">No Specimens In Registry</h3>
                      <p className="text-white/40 font-bold mb-10 text-sm max-w-sm mx-auto leading-relaxed">
                        Your autonomous zone is currently vacant. Begin your alpha mission by anchoring your first botanical asset to the Sovereign Feed.
                      </p>
                      <button 
                        onClick={runSovereignScan}
                        className="px-10 py-4 bg-emerald-500 text-black rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-[0_0_50px_rgba(16,185,129,0.3)] hover:scale-105 transition-all active:scale-95"
                      >
                        Assemble First Specimen
                      </button>
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div 
                  key="simulation"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.05 }}
                  className="h-full bg-zinc-900/50 rounded-3xl border border-white/5 p-12 flex items-center justify-center text-center"
                >
                  <div>
                    <Terminal className="w-16 h-16 text-white/10 mx-auto mb-6" />
                    <h2 className="text-2xl font-black uppercase tracking-widest text-white/20">Simulation Engine Offline</h2>
                    <p className="text-xs text-white/10 max-w-xs mt-2 mx-auto">Initialize Sovereign Protocol to enable adversarial red-team simulations.</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Operational Feed (Sidebar) */}
        <aside className="w-96 flex flex-col gap-6">
          <div className="flex-1 bg-zinc-900/50 rounded-3xl border border-white/5 p-8 flex flex-col">
            <div className="flex items-center gap-3 mb-8">
              <Radio className="w-4 h-4 text-emerald-500 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-white/50">Operational Feed</span>
            </div>
            
            <div className="flex-1 overflow-y-auto flex flex-col gap-4">
              {auditLog.slice(0, 10).map((action, i) => (
                <div key={action.id || i} className="p-4 rounded-2xl bg-white/5 border border-white/5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[9px] font-black uppercase text-emerald-400">{action.type}</span>
                    <span className="text-[8px] font-medium text-white/20">
                      {isMounted && action.timestamp ? new Date(action.timestamp).toLocaleTimeString() : "--:--:--"}
                    </span>
                  </div>
                  <p className="text-[10px] text-white/60 leading-relaxed">{action.impact || "Autonomous heartbeat logged."}</p>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}
