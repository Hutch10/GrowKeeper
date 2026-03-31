"use client";

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Terminal,
  Plus,
  Sun,
  Cloud,
  Bell,
  User,
  CheckCircle2,
  AlertCircle,
  LogIn
} from 'lucide-react';
import { SpecimenSummaryCard } from '../specimens/specimen-summary-card';
import { ThemeToggle } from '../ui/theme-toggle';
import { useSpecimenData } from '@/hooks/use-specimen-data';
import { useTaskData } from '@/hooks/use-task-data';
import { aggregateDashboardStats } from '@/lib/services/dashboard-stats';
import type { BaseSpecimen } from '@/types/specimen';
import type { SpecimenRow } from '@/app/actions/types';
import type { TaskRow } from '@/app/actions/tasks';
import { KPIStrip } from './kpi-strip';
import { DetailRail } from './detail-rail';
import { ComplianceView } from './compliance-view';
import { Sidebar } from './sidebar';
import { TipsSection } from './tips-section';
import { ComplianceSurface } from '../compliance/compliance-surface';
import { AddSpecimenForm } from '../plants/add-specimen-form';

/**
 * GrowKeeper Command Center (Phase 10: Seamless Onboarding & AI Auth Hardening)
 * Features a high-fidelity Auth Status header and specific error handling.
 */
