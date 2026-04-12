"use client";

import { useState, useMemo } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { DashboardHeader } from "@/components/dashboard/header";
import { SpecimenSummaryCard } from "@/components/dashboard/specimen-summary-card";
import { SpecimenDetailPanel } from "@/components/dashboard/specimen-detail-panel";
import { Search, Plus } from "lucide-react";
import Link from "next/link";
import type { SpecimenRow } from "@/app/actions/types";
import { useSpecimens } from "@/hooks/use-specimens";
import { SpecimenListSkeleton } from "@/components/ui/skeleton";

interface SpecimensClientProps {
  initialSpecimens: SpecimenRow[];
}

export function SpecimensClient({ initialSpecimens }: SpecimensClientProps) {
  const { specimens, loading, error } = useSpecimens(initialSpecimens);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [selectedSpecimenId, setSelectedSpecimenId] = useState<string | undefined>(initialSpecimens[0]?.id);

  const locations = useMemo(() => {
    const locs = new Set(specimens.map(p => p.location).filter(Boolean));
    return Array.from(locs);
  }, [specimens]);

  const filteredSpecimens = useMemo(() => {
    return specimens.filter(specimen => {
      const matchesSearch = (specimen.nickname ?? "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (specimen.species_name ?? "").toLowerCase().includes(searchQuery.toLowerCase());
      const matchesLocation = !selectedLocation || specimen.location === selectedLocation;
      return matchesSearch && matchesLocation;
    });
  }, [specimens, searchQuery, selectedLocation]);

  const selectedSpecimen = specimens.find(p => p.id === selectedSpecimenId) || specimens[0];

  if (loading) {
    return (
      <div className="flex min-h-screen bg-brand-cream font-sans">
        <Sidebar aria-hidden />
        <main className="flex-1 ml-64 p-8 overflow-y-auto">
          <div className="flex flex-col gap-8">
            <div className="space-y-2">
              <div className="h-10 w-64 bg-slate-200 dark:bg-slate-700 animate-pulse rounded-lg" />
              <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 animate-pulse rounded-lg" />
            </div>
            <SpecimenListSkeleton />
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-brand-cream p-8">
        <div className="max-w-md text-center">
          <h2 className="text-3xl font-black text-brand-dark mb-4">Offline Data Error</h2>
          <p className="text-brand-dark/40 font-bold mb-6">{error.message}</p>
          <button onClick={() => window.location.reload()} className="px-8 py-4 bg-brand-forest text-white rounded-2xl font-black shadow-lg">Retry Sync</button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-brand-cream font-sans selection:bg-brand-green/10">
      <Sidebar />
      
      <main className="flex-1 ml-64 p-8 overflow-y-auto">
        <DashboardHeader />

        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-black text-brand-dark mb-2">My Specimen Collection</h1>
            <p className="text-brand-dark/40 font-bold">{initialSpecimens.length} Specimens Total</p>
          </div>
          
          <Link 
            href="/plants/new"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-brand-forest text-white font-black hover:bg-brand-forest/90 transition-all shadow-lg hover:shadow-brand-forest/20 active:scale-95"
          >
            <Plus className="w-5 h-5" />
            Add New Specimen
          </Link>
        </div>

        {/* Filters & Search */}
        <div className="bg-white/50 backdrop-blur-md rounded-[2.5rem] p-6 mb-8 border border-white/50 shadow-sm">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1 relative">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-dark/20" />
              <input 
                type="text"
                placeholder="Search your collection..."
                className="w-full bg-brand-cream/50 border-2 border-transparent focus:border-brand-green/20 rounded-2xl py-4 pl-14 pr-6 text-brand-dark font-bold placeholder:text-brand-dark/20 transition-all outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex items-center gap-3 overflow-x-auto pb-2 lg:pb-0 no-scrollbar">
              <button 
                onClick={() => setSelectedLocation(null)}
                className={`px-6 py-4 rounded-2xl font-black whitespace-nowrap transition-all ${!selectedLocation ? 'bg-brand-forest text-white shadow-md' : 'bg-white text-brand-dark/40 hover:bg-white/80'}`}
              >
                All Locations
              </button>
              {locations.map((loc) => (
                <button 
                  key={loc}
                  onClick={() => setSelectedLocation(loc as string)}
                  className={`px-6 py-4 rounded-2xl font-black whitespace-nowrap transition-all ${selectedLocation === loc ? 'bg-brand-forest text-white shadow-md' : 'bg-white text-brand-dark/40 hover:bg-white/80'}`}
                >
                  {loc}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Empty State Hero */}
        {initialSpecimens.length === 0 && (
          <div className="bg-white rounded-[3rem] p-12 text-center mb-8 border-2 border-dashed border-brand-pink/20">
            <div className="max-w-2xl mx-auto">
              <div className="w-24 h-24 bg-brand-pink/10 rounded-full flex items-center justify-center mx-auto mb-8">
                <Plus className="w-12 h-12 text-brand-pink" />
              </div>
              <h2 className="text-4xl font-black text-brand-dark mb-4">Your Field Collection is Empty</h2>
              <p className="text-xl text-brand-dark/50 font-medium mb-10 leading-relaxed">
                Start your biological asset management journey. Register your first specimen to begin tracking health metrics, hardware provenance, and autonomous regulation cycles.
              </p>
              <Link 
                href="/plants/new"
                className="inline-flex items-center gap-4 px-10 py-5 rounded-[2rem] bg-brand-forest text-white text-xl font-black hover:bg-brand-forest/90 transition-all shadow-xl shadow-brand-forest/30 active:scale-95"
              >
                <Plus className="w-6 h-6" />
                Add Your First Specimen
              </Link>
            </div>
          </div>
        )}

        {/* Specimens Grid */}
        {filteredSpecimens.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredSpecimens.map((specimen) => (
              <SpecimenSummaryCard 
                key={specimen.id}
                specimen={specimen}
                isSelected={selectedSpecimenId === specimen.id}
                onClick={() => setSelectedSpecimenId(specimen.id)}
              />
            ))}
          </div>
        ) : initialSpecimens.length > 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-24 h-24 bg-brand-soft-pink/30 rounded-full flex items-center justify-center mb-6">
              <Search className="w-10 h-10 text-brand-pink-dark" />
            </div>
            <h3 className="text-2xl font-black text-brand-dark mb-2">No specimens found</h3>
            <p className="text-brand-dark/40 font-bold max-w-md">Try adjusting your filters or search query to find the specimen you&apos;re looking for.</p>
          </div>
        ) : null}
      </main>

      {/* Right Sidebar Inspector */}
      <div className="p-4 pr-6 flex items-start sticky top-0 h-screen">
        <SpecimenDetailPanel specimen={selectedSpecimen} />
      </div>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
