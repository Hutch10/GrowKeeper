import React from 'react';
import { motion } from 'framer-motion';
import { GlowMesh } from '../ui/glow-mesh';
import { Activity, Droplets, Thermometer, ShieldCheck } from 'lucide-react';
import { BaseSpecimen } from '@/types/specimen';

interface SpecimenSummaryCardProps {
  specimen: BaseSpecimen;
  onClick: () => void;
  isSelected?: boolean;
}

export const SpecimenSummaryCard: React.FC<SpecimenSummaryCardProps> = ({ 
  specimen, 
  onClick, 
  isSelected 
}) => {
  const status = specimen.health > 70 ? 'Healthy' : specimen.health > 40 ? 'Stressed' : 'Critical';

  return (
    <motion.div
      onClick={onClick}
      whileHover={{ y: -4, scale: 1.02 }}
      className={`relative p-6 rounded-3xl cursor-pointer transition-all duration-500 overflow-hidden ${
        isSelected 
          ? 'bg-white/10 border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.3)]' 
          : 'bg-white/5 border-white/5 hover:bg-white/10'
      } border`}
    >
      {/* GlowMesh Vitality Indicator */}
      <div className="absolute -right-8 -top-8 pointer-events-none opacity-40">
        <GlowMesh status={status} size={160} />
      </div>

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-black uppercase tracking-widest text-white/50">
            {specimen.kingdom}
          </div>
          {specimen.health > 80 && (
            <ShieldCheck className="w-4 h-4 text-brand-green" />
          )}
        </div>

        <h3 className="text-xl font-bold text-white mb-1">{specimen.nickname}</h3>
        <p className="text-xs text-white/40 italic mb-6">{specimen.species_name || "Unknown Species"}</p>

        <div className="grid grid-cols-2 gap-4">
          <TelemetryMiniItem 
            icon={Droplets} 
            label="Moisture" 
            value={`${Math.round((specimen.telemetry?.moisture || 0) * 100)}%`} 
          />
          <TelemetryMiniItem 
            icon={Thermometer} 
            label="Temp" 
            value={`${specimen.telemetry?.temperature || 22}°C`} 
          />
        </div>

        <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className={`w-3 h-3 ${status === 'Healthy' ? 'text-brand-green' : 'text-brand-pink'}`} />
            <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Vitality</span>
          </div>
          <span className={`text-lg font-black ${status === 'Healthy' ? 'text-brand-green' : 'text-brand-pink'}`}>
            {Math.round(specimen.health ?? 0)}%
          </span>
        </div>
      </div>
    </motion.div>
  );
};

const TelemetryMiniItem = ({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value: string }) => (
  <div className="flex flex-col gap-1">
    <div className="flex items-center gap-1.5 opacity-40">
      <Icon className="w-3 h-3 text-white" />
      <span className="text-[9px] font-black uppercase tracking-tighter text-white">{label}</span>
    </div>
    <span className="text-xs font-bold text-white/80">{value}</span>
  </div>
);
