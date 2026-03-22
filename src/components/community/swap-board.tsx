"use client";

import Image from "next/image";
import { MapPin, RefreshCw, MessageCircle, Plus } from "lucide-react";
import type { SwapListing } from "@/app/actions/community";

export function SwapBoard({ listings }: { listings: SwapListing[] }) {
  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      {/* Header Section */}
      <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="px-3 py-1 bg-brand-pink/20 rounded-full text-[10px] font-black text-brand-pink-dark uppercase tracking-widest border border-brand-pink/30">
              Community Exchange
            </div>
          </div>
          <h1 className="text-4xl font-black text-brand-dark mb-4 tracking-tight">Propagation Swap</h1>
          <p className="text-lg font-bold text-slate-500/80 max-w-xl leading-relaxed">
            Trade cuttings and starters with local growers. Build your collection through the botanical gift economy.
          </p>
        </div>
        
        <button className="px-6 py-4 bg-brand-dark text-white rounded-2xl font-black text-sm shadow-xl shadow-slate-200 hover:bg-brand-green transition-all flex items-center gap-2 group whitespace-nowrap">
          <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
          List a Cutting
        </button>
      </header>

      {/* Filters & Search */}
      <div className="flex items-center gap-8 mb-12 overflow-x-auto pb-4 scrollbar-hide">
        {["All Species", "Cuttings", "Seeds", "Starters", "Recent"].map((filter, i) => (
          <button 
            key={filter} 
            className={`text-sm font-black whitespace-nowrap transition-colors ${
              i === 0 ? "text-brand-green" : "text-slate-400 hover:text-brand-dark"
            }`}
          >
            {filter}
          </button>
        ))}
        <div className="flex-1" />
        <div className="relative group min-w-[200px]">
          <input 
            type="text" 
            placeholder="Search swaps..." 
            className="w-full pl-4 pr-10 py-3 bg-slate-100 rounded-xl border-none focus:ring-2 focus:ring-brand-green/20 font-bold text-sm"
          />
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {listings.map((item) => (
          <div key={item.id} className="group bg-white rounded-[2.5rem] p-5 shadow-sm hover:shadow-2xl hover:shadow-brand-green/10 transition-all border border-slate-100 flex flex-col h-full">
            {/* Image Wrap */}
            <div className="relative aspect-square rounded-[2rem] overflow-hidden mb-6 bg-slate-50">
              <Image 
                src={item.imageUrl} 
                alt={item.plantName}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute top-4 right-4">
                <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest backdrop-blur-md border ${
                   item.type === "Cutting" 
                     ? "bg-brand-pink/80 text-white border-brand-pink" 
                     : "bg-brand-green/80 text-white border-brand-green"
                }`}>
                  {item.type}
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 px-2 pb-2">
              <div className="flex items-center gap-2 text-[10px] font-black text-brand-green uppercase tracking-widest mb-2">
                <RefreshCw className="w-3 h-3" />
                {item.status}
              </div>
              <h3 className="text-xl font-black text-brand-dark mb-1">{item.plantName}</h3>
              <p className="text-sm font-bold text-slate-400 italic mb-4">{item.species}</p>
              <p className="text-sm font-bold text-slate-500/80 line-clamp-2 leading-relaxed mb-6">
                {item.description}
              </p>

              <div className="flex items-center justify-between mt-auto pt-6 border-t border-slate-50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-100 overflow-hidden relative border border-white">
                    <Image 
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${item.username}`}
                      alt={item.username}
                      fill
                    />
                  </div>
                  <div>
                    <div className="text-xs font-black text-brand-dark">{item.username}</div>
                    <div className="flex items-center gap-1 text-[9px] font-bold text-slate-400">
                      <MapPin className="w-3 h-3" />
                      {item.location}
                    </div>
                  </div>
                </div>
                <button className="p-3 bg-brand-green/10 hover:bg-brand-green text-brand-green hover:text-white rounded-xl transition-all group/btn shadow-sm">
                  <MessageCircle className="w-5 h-5 group-hover/btn:scale-110" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Footer / Empty State placeholder */}
      <div className="mt-20 text-center py-12 border-t border-dashed border-slate-200">
        <p className="text-slate-300 font-black uppercase tracking-[0.2em] text-xs">
          Load More Swaps
        </p>
      </div>
    </div>
  );
}
