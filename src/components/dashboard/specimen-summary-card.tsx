"use client";

import Image from "next/image";
import { Coins, Loader2, Award, Leaf, Waves, Heart } from "lucide-react";
import type { Kingdom } from "@/types/specimen";
import type { SpecimenRow } from "@/app/actions/types";
import { useState } from "react";
import { useSpecimenData } from "@/hooks/use-specimen-data";

interface SpecimenSummaryCardProps {
  id: string;
  nickname?: string;
  species_name?: string | null;
  image_url?: string | null;
  onClick?: () => void;
  onList?: () => Promise<void>;
  isActive?: boolean;
  kingdom?: Kingdom;
  isCertified?: boolean;
  complianceStatus?: string;
}

export function SpecimenSummaryCard({ 
  id,
  nickname,
  species_name,
  image_url,
  onClick,
  onList,
  isActive,
  kingdom,
  isCertified = true, // Mocked for now
  complianceStatus
}: SpecimenSummaryCardProps) {
  const [isListing, setIsListing] = useState(false);
  const { specimens, loading: dataLoading } = useSpecimenData();
  const specimen = (specimens.find(s => s.id === id) ?? ({} as SpecimenRow)) as SpecimenRow;
  const displayNickname = nickname || specimen.nickname || "Unknown";
  const displaySpecies = species_name || specimen.species_name;
  // Ensure a non‑empty string for the image source
  const displayImage: string = image_url ?? specimen.image_url ?? (kingdom === "Fungi"
    ? `https://images.unsplash.com/photo-1544070282-591d487abc53?q=80&w=300&h=300&auto=format&fit=crop`
    : kingdom === "Animalia"
      ? `https://images.unsplash.com/photo-1552053831-71594a27632d?q=80&w=300&h=300&auto=format&fit=crop`
      : `https://images.unsplash.com/photo-1545239351-ef056c5983f3?q=80&w=300&h=300&auto=format&fit=crop`);
  const isLoading = dataLoading;


  if (isLoading) {
    return (
      <div className="flex flex-col flex-shrink-0 w-48 items-center justify-center p-4">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  return (
    <div 
      onClick={onClick}
      className={`flex flex-col flex-shrink-0 w-48 cursor-pointer group transition-all ${
        isActive ? "scale-105" : "hover:scale-102"
      }`}
    >
      <div className={`relative w-full aspect-square rounded-[1.5rem] overflow-hidden mb-3 border-4 transition-all ${
        isActive ? "border-brand-green" : "border-white shadow-sm group-hover:shadow-md"
      }`}>
        <Image 
          src={displayImage}
          alt={displayNickname}
          fill
          unoptimized
          className="object-cover transition-transform group-hover:scale-105"
        />
        
        {/* Certified Badge */}
        {isCertified && (
          <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md p-1.5 rounded-lg shadow-sm border border-amber-200 z-10">
            <Award className="w-3 h-3 text-amber-500 fill-current" />
          </div>
        )}

        {/* Compliance Alert Badge */}
        {complianceStatus && complianceStatus !== 'none' && (
          <div className="absolute top-3 right-3 bg-red-500/90 backdrop-blur-md p-1.5 rounded-lg shadow-sm border border-red-400 z-10" title={`CITES Appendix ${complianceStatus} Protected`}>
            <span className="text-[8px] font-black text-white">CITES</span>
          </div>
        )}

        {/* List for Sale Overlay */}
        {onList && (
          <div className="absolute inset-0 bg-brand-dark/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-20">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setIsListing(true);
                onList().finally(() => setIsListing(false));
              }}
              disabled={isListing}
              className="bg-white text-brand-dark px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-brand-green hover:text-white transition-all shadow-xl disabled:opacity-50"
            >
              {isListing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Coins className="w-3 h-3" />}
              {isListing ? "MINTING..." : "List Asset"}
            </button>
          </div>
        )}

        {/* Kingdom Icon Badge */}
        <div className={`absolute bottom-3 right-3 p-1.5 rounded-lg border backdrop-blur-md z-10 ${
          kingdom === 'Plantae' ? 'bg-emerald-500/90 border-emerald-400 text-white' :
          kingdom === 'Fungi' ? 'bg-blue-500/90 border-blue-400 text-white' :
          kingdom === 'Animalia' ? 'bg-brand-pink/90 border-brand-pink-dark text-brand-dark' :
          'bg-slate-500/90 border-slate-400 text-white'
        }`}>
          {kingdom === 'Plantae' ? <Leaf className="w-3 h-3" /> :
           kingdom === 'Fungi' ? <Waves className="w-3 h-3" /> :
           kingdom === 'Animalia' ? <Heart className="w-3 h-3" /> :
           <div className="w-3 h-3 border border-current rounded-full" />}
        </div>
      </div>
      <h3 className="font-bold text-brand-dark px-1 truncate">{displayNickname}</h3>
      {displaySpecies && (
        <span className="text-sm text-brand-dark/50 font-medium px-1 truncate">{displaySpecies}</span>
      )}
    </div>
  );
}
