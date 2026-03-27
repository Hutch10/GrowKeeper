"use client";

import { useState, useEffect } from "react";
import { 
  Shield, 
  PieChart, 
  TrendingUp, 
  Lock, 
  Unlock, 
  Activity,
  DollarSign,
  ChevronRight
} from "lucide-react";
import { rwaVault, FractionalVault } from "@/lib/services/rwa-vault";
import { SpecimenRow as Specimen } from "@/app/actions/types";
import { toast } from "sonner";

interface FractionalVaultPanelProps {
  specimen: Specimen;
}

export function FractionalVaultPanel({ specimen }: FractionalVaultPanelProps) {
  const [vault, setVault] = useState<FractionalVault | null>(null);
  const [isVaulting, setIsVaulting] = useState(false);
  const [purchaseAmount, setPurchaseAmount] = useState(10);

  useEffect(() => {
    const existingVault = rwaVault.getVault(specimen.id);
    if (existingVault) {
      setVault(existingVault);
    } else {
      setVault(null);
    }
  }, [specimen.id]);

  const handleVault = async () => {
    setIsVaulting(true);
    try {
      const newVault = await rwaVault.vaultSpecimen(specimen);
      setVault(newVault);
      toast.success(`${specimen.nickname} has been fractionalized into 1,000 shares.`);
    } catch {
      toast.error("Vaulting failed. Verification required.");
    } finally {
      setIsVaulting(false);
    }
  };

  const handlePurchase = async () => {
    if (!vault) return;
    try {
      const success = await rwaVault.purchaseShares(specimen.id, purchaseAmount);
      if (success) {
        setVault({ ...vault, availableShares: vault.availableShares - purchaseAmount });
        toast.success(`Acquired ${purchaseAmount} shares of ${specimen.nickname}`);
      } else {
        toast.error("Purchase failed. Insufficient liquidity.");
      }
    } catch {
      toast.error("Transaction error.");
    }
  };

  if (!vault) {
    return (
      <div className="p-5 rounded-[2rem] bg-brand-green/5 border border-brand-green/10 animate-in fade-in zoom-in duration-500">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-brand-green/20 rounded-xl">
            <Lock className="w-4 h-4 text-brand-green" />
          </div>
          <div>
            <h4 className="text-[11px] font-black text-white uppercase tracking-widest">Institutional Vault</h4>
            <p className="text-[9px] font-black text-brand-green/60 uppercase">Asset is currently 100% Private</p>
          </div>
        </div>
        
        <p className="text-[10px] font-bold text-white/40 mb-5 leading-tight">
          Slicing this asset creates 1,000 fractional RWA shares, enabling institutional liquidity while maintaining biological custody.
        </p>

        <button 
          onClick={handleVault}
          disabled={isVaulting}
          className="w-full py-3 bg-brand-green text-black rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg shadow-brand-green/10 flex items-center justify-center gap-2 group"
        >
          {isVaulting ? (
            <Activity className="w-3 h-3 animate-spin" />
          ) : (
            <PieChart className="w-3 h-3 group-hover:rotate-180 transition-transform duration-500" />
          )}
          {isVaulting ? "ENCRYPTING..." : "Slice Asset for Institutional Entry"}
        </button>
      </div>
    );
  }

  return (
    <div className="p-5 rounded-[2rem] bg-brand-green/5 border border-brand-green/20 animate-in slide-in-from-bottom duration-500">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-brand-green/20 rounded-xl relative">
            <Unlock className="w-4 h-4 text-brand-green" />
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-brand-green rounded-full animate-pulse" />
          </div>
          <div>
            <h4 className="text-[11px] font-black text-white uppercase tracking-widest">Fractionalized Vault</h4>
            <p className="text-[9px] font-black text-brand-green uppercase tracking-tighter">Liquid Asset Class</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-[12px] font-black text-white tabular-nums">${vault.sharePrice.toFixed(2)}</div>
          <div className="text-[8px] font-black text-white/20 uppercase">Per Share</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
          <div className="flex items-center gap-2 text-white/20 mb-1">
            <TrendingUp size={12} />
            <span className="text-[9px] font-black uppercase tracking-widest">Available</span>
          </div>
          <div className="text-sm font-black text-white tabular-nums">{vault.availableShares} / 1000</div>
        </div>
        <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
          <div className="flex items-center gap-2 text-white/20 mb-1">
            <DollarSign size={12} />
            <span className="text-[9px] font-black uppercase tracking-widest">TVL</span>
          </div>
          <div className="text-sm font-black text-white tabular-nums">${vault.lockedValue.toFixed(0)}</div>
        </div>
      </div>

      <div className="space-y-3">
        <label htmlFor={`share-purchase-${specimen.id}`} className="sr-only">Purchase Amount</label>
        <div className="flex items-center gap-3">
          <input 
            id={`share-purchase-${specimen.id}`}
            type="number" 
            value={purchaseAmount}
            onChange={(e) => setPurchaseAmount(Number(e.target.value))}
            className="w-20 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs font-black text-white focus:outline-none focus:border-brand-green/50"
          />
          <button 
            onClick={handlePurchase}
            className="flex-1 py-3 bg-white text-black rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-brand-green transition-all shadow-lg flex items-center justify-center gap-2"
          >
            Aquire Shares <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
         <div className="flex items-center gap-2">
            <Shield className="w-3 h-3 text-brand-green/40" />
            <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">Protocol-Enforced Escrow</span>
         </div>
         <span className="text-[8px] font-black text-brand-green uppercase">ACTIVE</span>
      </div>
    </div>
  );
}
