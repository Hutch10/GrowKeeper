"use client";

import Image from "next/image";
import { 
  MapPin,
  Sun,
  Droplets, 
  Zap, 
  Waves,
  Leaf,
  ChevronDown,
  Thermometer,
  AlertCircle,
  LucideIcon,
  Bot,
  ShieldCheck,
  FileText,
  Clock,
  TrendingUp,
  Beef,
  Activity,
  Heart
} from "lucide-react";


import { forecasting, ForecastResult } from '@/lib/services/forecasting-engine';
import { riskService, RiskAnalysis } from '@/lib/services/risk-assessment';

import { useState, useEffect } from "react";
import { SpecimenScanner } from "@/components/plants/specimen-scanner";
import { LineageView } from "@/components/plants/lineage-view";
import type { SpecimenRow, PlantSpecimen, FungalSpecimen, AnimaliaSpecimen } from "@/app/actions/types";

interface SpecimenDetailPanelProps {
  className?: string;
  specimen?: SpecimenRow;
  onDelete?: (id: string) => void;
  onEdit?: (specimen: SpecimenRow) => void;
  onClose?: () => void;
}

export function SpecimenDetailPanel({ specimen, className }: SpecimenDetailPanelProps) {
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [forecast, setForecast] = useState<ForecastResult | null>(null);
  const [risk, setRisk] = useState<RiskAnalysis | null>(null);

  useEffect(() => {
    if (specimen) {
      forecasting.predictMilestone(specimen).then(setForecast);
      riskService.assessRisk(specimen).then(setRisk);
    } else {
      setForecast(null);
      setRisk(null);
    }
  }, [specimen]);

  if (!specimen) {
    return (
      <aside className={`w-80 bg-white rounded-[2.5rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col items-center justify-center text-center ${className || ""}`}>
        <div className="w-20 h-20 bg-brand-pink/20 rounded-full flex items-center justify-center mb-4">
          <Leaf className="w-10 h-10 text-brand-pink-dark" />
        </div>
        <h2 className="text-xl font-bold text-brand-dark mb-2">Select a Specimen</h2>
        <p className="text-sm text-brand-dark/40 font-medium">Click on a specimen to see its detailed care guide and reminders.</p>
      </aside>
    );
  }

  const isFungal = specimen.kingdom === "Fungi";
  const isAnimalia = specimen.kingdom === "Animalia";
  const displayImage = specimen.image_url || (isFungal 
    ? `https://images.unsplash.com/photo-1544070282-591d487abc53?q=80&w=400&h=400&auto=format&fit=crop`
    : isAnimalia
      ? `https://images.unsplash.com/photo-1552053831-71594a27632d?q=80&w=400&h=400&auto=format&fit=crop`
      : `https://images.unsplash.com/photo-1545239351-ef056c5983f3?q=80&w=400&h=400&auto=format&fit=crop`);

  return (
    <aside className={`w-96 bg-white rounded-[2.5rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-y-auto max-h-[calc(100vh-2rem)] border border-white ${className || ""}`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-extrabold text-brand-dark">Specimen Details</h2>
        <button className="text-brand-dark/20 hover:text-brand-dark transition-colors" title="Close">
          <ChevronDown className="w-6 h-6" />
        </button>
      </div>

      <div className="relative w-full aspect-[4/3] rounded-[2rem] overflow-hidden mb-4 shadow-md group">
        <Image src={displayImage} alt={specimen.nickname} fill unoptimized className="object-cover transition-transform duration-700 group-hover:scale-110" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
          <button className="w-full py-2 bg-white/20 backdrop-blur-md rounded-xl text-white text-xs font-black uppercase tracking-widest border border-white/20 hover:bg-white/40 transition-all">
            View Gallery
          </button>
        </div>
      </div>

      <div className="mb-8">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-2xl font-black text-brand-dark mb-1">{specimen.nickname}</h3>
            <p className="text-brand-dark/40 font-bold">{specimen.species_name || "Unknown Species"}</p>
          </div>
          <button 
            onClick={() => setIsScannerOpen(true)}
            className="p-3 bg-gradient-to-br from-emerald-400 to-brand-green rounded-2xl text-white shadow-lg shadow-emerald-200 hover:scale-110 active:scale-95 transition-all group" 
            title="Identify & Diagnose"
          >
            <Zap className="w-5 h-5 fill-current group-hover:animate-pulse" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-2 text-blue-400 mb-1">
                <Clock size={16} />
                <span className="text-xs font-semibold uppercase tracking-wider">Predictive Milestone</span>
              </div>
              <p className="text-lg font-bold text-white">{forecast?.nextMilestone || 'Analyzing...'}</p>
              <p className="text-xs text-white/50">{forecast?.daysToMilestone} days remaining</p>
            </div>

            <div className={`p-4 rounded-xl border ${
              risk?.riskLevel === 'CRITICAL' ? 'bg-red-500/10 border-red-500/20' : 
              risk?.riskLevel === 'HIGH' ? 'bg-orange-500/10 border-orange-500/20' : 
              'bg-white/5 border-white/10'
            }`}>
              <div className={`flex items-center gap-2 mb-1 ${
                risk?.healthOutlook === 'CRITICAL' || risk?.healthOutlook === 'DEGRADING' ? 'text-red-400' : 'text-green-400'
              }`}>
                <TrendingUp size={16} />
                <span className="text-xs font-semibold uppercase tracking-wider">Health Outlook</span>
              </div>
              <p className="text-lg font-bold text-white">{risk?.healthOutlook || 'STABLE'}</p>
              <p className="text-xs text-white/50">{risk?.recommendation}</p>
            </div>
          </div>
        {/* Happiness & Status Indicators */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 bg-slate-50 p-3 rounded-2xl border border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black text-brand-dark/20 uppercase tracking-widest">Happiness</span>
              <span className="text-xs font-black text-brand-green">{specimen.happiness_score || 85}%</span>
            </div>
            <div className="h-1.5 bg-brand-green/10 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-emerald-400 to-brand-green rounded-full transition-all duration-1000 shadow-[0_0_8px_rgba(52,211,153,0.5)]" 
                style={{ width: `${specimen.happiness_score || 85}%` }} 
              />
            </div>
          </div>
          <div className="px-4 py-3 bg-brand-pink/10 rounded-2xl border border-brand-pink/20 flex flex-col items-center justify-center min-w-[80px]">
            <span className="text-[10px] font-black text-brand-pink-dark/40 uppercase tracking-widest mb-1">Status</span>
            <span className="text-xs font-black text-brand-pink-dark">{specimen.health_status || "Thriving"}</span>
          </div>
        </div>

        <div className="space-y-4">
          <DetailRow icon={MapPin} label="Location" value={specimen.location || "Living Room"} color="text-emerald-500" bg="bg-emerald-50" />
          {specimen.kingdom === "Fungi" ? (
            <>
              <DetailRow icon={Zap} label="Substrate" value={(specimen as FungalSpecimen).substrate || "Sawdust"} color="text-amber-500" bg="bg-amber-50" />
              <DetailRow icon={Waves} label="Misting" value={(specimen as FungalSpecimen).misting_schedule || "Daily"} color="text-blue-500" bg="bg-blue-50" />
            </>
          ) : specimen.kingdom === "Plantae" ? (
            <>
              <DetailRow icon={Sun} label="Light" value={(specimen as PlantSpecimen).light || "Bright, Indirect"} color="text-amber-500" bg="bg-amber-50" />
              <DetailRow icon={Droplets} label="Watering" value={(specimen as PlantSpecimen).watering || "Weekly"} color="text-blue-500" bg="bg-blue-50" />
            </>
          ) : specimen.kingdom === "Animalia" ? (
            <>
              <DetailRow icon={Activity} label="Activity" value={`${(specimen as AnimaliaSpecimen).activity_level || 0}% Target`} color="text-emerald-500" bg="bg-emerald-50" />
              <DetailRow icon={Beef} label="Diet" value={(specimen as AnimaliaSpecimen).dietary_notes || "Balanced Diet"} color="text-rose-500" bg="bg-rose-50" />
            </>
          ) : null}
          <DetailRow icon={Zap} label="Nourishment" value={specimen.fertilizer || "As needed"} color="text-orange-500" bg="bg-orange-50" />
        </div>

        {/* Ask Concierge Quick Action */}
        <button 
          className="w-full mt-6 py-4 bg-brand-dark/5 hover:bg-brand-green/10 border border-brand-dark/5 hover:border-brand-green/20 rounded-[1.5rem] flex items-center justify-center gap-3 transition-all group"
          onClick={() => {
            // Logic to open concierge with this specimen context would go here
            // For now, we'll just alert that the concierge is ready
            alert(`Concierge is analyzing ${specimen.nickname}. Ask anything!`);
          }}
        >
          <Bot className="w-5 h-5 text-brand-green group-hover:scale-110 transition-transform" />
          <span className="text-xs font-black text-brand-dark uppercase tracking-widest">Ask Botanical Concierge</span>
        </button>
      </div>

      {/* IoT Vitals Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-extrabold text-brand-dark">Live Vitals</h4>
          <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-100 rounded-full">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-tighter">Connected</span>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <VitalCard icon={isAnimalia ? Activity : isFungal ? Waves : Droplets} label={isAnimalia ? "Activity" : isFungal ? "Humidity" : "Soil"} value={isAnimalia ? `${specimen.activity_level || 0}%` : `${specimen.moisture_level || 58}%`} color="text-blue-500" />
          <VitalCard icon={isAnimalia ? Heart : Sun} label={isAnimalia ? "Heart Rate" : "Light"} value={isAnimalia ? `${specimen.heart_rate || 70} BPM` : `${specimen.light_level || 7} UV`} color="text-amber-500" />
          <VitalCard icon={Thermometer} label="Temp" value={`${specimen.temp_c || 22}°C`} color="text-brand-pink-dark" />
        </div>
      </div>

      {/* Smart Home Alerts */}
      {specimen.moisture_level && specimen.moisture_level < 45 && (
        <div className="mb-8 p-4 bg-amber-50 rounded-[2rem] border border-amber-100 flex items-start gap-4 animate-in slide-in-from-bottom duration-500">
          <div className="p-2 bg-amber-500 rounded-xl text-white shadow-lg shadow-amber-200">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <h5 className="text-sm font-black text-amber-900 mb-0.5">Smart Home Alert</h5>
            <p className="text-[11px] font-bold text-amber-700/80 leading-relaxed">
              Critical {isFungal ? "humidity" : "moisture"} drop detected. Automated irrigation reservoir is low. Please refill.
            </p>
          </div>
        </div>
      )}

      <div className="mb-8">
        <h4 className="text-lg font-extrabold text-brand-dark mb-4">Institutional Provenance</h4>
        <div className="space-y-3">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="flex items-center gap-3 mb-3">
              <ShieldCheck className={`w-5 h-5 ${specimen.lastVitalSignature || specimen.hardware_attestation_statement ? 'text-emerald-500' : 'text-slate-300'}`} />
              <span className="text-xs font-black text-brand-dark uppercase tracking-widest">
                {specimen.hardware_attestation_statement ? 'Hardware Enclave Verified' : specimen.lastVitalSignature ? 'Proof-of-Care Verified' : 'Unsigned Record'}
              </span>
            </div>
            {(specimen.lastVitalSignature || specimen.hardware_attestation_statement) && (
              <code className="block p-2 bg-white rounded-lg text-[10px] text-brand-dark/40 font-mono truncate">
                {specimen.hardware_attestation_statement || specimen.lastVitalSignature}
              </code>
            )}
            
            <div className="mt-4 pt-4 border-t border-slate-200/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-brand-dark/20" />
                  <span className="text-[10px] font-black text-brand-dark/40 uppercase">Regulatory Status</span>
                </div>
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-black ${specimen.complianceStatus && specimen.complianceStatus !== 'none' ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}>
                  {specimen.complianceStatus && specimen.complianceStatus !== 'none' ? `CITES APP ${specimen.complianceStatus}` : 'GLOBAL CLEARANCE'}
                </span>
              </div>
            </div>

            {/* Institutional Co-sign Action */}
            {!specimen.custodian_id && (
              <button 
                className="w-full mt-4 py-2.5 bg-brand-dark text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-brand-green transition-all shadow-lg"
                onClick={() => alert("Requesting Institutional Co-sign from NGO/Regulator Swarm...")}
              >
                Request Institutional Co-sign
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="mb-8">
        <h4 className="text-lg font-extrabold text-brand-dark mb-4">Care Reminders</h4>
        <div className="space-y-3">
          <ReminderItem icon={isAnimalia ? Beef : isFungal ? Waves : Droplets} label={isAnimalia ? "Feeding in 4h" : isFungal ? "Mist in 2 Days" : "Water in 2 Days"} color="bg-blue-500" />
          <ReminderItem icon={Zap} label={isAnimalia ? "Vitamins: Daily" : isFungal ? "Supplement: 10 Days" : "Fertilizing: 10 Days"} color="bg-orange-500" />
          <ReminderItem icon={isAnimalia ? Activity : isFungal ? Thermometer : Waves} label={isAnimalia ? "Walk: Scheduled" : isFungal ? "Temp: Stable" : "Moisture: Moist"} color="bg-emerald-500" />
        </div>
      </div>

      <div className="mb-8">
        <LineageView specimenName={specimen.nickname} />
      </div>

      <SpecimenScanner 
        isOpen={isScannerOpen} 
        onClose={() => setIsScannerOpen(false)} 
        specimenImageUrl={specimen.image_url} 
        specimenNickname={specimen.nickname} 
        kingdom={specimen.kingdom}
      />
    </aside>
  );
}

function DetailRow({ icon: Icon, label, value, color, bg }: { icon: LucideIcon, label: string, value: string, color: string, bg: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className={`p-1.5 rounded-lg ${bg} ${color}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 flex items-center justify-between">
        <span className="text-sm font-bold text-brand-dark/40">{label} :</span>
        <span className="text-sm font-bold text-brand-dark">{value}</span>
      </div>
    </div>
  );
}

function ReminderItem({ icon: Icon, label, color }: { icon: LucideIcon, label: string, color: string }) {
  return (
    <div className="flex items-center justify-between p-3 rounded-2xl bg-white border border-brand-dark/5 hover:border-brand-green/20 transition-all cursor-pointer group">
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded-full ${color} flex items-center justify-center text-white`}>
          <Icon className="w-4 h-4" />
        </div>
        <span className="text-sm font-extrabold text-brand-dark/80 group-hover:text-brand-green transition-colors">{label}</span>
      </div>
      <div className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center">
         <div className="w-2 h-2 rounded-full bg-slate-400" />
      </div>
    </div>
  );
}

function VitalCard({ icon: Icon, label, value, color }: { icon: LucideIcon, label: string, value: string, color: string }) {
  return (
    <div className="bg-white border border-slate-100 p-3 rounded-2xl flex flex-col items-center justify-center text-center shadow-sm hover:shadow-md transition-shadow">
      <Icon className={`w-5 h-5 ${color} mb-1`} />
      <span className="text-[10px] font-black text-brand-dark/20 uppercase tracking-tighter mb-0.5">{label}</span>
      <span className="text-sm font-black text-brand-dark">{value}</span>
    </div>
  );
}
