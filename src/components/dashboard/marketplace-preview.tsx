"use client";

import Image from "next/image";
import { Heart, Star, ShoppingCart, Zap, Loader2, ShieldCheck, TrendingUp } from "lucide-react";
import { useState } from "react";
import { marketplace } from "@/lib/services/marketplace";
import type { Specimen } from "@/types/specimen";

interface MarketplacePreviewProps {
  specimen?: Specimen;
  isLoading?: boolean;
}

export function MarketplacePreview({ specimen, isLoading }: MarketplacePreviewProps) {
  const [isPurchasing, setIsPurchasing] = useState(false);
  
  const defaultAsset = {
    id: "premium-monstera-x-albo",
    nickname: "Stellar Monstera Albo",
    species_name: "M. deliciosa variegata",
    price: 890,
    rating: 4.9,
    rarity: "Ultra-Premium",
    health_status: "Excellent",
    image_url: "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&q=80&w=800",
  };

  const displayName = specimen?.nickname || defaultAsset.nickname;
  const displayImage = specimen?.species_name ? (specimen as unknown as { image_url: string }).image_url : defaultAsset.image_url;
  const displayPrice = (specimen as unknown as { price: number })?.price || defaultAsset.price; 
  const displayRarity = (specimen as unknown as { rarity: string })?.rarity || defaultAsset.rarity;
  const displaySpecies = specimen?.species_name || defaultAsset.species_name;

  const handleAcquire = async () => {
    setIsPurchasing(true);
    try {
      await marketplace.purchaseSpecimen(specimen?.id || defaultAsset.id, "GK-CORE-001", specimen as unknown as Specimen);
      alert("Asset ownership transferred to Sovereign Wallet.");
    } catch (err) {
      console.error("Acquisition failed:", err);
    } finally {
      setIsPurchasing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-[#0A0A0A] rounded-[2rem] p-12 flex items-center justify-center border border-white/5 shadow-2xl h-[400px]">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="relative group bg-[#080808] rounded-[2rem] p-10 border border-white/5 overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.5)]">
      {/* Glow Effects */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-emerald-500/5 rounded-full blur-[80px] pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row gap-12">
        {/* Asset Visualization */}
        <div className="w-full lg:w-2/5">
          <div className="relative aspect-[4/5] rounded-2xl overflow-hidden border border-white/10 group-hover:border-emerald-500/30 transition-all duration-500 shadow-2xl">
            <Image 
              src={displayImage} 
              alt={displayName}
              fill
              className="object-cover transition-transform duration-1000 group-hover:scale-105"
            />
            
            <div className="absolute top-6 left-6 flex flex-col gap-2">
              <div className="flex items-center gap-2 bg-black/60 backdrop-blur-xl px-3 py-1.5 rounded-xl border border-white/10 shadow-lg">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span className="text-[9px] font-black uppercase text-white tracking-widest">GK-VERIFIED</span>
              </div>
              <div className="flex items-center gap-2 bg-emerald-500/10 backdrop-blur-xl px-3 py-1.5 rounded-xl border border-emerald-500/20 shadow-lg">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span className="text-[9px] font-black uppercase text-emerald-400 tracking-widest">High Yield</span>
              </div>
            </div>

            <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between">
              <span className="px-3 py-1.5 bg-white/5 backdrop-blur-xl rounded-lg text-[9px] font-black text-white uppercase tracking-widest border border-white/10">
                {displayRarity}
              </span>
            </div>
          </div>
        </div>

        {/* Intelligence & Acquisition */}
        <div className="flex-1 flex flex-col justify-center">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-emerald-500/80">
              <Zap className="w-4 h-4 fill-current" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Premium Marketplace Drop</span>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-1 bg-white/5 rounded-lg border border-white/5">
              <Star className="w-3 h-3 text-emerald-500 fill-current" />
              <span className="text-[10px] font-bold text-white/40">4.9</span>
            </div>
          </div>

          <h3 className="text-4xl font-medium tracking-tight text-white mb-2">
            {displayName}
          </h3>
          <p className="text-xs font-bold text-emerald-500/60 uppercase tracking-widest mb-8">{displaySpecies}</p>

          <p className="text-sm font-medium text-white/40 leading-relaxed mb-10 max-w-lg italic">
            &quot;Sourced from high-provenance registries. Certified resilient with a predicted vitality coefficient of 0.94.&quot;
          </p>

          <div className="grid grid-cols-2 gap-4 mb-10">
            <div className="p-5 bg-white/5 rounded-2xl border border-white/5 group-hover:border-emerald-500/20 transition-colors">
              <div className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-1.5">Asset Listing</div>
              <div className="flex items-end gap-1">
                <span className="text-2xl font-black text-white">${displayPrice}</span>
                <span className="text-[10px] font-bold text-white/20 mb-1">GKP</span>
              </div>
            </div>
            <div className="p-5 bg-white/5 rounded-2xl border border-white/5 group-hover:border-emerald-500/20 transition-colors">
              <div className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-1.5">Sovereign Rating</div>
              <div className="text-2xl font-black text-emerald-400">AAA+</div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={handleAcquire}
              disabled={isPurchasing}
              className="flex-1 bg-white text-black py-5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl hover:bg-emerald-500 hover:text-white transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {isPurchasing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ShoppingCart className="w-4 h-4" />
              )}
              {isPurchasing ? "Securing Asset..." : "Acquire Ownership"}
            </button>
            <button 
              aria-label="Add to favorites"
              className="p-5 bg-white/5 border border-white/10 rounded-2xl text-white/40 hover:text-emerald-500 hover:border-emerald-500/40 transition-all"
            >
              <Heart className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
