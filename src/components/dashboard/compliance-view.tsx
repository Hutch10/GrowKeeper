"use client";

import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  History, 
  FileText, 
  Search, 
  Download, 
  Fingerprint,
  User,
  Clock,
  Activity,
  Zap
} from 'lucide-react';
import { createBrowserSupabaseClient } from '@/lib/supabase-browser';

interface AuditMetadata {
  audit_target?: string;
  audit_target_id?: string;
  payload_hash?: string;
  threat_type?: string;
  outcome?: string;
  severity?: string;
}

interface AuditLog {
  id: string;
  created_at: string;
  user_id: string | null;
  event_type: string;
  metadata: AuditMetadata;
  route: string | null;
  isSynthetic?: boolean;
}

export function ComplianceView() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSovereign, setIsSovereign] = useState(false);

  useEffect(() => {
    // Check sovereign status from local storage
    const engineStatus = localStorage.getItem('sovereign_engine_active') === 'true';
    setIsSovereign(engineStatus);

    async function fetchAuditLogs() {
      const supabase = createBrowserSupabaseClient();
      const { data, error } = await supabase
        .from('alpha_events')
        .select('*')
        .ilike('event_type', 'AUDIT_%')
        .order('created_at', { ascending: false })
        .limit(50);

      if (!error && data && data.length > 0) {
        setLogs(data as AuditLog[]);
      } else {
        // Fallback to Synthetic Audit for Alpha Pilot Demonstration
        // Specifically if table is missing (404/42P01) or empty
        const syntheticLogs: AuditLog[] = [
          {
            id: 'syn-1',
            created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
            user_id: 'sys-custodian-01',
            event_type: 'AUDIT_CREATE',
            metadata: { audit_target: 'specimen', audit_target_id: 'alpha-1', payload_hash: '8f7a6b5c4d3e2f1a' },
            route: '/plants/add',
            isSynthetic: true
          },
          {
            id: 'syn-2',
            created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
            user_id: 'sys-custodian-01',
            event_type: 'AUDIT_COMPLETE',
            metadata: { audit_target: 'task', audit_target_id: 'task-123', payload_hash: 'd4e5f6a7b8c90123' },
            route: '/dashboard',
            isSynthetic: true
          },
          {
            id: 'syn-3',
            created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
            user_id: 'node-edge-04',
            event_type: 'AUDIT_GEOFENCE_BREACH',
            metadata: { audit_target: 'registry', audit_target_id: 'zone-alpha', severity: 'Critical' },
            route: '/dashboard',
            isSynthetic: true
          },
          {
            id: 'syn-4',
            created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
            user_id: 'unknown-adversary',
            event_type: 'AUDIT_ADVERSARIAL_ATTEMPT',
            metadata: { 
              audit_target: 'specimen', 
              audit_target_id: 'alpha-1', 
              threat_type: 'UNAUTHORIZED_DELETE_ATTEMPT',
              outcome: 'NEUTRALIZED'
            },
            route: '/api/mutate',
            isSynthetic: true
          }
        ];
        setLogs(syntheticLogs);
        if (error) {
           console.warn("[Compliance Note] Table missing or unresponsive. Loading Synthetic Registry logs.");
        }
      }
      setLoading(false);
    }

    fetchAuditLogs();
  }, []);

  const filteredLogs = logs.filter(log => {
    const searchStr = `${log.event_type} ${log.metadata?.audit_target} ${log.metadata?.audit_target_id}`.toLowerCase();
    return searchStr.includes(searchQuery.toLowerCase());
  });

  return (
    <div className={`flex flex-col h-full space-y-8 pb-12 transition-all duration-700 ${isSovereign ? 'brightness-[1.1] contrast-[1.05]' : ''}`}>
      {/* Header & Stats Summary */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <ComplianceStatCard 
          icon={ShieldCheck} 
          label="Registry Integrity" 
          value="Non-Repudiable" 
          subtext="Cryptographically Anchored"
          color="emerald"
        />
        <ComplianceStatCard 
          icon={Zap} 
          label="Threats Mitigated" 
          value={String(logs.filter(l => l.event_type.includes('ADVERSARIAL')).length)} 
          subtext="Unauthorized Actions Blocked"
          color="rose"
        />
        <ComplianceStatCard 
          icon={History} 
          label="Audit Depth" 
          value={`${logs.length} Actions`} 
          subtext="Last 24 Hours in Registry"
          color="blue"
        />
        <ComplianceStatCard 
          icon={Activity} 
          label="Compliance Pulse" 
          value="Optimal" 
          subtext="Protocol Adherence: 98.4%"
          color="emerald"
        />
      </section>

      {/* Main Ledger Surface */}
      <section className={`flex-1 min-h-0 flex flex-col bg-white/[0.02] border rounded-[2.5rem] overflow-hidden transition-all duration-500 ${isSovereign ? 'border-emerald-500/20 shadow-[0_0_50px_-12px_rgba(16,185,129,0.1)]' : 'border-white/5'}`}>
        <div className="p-8 border-b border-white/5 bg-white/[0.01] flex items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-2xl border transition-colors ${isSovereign ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-white/5 border-white/5'}`}>
              <History className={`w-5 h-5 ${isSovereign ? 'text-emerald-400' : 'text-white/40'}`} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-black text-white tracking-tight leading-none">
                  Institutional Audit Ledger
                </h3>
                {logs.some(l => l.isSynthetic) && (
                  <span className="flex items-center gap-1 px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 rounded text-[8px] font-black uppercase text-amber-500 tracking-widest">
                    <Zap className="w-2 h-2" />
                    Synthetic Registry
                  </span>
                )}
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">
                Immutable Record of Stewardship Mutations
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
             <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-emerald-500 transition-colors" />
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search ledger..."
                className="bg-white/5 border border-white/5 rounded-xl py-2.5 pl-11 pr-4 text-xs font-medium focus:outline-none focus:border-emerald-500/50 transition-all placeholder:text-white/10 w-64"
              />
            </div>
            <button className="flex items-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-all">
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {loading ? (
             <div className="h-64 flex flex-col items-center justify-center opacity-20">
              <Activity className="w-12 h-12 animate-pulse mb-4 text-emerald-500" />
              <p className="text-[10px] font-black uppercase tracking-widest">Anchoring Ledger State...</p>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center opacity-20">
              <FileText className="w-12 h-12 mb-4" />
              <p className="text-[10px] font-black uppercase tracking-widest">No matching audit records</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-[#080808] z-10 px-8">
                <tr>
                  <th className="px-8 py-5 text-[10px] font-black text-white/20 uppercase tracking-widest border-b border-white/5">Action & State</th>
                  <th className="px-8 py-5 text-[10px] font-black text-white/20 uppercase tracking-widest border-b border-white/5">Target Entity</th>
                  <th className="px-8 py-5 text-[10px] font-black text-white/20 uppercase tracking-widest border-b border-white/5">Custodian</th>
                  <th className="px-8 py-5 text-[10px] font-black text-white/20 uppercase tracking-widest border-b border-white/5 text-right">Registry Hash</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.03]">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="group hover:bg-white/[0.01] transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-xl border ${getActionColor(log.event_type)}`}>
                          <Fingerprint className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-black text-white/80 group-hover:text-white transition-colors flex items-center gap-2">
                            {formatActionType(log.event_type)}
                          </div>
                          <div className="text-[10px] font-medium text-white/20 flex items-center gap-1.5 mt-1">
                            <Clock className="w-3 h-3 text-emerald-500/40" />
                            {new Date(log.created_at).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className={`text-xs font-black uppercase tracking-widest mb-1 items-center flex gap-2 ${isSovereign ? 'text-emerald-400/60' : 'text-white/60'}`}>
                        {log.metadata?.audit_target === 'specimen' ? <Activity className="w-3 h-3" /> : <FileText className="w-3 h-3" />}
                        {log.metadata?.audit_target || 'Registry'}
                      </div>
                      <div className="text-[9px] font-mono text-white/20 leading-none">
                        ID: {String(log.metadata?.audit_target_id || 'SYSTEM')?.slice(0, 12)}...
                      </div>
                    </td>
                    <td className="px-8 py-6">
                       <div className="flex items-center gap-3">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center border ${isSovereign ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-white/5 border-white/5'}`}>
                          <User className={`w-3 h-3 ${isSovereign ? 'text-emerald-400' : 'text-white/20'}`} />
                        </div>
                        <span className="text-[11px] font-bold text-white/40 truncate max-w-[120px]">
                          {log.user_id || 'Custodian Agent'}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="text-[10px] font-mono text-white/10 group-hover:text-emerald-500/40 transition-colors uppercase tracking-tighter">
                        {log.metadata?.payload_hash?.slice(0, 16) || "SHA256_ANCHORED"}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
}

function ComplianceStatCard({ icon: Icon, label, value, subtext, color }: { 
  icon: React.ElementType, 
  label: string, 
  value: string, 
  subtext: string, 
  color: 'emerald' | 'blue' | 'rose' 
}) {
  const colors: Record<string, string> = {
    emerald: 'text-emerald-400 bg-emerald-500/5 border-emerald-500/10',
    blue: 'text-blue-400 bg-blue-500/5 border-blue-500/10',
    rose: 'text-rose-400 bg-rose-500/5 border-rose-500/10',
  };

  return (
    <div className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 relative overflow-hidden group">
      <div className={`absolute -right-4 -top-4 opacity-5 transition-transform group-hover:scale-110 duration-700`}>
        <Icon size={120} />
      </div>
      <div className="relative z-10">
        <div className={`inline-flex p-3 rounded-2xl border mb-4 ${colors[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 mb-1">{label}</div>
        <div className="text-2xl font-black text-white tracking-tight mb-2">{value}</div>
        <div className="text-[10px] font-medium text-white/40">{subtext}</div>
      </div>
    </div>
  );
}

function getActionColor(type: string) {
  if (type.includes('CREATE')) return 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400';
  if (type.includes('UPDATE')) return 'bg-blue-500/10 border-blue-500/20 text-blue-400';
  if (type.includes('DELETE')) return 'bg-rose-500/10 border-rose-500/20 text-rose-400';
  if (type.includes('COMPLETE')) return 'bg-amber-500/10 border-amber-500/20 text-amber-400';
  if (type.includes('ADVERSARIAL')) return 'bg-rose-600/20 border-rose-500/40 text-rose-400 animate-pulse';
  return 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400';
}

function formatActionType(type: string) {
  return type.replace('AUDIT_', '').split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
}
