"use client";

import Image from "next/image";
import { Heart, Star, ShoppingCart, Award, CheckCircle2, Zap, Loader2 } from "lucide-react";
import { useState } from "react";
import { marketplace } from "@/lib/services/marketplace";
import type { SpecimenRow } from "@/app/actions/types";

interface MarketplacePreviewProps {
  specimen?: SpecimenRow;
  isLoading?: boolean;
}

interface MarketData {
  id: string;
  nickname: string;
  price: number;
  rating: number;
  rarity: string;
  image_url: string;
  species_name?: string | null;
  health_status?: string;
}

export function MarketplacePreview({ specimen, isLoading }: MarketplacePreviewProps) {
  const [isPurchasing, setIsPurchasing] = useState(false);
  
  const defaultPlant: MarketData = {
    id: "rare-monstera-001",
    nickname: "Monstera Albo Variegata",
    price: 450,
    rating: 4.9,
    rarity: "Ultra Rare",
    image_url: "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&q=80&w=800",
    species_name: "Monstera deliciosa",
  };

  const displaySpecimen = specimen || (defaultPlant as unknown as SpecimenRow);
  const displayName = displaySpecimen.nickname || "Unknown Asset";
  const displayImage = displaySpecimen.image_url || defaultPlant.image_url;
  const displayPrice = (specimen as MarketData | undefined)?.price || defaultPlant.price; 
  const displayRarity = (specimen as MarketData | undefined)?.rarity || defaultPlant.rarity;
  const displaySpecies = displaySpecimen.species_name;
  const displayRating = (specimen as MarketData | undefined)?.rating || defaultPlant.rating;

  const handleAcquire = async () => {
    setIsPurchasing(true);
    try {
      // Simulate acquisition via marketplace service
      // We pass the partial object to satisfy the signature if it's the default plant
      await marketplace.purchaseSpecimen(displaySpecimen.id, "CURRENT-USER", displaySpecimen as SpecimenRow);
      alert("Asset acquired! Funds locked in L2 Escrow.");
    } catch (err) {
      console.error("Acquisition failed:", err);
      alert("Acquisition failed. Check L2 network status.");
    } finally {
      setIsPurchasing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white/40 backdrop-blur-xl rounded-[3rem] p-12 flex items-center justify-center border border-white/20 shadow-xl">
        <Loader2 className="w-10 h-10 text-brand-green animate-spin" />
      </div>
    );
  }

  return (
    <div className="relative group bg-white/60 backdrop-blur-2xl rounded-[3rem] p-8 shadow-2xl hover:shadow-brand-green/20 transition-all border border-white/50 overflow-hidden">
      {/* Premium Background Decor */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-brand-pink/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-green/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

      <div className="relative z-10 flex flex-col lg:flex-row gap-12 items-center">
        {/* Plant Image Column */}
        <div className="w-full lg:w-2/5">
          <div className="relative aspect-square rounded-[2.5rem] overflow-hidden shadow-2xl group/img ring-4 ring-white/50">
            <Image 
              src={displayImage} 
              alt={displayName}
              fill
              className="object-cover transition-transform duration-700 group-hover/img:scale-110"
            />
            
            {/* AI Verification Badge */}
            <div className="absolute top-6 left-6 flex items-center gap-2 bg-white/80 backdrop-blur-md px-4 py-2 rounded-2xl shadow-xl border border-white/50">
              <Award className="w-5 h-5 text-amber-500 fill-current" />
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest leading-none mb-0.5">AI Certified</span>
                <span className="text-[8px] font-bold text-slate-400 leading-none">Healthy & Pathogen-Free</span>
              </div>
            </div>

            <div className="absolute bottom-6 left-6 flex gap-2">
              <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-lg text-[10px] font-black text-white uppercase tracking-widest border border-white/30">
                {displayRarity}
              </span>
              <span className="px-3 py-1 bg-brand-pink/80 rounded-lg text-[10px] font-black text-white uppercase tracking-widest border border-brand-pink">
                Hot Asset
              </span>
            </div>
          </div>
        </div>

        {/* Details Column */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2 text-brand-green font-black text-xs uppercase tracking-[0.2em]">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 fill-current" />
              <span>Marketplace Drop</span>
            </div>
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-current text-amber-400" />
              <span className="text-slate-500 font-bold">{displayRating} (12 Reviews)</span>
            </div>
          </div>

          <h3 className="text-4xl font-black text-brand-dark mb-1 leading-tight">
            {displayName}
          </h3>
          
          {displaySpecies && (
            <p className="text-sm font-bold text-brand-green/70 mb-6 uppercase tracking-widest">{displaySpecies}</p>
          )}

          <p className="text-lg font-bold text-slate-500/80 mb-8 leading-relaxed italic">
            &quot;A living masterpiece with unparalleled sectoral variegation. Fully acclimated and certified pathogen-free by the AI Plant Doctor.&quot;
          </p>

          <div className="grid grid-cols-2 gap-4 mb-10">
            <div className="p-4 bg-white/40 backdrop-blur-md rounded-2xl border border-white/50 shadow-sm">
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Asset Value</div>
              <div className="text-2xl font-black text-brand-dark">${displayPrice}.00</div>
            </div>
            <div className="p-4 bg-emerald-50/40 backdrop-blur-md rounded-2xl border border-emerald-100/50 shadow-sm">
              <div className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Growth Status</div>
              <div className="text-2xl font-black text-brand-green">{displaySpecimen.health_status || "Excellent"}</div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={handleAcquire}
              disabled={isPurchasing}
              className="flex-1 bg-brand-dark text-white py-5 rounded-[1.5rem] font-black text-sm shadow-2xl hover:bg-brand-green transition-all flex items-center justify-center gap-3 group disabled:opacity-50"
            >
              {isPurchasing ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <ShoppingCart className="w-5 h-5 group-hover:scale-110 transition-transform" />
              )}
              {isPurchasing ? "Securing L2 Escrow..." : "Acquire Asset Now"}
            </button>
            <button 
              aria-label="Add to Favorites"
              className="p-5 border border-slate-200 rounded-[1.5rem] text-slate-400 hover:text-brand-pink hover:border-brand-pink transition-all bg-white/40 backdrop-blur-md"
            >
              <Heart className="w-6 h-6" />
            </button>
          </div>
          
          <div className="mt-6 flex items-center gap-2 text-[10px] font-bold text-slate-400">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            Secure blockchain transaction & botanical health guarantee.
          </div>
        </div>
      </div>
    </div>
  );
}
