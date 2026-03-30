"use client";

import { useState, useEffect } from "react";

import Image from "next/image";
import { Heart, Leaf, Waves, Shield, Loader2, Zap, MapPin, AlertTriangle, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Kingdom, BaseSpecimen } from "@/types/specimen";
import { useSpecimenData } from "@/hooks/use-specimen-data";
import { checkLegalStatus } from "@/lib/geofencing";

interface SpecimenSummaryCardProps {
  id?: string;
  specimen?: BaseSpecimen; // Optional: can be passed in or fetched by ID
  nickname?: string;
  species_name?: string | null;
  image_url?: string | null;
  onClick?: () => void;
  isSelected?: boolean; // Changed from isActive to match other card
  isActive?: boolean; // Keep for compatibility
  kingdom?: Kingdom;
  compliance_status?: string | null;
  hardware_attestation_statement?: string | null;
}

export function SpecimenSummaryCard({ 
  id,
  specimen: propSpecimen,
  nickname,
  species_name,
  image_url,
  onClick,
  isSelected,
  isActive: propIsActive,
  kingdom: propKingdom,
  compliance_status: propCompliance,
  hardware_attestation_statement: propHardware
}: SpecimenSummaryCardProps) {
  const { specimens, loading: dataLoading } = useSpecimenData();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Use propSpecimen if provided, otherwise fetch by ID
  const specimen = propSpecimen ?? (specimens.find(s => s.id === id) as BaseSpecimen);
  
  if (dataLoading && !propSpecimen) {
    return (
      <div className="flex flex-col flex-shrink-0 w-48 items-center justify-center p-4">
        <Loader2 className="w-6 h-6 animate-spin text-brand-green" />
      </div>
    );
  }

  // Fallback to BaseSpecimen if still not found
  if (!specimen) return null;

  const displayNickname = nickname || specimen.nickname || "Unknown";
  const displaySpecies = species_name || specimen.species_name;
  const kingdom = propKingdom || specimen.kingdom;
  const compliance_status = propCompliance || specimen.compliance_status;
  const hardware_attestation_statement = propHardware || specimen.hardware_attestation_statement;
  const isActive = isSelected || propIsActive;
  
  const displayImage: string = image_url ?? specimen.image_url ?? (kingdom === "Fungi"
    ? `https://images.unsplash.com/photo-1544070282-591d487abc53?q=80&w=300&h=300&auto=format&fit=crop`
    : kingdom === "Animalia"
      ? `https://images.unsplash.com/photo-1552053831-71594a27632d?q=80&w=300&h=300&auto=format&fit=crop`
      : `https://images.unsplash.com/photo-1545239351-ef056c5983f3?q=80&w=300&h=300&auto=format&fit=crop`);

  const isHealthy = (specimen.health || 0) > 80;
  const isStressed = (specimen.health || 0) < 40;

  const geofence = specimen.lat && specimen.lon 
    ? checkLegalStatus(specimen.lon, specimen.lat) 
    : null;

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      onClick={onClick}
      className={`flex flex-col flex-shrink-0 w-full cursor-pointer relative group transition-all rounded-[2.5rem] p-3 border border-white/5 bg-black/20 hover:bg-white/5 ${
        isActive ? "bg-brand-green/10 tactical-border" : ""
      }`}
    >
      {/* Glow-Mesh Bioluminescent Layer */}
      <AnimatePresence>
        {isHealthy && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.1, 0.3, 0.1] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -inset-1 bg-brand-green/20 blur-2xl rounded-[2.5rem] z-0 pointer-events-none"
          />
        )}
        {isStressed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.1, 0.4, 0.1] }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="absolute -inset-1 bg-brand-pink/30 blur-2xl rounded-[2.5rem] z-0 pointer-events-none"
          />
        )}
      </AnimatePresence>

      <div className="relative w-full aspect-square rounded-[1.5rem] overflow-hidden mb-3 z-10">
        <Image 
          src={displayImage}
          alt={displayNickname}
          fill
          className="object-cover transition-transform group-hover:scale-110 duration-700"
        />
        
        {/* Hardware Attestation Badge (Provenance) */}
        {hardware_attestation_statement && (
          <div className="absolute top-3 left-3 bg-brand-green/90 backdrop-blur-md p-1.5 rounded-lg shadow-lg border border-brand-green/20 z-10" title="Hardware Verified Record">
            <Shield className="w-3 h-3 text-black" />
          </div>
        )}

        {/* Compliance Alert Badge */}
        {compliance_status && compliance_status !== 'none' && (
          <div className="absolute top-3 right-3 bg-red-500/90 backdrop-blur-md px-2 py-1 rounded-lg border border-red-400 z-10" title={`CITES Appendix ${compliance_status} Protected`}>
            <span className="text-[7px] font-black text-white uppercase tabular-nums tracking-tighter">CITES APP {compliance_status}</span>
          </div>
        )}

        {/* Kingdom Icon Badge */}
        <div className={`absolute bottom-3 right-3 p-2 rounded-xl backdrop-blur-xl z-20 border border-white/10 ${
          kingdom === 'Plantae' ? 'bg-emerald-500/20 text-emerald-400' :
          kingdom === 'Fungi' ? 'bg-blue-500/20 text-blue-400' :
          kingdom === 'Animalia' ? 'bg-brand-pink/20 text-brand-pink' :
          'bg-white/10 text-white'
        }`}>
          {kingdom === 'Plantae' ? <Leaf className="w-4 h-4" /> :
           kingdom === 'Fungi' ? <Waves className="w-4 h-4" /> :
           kingdom === 'Animalia' ? <Heart className="w-4 h-4" /> :
           <div className="w-4 h-4 border-2 border-current rounded-full" />}
        </div>

        {/* Geofencing Land Status Badge */}
        {geofence && (
          <div className={`absolute bottom-3 left-3 flex items-center gap-1.5 px-2 py-1 rounded-lg backdrop-blur-md border z-20 ${
            geofence.status === 'safe' ? 'bg-emerald-500/20 border-emerald-500/20 text-emerald-400' :
            geofence.status === 'warning' ? 'bg-yellow-500/20 border-yellow-500/20 text-yellow-500' :
            'bg-red-500/20 border-red-500/20 text-red-500'
          }`} title={geofence.message}>
            {geofence.status === 'safe' ? <CheckCircle2 className="w-3 h-3" /> :
             geofence.status === 'warning' ? <AlertTriangle className="w-3 h-3" /> :
             <MapPin className="w-3 h-3" />}
            <span className="text-[8px] font-black uppercase tracking-tighter tabular-nums">
              {geofence.status === 'safe' ? 'Safe Land' : 
               geofence.status === 'warning' ? 'Permit Req' : 'Restricted'}
            </span>
          </div>
        )}
      </div>
      
      <div className="flex flex-col gap-1 mt-2 z-10 px-1">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black text-white/90 uppercase tracking-tight truncate leading-none">{displayNickname}</h3>
          <div className="flex items-center gap-1.5">
            <Heart className={`w-2.5 h-2.5 ${isHealthy ? 'text-emerald-400' : isStressed ? 'text-brand-pink' : 'text-white/40'}`} />
            <span className={`text-[10px] font-black tracking-tighter transition-colors ${isHealthy ? 'text-emerald-400' : isStressed ? 'text-brand-pink' : 'text-white/60'}`}>
              {mounted ? (Math.round(specimen.health ?? 0)) : "--"}%
            </span>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[9px] text-white/30 font-black uppercase tracking-widest truncate">{displaySpecies || "UNIDENTIFIED"}</span>
            <div className="h-1 w-1 rounded-full bg-white/10" />
            <span className="text-[9px] text-brand-green/60 font-black tracking-widest uppercase">{kingdom}</span>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Waves className="w-2.5 h-2.5 text-blue-400/60" />
              <span className="text-[9px] font-black tabular-nums text-white/40">{Math.round((specimen.telemetry?.moisture || 0) * 100)}%</span>
            </div>
            <div className="flex items-center gap-1">
              <Zap className="w-2.5 h-2.5 text-yellow-400/60" />
              <span className="text-[9px] font-black tabular-nums text-white/40">{specimen.telemetry?.temperature ? Number(specimen.telemetry.temperature).toFixed(1) : "0.0"}°C</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
