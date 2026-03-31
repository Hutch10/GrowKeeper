"use client";

import Image from "next/image";
import { 
  MapPin,
  Sun,
  Droplets, 
  Zap, 
  Waves,
  Leaf,
  ChevronDown,
  Thermometer,
  AlertCircle,
  LucideIcon,
  Bot,
  ShieldCheck,
  FileText,
  Clock,
  TrendingUp,
  Beef,
  Activity,
  Heart,
  Fingerprint
} from "lucide-react";


import { forecasting, ForecastResult } from '@/lib/services/forecasting-engine';
import { riskService, RiskAnalysis } from '@/lib/services/risk-assessment';
import { RAIS_CONSTITUTION } from '@/lib/rais-constitution';

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SpecimenScanner } from "@/components/plants/specimen-scanner";
import { LineageView } from "@/components/plants/lineage-view";
import { FractionalVaultPanel } from "@/components/finance/fractional-vault-panel";
import { ParametricInsurancePanel } from "@/components/finance/parametric-insurance-panel";
import { treatmentProtocolService, type TreatmentTask } from "@/lib/services/treatment-protocol-service";
import { speciesIntelligenceService, type IntelligenceMeshNode, type CareProtocol } from "@/lib/services/species-intelligence";
import type { SpecimenRow } from "@/app/actions/types";
import { IntelligenceMeshPanel } from "./intelligence-mesh-panel";
import { healthForecastService, type HealthForecast } from "@/lib/services/health-forecast-service";
import { NeuralForecastGraph } from "./neural-forecast-graph";
import { DiagnosticConfidenceIndicator } from "./diagnostic-confidence-indicator";
import { getPendingProposals, acceptAgentProposal, type AgentProposal } from "@/app/actions/proposals";
import { deriveSpecimenState, type ProjectedState } from "@/lib/services/biological-engine";
import { CheckCircle2, XCircle } from "lucide-react";
import { CompleteSpecimen } from "@/types/biological-intelligence";
import { ComplianceView } from "./compliance-view";

interface SpecimenDetailPanelProps {
  className?: string;
  specimen?: SpecimenRow;
  onDelete?: (id: string) => void;
  onEdit?: (specimen: SpecimenRow) => void;
  onClose?: () => void;
  onOpenCompliance?: (specimen: SpecimenRow) => void;
}

/**
 * GrowKeeper Specimen Detail Panel (Block 3 Completion)
 * Refined for Industrial Hardening - Strictly typed & warning-free.
 */