export function CommandCenter({ 
  initialSpecimens,
  initialTasks = [],
  errorMessage
}: { 
  initialSpecimens?: BaseSpecimen[],
  initialTasks?: TaskRow[],
  errorMessage?: string
}) {
  const [activeTab, setActiveTab] = useState<'inventory' | 'simulation' | 'compliance' | string>('inventory');
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedSpecimenId, setSelectedSpecimenId] = useState<string | null>(null);
  const [isAddWizardOpen, setIsAddWizardOpen] = useState(false);
  
  const { specimens, loading: specimensLoading } = useSpecimenData(initialSpecimens as SpecimenRow[]);
  const { tasks, loading: tasksLoading } = useTaskData(initialTasks);

  const stats = useMemo(() => 
    aggregateDashboardStats(specimens as BaseSpecimen[], tasks),
  [specimens, tasks]);

  const filteredSpecimens = useMemo(() => {
    const base = (specimens as BaseSpecimen[]);
    if (activeFilter === 'all') return base;
    
    switch (activeFilter) {
      case 'due':
        const dueIds = tasks.filter(t => !t.completed && t.due_date).map(t => t.specimen_id);
        return base.filter(s => dueIds.includes(s.id));
      default:
        return base;
    }
  }, [specimens, tasks, activeFilter]);

  const selectedSpecimen = useMemo(() => 
    specimens.find(s => s.id === selectedSpecimenId) as SpecimenRow | undefined,
  [specimens, selectedSpecimenId]);

  const [isComplianceOpen, setIsComplianceOpen] = useState(false);
  const [complianceSpecimen, setComplianceSpecimen] = useState<SpecimenRow | null>(null);

  const handleOpenCompliance = (specimen: SpecimenRow) => {
    setComplianceSpecimen(specimen);
    setIsComplianceOpen(true);
  };

  return (
    <div className="flex h-screen bg-[#F8F7F3] dark:bg-background text-foreground overflow-hidden font-sans selection:bg-emerald-500/30 relative transition-colors duration-500">
      {/* Visual Background for Solaris Mode */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none z-0 mix-blend-multiply overflow-hidden">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-emerald-900 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-amber-900 rounded-full blur-[120px]" />
      </div>

      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      
      <div className="flex-1 flex flex-col min-w-0 z-10 overflow-hidden">
        {/* Institutional Auth Status Bar */}
        <div className="h-10 bg-white/50 dark:bg-black/20 border-b border-slate-100 dark:border-white/5 flex items-center justify-between px-12 backdrop-blur-md">
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[9px] font-black uppercase tracking-tighter text-slate-400">GrowKeeper Synced</span>
             </div>
          </div>
          <div className="flex items-center gap-6">
             <div className="flex items-center gap-2">
                <span className="text-[9px] font-black uppercase tracking-tighter text-slate-400">Not signed in</span>
                <button className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-tighter text-emerald-500 hover:text-emerald-400 transition-colors">
                  <LogIn className="w-3 h-3" />
                  Sign in
                </button>
             </div>
          </div>
        </div>

        <header className="flex items-center justify-between px-12 py-8 transition-colors duration-500">
          <div className="flex items-center gap-12">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center border border-amber-200">
                <Sun className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h1 className="text-xl font-black tracking-tighter text-slate-900 dark:text-white leading-none mb-1">
                  Welcome back to the Registry
                </h1>
                <p className="text-[10px] font-black text-slate-400 dark:text-white/20 uppercase tracking-[0.2em]">Operational Integrity: Nominal</p>
              </div>
            </div>

            <div className="flex items-center gap-6 text-[11px] font-bold text-slate-400">
              <div className="flex items-center gap-2">
                <Cloud className="w-4 h-4" />
                <span>12:47 PM • Sunny | 75°F</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3 mr-4">
              <button 
                title="Notifications"
                className="p-2.5 bg-white dark:bg-white/5 shadow-sm border border-slate-100 dark:border-white/10 rounded-xl text-slate-400 hover:text-emerald-500 transition-colors"
              >
                <Bell className="w-5 h-5" />
              </button>
              <ThemeToggle />
            </div>
            <div className="w-[1px] h-8 bg-slate-200 dark:bg-white/5 mr-4" />
            <div className="flex items-center gap-3">
              <div 
                title="Account Settings"
                className="w-10 h-10 bg-slate-200 dark:bg-white/10 rounded-xl overflow-hidden border-2 border-white dark:border-white/10 shadow-md"
              >
                <User className="w-full h-full p-2 text-slate-400" />
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto custom-scrollbar p-12 flex gap-12">
          <div className="flex-1 flex flex-col gap-12 min-w-0">
            {/* My Specimens Hero Section (Phase 10) */}
            {activeTab === 'inventory' && (
              <section className="relative min-h-[400px] p-16 rounded-[4rem] bg-emerald-500 dark:bg-emerald-600 overflow-hidden shadow-2xl shadow-emerald-500/20 group flex flex-col justify-center">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 mix-blend-overlay" />
                <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:scale-110 transition-transform duration-1000">
                   <Sun className="w-64 h-64 text-white" />
                </div>
                
                <div className="relative z-10 max-w-2xl">
                   <h2 className="text-7xl font-black text-black tracking-tighter mb-6 leading-[0.8]">
                     My Specimens.
                   </h2>
                   <p className="text-2xl font-bold text-black/60 leading-relaxed mb-12 max-w-lg">
                     Track your specimens and keep them healthy with GrowKeeper Biological Intelligence.
                   </p>
                   <button 
                      id="hero-add-specimen-btn"
                      onClick={() => {
                        console.log("Triggering Add Specimen Wizard...");
                        setIsAddWizardOpen(true);
                      }}
                      className="flex items-center gap-4 px-12 py-6 bg-black text-white rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:scale-105 active:scale-95 transition-all shadow-2xl"
                   >
                     <Plus className="w-5 h-5 text-emerald-400" />
                     Add New Specimen
                   </button>
                </div>
              </section>
            )}

            {activeTab === 'inventory' && (
              <KPIStrip 
                kpis={stats.kpis} 
                activeFilter={activeFilter}
                onFilterChange={setActiveFilter}
              />
            )}

            <div className="flex flex-col gap-8">
              <div className="flex items-center justify-between">
                <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300 dark:text-white/20">
                  {activeTab === 'inventory' ? 'Plant Overview' : 'Operational Registry'}
                </h2>
                {activeTab === 'inventory' && errorMessage && (
                   <div className="flex items-center gap-2 px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-full">
                      <AlertCircle className="w-3 h-3 text-red-500" />
                      <span className="text-[8px] font-black text-red-500 uppercase tracking-widest">Supabase Authentication Error</span>
                   </div>
                )}
              </div>

              <AnimatePresence mode="wait">
                {activeTab === 'inventory' ? (
                  <motion.div 
                    key="inventory"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="w-full"
                  >
                    {(specimensLoading || tasksLoading) ? (
                      <div className="h-64 flex flex-col items-center justify-center bg-white/5 rounded-[3rem] border border-white/5 border-dashed">
                        <div className="w-12 h-12 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mb-4" />
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Aggregating Operational Layer...</p>
                      </div>
                    ) : specimens.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-24 px-12 bg-white dark:bg-white/5 rounded-[3.5rem] border border-dashed border-slate-200 dark:border-white/10 text-center group">
                        <div className="w-24 h-24 bg-slate-50 dark:bg-white/5 rounded-[2.5rem] flex items-center justify-center mb-8 border border-slate-100 dark:border-white/5 group-hover:scale-110 transition-transform">
                           <Terminal className="w-10 h-10 text-slate-300 dark:text-white/20" />
                        </div>
                        {errorMessage ? (
                           <div className="space-y-4">
                              <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Identity Verification Failed</h3>
                              <p className="text-sm font-bold text-slate-400 dark:text-white/30 max-w-sm mx-auto leading-relaxed">
                                Could not load specimens from Supabase: <span className="text-red-500">{errorMessage}</span>
                              </p>
                              <div className="pt-4">
                                <button className="px-8 py-3 bg-emerald-500 text-black rounded-xl font-black uppercase tracking-widest text-[10px] hover:scale-105 transition-all">
                                   Sign in to Sync
                                </button>
                              </div>
                           </div>
                        ) : (
                           <div className="space-y-4">
                              <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">No Specimens Yet</h3>
                              <p className="text-sm font-bold text-slate-400 dark:text-white/30 max-w-md mx-auto leading-relaxed">
                                This sector is currently uninhabited. Add your first specimen to begin biological monitoring.
                              </p>
                              <div className="pt-8 flex items-center gap-4">
                                 <button 
                                    onClick={() => setIsAddWizardOpen(true)}
                                    className="px-10 py-4 bg-emerald-500 text-black rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all"
                                 >
                                    Add First Specimen
                                 </button>
                                 <button className="px-10 py-4 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-500 dark:text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-50 dark:hover:bg-white/10 transition-all">
                                    Report Issue
                                 </button>
                              </div>
                           </div>
                        )}
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
                        {filteredSpecimens.map(s => (
                          <SpecimenSummaryCard 
                            key={s.id} 
                            specimen={s} 
                            tasks={tasks}
                            onClick={() => setSelectedSpecimenId(s.id)}
                            active={selectedSpecimenId === s.id}
                          />
                        ))}
                      </div>
                    )}
                  </motion.div>
                ) : activeTab === 'compliance' ? (
                  <motion.div 
                    key="compliance"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="h-full"
                  >
                    <ComplianceView />
                  </motion.div>
                ) : (
                  <motion.div key="simulation" className="h-[400px] bg-black/5 dark:bg-white/5 rounded-[3rem] border border-slate-100 dark:border-white/5 p-16 flex items-center justify-center text-center backdrop-blur-sm">
                    <div className="max-w-md text-slate-300">
                      <Terminal className="w-16 h-16 mx-auto mb-8" />
                      <h2 className="text-2xl font-black uppercase tracking-[0.3em] mb-4">Adversarial Engine Offline</h2>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {activeTab === 'inventory' && <TipsSection />}
          </div>

          <AnimatePresence>
            {selectedSpecimen && (
              <motion.div
                initial={{ x: '100%', opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: '100%', opacity: 0 }}
                transition={{ type: "spring", damping: 30, stiffness: 300 }}
                className="w-[480px] h-full flex flex-col gap-8 flex-shrink-0"
              >
                <DetailRail 
                  specimen={selectedSpecimen} 
                  tasks={tasks}
                  onClose={() => setSelectedSpecimenId(null)} 
                  onOpenCompliance={handleOpenCompliance}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {isComplianceOpen && complianceSpecimen && (
              <ComplianceSurface 
                specimen={complianceSpecimen} 
                onClose={() => setIsComplianceOpen(false)} 
              />
            )}
          </AnimatePresence>

          <AnimatePresence>
            {isAddWizardOpen && (
               <AddSpecimenForm 
                  isOpen={isAddWizardOpen} 
                  onClose={() => setIsAddWizardOpen(false)} 
               />
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
