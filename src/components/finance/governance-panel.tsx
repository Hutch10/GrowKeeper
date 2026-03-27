"use client";

import { useState, useEffect } from "react";
import { 
  Gavel, 
  Timer,
  Award
} from "lucide-react";
import { governanceService, type ProtocolProposal } from "@/lib/services/governance-service";
import { toast } from "sonner";


export function GovernancePanel() {
  const [proposals, setProposals] = useState<ProtocolProposal[]>([]);
  const [votingPower, setVotingPower] = useState<number>(0);
  const [isCasting, setIsCasting] = useState<string | null>(null);

  useEffect(() => {
    governanceService.getProposals().then(setProposals);
    governanceService.calculateVotingPower("custodian_001").then(setVotingPower);
  }, []);

  const handleVote = async (proposalId: string, support: boolean) => {
    setIsCasting(proposalId);
    try {
      await governanceService.castVote(proposalId, "custodian_001", support);
      const updated = await governanceService.getProposals();
      setProposals(updated);
      toast.success("Vote Finalized", {
        description: `Cast ${votingPower.toLocaleString()} votes ${support ? 'FOR' : 'AGAINST'} protocol change.`,
      });
    } catch {
      toast.error("Governance Error", {
        description: "Failed to synchronize vote on-chain.",
      });
    } finally {
      setIsCasting(null);
    }
  };

  return (
    <div className="flex flex-col gap-6 h-full">
      {/* Governance Hero */}
      <div className="flex items-center justify-between p-6 bg-gradient-to-r from-brand-pink/10 to-transparent border border-brand-pink/20 rounded-[2.5rem]">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-brand-pink/20 rounded-2xl text-brand-pink">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-black uppercase tracking-widest text-white/90">Protocol Seniority Power</h3>
            <p className="text-2xl font-black text-brand-pink tracking-tighter">{votingPower.toLocaleString()} VP</p>
          </div>
        </div>
        <div className="text-right hidden md:block">
          <p className="text-[10px] text-white/30 uppercase tracking-widest mb-1">Staking Tier</p>
          <p className="text-xs font-black text-white px-3 py-1 bg-white/5 rounded-full uppercase">Institutional Pro</p>
        </div>
      </div>

      {/* Active Proposals */}
      <div className="flex flex-col gap-4">
        <h4 className="text-[10px] font-black text-white/30 uppercase tracking-widest px-2 flex items-center gap-2">
          <Gavel className="w-3 h-3 text-brand-pink" />
          Active Protocol Proposals
        </h4>
        
        <div className="grid grid-cols-1 gap-4 overflow-y-auto max-h-[500px] custom-scrollbar pr-2">
          {proposals.map(prop => (
            <div key={prop.id} className="bg-white/5 border border-white/5 p-6 rounded-[2rem] group hover:border-brand-pink/30 transition-all">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h5 className="text-xs font-black text-white uppercase tracking-widest mb-1">{prop.title}</h5>
                  <p className="text-[10px] text-white/30 truncate max-w-[300px]">{prop.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-black uppercase text-brand-pink px-2 py-0.5 bg-brand-pink/10 rounded-full">{prop.status}</span>
                  <Timer className="w-3 h-3 text-white/20" />
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2 mb-6">
                <div className="flex items-center justify-between text-[8px] font-black uppercase tracking-widest text-white/40">
                  <span>Current: {(prop.votesFor + prop.votesAgainst).toLocaleString()} VP</span>
                  <span>Threshold: {prop.threshold.toLocaleString()} VP</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-brand-pink transition-all duration-1000" 
                    style={{ width: `${Math.min(100, ((prop.votesFor + prop.votesAgainst) / prop.threshold) * 100)}%` }} 
                  />
                </div>
              </div>

              {/* Voting Actions */}
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => handleVote(prop.id, true)}
                  disabled={!!isCasting}
                  className="flex-1 py-3 bg-brand-pink/20 hover:bg-brand-pink text-brand-pink hover:text-white text-[9px] font-black uppercase tracking-widest rounded-xl transition-all border border-brand-pink/30"
                >
                  {isCasting === prop.id ? "SYNCING..." : "Vote For"}
                </button>
                <button 
                  onClick={() => handleVote(prop.id, false)}
                  disabled={!!isCasting}
                  className="flex-1 py-3 bg-white/5 hover:bg-red-500/20 text-white/40 hover:text-red-400 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all border border-white/5 hover:border-red-500/30"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
