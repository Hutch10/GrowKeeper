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
import { GlowMesh } from '../ui/glow-mesh';
import { sovereignProtocolEnforcer } from '@/lib/services/sovereign-enforcer';
import { useSpecimenData } from '@/hooks/use-specimen-data';
import { BaseSpecimen } from '@/types/specimen';

export function CommandCenter() {
  const [activeTab, setActiveTab] = useState<'inventory' | 'simulation'>('inventory');
  const [isSovereignMode, setIsSovereignMode] = useState(false);
  const { specimens } = useSpecimenData();
  const [searchQuery, setSearchQuery] = useState("");
  const [isMounted, setIsMounted] = useState(false);

  React.useEffect(() => {
    setIsMounted(true);
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
            
            <button 
              onClick={runSovereignScan}
              className="flex items-center gap-2.5 px-6 py-3 bg-white text-black rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all shadow-[0_10px_30px_rgba(255,255,255,0.1)]"
            >
              <Plus className="w-4 h-4" />
              Add Specimen
            </button>
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
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                  {filteredSpecimens.map(s => (
                    <SpecimenSummaryCard 
                      key={s.id} 
                      specimen={s} 
                      onClick={() => {}} 
                    />
                  ))}
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
              {sovereignProtocolEnforcer.getAuditLog().slice(0, 10).map(action => (
                <div key={action.id} className="p-4 rounded-2xl bg-white/5 border border-white/5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[9px] font-black uppercase text-emerald-400">{action.type}</span>
                    <span className="text-[8px] font-medium text-white/20">
                      {isMounted ? new Date(action.timestamp).toLocaleTimeString() : "--:--:--"}
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

const TabButton = ({ active, onClick, icon: Icon, label }: { active: boolean, onClick: () => void, icon: React.ElementType, label: string }) => (
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
