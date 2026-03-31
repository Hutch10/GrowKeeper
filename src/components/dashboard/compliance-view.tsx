"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, 
  History, 
  Fingerprint, 
  Gavel, 
  AlertTriangle,
  CheckCircle2,
  Lock,
  Globe,
  Database,
  Cpu
} from 'lucide-react';
import { BiologicalSpecimen, AuditEvent } from '@/types/biological-intelligence';

interface ComplianceViewProps {
  specimen: BiologicalSpecimen;
}

/**
 * Sovereign Compliance Surface (Phase 12)
 * Provides a high-fidelity, transparent audit ledger for biological specimen governance.
 */
export function ComplianceView({ specimen }: ComplianceViewProps) {
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [activeTab, setActiveTab] = useState<'audit' | 'constitution' | 'sovereignty'>('audit');

  // Simulated Audit Ledger Fetch
  useEffect(() => {
    // In a real implementation, this would fetch from the `alpha_events` table in Supabase
    const mockEvents: AuditEvent[] = [
      {
        id: 'evt_1',
        created_at: new Date().toISOString(),
        user_id: specimen.user_id || 'system',
        event_type: 'IDENTITY_ATTESTATION',
        metadata: { status: 'verified', method: 'DNA_SEQUENCE_HASH' },
        route: '/api/v1/attestation'
      },
      {
        id: 'evt_2',
        created_at: new Date(Date.now() - 3600000).toISOString(),
        user_id: 'agent_bot_alpha',
        event_type: 'AUTONOMOUS_INTERVENTION',
        metadata: { action: 'irrigation_trigger', target: 'moisture', value: 0.45 },
        route: '/api/v1/agents/climate/act'
      },
      {
        id: 'evt_3',
        created_at: new Date(Date.now() - 86400000).toISOString(),
        user_id: specimen.user_id || 'system',
        event_type: 'GOVERNANCE_AUDIT',
        metadata: { constitution_version: '2.2.0', status: 'compliant' },
        route: '/dashboard'
      }
    ];
    setEvents(mockEvents);
  }, [specimen]);

  return (
    <div className="flex flex-col h-full bg-black/40 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="p-8 border-b border-white/5 bg-gradient-to-br from-emerald-500/10 to-transparent">
        <div className="flex items-center gap-4 mb-2">
          <div className="p-3 bg-emerald-500/20 rounded-2xl text-emerald-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white uppercase tracking-tighter leading-none">Sovereign Compliance Surface</h2>
            <p className="text-[10px] font-black text-emerald-400/60 uppercase tracking-[0.2em] mt-1.5">RAIS Governance Alpha-Pilot v2.2.0</p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex px-8 border-b border-white/5 bg-white/5">
        <TabButton 
          active={activeTab === 'audit'} 
          onClick={() => setActiveTab('audit')} 
          icon={History} 
          label="Audit Ledger" 
        />
        <TabButton 
          active={activeTab === 'constitution'} 
          onClick={() => setActiveTab('constitution')} 
          icon={Gavel} 
          label="Constitution" 
        />
        <TabButton 
          active={activeTab === 'sovereignty'} 
          onClick={() => setActiveTab('sovereignty')} 
          icon={Globe} 
          label="Sovereignty" 
        />
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        <AnimatePresence mode="wait">
          {activeTab === 'audit' && (
            <motion.div
              key="audit"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-[11px] font-black text-white/40 uppercase tracking-widest">Immutable Event sequence</h3>
                <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[8px] font-black text-emerald-400 uppercase">Live Attestation Active</span>
              </div>

              {events.map((event, idx) => (
                <div key={event.id} className="relative pl-8 group">
                  {/* Timeline Line */}
                  {idx !== events.length - 1 && (
                    <div className="absolute left-[11px] top-6 bottom-0 w-px bg-white/5" />
                  )}
                  
                  {/* Event Marker */}
                  <div className="absolute left-0 top-1 p-1 bg-white/5 border border-white/10 rounded-full group-hover:border-emerald-500/40 transition-colors">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  </div>

                  <div className="p-4 bg-white/5 border border-white/5 rounded-2xl hover:border-white/10 transition-all">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-black text-white uppercase tracking-tight">{event.event_type.replace(/_/g, ' ')}</span>
                      <span className="text-[9px] font-mono text-white/20">{new Date(event.created_at).toLocaleTimeString()}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <span className="text-[8px] font-black text-white/20 uppercase">Subject ID</span>
                        <code className="block text-[9px] text-emerald-400 font-mono truncate">{event.user_id}</code>
                      </div>
                      <div className="space-y-1 text-right">
                        <span className="text-[8px] font-black text-white/20 uppercase font-black uppercase">Attestation Hash</span>
                        <code className="block text-[9px] text-white/40 font-mono truncate">0x{event.id.slice(0, 8)}...</code>
                      </div>
                    </div>
                    
                    {event.metadata && (
                      <div className="mt-3 p-2 bg-black/40 rounded-lg border border-white/5">
                        <pre className="text-[8px] text-white/60 font-mono whitespace-pre-wrap">
                          {JSON.stringify(event.metadata, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {activeTab === 'constitution' && (
            <motion.div
              key="constitution"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              <SectionHeader title="governance parameters" subtitle="Enforced by RAIS Constitution v2.2.0" />
              
              <div className="grid grid-cols-2 gap-4">
                <ConstitutionCard 
                  title="Specimen Sovereignty" 
                  desc="Direct physical control is maintained by the designated human custodian."
                  status="Enforced"
                />
                <ConstitutionCard 
                  title="Agent Boundedness" 
                  desc="All autonomous actions are mathematically bounded by specimen homeostasis."
                  status="Verified"
                />
              </div>

              <div className="p-6 bg-amber-500/5 border border-amber-500/10 rounded-2xl">
                <div className="flex gap-4">
                  <AlertTriangle className="text-amber-500 w-5 h-5 flex-shrink-0" />
                  <div>
                    <h4 className="text-xs font-black text-amber-500 uppercase tracking-widest mb-1 font-black uppercase">Attestation Warning</h4>
                    <p className="text-[10px] text-amber-500/60 font-medium">This specimen is currently operating under &apos;Alpha-Pilot&apos; governance protocols. Certain legacy biological regulations may be superseded by RAIS sovereign attestation.</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'sovereignty' && (
            <motion.div
              key="sovereignty"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <SovereigntyStat icon={Database} label="Identity Node" value="DECENTRALIZED" />
                <SovereigntyStat icon={Cpu} label="Attestation" value="HARDWARE_LEVEL" />
                <SovereigntyStat icon={Fingerprint} label="Bio-Signature" value="UNIQUE_HASH" />
              </div>

              <div className="p-6 bg-white/5 border border-white/5 rounded-3xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                  <Globe className="w-32 h-32" />
                </div>
                <div className="relative z-10">
                  <h3 className="text-lg font-black text-white uppercase tracking-tighter mb-4">Network Attestation</h3>
                  <div className="space-y-4">
                    <ProgressBar label="Network Consensus" value={98} />
                    <ProgressBar label="Sovereign Integrity" value={100} />
                    <ProgressBar label="Data Sovereignty" value={100} />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center p-8 border border-emerald-500/20 bg-emerald-500/5 rounded-3xl gap-4">
                 <CheckCircle2 className="text-emerald-400 w-10 h-10" />
                 <div>
                    <h4 className="text-xl font-black text-white uppercase tracking-tighter mb-1">SPECIMEN CERTIFIED</h4>
                    <p className="text-xs text-emerald-400/60 font-black uppercase tracking-widest">Sovereign Integrity Attested by RAIS v2.2.0</p>
                 </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer Action */}
      <div className="p-8 bg-white/5 border-t border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3 text-white/40">
           <Lock className="w-4 h-4" />
           <span className="text-[9px] font-black uppercase tracking-[0.3em] font-black uppercase">End-to-End Encrypted Audit Session</span>
        </div>
        <button className="px-6 py-2.5 bg-white text-black rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl">
          Export Audit Log
        </button>
      </div>
    </div>
  );
}

function TabButton({ active, onClick, icon: Icon, label }: { active: boolean, onClick: () => void, icon: React.ElementType, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={`px-6 py-5 flex items-center gap-2 border-b-2 transition-all relative ${
        active ? 'border-emerald-500 text-white' : 'border-transparent text-white/20 hover:text-white/40'
      }`}
    >
      <Icon className="w-4 h-4" />
      <span className="text-[10px] font-black uppercase tracking-[0.2em]">{label}</span>
      {active && (
        <motion.div 
          layoutId="activeTab"
          className="absolute inset-0 bg-emerald-500/5 -z-10"
        />
      )}
    </button>
  );
}

function SectionHeader({ title, subtitle }: { title: string, subtitle: string }) {
  return (
    <div className="mb-4">
      <h3 className="text-[11px] font-black text-white/40 uppercase tracking-widest mb-1">{title}</h3>
      <p className="text-xs font-medium text-white/60">{subtitle}</p>
    </div>
  );
}

function ConstitutionCard({ title, desc, status }: { title: string, desc: string, status: string }) {
  return (
    <div className="p-4 bg-white/5 border border-white/5 rounded-2xl">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-black text-white uppercase tracking-tight">{title}</span>
        <span className="text-[8px] font-black text-emerald-400 uppercase font-black uppercase">{status}</span>
      </div>
      <p className="text-[10px] text-white/40 leading-tight font-medium">{desc}</p>
    </div>
  );
}

function SovereigntyStat({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-4 bg-white/5 border border-white/5 rounded-2xl text-center">
       <Icon className="w-5 h-5 text-emerald-400 mb-2 opacity-60" />
       <span className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-1 font-black uppercase">{label}</span>
       <span className="text-[10px] font-black text-white uppercase tracking-tighter">{value}</span>
    </div>
  );
}

function ProgressBar({ label, value }: { label: string, value: number }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between px-1">
        <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">{label}</span>
        <span className="text-[10px] font-black text-emerald-400">{value}%</span>
      </div>
      <div className="h-1.5 bg-black/40 rounded-full overflow-hidden border border-white/5">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 1, delay: 0.5 }}
          className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]" 
        />
      </div>
    </div>
  );
}
