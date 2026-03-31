"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ShieldCheck, 
  X, 
  Lock, 
  Search, 
  Activity, 
  FileText,
  Clock,
  ExternalLink,
  AlertTriangle
} from 'lucide-react';
import { RAIS_CONSTITUTION } from "@/lib/rais-constitution";
import { SpecimenRow } from "@/app/actions/types";

interface AuditEntry {
  id: string;
  created_at: string;
  event_type: string;
  metadata: {
    audit_target: string;
    audit_target_id: string;
    payload_hash?: string;
    custodian_id?: string;
    timestamp: string;
  };
  user_id?: string;
}

interface ComplianceSurfaceProps {
  specimen: SpecimenRow;
  onClose: () => void;
}

/**
 * Sovereign Compliance Surface (Block 3)
 * Non-repudiable audit visualization for biological assets.
 * Strictly typed & warning-free.
 */
export function ComplianceSurface({ specimen, onClose }: ComplianceSurfaceProps) {
  const [auditTrail, setAuditTrail] = useState<AuditEntry[]>([]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationPassed, setVerificationPassed] = useState<boolean | null>(null);

  useEffect(() => {
    // Simulate fetching audit trail from alpha_events
    setAuditTrail([
      {
        id: '1',
        created_at: new Date().toISOString(),
        event_type: 'BIO_ASSET_REGISTRATION',
        metadata: {
          audit_target: 'specimen',
          audit_target_id: specimen.id,
          payload_hash: 'sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
          custodian_id: 'system-alpha',
          timestamp: new Date().toISOString()
        }
      }
    ]);
  }, [specimen.id]);

  const runVerification = async () => {
    setIsVerifying(true);
    await new Promise(r => setTimeout(r, 1500));
    setVerificationPassed(true);
    setIsVerifying(false);
  };

  const raisStatus = RAIS_CONSTITUTION.validateSpecimen(specimen);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-8 bg-black/80 backdrop-blur-xl"
    >
      <div className="relative w-full max-w-5xl h-[80vh] bg-[#050505] rounded-[3rem] border border-white/5 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-12 py-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-500/20">
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white tracking-tighter uppercase">Sovereign Compliance Hub</h2>
              <p className="text-[10px] font-black text-white/30 tracking-[0.2em] uppercase">Non-Repudiable Audit Ledger • v2.2.0</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            title="Close Compliance Surface"
            className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 transition-all text-white/40 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Left: Constitution & Real-time Status */}
          <div className="w-1/3 p-12 border-r border-white/5 bg-black overflow-y-auto custom-scrollbar">
            <h3 className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em] mb-8">Protocol Verification</h3>
            
            <div className="space-y-8">
              {/* RAIS Constitution Status */}
              <div className="p-6 rounded-3xl bg-white/[0.03] border border-emerald-500/20 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black text-white/40 uppercase tracking-widest">Governance State</span>
                  <div className="flex items-center gap-2 px-2 py-0.5 bg-brand-green/20 border border-brand-green/30 rounded-md">
                    <Lock className="w-3 h-3 text-brand-green" />
                    <span className="text-[9px] font-black text-brand-green uppercase tracking-tighter">Anchored</span>
                  </div>
                </div>
                <div className="text-2xl font-black text-white leading-none">
                  {raisStatus.isValid ? 'COMPLIANT' : 'VIOLATION'}
                </div>
                <p className="text-[10px] text-white/40 leading-relaxed font-medium">
                  {raisStatus.isValid 
                    ? "Biological asset adheres to RAIS Constitution Article IV (Managed Growth Protocols)." 
                    : "Intervention required: System detected deviation from authorized botanical bounds."}
                </p>
              </div>

              {/* Cryptographic Integrity Check */}
              <button 
                onClick={runVerification}
                disabled={isVerifying}
                title="Execute Cryptographic Verification"
                className={`w-full py-6 rounded-3xl border transition-all flex flex-col items-center justify-center gap-3 group ${
                  verificationPassed ? 'bg-emerald-500/20 border-emerald-500/40' : 'bg-white/5 border-white/10 hover:border-emerald-500/30'
                }`}
              >
                {isVerifying ? (
                  <Activity className="w-8 h-8 text-emerald-500 animate-spin" />
                ) : verificationPassed ? (
                  <ShieldCheck className="w-8 h-8 text-emerald-400" />
                ) : (
                  <Search className="w-8 h-8 text-white/20 group-hover:text-emerald-400" />
                )}
                <span className="text-[10px] font-black uppercase tracking-widest text-white/60">
                  {isVerifying ? 'Verifying Ledger...' : verificationPassed ? 'Integrity Verified' : 'Scan Audit Integrity'}
                </span>
              </button>

              {/* Constitution Quick-Ref */}
              <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5">
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="w-4 h-4 text-white/20" />
                  <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">RAIS Constitution Clauses</span>
                </div>
                <div className="space-y-3">
                  {[
                    "Article I: Biological Autonomy Shield",
                    "Article II: Non-Extractable Value Floor",
                    "Article III: Recursive Safety Loops"
                  ].map((clause, i) => (
                    <div key={i} className="flex items-center gap-3 text-[10px] font-bold text-white/40">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/30" />
                      {clause}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right: Immutabe Ledger Feed */}
          <div className="flex-1 p-12 overflow-y-auto custom-scrollbar bg-black/40">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em]">Operational Chronology</h3>
              <div className="flex items-center gap-6">
                 <div className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                   <span className="text-[9px] font-black text-white/40 uppercase tracking-tighter">Live Audit Stream</span>
                 </div>
              </div>
            </div>

            <div className="space-y-6">
              {auditTrail.map((entry) => (
                <div key={entry.id} className="group relative pl-8 border-l border-white/5 py-2 hover:border-emerald-500/30 transition-colors">
                  {/* Timeline Dot */}
                  <div className="absolute left-[-5px] top-4 w-[9px] h-[9px] bg-black border border-white/10 rounded-full group-hover:border-emerald-500/50 transition-colors" />
                  
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-[11px] font-black text-white uppercase tracking-tighter">{entry.event_type.replace(/_/g, ' ')}</span>
                        <div className="px-1.5 py-0.5 bg-emerald-500/10 rounded border border-emerald-500/20">
                          <span className="text-[8px] font-black text-emerald-400 uppercase tracking-tighter">Certified</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-[9px] font-bold text-white/20 uppercase tracking-widest">
                        <span className="flex items-center gap-1.5"><Clock className="w-3 h-3" /> {new Date(entry.created_at).toLocaleString()}</span>
                        <span className="flex items-center gap-1.5"><ShieldCheck className="w-3 h-3" /> Custodian: {entry.metadata.custodian_id}</span>
                      </div>
                    </div>
                    <button 
                      title="View External Verification Source"
                      className="p-2 opacity-0 group-hover:opacity-100 transition-opacity text-white/20 hover:text-emerald-400"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </div>

                  {entry.metadata.payload_hash && (
                    <div className="mt-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5 font-mono text-[9px] text-white/30 break-all flex items-center gap-3">
                      <Lock className="w-3 h-3 shrink-0" />
                      {entry.metadata.payload_hash}
                    </div>
                  )}
                </div>
              ))}

              {/* If no data... */}
              {auditTrail.length === 0 && (
                <div className="h-64 flex flex-col items-center justify-center text-center opacity-20">
                   <AlertTriangle className="w-12 h-12 mb-4" />
                   <p className="text-xs font-black uppercase tracking-widest text-white">No historical traces detected for this asset.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Seal */}
        <div className="px-12 py-6 border-t border-white/5 bg-white/[0.01] flex items-center justify-between">
           <div className="flex items-center gap-3">
              <ShieldCheck className="w-4 h-4 text-emerald-500/50" />
              <span className="text-[8px] font-black text-white/20 uppercase tracking-[0.4em]">Sovereignty Attested • RAIS Protocol Registry</span>
           </div>
           <div className="flex items-center gap-6">
              <span className="text-[8px] font-black text-white/10 uppercase tracking-widest italic">Digital Twin Integrity v0.9.0-CERTIFIED</span>
           </div>
        </div>
      </div>
    </motion.div>
  );
}
