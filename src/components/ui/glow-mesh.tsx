import React from 'react';
import { motion, Variants } from 'framer-motion';
import { cn } from '@/lib/utils';

interface GlowMeshProps {
  status: 'Healthy' | 'Stressed' | 'Critical' | 'Dormant';
  size?: number;
}

export const GlowMesh: React.FC<GlowMeshProps> = ({ status, size = 120 }) => {
  const variants: Variants = {
    Healthy: {
      scale: [1, 1.1, 1],
      opacity: [0.3, 0.6, 0.3],
      background: 'radial-gradient(circle, #10b981 0%, transparent 70%)',
      transition: { repeat: Infinity, duration: 3, ease: "easeInOut" }
    },
    Stressed: {
      scale: [0.95, 1, 0.95],
      opacity: [0.2, 0.4, 0.2],
      background: 'radial-gradient(circle, #f59e0b 0%, transparent 70%)',
      transition: { repeat: Infinity, duration: 5, ease: "easeInOut" }
    },
    Critical: {
      scale: [1, 1.2, 1],
      opacity: [0.4, 0.8, 0.4],
      background: 'radial-gradient(circle, #ef4444 0%, transparent 70%)',
      transition: { repeat: Infinity, duration: 1.5, ease: "linear" }
    },
    Dormant: {
      scale: 1,
      opacity: 0.1,
      background: 'radial-gradient(circle, #64748b 0%, transparent 70%)',
      transition: { duration: 1 }
    }
  };

  return (
    <div 
      className={cn("relative flex items-center justify-center")}
      style={{ width: size, height: size }}
    >
      <motion.div
        className="absolute inset-0 rounded-full blur-2xl"
        animate={status}
        variants={variants}
      />
      <motion.div
        className="relative z-10 w-1/3 h-1/3 rounded-full bg-white/10 backdrop-blur-md border border-white/20"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
      />
    </div>
  );
};
