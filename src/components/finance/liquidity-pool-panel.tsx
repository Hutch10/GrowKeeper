"use client";

import { useState, useEffect } from "react";
import { 
  PiggyBank, 
  TrendingUp, 
  Lock,
  Zap,
  History as LucideHistory,
  Repeat,
  Activity,
  BrainCircuit,
  Network,
  LucideIcon
} from "lucide-react";
import { liquidityPool, type PoolMetrics, type StakingPosition, type PoolTransaction } from "@/lib/services/liquidity-pool";
import { autoRebalanceService } from "@/lib/services/rebalance-service";
import { gasMonitorService, type GasSnapshot } from "@/lib/services/gas-monitor";
import { GovernancePanel } from "./governance-panel";
import { RiskHeatmap } from "./risk-heatmap";
import { AggregatorPanel } from "./aggregator-panel";
import { aiGovernanceService } from "@/lib/services/ai-governance";
import { UnderwritingPanel } from "./underwriting-panel";
import { toast } from "sonner";

type TreasuryView = "OPERATIONS" | "GOVERNANCE" | "RISK" | "AGGREGATOR" | "UNDERWRITING";

export function LiquidityPoolPanel() {
  const [view, setView] = useState<TreasuryView>("OPERATIONS");
  const [metrics, setMetrics] = useState<PoolMetrics | null>(null);
  const [positions, setPositions] = useState<StakingPosition[]>([]);
  const [transactions, setTransactions] = useState<PoolTransaction[]>([]);
  const [yieldBoost, setYieldBoost] = useState<number>(0);
  const [gasSnapshot, setGasSnapshot] = useState<GasSnapshot | null>(null);
  const [vitality, setVitality] = useState<number>(0);
  const [stakeAmount, setStakeAmount] = useState<string>("");
  const [isStaking, setIsStaking] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const [m, p, t, b, g, v] = await Promise.all([
        liquidityPool.getMetrics(),
        liquidityPool.getCustodianPositions("custodian_001"),
        liquidityPool.getTransactions(),
        autoRebalanceService.getEfficiencyBoost(),
        gasMonitorService.getSnapshot("BASE"),
        aiGovernanceService.calculateVitalityScore()
      ]);
      setMetrics(m);
      setPositions(p);
      setTransactions(t);
      setYieldBoost(b);
      setGasSnapshot(g);
      setVitality(v);
    };

    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleStake = async () => {
    const amount = parseFloat(stakeAmount);
    if (isNaN(amount) || amount <= 0) return;

    setIsStaking(true);
    try {
      const pos = await liquidityPool.stake("custodian_001", amount);
      setPositions(prev => [...prev, pos]);
      const updatedMetrics = await liquidityPool.getMetrics();
      setMetrics(updatedMetrics);
      setStakeAmount("");
      toast.success("Liquidity Committed", {
        description: `${amount} GK staked into the Institutional Reserve.`,
      });
    } catch {
      toast.error("Staking Error", {
        description: "Institutional credit synchronization failure.",
      });
    } finally {
      setIsStaking(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 h-full animate-in slide-in-from-bottom-8 duration-700">
      {/* View Switcher */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-white/5 border border-white/5 rounded-2xl w-fit">
        <button 
          onClick={() => setView("OPERATIONS")}
          className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${view === 'OPERATIONS' ? 'bg-brand-green text-black' : 'text-white/40 hover:text-white'}`}
        >
          Operations
        </button>
        <button 
          onClick={() => setView("AGGREGATOR")}
          className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${view === 'AGGREGATOR' ? 'bg-white text-black' : 'text-white/40 hover:text-white'}`}
        >
          Aggregator
        </button>
        <button 
          onClick={() => setView("RISK")}
          className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${view === 'RISK' ? 'bg-brand-pink text-white' : 'text-white/40 hover:text-white'}`}
        >
          Sentient Risk
        </button>
        <button 
          onClick={() => setView("GOVERNANCE")}
          className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${view === 'GOVERNANCE' ? 'bg-blue-400 text-black' : 'text-white/40 hover:text-white'}`}
        >
          Governance
        </button>
        <button 
          onClick={() => setView("UNDERWRITING")}
          className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${view === 'UNDERWRITING' ? 'bg-orange-400 text-black' : 'text-white/40 hover:text-white'}`}
        >
          Underwriting
        </button>
      </div>

      {view === "OPERATIONS" && (
        <>
          {/* Pool Stats Card */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard 
              label="Total Value Locked" 
              value={`${(metrics?.totalValueLocked || 0).toLocaleString()} GC`} 
              desc="Omnichain Reserve Capacity"
              icon={Lock}
              color="text-blue-400"
            />
            <StatCard 
              label="Estimated APY" 
              value={`${metrics?.currentAPY.toFixed(2)}%`} 
              desc={`Includes +${yieldBoost.toFixed(2)}% Optimization`}
              icon={TrendingUp}
              color="text-brand-green"
              trend="up"
            />
            <StatCard 
              label="Cross-Chain Aggregator" 
              value="ACTIVE" 
              desc="BASE • SOL • ETH-MAIN Connected"
              icon={Network}
              color="text-white"
            />
          </div>

          <div className="flex flex-col xl:flex-row gap-8">
            {/* Staking Interface */}
            <div className="flex-1 space-y-6">
              <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8">
                <h3 className="text-sm font-black uppercase tracking-widest text-white/50 mb-6 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-brand-green" />
                  Capital Commitment
                </h3>
                
                <div className="space-y-4">
                  <div className="relative group">
                    <input 
                      type="number" 
                      value={stakeAmount}
                      onChange={(e) => setStakeAmount(e.target.value)}
                      placeholder="Enter Amount [GC]"
                      className="w-full bg-black/40 border border-white/5 focus:border-brand-green/30 rounded-2xl py-6 px-8 text-xl font-black text-white outline-none transition-all placeholder:text-white/10"
                    />
                    <button 
                      onClick={() => setStakeAmount("10000")}
                      className="absolute right-4 top-1/2 -translate-y-1/2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest text-white/40 transition-all"
                    >
                      MAX
                    </button>
                  </div>

                  <button 
                    onClick={handleStake}
                    disabled={isStaking || !stakeAmount}
                    className="w-full py-6 bg-brand-green hover:bg-white disabled:opacity-50 text-black text-xs font-black uppercase tracking-[0.3em] rounded-2xl transition-all shadow-2xl shadow-brand-green/10"
                  >
                    {isStaking ? "Synchronizing LayerZero..." : "Stake into Reserve"}
                  </button>
                </div>
              </div>

              {/* Ecosystem Stats */}
              <div className="bg-gradient-to-br from-blue-500/10 to-transparent border border-blue-500/20 rounded-[2.5rem] p-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-sm font-black uppercase tracking-widest text-blue-400 flex items-center gap-2">
                    <BrainCircuit className="w-4 h-4" />
                    Sentient Vitality Index
                  </h3>
                  <span className="px-3 py-1 bg-blue-500/20 text-blue-400 text-[9px] font-black rounded-full uppercase tracking-widest">{vitality.toFixed(1)}%</span>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-black/20 rounded-2xl border border-white/5">
                    <p className="text-[10px] text-white/30 uppercase tracking-widest mb-1">Gas Telemetry</p>
                    <p className="text-lg font-black text-white">{gasSnapshot?.gwei.toFixed(2)} GWEI</p>
                  </div>
                  <div className="p-4 bg-black/20 rounded-2xl border border-white/5">
                    <p className="text-[10px] text-white/30 uppercase tracking-widest mb-1">Rebalance Efficiency</p>
                    <p className="text-lg font-black text-brand-green">99.2%</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Active Positions */}
            <div className="w-full xl:w-[400px] flex flex-col gap-4">
              <h4 className="text-[10px] font-black text-white/30 uppercase tracking-widest px-2">Active Positions</h4>
              {positions.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 border border-dashed border-white/5 rounded-3xl opacity-40">
                  <PiggyBank className="w-8 h-8 mb-4" />
                  <span className="text-[9px] font-black uppercase tracking-widest">No active stakes</span>
                </div>
              ) : (
                <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                  {positions.map(pos => (
                    <div key={pos.id} className="bg-white/5 border border-white/5 p-4 rounded-2xl flex items-center justify-between group hover:border-white/10 transition-all">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-brand-green/10 rounded-xl text-brand-green">
                          <Activity className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-black text-white">{pos.amount.toLocaleString()} GC</p>
                          <p className="text-[9px] text-white/30 uppercase tracking-widest font-mono">ID: {pos.id.slice(4)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-brand-green font-black">+{pos.yieldEarned.toFixed(4)}</p>
                        <p className="text-[8px] text-white/20 uppercase tracking-tighter">Yield Earned</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              <h4 className="text-[10px] font-black text-white/30 uppercase tracking-widest px-2 mt-4">Settlement Engine Feed</h4>
              <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                {transactions.map(tx => (
                  <div key={tx.id} className="group flex items-center justify-between p-4 rounded-2xl bg-black/20 border border-white/5 hover:border-white/10 transition-all">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg ${tx.type === 'SETTLEMENT' ? 'bg-red-500/10 text-red-400' : 'bg-brand-green/10 text-brand-green'}`}>
                        <Repeat className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-white uppercase tracking-widest">{tx.type} • {tx.id}</p>
                        <p className="text-[9px] text-white/30 truncate max-w-[150px]">{tx.reason}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-[10px] font-black ${tx.type === 'SETTLEMENT' ? 'text-red-400' : 'text-brand-green'}`}>
                        {tx.type === 'SETTLEMENT' ? '-' : '+'}{tx.amount.toLocaleString()}
                      </p>
                      <LucideHistory className="w-3 h-3 text-white/10 ml-auto" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {view === "AGGREGATOR" && (
        <div className="animate-in fade-in slide-in-from-right-8 duration-500 h-full">
          <AggregatorPanel />
        </div>
      )}

      {view === "RISK" && (
        <div className="animate-in fade-in slide-in-from-right-8 duration-500 h-full">
          <RiskHeatmap />
        </div>
      )}

      {view === "GOVERNANCE" && (
        <div className="animate-in fade-in slide-in-from-right-8 duration-500 h-full">
          <GovernancePanel />
        </div>
      )}
      
      {view === "UNDERWRITING" && (
        <div className="animate-in fade-in slide-in-from-right-8 duration-500 h-full">
          <UnderwritingPanel />
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, desc, icon: Icon, color, trend }: { label: string, value: string, desc: string, icon: LucideIcon, color: string, trend?: "up" | "down" }) {
  return (
    <div className="bg-white/5 border border-white/5 p-6 rounded-[2rem] group hover:bg-white/[0.07] hover:border-white/10 transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-2xl bg-black/40 ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 bg-white/[0.03] rounded-full">
          <div className={`w-1 h-1 rounded-full animate-pulse ${trend === 'up' ? 'bg-brand-green' : 'bg-blue-400'}`} />
          <span className="text-[8px] font-black uppercase text-white/40 tracking-widest leading-none">Real-Time</span>
        </div>
      </div>
      <h4 className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-1">{label}</h4>
      <p className="text-2xl font-black text-white tracking-tighter mb-2">{value}</p>
      <p className="text-[9px] font-mono text-white/20 leading-tight uppercase tracking-widest">{desc}</p>
    </div>
  );
}
