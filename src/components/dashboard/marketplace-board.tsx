"use client";

import { useState, useEffect } from "react";
import { ShoppingCart, Tag, Shield, Zap, TrendingUp, Info } from "lucide-react";
import { marketplace } from "@/lib/services/marketplace";
import { type Listing } from "@/types/marketplace";
import { useSpecimenData } from "@/hooks/use-specimen-data";
import { toast } from "sonner";

export function MarketplaceBoard() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const { specimens } = useSpecimenData();

  const fetchListings = async () => {
    try {
      const active = await marketplace.getActiveListings();
      setListings(active);
    } catch (err) {
      console.error("Failed to fetch listings", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
    
    // Polling for simulation of a live market
    const interval = setInterval(fetchListings, 5000);
    return () => clearInterval(interval);
  }, []);

  const handlePurchase = async (listing: Listing) => {
    const specimen = specimens.find(s => s.id === listing.specimenId);
    if (!specimen) return;

    try {
      await marketplace.purchaseSpecimen(listing.id, "CURRENT_USER", specimen);
      toast.success("Purchase initiated! Escrow locked.");
      fetchListings();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Purchase failed");
    }
  };

  if (loading && listings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <div className="w-12 h-12 border-2 border-brand-green border-t-transparent rounded-full animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">Scanning Liquidity Pools...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-brand-green/10 rounded-xl border border-brand-green/20">
            <ShoppingCart className="w-6 h-6 text-brand-green" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white tracking-tight">Sovereign Marketplace</h2>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">L2 Assets • P2P Settlement</p>
          </div>
        </div>
        
        <div className="hidden md:flex items-center gap-6 px-6 py-3 bg-white/5 rounded-2xl border border-white/10">
          <div className="flex flex-col">
            <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">Global Vol</span>
            <span className="text-sm font-black text-brand-green">$124.8M</span>
          </div>
          <div className="w-[1px] h-6 bg-white/10" />
          <div className="flex flex-col">
            <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">Avg Yield</span>
            <span className="text-sm font-black text-white">12.4%</span>
          </div>
        </div>
      </div>

      {listings.length === 0 ? (
        <div className="tactical-panel p-16 text-center space-y-4 border-dashed bg-transparent border-white/10">
          <Tag className="w-12 h-12 text-white/10 mx-auto" />
          <div>
            <h3 className="text-lg font-black text-white/40">No Active Listings</h3>
            <p className="text-xs text-white/20 font-bold max-w-xs mx-auto">The market is currently stable. All specimens are under protocol custody.</p>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((listing) => {
            const specimen = specimens.find(s => s.id === listing.specimenId);
            if (!specimen) return null;

            return (
              <div key={listing.id} className="tactical-panel border-white/10 hover:border-brand-green/30 transition-all group overflow-hidden">
                <div className="p-6 space-y-6">
                  {/* Card Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-brand-green/10 rounded-lg border border-brand-green/20 flex items-center justify-center">
                        <Zap className="w-5 h-5 text-brand-green" />
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-white">{specimen.nickname}</h4>
                        <p className="text-[8px] font-black text-white/30 uppercase tracking-wider">{specimen.species_name || "Unknown Species"}</p>
                      </div>
                    </div>
                    {specimen.compliance_status === 'compliant' && (
                      <div className="p-1 px-2 bg-brand-green/20 border border-brand-green/30 rounded-md">
                         <Shield className="w-3 h-3 text-brand-green" />
                      </div>
                    )}
                  </div>

                  {/* Price Section */}
                  <div className="bg-white/5 rounded-xl border border-white/10 p-4 relative">
                    <div className="flex items-end justify-between">
                      <div>
                        <span className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-1 block">Listing Price</span>
                        <span className="text-2xl font-black text-white">${listing.price.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-1 text-brand-green">
                         <TrendingUp className="w-3 h-3" />
                         <span className="text-[10px] font-black">+4.2%</span>
                      </div>
                    </div>
                  </div>

                  {/* Fee Breakdown Info */}
                  <div className="flex items-center gap-2 group/info cursor-help p-2 rounded-lg hover:bg-white/5 transition-colors">
                    <Info className="w-3 h-3 text-white/20" />
                    <span className="text-[8px] font-black text-white/30 uppercase tracking-widest">Protocol-Enforced fees apply</span>
                  </div>

                  {/* Call to Action */}
                  <button
                    onClick={() => handlePurchase(listing)}
                    className="w-full py-4 bg-brand-green text-black rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-white hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-brand-green/10"
                  >
                    Initiate Settlement
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
