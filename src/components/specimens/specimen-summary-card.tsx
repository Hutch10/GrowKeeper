"use client";

import React, { useMemo } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Specimen } from '@/types/specimen';
import { TaskRow } from '@/app/actions/tasks';

interface SpecimenSummaryCardProps {
  specimen: Specimen;
  tasks?: TaskRow[];
  onClick: () => void;
  active?: boolean;
}

export const SpecimenSummaryCard: React.FC<SpecimenSummaryCardProps> = ({ 
  specimen, 
  tasks = [],
  onClick, 
  active 
}) => {
  const status = specimen.health > 70 ? 'Healthy' : specimen.health > 40 ? 'Stressed' : 'Critical';
  
  const isOverdue = useMemo(() => {
    const pending = tasks.filter(t => t.specimen_id === specimen.id && !t.completed);
    if (pending.length === 0) return false;
    return pending.some(t => t.due_date && new Date(t.due_date) < new Date());
  }, [tasks, specimen.id]);

  return (
    <motion.div
      onClick={onClick}
      whileHover={{ y: -12, scale: 1.02 }}
      transition={{ type: "spring", damping: 20, stiffness: 300 }}
      className={`group cursor-pointer flex flex-col gap-5 animate-in fade-in slide-in-from-bottom-6 duration-1000 scroll-mt-24`}
    >
      <div className={`relative aspect-square rounded-[3rem] overflow-hidden border-4 transition-all duration-700 shadow-2xl ${
        active 
          ? 'border-emerald-500 shadow-emerald-500/30 scale-[1.03]' 
          : 'border-white dark:border-white/5 shadow-slate-200/50 dark:shadow-black/20 hover:border-emerald-500/40'
      }`}>
        <Image 
          src={specimen.image_url || `https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&q=80&w=800`} 
          alt={specimen.nickname}
          fill
          unoptimized
          className="object-cover transition-transform duration-700 group-hover:scale-110"
        />
        
        {/* Vitality Overlay */}
        <div className="absolute top-6 right-6">
          <div className={`w-3 h-3 rounded-full border-2 border-white shadow-lg ${
            status === 'Healthy' ? 'bg-emerald-400 font-black' : 'bg-rose-400 font-black'
          }`} />
        </div>

        {/* Tactical Badge if Overdue */}
        {isOverdue && (
          <div className="absolute bottom-6 left-6 right-6 bg-rose-500/90 backdrop-blur-md py-2 rounded-xl text-center text-[9px] font-black uppercase tracking-widest text-white animate-pulse">
            Protocol Overdue
          </div>
        )}
      </div>

      <div className="px-2">
        <h3 className="text-sm font-black text-slate-800 dark:text-white tracking-tight mb-0.5 group-hover:text-emerald-600 transition-colors">
          {specimen.nickname}
        </h3>
        <p className="text-[10px] font-bold text-slate-400 dark:text-white/20 uppercase tracking-widest">
          {specimen.species_name || "Biological Specimen"}
        </p>
      </div>
    </motion.div>
  );
};
