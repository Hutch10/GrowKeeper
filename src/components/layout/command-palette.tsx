"use client";

import { useState, useEffect } from "react";
import { Search, Command, Leaf, Users, Zap, TrendingUp, Sparkles, X } from "lucide-react";

interface SearchResult {
  id: string;
  category: "Plants" | "Community" | "Marketplace";
  title: string;
  subtitle: string;
  href: string;
}

const MOCK_RESULTS: SearchResult[] = [
  { id: "1", category: "Plants", title: "Snake Plant", subtitle: "Living Room • Healthy", href: "/dashboard" },
  { id: "2", category: "Plants", title: "Monstera Albo", subtitle: "Bedroom • Rare Variegated", href: "/dashboard" },
  { id: "3", category: "Community", title: "Gene Grower", subtitle: "Master Grower • 1.2k Followers", href: "/community/profile/guest" },
  { id: "4", category: "Community", title: "Rare Aroid Club", subtitle: "Group • 45 active swaps", href: "/community/swap" },
  { id: "5", category: "Marketplace", title: "Philodendron Pink Princess", subtitle: "Hot Asset • AI Certified", href: "/dashboard" },
  { id: "6", category: "Marketplace", title: "Ceramic Minimalist Pot", subtitle: "Accessory • Ships Worldwide", href: "/dashboard" },
];

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }
    const filtered = MOCK_RESULTS.filter(r => 
      r.title.toLowerCase().includes(query.toLowerCase()) || 
      r.category.toLowerCase().includes(query.toLowerCase())
    );
    setResults(filtered);
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-start justify-center pt-[15vh] px-4 animate-in fade-in duration-300 backdrop-blur-md bg-slate-900/40">
      <div className="w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100 flex flex-col ring-8 ring-white/10">
        
        {/* Search Input Area */}
        <div className="p-8 border-b border-slate-50 relative flex items-center gap-4">
          <Search className="w-8 h-8 text-brand-green" />
          <input 
            autoFocus
            type="text" 
            placeholder="Search the botanical empire..."
            className="w-full bg-transparent border-none focus:ring-0 text-3xl font-black text-brand-dark placeholder:text-slate-200 tracking-tight italic"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button 
            onClick={() => setIsOpen(false)}
            className="p-3 hover:bg-slate-50 rounded-2xl text-slate-300 transition-colors"
            title="Close Search (ESC)"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Results / Discovery Content */}
        <div className="max-h-[500px] overflow-y-auto scrollbar-hide p-4">
          {query.length < 2 ? (
            <div className="p-8">
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-8 px-4 flex items-center gap-2">
                <TrendingUp className="w-3 h-3" />
                Trending Searches
              </div>
              <div className="grid grid-cols-2 gap-4">
                {["Monstera Albo", "Propagation Tips", "Master Grower", "Swap Near Me"].map(term => (
                  <button 
                    key={term}
                    onClick={() => setQuery(term)}
                    className="flex items-center gap-3 p-5 rounded-3xl bg-slate-50 hover:bg-brand-green/10 hover:text-brand-green transition-all text-left group"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-brand-green group-hover:scale-150 transition-transform" />
                    <span className="font-bold text-sm text-slate-600 group-hover:text-brand-green">{term}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {results.length > 0 ? results.map((result) => (
                <button 
                  key={result.id}
                  onClick={() => {
                    window.location.href = result.href;
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center justify-between p-6 rounded-[2rem] hover:bg-slate-50 group transition-all"
                >
                  <div className="flex items-center gap-6">
                    <div className={`p-4 rounded-2xl border transition-all ${
                      result.category === "Marketplace" 
                        ? "bg-brand-pink/10 border-brand-pink/20 text-brand-pink" 
                        : result.category === "Community"
                          ? "bg-brand-green/10 border-brand-green/20 text-brand-green"
                          : "bg-brand-dark/5 border-slate-100 text-brand-dark"
                    }`}>
                      {result.category === "Marketplace" ? <Zap className="w-6 h-6" /> : result.category === "Community" ? <Users className="w-6 h-6" /> : <Leaf className="w-6 h-6" />}
                    </div>
                    <div className="text-left">
                      <div className="text-xl font-black text-brand-dark group-hover:translate-x-1 transition-transform">{result.title}</div>
                      <div className="text-sm font-bold text-slate-400 uppercase tracking-widest text-[10px] mt-1">{result.subtitle}</div>
                    </div>
                  </div>
                  <div className="px-4 py-2 bg-white rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-300 border border-slate-100 opacity-0 group-hover:opacity-100 transition-opacity">
                    ESC to close
                  </div>
                </button>
              )) : (
                <div className="py-20 text-center">
                  <Sparkles className="w-12 h-12 text-slate-100 mx-auto mb-4" />
                  <div className="text-xl font-black text-slate-300 italic">No botanical matches found.</div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="p-6 bg-slate-50 border-t border-slate-50 flex items-center justify-between">
          <div className="flex gap-6">
            <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase">
              <span className="px-2 py-1 bg-white rounded border border-slate-200">↑↓</span>
              Navigate
            </div>
            <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase">
              <span className="px-2 py-1 bg-white rounded border border-slate-200">Enter</span>
              Select
            </div>
          </div>
          <div className="text-[10px] font-black text-brand-green/60 uppercase tracking-widest flex items-center gap-2">
            <Command className="w-3 h-3" />
            GrowKeeper Global Engine
          </div>
        </div>
      </div>
    </div>
  );
}
