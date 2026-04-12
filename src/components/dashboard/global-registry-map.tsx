"use client";

import { useState, useEffect } from "react";
import { 
  Globe, 
  Activity, 
  ShieldCheck, 
  Zap,
  Navigation,
  LucideIcon,
  Cpu
} from "lucide-react";
import { regionalNodesService, type RegionalNode } from "@/lib/services/regional-nodes";
import { SimulationPanel } from "./simulation-panel";

export function GlobalRegistryMap() {
  const [nodes, setNodes] = useState<RegionalNode[]>([]);
  const [selectedNode, setSelectedNode] = useState<RegionalNode | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSimulationMode, setIsSimulationMode] = useState(false);

  useEffect(() => {
    regionalNodesService.getGlobalNodes().then(data => {
      setNodes(data);
      setSelectedNode(data[0]);
      setIsLoading(false);
    });
  }, []);

  // Simple lat/lng to XY conversion for a 2D Mercator-ish projection
  const getXY = (lat: number, lng: number) => {
    const x = ((lng + 180) * (800 / 360));
    const y = ((90 - lat) * (400 / 180));
    return { x, y };
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[600px] bg-black/40 rounded-[3rem] border border-white/5">
        <Globe className="w-12 h-12 text-brand-green animate-spin mb-4" />
        <span className="text-[10px] font-black uppercase tracking-[0.5em] text-brand-green animate-pulse">Establishing Satellite Link...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full space-y-6 animate-in fade-in duration-1000">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <h2 className="text-2xl font-black text-white uppercase tracking-tighter">
              {isSimulationMode ? "Biosphere Simulator" : "Sovereign Mode (Manual Override)"}
            </h2>
            <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mt-1 pr-4">
              {isSimulationMode 
                ? "Predictive temporal drift engine. Historical & future mycelial projections active." 
                : "Manual command active. Distributed ledger synchronization paused for direct stewardship."}
            </p>
          </div>
          
          <button 
            onClick={() => setIsSimulationMode(!isSimulationMode)}
            title={isSimulationMode ? "Return to real-time operations" : "Predict future biological stressors"}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all relative group/tip ${
              isSimulationMode 
                ? 'bg-brand-pink/20 border-brand-pink/40 text-brand-pink' 
                : 'bg-white/5 border-white/10 text-white/40 hover:text-brand-pink hover:border-brand-pink/30'
            }`}
          >
            <Cpu className="w-3 h-3" />
            <span className="text-[9px] font-black uppercase tracking-widest">{isSimulationMode ? "Exit Simulation" : "Enter Simulation"}</span>
          </button>
        </div>
        {!isSimulationMode && (
          <div className="flex gap-4">
            <StatMini label="Global Vitality" value="88.4%" color="text-brand-green" />
            <StatMini label="Active Nodes" value={nodes.filter(n => n.status === 'online').length.toString()} color="text-brand-pink" />
            <StatMini label="Total Records" value="53.4k" color="text-brand-green" />
          </div>
        )}
      </div>

      {isSimulationMode ? (
        <div className="flex-1 min-h-0 bg-black/40 rounded-[3rem] border border-white/5 p-8 overflow-y-auto">
          <SimulationPanel />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 min-h-0">
          {/* Tactical Map View */}
          <div className="lg:col-span-3 bg-black/60 rounded-[3rem] border border-white/5 relative overflow-hidden group">
            {/* SVG Map Background (Abstracted grid) */}
            <div className="absolute inset-0 opacity-10 pointer-events-none">
               <div className="w-full h-full bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:40px_40px]" />
            </div>

            <svg viewBox="0 0 800 400" className="w-full h-full p-12 relative z-10">
              {/* Connection Lines (Simulated Mesh) */}
              {nodes.map((node, i) => {
                if (i === 0) return null;
                const prev = getXY(nodes[0].coordinates[0], nodes[0].coordinates[1]);
                const curr = getXY(node.coordinates[0], node.coordinates[1]);
                return (
                  <line 
                    key={`line-${node.id}`}
                    x1={prev.x} y1={prev.y} x2={curr.x} y2={curr.y}
                    stroke="currentColor" strokeWidth="0.5" strokeDasharray="4 4"
                    className="text-brand-pink/30"
                  />
                );
              })}

              {/* Node Points */}
              {nodes.map((node) => {
                const { x, y } = getXY(node.coordinates[0], node.coordinates[1]);
                const isSelected = selectedNode?.id === node.id;
                
                return (
                  <g 
                    key={node.id} 
                    className="cursor-pointer group/node"
                    onClick={() => setSelectedNode(node)}
                  >
                    <circle 
                      cx={x} cy={y} r={isSelected ? 6 : 4} 
                      className={`${node.status === 'online' ? 'fill-brand-green' : node.status === 'degraded' ? 'fill-orange-400' : 'fill-red-500'} ${isSelected ? 'animate-pulse' : ''}`} 
                    />
                    <circle 
                      cx={x} cy={y} r={isSelected ? 12 : 8} 
                      className={`fill-none stroke-current opacity-20 ${isSelected ? 'animate-ping' : ''} ${node.status === 'online' ? 'text-brand-green' : 'text-orange-400'}`} 
                    />
                    <text 
                      x={x} y={y - 12} 
                      textAnchor="middle" 
                      className={`text-[7px] font-black uppercase tracking-tighter ${node.vitalityScore > 90 ? 'fill-brand-green' : node.vitalityScore > 75 ? 'fill-orange-400' : 'fill-red-400'}`}
                    >
                      {node.vitalityScore}%
                    </text>
                    {isSelected && (
                      <text x={x + 10} y={y + 4} className="text-[8px] font-black fill-brand-green uppercase tracking-widest">{node.name}</text>
                    )}
                  </g>
                );
              })}
            </svg>

            {/* Map Overlay HUD */}
            <div className="absolute bottom-8 left-8 p-4 bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 max-w-[200px]">
               <div className="flex items-center gap-2 mb-2">
                  <Activity className="w-3 h-3 text-brand-green" />
                  <span className="text-[8px] font-black text-white/40 uppercase tracking-widest">Global Pings</span>
               </div>
               <p className="text-[10px] font-bold text-white/60 leading-tight">Amazonia Primary reported +4% biological drift in last epoch.</p>
            </div>
          </div>

          {/* Selected Node Details Sidebar */}
          <div className="space-y-4 h-full overflow-y-auto pr-2">
            {selectedNode ? (
              <div className="p-6 bg-white/5 border border-white/5 rounded-[2.5rem] h-full animate-in slide-in-from-right duration-500">
                <div className="flex items-center gap-3 mb-6">
                  <div className={`p-3 rounded-2xl ${selectedNode.status === 'online' ? 'bg-brand-green/10 text-brand-green' : 'bg-orange-500/10 text-orange-400'}`}>
                    <Navigation className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-md font-black text-white uppercase tracking-tight">{selectedNode.name}</h3>
                    <span className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em]">{selectedNode.region}</span>
                  </div>
                </div>

                <div className="space-y-6">
                  <MetricBlock icon={Activity} label="Vitality Score" value={`${selectedNode.vitalityScore}%`} color="text-brand-green" shadow="brand-green" />
                  <MetricBlock icon={Globe} label="Registry Density" value={selectedNode.specimenCount.toLocaleString()} color="text-brand-pink" shadow="brand-pink" />
                  <MetricBlock icon={ShieldCheck} label="Compliance" value={`${Math.round(selectedNode.complianceLevel * 100)}%`} color="text-brand-green" shadow="brand-green" />
                  
                  <div className="pt-4 border-t border-white/5">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="w-3 h-3 text-brand-pink" />
                      <span className="text-[9px] font-black text-white/40 uppercase tracking-widest leading-none">Status Assessment</span>
                    </div>
                    <p className="text-[11px] text-white/60 font-bold leading-relaxed">
                      Node is currently {selectedNode.status.toUpperCase()}. {selectedNode.status === 'degraded' ? 'Investigating Mycelial link instability.' : 'All biological streams synchronized.'}
                    </p>
                  </div>

                  <button className="w-full py-4 bg-brand-pink text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-brand-pink transition-all shadow-lg shadow-brand-pink/20">
                    Detailed Shard Audit
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full bg-white/5 border border-dashed border-white/10 rounded-[2.5rem]">
                <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em]">Select a node...</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function StatMini({ label, value, color }: { label: string, value: string, color: string }) {
  return (
    <div className="flex flex-col items-end group">
      <span className="text-[8px] font-black text-white/30 uppercase tracking-widest group-hover:text-white/50 transition-colors">{label}</span>
      <span className={`text-sm font-black ${color} tabular-nums transition-all duration-700`}>{value}</span>
    </div>
  );
}

function MetricBlock({ icon: Icon, label, value, color, shadow }: { icon: LucideIcon, label: string, value: string, color: string, shadow?: string }) {
  return (
    <div className={`group space-y-2 p-1 rounded-2xl transition-all ${shadow === 'brand-pink' ? 'hover:bg-brand-pink/5' : 'hover:bg-brand-green/5'}`}>
      <div className="flex items-center gap-2 mb-1.5 opacity-40 group-hover:opacity-80 transition-opacity">
        <Icon className={`w-3 h-3 ${color}`} />
        <span className="text-[9px] font-black uppercase tracking-widest">{label}</span>
      </div>
      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden mb-2 border border-white/5">
        <div 
          className={`h-full ${color.replace('text', 'bg')} rounded-full transition-all duration-1000 shadow-[0_0_8px_rgba(var(--brand-rgb),0.5)]`}
          style={{ width: value.includes('%') ? value : '80%' }}
        />
      </div>
      <span className={`text-xl font-black tabular-nums ${color} tracking-tighter`}>{value}</span>
    </div>
  );
}
