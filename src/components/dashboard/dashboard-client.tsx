"use client";

import { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { DashboardHeader } from "@/components/dashboard/header";
import { StatCard } from "@/components/dashboard/stat-card";
import { SpecimenSummaryCard } from "@/components/dashboard/specimen-summary-card";
import { ArticleCard } from "@/components/dashboard/article-card";
import { SpecimenDetailPanel } from "@/components/dashboard/specimen-detail-panel";
import { Droplets, Calendar, Waves, Loader2 } from "lucide-react";

import { MarketplacePreview } from "@/components/dashboard/marketplace-preview";
import { WeatherBanner } from "@/components/dashboard/weather-banner";
import { AnalyticsHub } from "./analytics-hub";
import { AskConcierge } from "@/components/assistant/ask-concierge";
import { InvestorView } from "@/components/dashboard/investor-view";
import { SovereignSettlement } from "@/components/dashboard/sovereign-settlement";
import type { WeatherData } from "@/app/actions/weather";
import { useSpecimenData } from "@/hooks/use-specimen-data";
import type { SpecimenRow } from "@/app/actions/types";
import { marketplace } from "@/lib/services/marketplace";

interface DashboardClientProps {
  initialData: {
    specimens: SpecimenRow[];
    summary: {
      totalSpecimens: number;
      totalIncompleteTasks: number;
      totalCareEvents: number;
    };
    weather: WeatherData;
  };
}

const ARTICLES = [
  { title: "Propagation Tips", image: "https://images.unsplash.com/photo-1581578731523-9372f442250c?auto=format&fit=crop&q=80&w=400" },
  { title: "Low Light Plants", image: "https://images.unsplash.com/photo-1466781783364-39c9c8421e5b?auto=format&fit=crop&q=80&w=400" },
];

export function DashboardClient({ initialData }: DashboardClientProps) {
  const { specimens, loading, isGuest } = useSpecimenData();
  const [selectedSpecimenId, setSelectedSpecimenId] = useState<string | undefined>(undefined);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isInvestorMode, setIsInvestorMode] = useState(false);
  const [filterKingdom, setFilterKingdom] = useState<string>("All");

  const handleList = async (specimen: SpecimenRow) => {
    try {
      // Logic for listing at a fixed tactical price for MVP
      await marketplace.listSpecimen(specimen as never, 500);
      alert(`Asset ${specimen.nickname} liquified on L2 Marketplace! Check Exclusive Drops.`);
    } catch (err) {
       alert(err instanceof Error ? err.message : "Ranking failed.");
    }
  };

  const filteredSpecimens = specimens.filter((p: SpecimenRow) => 
    filterKingdom === "All" || p.kingdom === filterKingdom
  );

  const selectedSpecimen = filteredSpecimens.find((p: SpecimenRow) => p.id === selectedSpecimenId) || filteredSpecimens[0] || specimens[0];

  return (
    <div className="flex min-h-screen bg-brand-cream font-sans selection:bg-brand-green/10">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-brand-dark/40 backdrop-blur-sm z-40 transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      
      <main className="flex-1 lg:ml-64 p-4 md:p-8 overflow-y-auto w-full">
        <DashboardHeader onMenuClick={() => setIsSidebarOpen(true)} />

        {/* Investor Mode Toggle */}
        <div className="flex items-center justify-between mb-8 p-1 bg-slate-100 rounded-2xl w-fit border border-slate-200 shadow-inner">
          <button 
            onClick={() => setIsInvestorMode(false)}
            className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${!isInvestorMode ? 'bg-white text-brand-dark shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Operational
          </button>
          <button 
            onClick={() => setIsInvestorMode(true)}
            className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${isInvestorMode ? 'bg-brand-dark text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Investor Mode
          </button>
        </div>

        {isInvestorMode ? (
          <InvestorView specimens={specimens} />
        ) : (
          <>
            {/* Predictive Climate Intelligence */}
            <WeatherBanner weather={initialData.weather} />

            {/* Stats Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-12">
              <StatCard 
                icon={Droplets} 
                label="Watering Needed" 
                value={isGuest ? 0 : initialData.summary.totalIncompleteTasks} 
                subLabel="Specimens" 
                iconBg="bg-emerald-50" 
                iconColor="text-emerald-600" 
              />
              <StatCard 
                icon={Calendar} 
                label="New Tasks" 
                value={initialData.weather.impact !== "Optimal Growth" ? initialData.summary.totalIncompleteTasks + 2 : initialData.summary.totalIncompleteTasks} 
                subLabel={initialData.weather.impact !== "Optimal Growth" ? "Weather Alerts" : "Task"} 
                iconBg="bg-amber-50" 
                iconColor="text-amber-600" 
              />
              <StatCard 
                icon={Waves} 
                label="Humidity Level" 
                value={`${initialData.weather.humidity}%`} 
                subLabel={initialData.weather.humidity > 40 ? "Good" : "Dry"} 
                iconBg="bg-blue-50" 
                iconColor="text-blue-600" 
              />
            </div>

            {/* Marketplace Highlight */}
            <section className="mb-8 md:mb-12">
              <div className="flex items-center justify-between mb-4 md:mb-6">
                <h2 className="text-xl md:text-2xl font-black text-brand-dark">Exclusive Drops</h2>
                <div className="h-px flex-1 mx-4 md:mx-6 bg-brand-dark/10" />
              </div>
              <MarketplacePreview specimen={selectedSpecimen} />
            </section>

            {/* Sovereign Settlement Feed (Phase 8.0) */}
            <section className="mb-8 md:mb-12">
              <SovereignSettlement />
            </section>
          </>
        )}

        {/* Specimen Overview Section */}
        <section className="mb-8 md:mb-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 md:mb-6 gap-4">
            <h2 className="text-xl md:text-2xl font-black text-brand-dark shrink-0">Specimen Overview</h2>
            <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
              {["All", "Plantae", "Fungi", "Animalia"].map((k) => (
                <button
                  key={k}
                  onClick={() => setFilterKingdom(k)}
                  className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border-2 ${
                    filterKingdom === k 
                      ? "bg-brand-dark text-white border-brand-dark shadow-md" 
                      : "bg-white text-brand-dark/40 border-slate-100 hover:border-brand-dark/20"
                  }`}
                >
                  {k === "Plantae" ? "Botanical" : k === "Fungi" ? "Mycology" : k}
                </button>
              ))}
            </div>
          </div>
          <div className="h-px w-full bg-brand-dark/10 mb-6" />
          
          {loading ? (
            <div className="flex items-center justify-center p-8 md:p-12 bg-white rounded-[1.5rem] md:rounded-[2rem] border border-brand-dark/5 shadow-sm">
              <Loader2 className="w-6 h-6 md:w-8 md:h-8 text-brand-green animate-spin" />
              <span className="ml-3 font-bold text-brand-dark/40 text-sm md:text-base">Syncing specimens...</span>
            </div>
          ) : filteredSpecimens.length > 0 ? (
            <div className="flex gap-4 md:gap-6 overflow-x-auto pb-4 no-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
              {filteredSpecimens.map((specimen) => (
                <SpecimenSummaryCard 
                  key={specimen.id}
                  id={specimen.id}
                  nickname={specimen.nickname}
                  species_name={specimen.species_name}
                  kingdom={specimen.kingdom as "Plantae" | "Fungi" | "Animalia" | "Other"}
                  isActive={selectedSpecimenId === specimen.id}
                  onClick={() => setSelectedSpecimenId(specimen.id)}
                  onList={() => handleList(specimen)}
                />
              ))}
            </div>
          ) : (
            <div className="p-8 md:p-12 text-center bg-white rounded-[1.5rem] md:rounded-[2rem] border border-dashed border-brand-dark/20">
              <p className="text-brand-dark/40 font-bold mb-4 text-sm md:text-base">No specimens found. {isGuest ? "Add your first one below!" : ""}</p>
              {isGuest && (
                <button className="px-6 py-2 bg-brand-green text-white rounded-xl font-bold hover:bg-brand-green-dark transition-all">
                  Add Specimen
                </button>
              )}
            </div>
          )}
        </section>

        {/* Institutional ROI Analytics */}
        <section className="mb-8 md:mb-12">
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <h2 className="text-xl md:text-2xl font-black text-brand-dark text-wrap">Institutional Dashboard</h2>
            <div className="h-px flex-1 mx-4 md:mx-6 bg-brand-dark/10" />
          </div>
          <AnalyticsHub />
        </section>

        {/* Tips & Articles Section */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <h2 className="text-xl md:text-2xl font-black text-brand-dark">Tips & Articles</h2>
            <div className="h-px flex-1 mx-4 md:mx-6 bg-brand-dark/10" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {ARTICLES.map((article) => (
              <ArticleCard key={article.title} title={article.title} image_url={article.image} />
            ))}
          </div>
        </section>
      </main>

      {/* Right Sidebar Inspector - Sticky on Desktop, hidden on Mobile */}
      <div className="hidden xl:flex p-4 pr-6 items-start sticky top-0 h-screen w-[400px]">
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
      <AskConcierge />
    </div>
  );
}
