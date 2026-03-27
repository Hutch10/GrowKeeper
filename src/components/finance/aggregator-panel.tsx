"use client";

import { useState, useEffect } from "react";
import { 
  Network, 
  ArrowRightLeft, 
  ShieldCheck, 
  Zap,
  Timer,
  TrendingDown,
  Globe
} from "lucide-react";
import { liquidityAggregator, type BridgeTransfer } from "@/lib/services/liquidity-aggregator";
import { toast } from "sonner";

export function AggregatorPanel() {
  const [bridges, setBridges] = useState<BridgeTransfer[]>([]);
  const [distribution, setDistribution] = useState<Record<string, number>>({});
  const [arbitrage, setArbitrage] = useState<{ chain: string; yieldDelta: number }[]>([]);
  const [bridgeAmount, setBridgeAmount] = useState<string>("");
  const [isBridging, setIsBridging] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const [b, d, a] = await Promise.all([
        liquidityAggregator.getActiveBridges(),
        liquidityAggregator.getChainDistribution(),
        liquidityAggregator.getArbitrageDelta()
      ]);
      setBridges(b);
      setDistribution(d);
      setArbitrage(a);
    };

    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleBridge = async (targetChain: string) => {
    const amount = parseFloat(bridgeAmount);
    if (isNaN(amount) || amount <= 0) return;

    setIsBridging(true);
    try {
      const transfer = await liquidityAggregator.bridgeLiquidity(amount, targetChain);
      setBridges(prev => [...prev, transfer]);
      setBridgeAmount("");
      
      if (transfer.status === "PENDING_AUTH") {
        toast.warning("Multi-Sig Required", {
          description: "Large capital move detected. Awaiting protocol-enforced authentication.",
        });
      } else {
        toast.success("Bridge Initiated", {
          description: `Relaying ${amount} GC to ${targetChain} via LayerZero.`,
        });
      }
    } catch {
      toast.error("Bridge Error", {
        description: "Cross-chain relay synchronization failure.",
      });
    } finally {
      setIsBridging(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 h-full">
      {/* Ecosystem Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Object.entries(distribution).map(([chain, tvl]) => (
          <div key={chain} className="bg-white/5 border border-white/5 p-5 rounded-[2rem] group hover:border-brand-green/30 transition-all">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-white/5 rounded-xl text-white/40">
                <Globe className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-white/40">{chain}</span>
            </div>
            <p className="text-xl font-black text-white tracking-tighter mb-1">${(tvl / 1000000).toFixed(1)}M</p>
            <div className="flex items-center gap-2">
              <span className="text-[8px] font-black uppercase text-brand-green">Protocol Active</span>
              <div className="w-1 h-1 rounded-full bg-brand-green animate-pulse" />
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col xl:flex-row gap-6">
        {/* Arbitrage & Bridge Interface */}
        <div className="flex-1 space-y-6">
          <div className="bg-black/40 border border-white/5 rounded-[2.5rem] p-8">
            <h3 className="text-sm font-black uppercase tracking-widest text-white/50 mb-6 flex items-center gap-2">
              <ArrowRightLeft className="w-4 h-4 text-brand-green" />
              Omnichain Aggregator
            </h3>
            
            <div className="space-y-4">
              <input 
                type="number" 
                value={bridgeAmount}
                onChange={(e) => setBridgeAmount(e.target.value)}
                placeholder="Bridge Amount [GC]"
                className="w-full bg-white/5 border border-white/5 focus:border-brand-green/30 rounded-2xl py-6 px-8 text-xl font-black text-white outline-none transition-all placeholder:text-white/10"
              />
              
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => handleBridge("SOL")}
                  disabled={isBridging || !bridgeAmount}
                  className="py-4 bg-brand-green hover:bg-white disabled:opacity-50 text-black text-[10px] font-black uppercase tracking-widest rounded-xl transition-all"
                >
                  Bridge to SOL
                </button>
                <button 
                  onClick={() => handleBridge("ETH-MAIN")}
                  disabled={isBridging || !bridgeAmount}
                  className="py-4 bg-white/5 hover:bg-white/10 disabled:opacity-50 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all border border-white/5"
                >
                  Bridge to ETH-M
                </button>
              </div>
            </div>
          </div>

          {/* Arbitrage Alerts */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-black text-white/30 uppercase tracking-widest px-2 flex items-center gap-2">
              <Zap className="w-3 h-3 text-brand-green" />
              Yield Arbitrage Signals
            </h4>
            {arbitrage.filter(a => a.yieldDelta > 0).map(arb => (
              <div key={arb.chain} className="bg-brand-green/10 border border-brand-green/20 p-5 rounded-3xl flex items-center justify-between group hover:bg-brand-green/20 transition-all">
                <div className="flex items-center gap-4">
                  <TrendingDown className="w-5 h-5 text-brand-green rotate-180" />
                  <div>
                    <h5 className="text-xs font-black text-white uppercase tracking-widest">{arb.chain} Opportunity</h5>
                    <p className="text-[10px] text-white/40">Market spread detected in Solana Ecosystem.</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-brand-green">+{arb.yieldDelta}%</p>
                  <p className="text-[8px] text-white/20 uppercase">Yield Delta</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bridge Status Sidebar */}
        <div className="w-full xl:w-[350px] flex flex-col gap-4">
          <h4 className="text-[10px] font-black text-white/30 uppercase tracking-widest px-2">Protocol Relay Status</h4>
          {bridges.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 border border-dashed border-white/5 rounded-3xl opacity-40">
              <Network className="w-8 h-8 mb-4" />
              <span className="text-[9px] font-black uppercase tracking-widest">No active relays</span>
            </div>
          ) : (
            <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
              {bridges.reverse().map(bridge => (
                <div key={bridge.id} className="bg-white/5 border border-white/5 p-4 rounded-2xl group hover:border-white/10 transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[8px] font-mono text-white/20 uppercase tracking-widest">ID: {bridge.id.slice(4)}</span>
                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${bridge.status === 'PENDING_AUTH' ? 'bg-red-500/20 text-red-400' : 'bg-brand-green/20 text-brand-green'}`}>
                      {bridge.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-black text-white">{bridge.amount.toLocaleString()} GC</p>
                      <p className="text-[9px] text-white/40 uppercase tracking-widest">{bridge.sourceChain} → {bridge.targetChain}</p>
                    </div>
                    {bridge.status === 'PENDING_AUTH' ? (
                      <ShieldCheck className="w-5 h-5 text-red-400" />
                    ) : (
                      <Timer className="w-5 h-5 text-brand-green animate-spin-slow" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
