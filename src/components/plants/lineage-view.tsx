"use client";

import { Share2, GitBranch, Leaf, TrendingUp, ShieldCheck } from "lucide-react";

interface LineageNode {
  id: string;
  name: string;
  type: "Mother" | "Cuttings" | "Offspring";
  date: string;
  location: string;
  health: number;
}

const MOCK_LINEAGE: LineageNode[] = [
  { id: "1", name: "Alpha Monstera (Mother)", type: "Mother", date: "Jan 2024", location: "Boutique Nursery", health: 100 },
  { id: "2", name: "Node Prop #1", type: "Cuttings", date: "April 2024", location: "In House", health: 98 },
  { id: "3", name: "Node Prop #2", type: "Cuttings", date: "April 2024", location: "Sold to @GeneGrower", health: 95 },
  { id: "4", name: "Alpha Junior", type: "Offspring", date: "June 2024", location: "In House", health: 100 },
];

export function LineageView({ specimenName = "Monstera Albo", nodes = MOCK_LINEAGE }: { specimenName?: string, nodes?: LineageNode[] }) {
  const displayNodes = nodes;
  return (
    <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-xl overflow-hidden relative">
      <div className="absolute top-0 right-0 p-12 opacity-[0.03] select-none pointer-events-none">
        <GitBranch className="w-64 h-64 text-brand-dark" />
      </div>

      <header className="flex justify-between items-start mb-12 relative z-10">
        <div>
          <div className="flex items-center gap-3 text-brand-green mb-2">
            <GitBranch className="w-5 h-5" />
            <span className="text-[10px] font-black uppercase tracking-widest">Asset Genealogy</span>
          </div>
          <h3 className="text-3xl font-black text-brand-dark tracking-tight">Lineage of {specimenName}</h3>
          <p className="text-slate-400 font-bold mt-1 uppercase text-[10px] tracking-widest">Tracking DNA & Provenance Globally</p>
        </div>
        <button className="p-4 bg-slate-50 text-slate-400 rounded-2xl hover:bg-brand-pink/10 hover:text-brand-pink transition-all">
          <Share2 className="w-5 h-5" />
        </button>
      </header>

      <div className="space-y-8 relative z-10">
        {displayNodes.map((node, i) => (
          <div key={node.id} className="relative flex items-center gap-8 group">
            {/* Connector Line */}
            {i < displayNodes.length - 1 && (
              <div className="absolute left-[23px] top-10 bottom-[-40px] w-0.5 bg-slate-100" />
            )}
            
            {/* Type Indicator */}
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border-4 border-white shadow-lg transition-transform group-hover:scale-110 ${
              node.type === "Mother" ? "bg-brand-dark text-white" : 
              node.type === "Cuttings" ? "bg-brand-pink text-white" : "bg-brand-green text-white"
            }`}>
              <Leaf className="w-5 h-5" />
            </div>

            <div className="flex-1 bg-slate-50/50 p-6 rounded-[2rem] border border-transparent group-hover:border-slate-100 group-hover:bg-white transition-all flex justify-between items-center">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <span className="font-black text-brand-dark">{node.name}</span>
                  <span className="px-2 py-0.5 bg-slate-200 text-slate-500 rounded-md text-[8px] font-black uppercase">{node.type}</span>
                </div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider italic">
                  Isolated in {node.location} • {node.date}
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-right">
                  <div className="text-[10px] font-black uppercase tracking-widest text-slate-300 mb-1">Health</div>
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-brand-green rounded-full" style={{ width: `${node.health}%` }} />
                    </div>
                    <span className="text-[10px] font-black text-brand-green">{node.health}%</span>
                  </div>
                </div>
                {node.type === "Mother" && (
                  <div className="p-3 bg-amber-100 text-amber-600 rounded-xl" title="Original Specimen">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <footer className="mt-12 pt-8 border-t border-slate-50 flex items-center justify-between opacity-40">
        <div className="flex items-center gap-3">
          <div className="flex -space-x-3">
            {[1,2,3].map(i => (
              <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200" />
            ))}
          </div>
          <span className="text-[10px] font-black uppercase text-slate-500 italic">4 Collectable Nodes in Circulation</span>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-black text-brand-green uppercase tracking-widest">
          <TrendingUp className="w-3 h-3" />
          +12% Portfolio Value
        </div>
      </footer>
    </div>
  );
}
