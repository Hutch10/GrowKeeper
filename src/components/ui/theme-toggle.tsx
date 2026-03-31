"use client";

import React, { useEffect, useState } from "react";
import { useTheme } from "@/components/providers/theme-provider";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sun, 
  Moon, 
  Zap, 
  Cloud
} from "lucide-react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="h-10 w-10 rounded-xl bg-white/5 border border-white/5 animate-pulse" />
    );
  }

  const themes: { id: typeof theme; icon: React.ElementType; color: string; label: string }[] = [
    { id: "dark", icon: Moon, color: "text-blue-400", label: "Midnight" },
    { id: "light", icon: Sun, color: "text-amber-400", label: "Solaris" },
    { id: "neon", icon: Zap, color: "text-emerald-400", label: "Neon" },
    { id: "mist", icon: Cloud, color: "text-indigo-400", label: "Mist" },
  ];

  const currentThemeInfo = themes.find(t => t.id === theme) || themes[0];

  const cycleTheme = () => {
    const currentIndex = themes.findIndex(t => t.id === theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex].id);
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={cycleTheme}
        className="group relative flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all active:scale-95 shadow-2xl overflow-hidden backdrop-blur-xl"
        title={`Active Protocol: ${currentThemeInfo.label}`}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={theme}
            initial={{ y: 20, opacity: 0, rotate: -45 }}
            animate={{ y: 0, opacity: 1, rotate: 0 }}
            exit={{ y: -20, opacity: 0, rotate: 45 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className={`relative z-10 ${currentThemeInfo.color}`}
          >
            {React.createElement(currentThemeInfo.icon, { size: 18, strokeWidth: 2 })}
          </motion.div>
        </AnimatePresence>
        
        {/* Subtle indicator glow */}
        <motion.div 
          layoutId="theme-glow"
          className={`absolute inset-0 opacity-20 blur-xl ${currentThemeInfo.color.replace('text-', 'bg-')}`}
        />
        
        {/* Scan line effect on hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-500">
          <div className="h-[2px] w-full bg-white/40 absolute top-0 animate-scan" />
        </div>
      </button>

      {/* Hidden label for larger viewports or accessibility */}
      <div className="hidden lg:block">
        <div className="text-[9px] font-black uppercase tracking-[0.2em] text-white/20 mb-0.5">Surface Mode</div>
        <div className="text-[11px] font-bold text-white/40 leading-none">{currentThemeInfo.label}</div>
      </div>
    </div>
  );
}
