"use client";

import React from 'react';
import { 
  LayoutGrid, 
  Sprout, 
  MapPin, 
  Book, 
  CheckSquare, 
  MessageSquare, 
  Settings, 
  HelpCircle,
  Leaf
} from 'lucide-react';
import { motion } from 'framer-motion';

const NAV_ITEMS = [
  { icon: LayoutGrid, label: 'Dashboard', id: 'dashboard', active: true },
  { icon: Sprout, label: 'My Plants', id: 'inventory' },
  { icon: MapPin, label: 'Care Tips', id: 'tips' },
  { icon: Book, label: 'Plant Library', id: 'library' },
  { icon: CheckSquare, label: 'Tasks', id: 'tasks', badge: 3 },
  { icon: MessageSquare, label: 'Community', id: 'community' },
  { icon: Settings, label: 'Settings', id: 'settings' },
  { icon: HelpCircle, label: 'Support', id: 'support' },
];

export function Sidebar({ 
  activeTab, 
  onTabChange 
}: { 
  activeTab: string, 
  onTabChange: (id: 'inventory' | 'compliance' | 'simulation' | string) => void 
}) {
  return (
    <aside className="w-64 h-screen bg-emerald-900/40 backdrop-blur-3xl border-r border-white/5 flex flex-col p-6 z-[100] transition-colors duration-500 overflow-hidden relative group">
      {/* Dynamic Background Mesh for Premium Feel */}
      <div className="absolute inset-0 opacity-20 pointer-events-none overflow-hidden">
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-emerald-400 rounded-full blur-[100px] anime-pulse" />
      </div>

      {/* Brand Section */}
      <div className="flex items-center gap-3 mb-12 px-2">
        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
          <Leaf className="w-6 h-6 text-emerald-600" />
        </div>
        <div>
          <h1 className="text-sm font-black italic tracking-tighter text-white leading-none">
            All About Plants
          </h1>
        </div>
      </div>

      {/* Primary Navigation */}
      <nav className="flex-1 space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive = activeTab === item.id || (item.id === 'dashboard' && activeTab === 'inventory');
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 group/btn ${
                isActive 
                  ? 'bg-white/10 text-white shadow-sm shadow-black/10' 
                  : 'text-white/40 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-3">
                <item.icon className={`w-4 h-4 transition-transform duration-300 group-hover/btn:scale-110 ${isActive ? 'text-emerald-400' : ''}`} />
                <span className="text-[11px] font-bold tracking-wide">
                  {item.label}
                </span>
              </div>
              {item.badge && (
                <span className="w-5 h-5 bg-rose-500 text-white text-[9px] font-black rounded-full flex items-center justify-center shadow-lg shadow-rose-500/40">
                  {item.badge}
                </span>
              )}
              {isActive && (
                <motion.div 
                  layoutId="activeSideBarNav"
                  className="absolute left-0 w-1 h-6 bg-emerald-400 rounded-r-full"
                />
              )}
            </button>
          );
        })}
      </nav>

      {/* Decorative Footer */}
      <div className="mt-auto px-4 py-8 border-t border-white/5">
        <div className="text-[9px] uppercase tracking-[0.2em] font-black text-white/20">
          Alpha Sovereign Layer
        </div>
      </div>
    </aside>
  );
}
