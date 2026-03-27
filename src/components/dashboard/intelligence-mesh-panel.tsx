"use client";

import { 
  Network, 
  Cpu, 
  Brain, 
  AlertTriangle,
  ChevronRight,
  Fingerprint,
  Link2
} from "lucide-react";
import { type IntelligenceMeshNode, type CareProtocol } from "@/lib/services/species-intelligence";

interface IntelligenceMeshPanelProps {
  nodes: IntelligenceMeshNode[];
  protocol: CareProtocol;
}

export function IntelligenceMeshPanel({ nodes, protocol }: IntelligenceMeshPanelProps) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Neural Mesh Section */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Network className="w-4 h-4 text-brand-pink" />
          <h4 className="text-[11px] font-black text-white/40 uppercase tracking-[0.2em] group-hover:text-brand-pink/60 transition-colors">Sovereign Intelligence Mesh</h4>
        </div>
        
        <div className="grid grid-cols-1 gap-3">
          {nodes.map((node) => (
            <div key={node.id} className="group relative p-4 bg-white/5 border border-white/5 rounded-2xl hover:border-brand-pink/30 transition-all overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity">
                <Fingerprint className="w-12 h-12 text-brand-pink" />
              </div>
              
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-brand-pink animate-pulse" />
                  <span className="text-sm font-black text-white uppercase tracking-tight">{node.nickname}</span>
                </div>
                <span className="text-[10px] font-black text-brand-pink px-2 py-0.5 bg-brand-pink/10 rounded-md border border-brand-pink/20">
                  {Math.round(node.symbioticStrength * 100)}% Match
                </span>
              </div>
              
              <div className="flex items-center gap-2 text-[10px] text-white/40 font-bold uppercase tracking-widest">
                <Link2 className="w-3 h-3" />
                {node.sharedTrait}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Adaptive Protocol Section */}
      <section className="p-5 bg-gradient-to-br from-brand-pink/10 to-transparent border border-brand-pink/20 rounded-[2rem] relative overflow-hidden group">
        <div className="absolute top-[-20px] right-[-20px] opacity-10 group-hover:opacity-20 transition-opacity">
          <Brain className="w-32 h-32 text-brand-pink" />
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-brand-pink" />
            <h4 className="text-[11px] font-black text-white uppercase tracking-widest leading-none">Sentient Care Protocol</h4>
          </div>
          <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase ${
            protocol.urgency === 'high' ? 'bg-brand-pink text-white shadow-lg shadow-brand-pink/20' :
            protocol.urgency === 'medium' ? 'bg-orange-500 text-white' :
            'bg-brand-green text-black'
          }`}>
            {protocol.urgency} Urgency
          </span>
        </div>

        <div className="space-y-4 relative z-10">
          <div>
            <span className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-1 block">Recommendation</span>
            <p className="text-md font-black text-white leading-tight">{protocol.recommendation}</p>
          </div>

          <div className="p-3 bg-black/40 rounded-xl border border-white/5 group-hover:border-brand-pink/20 transition-colors">
            <span className="text-[9px] font-black text-brand-pink uppercase tracking-widest mb-2 flex items-center gap-1.5 leading-none">
              <Brain className="w-2.5 h-2.5" />
              Neural Trace (Simulated LLM Thought)
            </span>
            <p className="text-[11px] text-white/60 font-mono leading-relaxed italic">
              &quot;{protocol.simulatedLLMThought}&quot;
            </p>
          </div>

          <div className="flex items-center justify-between pt-2">
             <div className="flex items-center gap-2">
                <AlertTriangle className="w-3 h-3 text-brand-pink/50" />
                <span className="text-[9px] font-bold text-white/30 uppercase tracking-tighter">{protocol.rationale}</span>
             </div>
             <button className="flex items-center gap-1 text-[9px] font-black text-brand-pink uppercase tracking-widest group/btn">
                Execute <ChevronRight className="w-3 h-3 group-hover/btn:translate-x-0.5 transition-transform" />
             </button>
          </div>
        </div>
      </section>
    </div>
  );
}