export function SpecimenDetailPanel({ specimen, className, onClose, onOpenCompliance }: SpecimenDetailPanelProps) {
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [forecast, setForecast] = useState<ForecastResult | null>(null);
  const [risk, setRisk] = useState<RiskAnalysis | null>(null);
  const [tasks, setTasks] = useState<TreatmentTask[]>([]);
  const [isMeshInitialized, setIsMeshInitialized] = useState(false);
  const [isMeshLoading, setIsMeshLoading] = useState(false);
  const [meshNodes, setMeshNodes] = useState<IntelligenceMeshNode[]>([]);
  const [careProtocol, setCareProtocol] = useState<CareProtocol | null>(null);
  const [healthForecast, setHealthForecast] = useState<HealthForecast | null>(null);
  const [proposals, setProposals] = useState<AgentProposal[]>([]);
  const [isComplianceOpen, setIsComplianceOpen] = useState(false);
  const [projectedState, setProjectedState] = useState<ProjectedState | null>(null);

  useEffect(() => {
    if (specimen) {
      const completeSpecimen = specimen as unknown as CompleteSpecimen;
      forecasting.predictMilestone(completeSpecimen).then(setForecast);
      riskService.assessRisk(completeSpecimen).then(setRisk);
      treatmentProtocolService.getSpecimenTasks(specimen.id).then(setTasks); 
      
      // Fetch Proposals (Phase 5)
      getPendingProposals(specimen.id).then(setProposals);
      
      // Derive State (Phase 1)
      const state = deriveSpecimenState(completeSpecimen, []); 
      setProjectedState(state);

      const forecastData = healthForecastService.generateForecast(
        specimen.id, 
        specimen.health || 85, 
        (specimen.kingdom as "Botanical" | "Mycology" | "Animalia") || "Botanical",
        specimen.telemetry || {}
      );
      setHealthForecast(forecastData);

      // Reset mesh state when switching specimens
      setIsMeshInitialized(false);
      setMeshNodes([]);
      setCareProtocol(null);
    } else {
      setForecast(null);
      setRisk(null);
      setTasks([]);
      setHealthForecast(null);
      setProposals([]);
      setProjectedState(null);
    }
  }, [specimen]);

  if (!specimen) {
    return (
      <aside className={`w-80 tactical-panel p-8 flex flex-col items-center justify-center text-center ${className || ""}`}>
        <div className="w-20 h-20 bg-brand-green/10 rounded-full flex items-center justify-center mb-4">
          <Leaf className="w-10 h-10 text-brand-green" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Select a Specimen</h2>
        <p className="text-sm text-white/40 font-medium">Capture or select a record to initiate protocol synchronization.</p>
      </aside>
    );
  }

  const completeSpecimen = specimen as unknown as CompleteSpecimen;
  const raisAudit = RAIS_CONSTITUTION.validateSpecimen(completeSpecimen);

  const isMycology = specimen.kingdom === "Mycology";
  const isAnimalia = specimen.kingdom === "Animalia";
  const displayImage = specimen.image_url || (isMycology 
    ? `https://images.unsplash.com/photo-1544070282-591d487abc53?q=80&w=400&h=400&auto=format&fit=crop`
    : isAnimalia
      ? `https://images.unsplash.com/photo-1552053831-71594a27632d?q=80&w=400&h=400&auto=format&fit=crop`
      : `https://images.unsplash.com/photo-1545239351-ef056c5983f3?q=80&w=400&h=400&auto=format&fit=crop`);

  return (
    <aside className={`w-96 tactical-panel p-6 overflow-y-auto max-h-[calc(100vh-2rem)] border border-white/5 shadow-2xl ${className || ""}`}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-black text-white uppercase tracking-tighter leading-none">Specimen Intelligence</h2>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => onOpenCompliance?.(specimen)}
              className="p-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 rounded-xl text-emerald-400 border border-emerald-500/20 transition-all group"
              title="Audit & Compliance Hub"
            >
              <ShieldCheck className="w-4 h-4 group-hover:scale-110" />
            </button>
            <button 
              onClick={onClose}
              className="text-white/20 hover:text-white transition-colors p-1" 
              title="Close Panel"
            >
              <ChevronDown className="w-6 h-6" />
            </button>
          </div>
        </div>

      <div className="relative w-full aspect-[4/3] rounded-[2rem] overflow-hidden mb-4 shadow-md group">
        <Image src={displayImage} alt={specimen.nickname} fill unoptimized className="object-cover transition-transform duration-700 group-hover:scale-110" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
          <button 
             title="View Gallery"
             className="w-full py-2 bg-white/20 backdrop-blur-md rounded-xl text-white text-xs font-black uppercase tracking-widest border border-white/20 hover:bg-white/40 transition-all"
          >
            View Gallery
          </button>
        </div>
      </div>

      <div className="mb-8">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-2xl font-black text-white mb-1 uppercase tracking-tight leading-none">{specimen.nickname}</h3>
            <p className="text-white/40 font-black uppercase text-[10px] tracking-widest leading-none mt-1">{specimen.species_name || "Unidentified Record"}</p>
          </div>
          <button 
            onClick={() => setIsScannerOpen(true)}
            className="p-3 bg-gradient-to-br from-emerald-400 to-brand-green rounded-2xl text-white shadow-lg shadow-emerald-200 hover:scale-110 active:scale-95 transition-all group" 
            title="Identify & Diagnose"
          >
            <Zap className="w-5 h-5 fill-current group-hover:animate-pulse" />
          </button>
        </div>

        {/* Diagnostic Confidence Framework (Phase 3) */}
        {projectedState && (
          <div className="mb-6">
            <DiagnosticConfidenceIndicator confidence={projectedState.confidence} label="Stewardship Certainty" />
          </div>
        )}

        {/* Intelligence Mesh & Proposals (Phase 5) */}
        {proposals.length > 0 && (
          <div className="mb-6 p-4 bg-purple-500/10 border border-purple-500/20 rounded-[1.5rem] animate-in fade-in slide-in-from-top duration-500">
            <div className="flex items-center gap-2 mb-3">
              <Bot className="text-purple-400 w-4 h-4" />
              <h4 className="text-[10px] font-black text-purple-400 uppercase tracking-widest">Specialist Agent Proposals</h4>
            </div>
            <div className="space-y-3">
              {proposals.map(p => (
                <div key={p.id} className="p-3 bg-white/5 border border-white/5 rounded-xl">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-black text-white uppercase tracking-tighter">{p.action_type}</span>
                    <span className={`text-[8px] font-black px-1.5 py-0.5 rounded ${
                      p.priority === 'critical' ? 'bg-red-500/20 text-red-400' : 'bg-purple-500/20 text-purple-400'
                    }`}>
                      {p.priority}
                    </span>
                  </div>
                  <p className="text-[9px] text-white/50 leading-none mb-2">{p.reasoning}</p>
                  <div className="flex items-center gap-2">
                    <button 
                      title="Authorize Agent Action"
                      onClick={() => acceptAgentProposal(p.id, "system-user").then(() => getPendingProposals(specimen.id).then(setProposals))}
                      className="flex-1 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-400 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 transition-all"
                    >
                      <CheckCircle2 size={10} /> Authorize
                    </button>
                    <button 
                       title="Dismiss Proposal"
                       className="p-1.5 bg-white/5 hover:bg-red-500/20 text-white/20 hover:text-red-400 rounded-lg transition-all"
                    >
                      <XCircle size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-2 text-blue-400 mb-1">
                <Clock size={16} />
                <span className="text-xs font-semibold uppercase tracking-wider">Predictive Milestone</span>
              </div>
              <p className="text-lg font-bold text-white leading-none mt-2">{forecast?.nextMilestone || 'Analyzing...'}</p>
              <p className="text-[10px] text-white/30 font-black uppercase mt-1 tracking-widest">{forecast?.daysToMilestone} days remaining</p>
            </div>

            <div className={`p-4 rounded-xl border ${
              risk?.riskLevel === 'CRITICAL' ? 'bg-red-500/10 border-red-500/20' : 
              risk?.riskLevel === 'HIGH' ? 'bg-orange-500/10 border-orange-500/20' : 
              'bg-white/5 border-white/10'
            }`}>
              <div className={`flex items-center gap-2 mb-1 ${
                risk?.healthOutlook === 'CRITICAL' || risk?.healthOutlook === 'DEGRADING' ? 'text-red-400' : 'text-green-400'
              }`}>
                <TrendingUp size={16} />
                <span className="text-xs font-semibold uppercase tracking-wider">Health Outlook</span>
              </div>
              <p className="text-lg font-bold text-white leading-none mt-2">{risk?.healthOutlook || 'STABLE'}</p>
              <p className="text-[9px] text-white/40 leading-tight mt-2 font-medium">{risk?.recommendation}</p>
            </div>
          </div>

        {/* Vitality & status Indicators */}
        <div className="flex items-center gap-2 mb-6 ml-[-4px] mt-8">
          <div className="flex-1 bg-white/5 px-3 py-2 rounded-2xl border border-white/5">
            <div className="flex items-center justify-between mb-1.5 px-0.5">
              <span className="text-[10px] font-black text-white/30 uppercase tracking-widest font-black uppercase">Vital Signs</span>
              <span className="text-[10px] font-black text-brand-green uppercase tracking-widest font-black uppercase">{specimen.health || 85}% Nominal</span>
            </div>
            <div className="h-1 bg-white/10 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${specimen.health || 85}%` }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="h-full bg-brand-green rounded-full shadow-[0_0_10px_rgba(52,211,153,0.5)]" 
              />
            </div>
          </div>
          <div className="px-3 py-2 bg-brand-green/10 rounded-2xl border border-brand-green/20 flex flex-col items-center justify-center min-w-[70px]">
            <span className="text-[9px] font-black text-brand-green/50 uppercase tracking-widest mb-0.5 font-black uppercase">Alert Level</span>
            <span className="text-[10px] font-black text-brand-green uppercase tracking-tight font-black uppercase">{(specimen.health || 0) > 80 ? "NORMAL" : "STRESSED"}</span>
          </div>
        </div>

        <div className="space-y-2">
          <DetailRow icon={MapPin} label="Deployment" value={specimen.location || "Central Hub"} color="text-brand-green" bg="bg-brand-green/10" />
          
          <DetailRow 
            icon={Activity} 
            label="Truth Data" 
            value={projectedState?.vitalityTrend || "STABLE"} 
            color="text-emerald-400" 
            bg="bg-emerald-400/10" 
            badge="INFERRED"
          />

          {specimen.kingdom === "Mycology" ? (
            <>
              <DetailRow icon={Zap} label="Growth Medium" value={specimen.substrate || "Sawdust"} color="text-blue-400" bg="bg-blue-400/10" />
              <DetailRow icon={Waves} label="Climate Model" value={specimen.misting_schedule || "Stable"} color="text-blue-400" bg="bg-blue-400/10" />
            </>
          ) : specimen.kingdom === "Botanical" ? (
            <>
              <DetailRow icon={Sun} label="Photon Input" value={specimen.light || "Ambient"} color="text-amber-400" bg="bg-amber-400/10" />
              <DetailRow icon={Droplets} label="Hydration" value={specimen.watering || "Automated"} color="text-blue-400" bg="bg-blue-400/10" />
            </>
          ) : specimen.kingdom === "Animalia" ? (
            <>
              <DetailRow icon={Activity} label="Metabolic Act" value={`${specimen.activity_level || 0}%`} color="text-brand-green" bg="bg-brand-green/10" />
              <DetailRow icon={Beef} label="Nutrient Pack" value={specimen.dietary_notes || "Standard"} color="text-rose-400" bg="bg-rose-400/10" />
            </>
          ) : null}
        </div>

        {isMeshInitialized && meshNodes.length > 0 && careProtocol ? (
          <div className="mt-8 border-t border-white/5 pt-8">
            <IntelligenceMeshPanel nodes={meshNodes} protocol={careProtocol} />
          </div>
        ) : (
          <>
            {/* Ask Concierge Quick Action */}
            <button 
              title="Initialize Species Intelligence Mesh"
              className="w-full mt-6 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-[1.5rem] flex items-center justify-center gap-3 transition-all group relative overflow-hidden"
              onClick={async () => {
                if (isMeshLoading) return;
                setIsMeshLoading(true);
                
                // Simulate neural synchronization delay
                await new Promise(r => setTimeout(r, 2000));
                
                const nodes = await speciesIntelligenceService.getIntelligenceMesh(completeSpecimen);
                const protocol = await speciesIntelligenceService.getAdaptiveCareProtocol(completeSpecimen);
                
                setMeshNodes(nodes);
                setCareProtocol(protocol);
                setIsMeshInitialized(true);
                setIsMeshLoading(false);
              }}
            >
              <div className={`flex items-center gap-3 transition-opacity duration-300 ${isMeshLoading ? 'opacity-0' : 'opacity-100'}`}>
                <Bot className="w-5 h-5 text-brand-green group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-black text-white uppercase tracking-widest">Initialize Intelligence Mesh</span>
              </div>
              
              {isMeshLoading && (
                <div className="absolute inset-0 flex items-center justify-center gap-2 bg-brand-green/10">
                  <Activity className="w-4 h-4 text-brand-green animate-spin" />
                  <span className="text-[9px] font-black text-brand-green uppercase tracking-[0.3em] animate-pulse">Neural Sync...</span>
                </div>
              )}
            </button>

            {/* Institutional Liquidity Layer */}
            <div className="mt-4">
              <FractionalVaultPanel specimen={completeSpecimen} />
            </div>

            {/* Parametric Resilience Layer */}
            <ParametricInsurancePanel specimen={completeSpecimen} />
          </>
        )}
      </div>

      {/* IoT Vitals Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-[11px] font-black text-white/40 uppercase tracking-widest">Real-time Telemetry</h4>
          <div className="flex items-center gap-1.5 px-2 py-0.5 bg-brand-green/10 border border-brand-green/20 rounded-full">
            <div className="w-1 h-1 bg-brand-green rounded-full animate-pulse" />
            <span className="text-[8px] font-black text-brand-green uppercase tracking-tighter">Link Active</span>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <VitalCard icon={isAnimalia ? Activity : isMycology ? Waves : Droplets} label={isAnimalia ? "Metabolism" : isMycology ? "Osmosis" : "Hydration"} value={isAnimalia ? "Active" : `${Math.round((specimen.telemetry?.moisture || 0.5) * 100)}%`} color="text-blue-400" badge="OBSERVED" />
          <VitalCard icon={isAnimalia ? Heart : Sun} label={isAnimalia ? "Pulse" : "Solar"} value={isAnimalia ? "Norm" : `${Math.round((specimen.telemetry?.light || 0.5) * 10)} UV`} color="text-amber-400" />
          <VitalCard icon={Thermometer} label="Thermal" value={`${specimen.telemetry?.temperature || 21}°C`} color="text-brand-pink" />
        </div>
      </div>

      {/* Smart Home Alerts */}
      {specimen.telemetry?.moisture && specimen.telemetry.moisture < 0.45 && (
        <div className="mb-8 p-4 bg-amber-500/10 rounded-[1.5rem] border border-amber-500/20 flex items-start gap-4 animate-in slide-in-from-bottom duration-500">
          <div className="p-2 bg-amber-500 rounded-xl text-black shadow-lg shadow-amber-500/50">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <h5 className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-0.5 font-black uppercase">Automated Irrigation Triggered</h5>
            <p className="text-[11px] font-bold text-white/60 leading-tight">
              Sovereign {isMycology ? "humidity" : "moisture"} floor reached. Autonomous systems engaged to restore homeostasis.
            </p>
          </div>
        </div>
      )}

      {/* Biological Neural Prophecy */}
      {healthForecast && (
        <div className="mb-8 border-t border-white/5 pt-8">
          <NeuralForecastGraph forecast={healthForecast} />
        </div>
      )}

      <div className="mb-8 border-t border-white/5 pt-8">
        <h4 className="text-[11px] font-black text-white/40 uppercase tracking-widest mb-4">RAIS Governance Audit</h4>
        <div className="space-y-3">
          <div className={`p-4 rounded-2xl border transition-all ${raisAudit.isValid ? 'bg-brand-green/5 border-brand-green/20' : 'bg-red-500/5 border-red-500/20'}`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <ShieldCheck className={`w-5 h-5 ${raisAudit.isValid ? 'text-brand-green' : 'text-red-400'}`} />
                <span className={`text-[10px] font-black uppercase tracking-widest ${raisAudit.isValid ? 'text-brand-green' : 'text-red-400'}`}>
                  {raisAudit.isValid ? 'Protocol Compliant (GOVERNED)' : 'Protocol Violation (AUDIT)'}
                </span>
              </div>
              <div className="px-2 py-0.5 bg-white/5 rounded-md border border-white/10">
                <span className="text-[8px] font-black text-white/40 uppercase">v2.2.0</span>
              </div>
            </div>

            {!raisAudit.isValid && (
              <div className="mb-4 space-y-1">
                {raisAudit.violations.map((v, i) => (
                  <div key={i} className="flex items-center gap-2 text-[9px] font-black text-red-300 uppercase tracking-tight font-black uppercase">
                    <AlertCircle size={10} />
                    {v.replace(/_/g, ' ')}
                  </div>
                ))}
              </div>
            )}

            {(specimen.hardware_attestation_statement || specimen.last_vital_signature) && (
              <div className="mb-4">
                <span className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-1 block font-black uppercase">Seal of Governance (Anchored)</span>
                <code className="block p-2 bg-black/40 rounded-lg text-[9px] text-white/50 font-mono truncate border border-white/5">
                  {specimen.hardware_attestation_statement || specimen.last_vital_signature}
                </code>
              </div>
            )}
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-3 h-3 text-white/20" />
                <span className="text-[9px] font-black text-white/30 uppercase font-black uppercase">Regulatory Class</span>
              </div>
              <span className={`px-2 py-0.5 rounded-md text-[9px] font-black tabular-nums tracking-tighter ${specimen.compliance_status && specimen.compliance_status !== 'none' ? 'bg-red-500/20 text-red-400 border border-red-500/20' : 'bg-brand-green/20 text-brand-green border border-brand-green/20'}`}>
                {specimen.compliance_status && specimen.compliance_status !== 'none' ? `CITES APPENDIX ${specimen.compliance_status}` : 'GLOBAL WHITE-LISTED'}
              </span>
            </div>

            <button 
              onClick={() => setIsComplianceOpen(true)}
              className="w-full mt-4 py-2 border border-brand-green/30 bg-brand-green/5 text-[9px] font-black text-brand-green uppercase tracking-widest rounded-xl hover:bg-brand-green/10 transition-all flex items-center justify-center gap-2"
            >
              <Fingerprint size={12} />
              Open Compliance Surface
            </button>
          </div>
        </div>
      </div>

            {/* Institutional Co-sign Action */}
            {!specimen.custodian_id && (
              <button 
                title="Request Institutional Audit Co-sign"
                className="w-full mt-4 py-2.5 bg-white/10 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-brand-green transition-all shadow-lg"
                onClick={() => alert("Requesting Institutional Co-sign from NGO/Regulator Swarm...")}
              >
                Request Institutional Co-sign
              </button>
            )}


      {/* Autonomous Treatment Protocols */}
      {tasks.length > 0 && (
        <div className="mb-8 border-t border-white/5 pt-8">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-[11px] font-black text-white/40 uppercase tracking-widest">Remediation Protocols</h4>
            <span className="text-[10px] font-black text-brand-green uppercase tracking-tighter font-black uppercase">{tasks.filter(t => t.status === 'completed').length}/{tasks.length} Resolved</span>
          </div>
          <div className="space-y-3">
            {tasks.map((task) => (
              <div key={task.id} className="p-4 bg-white/5 border border-white/10 rounded-2xl group hover:border-brand-green/20 transition-all">
                <div className="flex items-center gap-3 mb-2">
                  <div className={`p-1.5 rounded-lg ${task.status === 'completed' ? 'bg-brand-green/10 text-brand-green' : 'bg-orange-500/10 text-orange-400'}`}>
                    {task.status === 'completed' ? <ShieldCheck size={14} /> : <Activity size={14} />}
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/80">{task.name}</span>
                  <span className={`ml-auto text-[8px] font-black uppercase px-1.5 py-0.5 rounded border ${
                    task.status === 'completed' ? 'border-brand-green/20 text-brand-green' : 'border-orange-500/20 text-orange-400'
                  }`}>
                    {task.status}
                  </span>
                </div>
                <p className="text-[10px] text-white/40 leading-tight mb-2 font-medium">{task.description}</p>
                {task.status === 'pending' && task.approvalRequired && (
                  <div className="flex items-center gap-2 text-[8px] font-black text-amber-500 uppercase tracking-widest">
                    <AlertCircle size={10} />
                    Awaiting Authorization
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mb-8 border-t border-white/5 pt-8">
        <h4 className="text-[11px] font-black text-white/40 uppercase tracking-widest mb-4">Registry Feed</h4>
        <div className="space-y-2">
          <ReminderItem icon={isAnimalia ? Beef : isMycology ? Waves : Droplets} label={isAnimalia ? "Nutrient Distribution: 4h" : isMycology ? "Atmospheric Mist: 2d" : "Hydration Cycle: 2d"} color="bg-blue-500/20" />
          <ReminderItem icon={Zap} label={isAnimalia ? "Vital Booster: Daily" : isMycology ? "Mineralization: 10d" : "Soil Enrichment: 10d"} color="bg-orange-500/20" />
        </div>
      </div>

      <div className="mb-8 border-t border-white/5 pt-8">
        <LineageView specimenName={specimen.nickname} />
      </div>

      <SpecimenScanner 
        isOpen={isScannerOpen} 
        onClose={() => setIsScannerOpen(false)} 
        specimenImageUrl={specimen.image_url || "/placeholder-plant.png"} 
        specimenNickname={specimen.nickname} 
        kingdom={specimen.kingdom}
      />

      <AnimatePresence>
        {isComplianceOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-12">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
              onClick={() => setIsComplianceOpen(false)}
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-5xl h-[85vh] z-10"
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={() => setIsComplianceOpen(false)}
                title="Close Compliance Surface"
                className="absolute -top-4 -right-4 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white border border-white/10 backdrop-blur-xl z-20 transition-all hover:rotate-90"
              >
                <XCircle className="w-6 h-6" />
              </button>
              <ComplianceView specimen={completeSpecimen} />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </aside>
  );
}

function DetailRow({ icon: Icon, label, value, color, bg, badge }: { icon: LucideIcon, label: string, value: string, color: string, bg: string, badge?: string }) {
  return (
    <div className="flex items-center gap-3 py-1">
      <div className={`p-1.5 rounded-lg ${bg} ${color}`}>
        <Icon className="w-3.5 h-3.5" />
      </div>
      <div className="flex-1 flex items-center justify-between border-b border-white/5 pb-1">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">{label}</span>
          {badge && <span className="text-[7px] font-black bg-white/5 px-1 rounded-sm text-white/40 uppercase tracking-tighter">{badge}</span>}
        </div>
        <span className="text-[11px] font-black text-white/80 uppercase tracking-tight">{value}</span>
      </div>
    </div>
  );
}

function ReminderItem({ icon: Icon, label, color }: { icon: LucideIcon, label: string, color: string }) {
  return (
    <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5 hover:border-brand-green/20 transition-all cursor-pointer group">
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded-xl ${color} flex items-center justify-center text-white/80`}>
          <Icon className="w-4 h-4" />
        </div>
        <span className="text-[10px] font-black text-white/60 uppercase tracking-widest group-hover:text-brand-green transition-colors">{label}</span>
      </div>
      <div className="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center border border-white/5">
         <div className="w-1.5 h-1.5 rounded-full bg-white/10" />
      </div>
    </div>
  );
}

function VitalCard({ icon: Icon, label, value, color, badge }: { icon: LucideIcon, label: string, value: string, color: string, badge?: string }) {
  return (
    <div className="bg-white/5 border border-white/5 p-3 rounded-2xl flex flex-col items-center justify-center text-center shadow-lg hover:bg-white/10 transition-all relative">
      {badge && <span className="absolute top-1 right-1 text-[6px] font-black text-white/20 uppercase font-black uppercase">{badge}</span>}
      <Icon className={`w-5 h-5 ${color} mb-1 opacity-80`} />
      <span className="text-[8px] font-black text-white/20 uppercase tracking-tighter mb-0.5 font-black uppercase">{label}</span>
      <span className="text-xs font-black text-white/90 tabular-nums font-black uppercase">{value}</span>
    </div>
  );
}
