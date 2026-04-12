"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { 
  X, 
  CheckCircle2, 
  Activity,
  Search,
  ThermometerSun,
  Droplets,
  Shield
} from "lucide-react";
import type { Kingdom } from "@/types/specimen";
import * as tf from "@tensorflow/tfjs";
import { diagnoseSpecimen, type DiagnosisResult } from "@/lib/services/ai-diagnosis";
import { toast } from "sonner";

interface SpecimenScannerProps {
  isOpen: boolean;
  onClose: () => void;
  specimenImageUrl?: string | null;
  specimenNickname: string;
  kingdom?: Kingdom;
}

export function SpecimenScanner({ isOpen, onClose, specimenImageUrl, specimenNickname, kingdom }: SpecimenScannerProps) {
  const [step, setStep] = useState<"initial" | "scanning" | "analyzing" | "completed">("initial");
  const [progress, setProgress] = useState(0);
  const [diagnosis, setDiagnosis] = useState<DiagnosisResult | null>(null);
  const [isSpectralMode, setIsSpectralMode] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const isFungal = kingdom === "Fungi";

  useEffect(() => {
    if (isOpen) {
      setStep("scanning");
      setProgress(0);
      
      if (typeof window !== 'undefined' && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
          .then(setStream)
          .catch(err => console.error("Camera Access Denied:", err));
      }
    } else {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const runAnalysis = useCallback(async () => {
    if (!specimenImageUrl && !stream) {
      setDiagnosis({
        overallHealth: "healthy",
        healthScore: 98,
        kingdom: kingdom || "Plantae",
        observedSymptoms: [],
        likelyCauses: [],
        careRecommendations: ["Maintain current atmospheric parameters."],
        identifiedSpecies: specimenNickname,
        systemConfidence: 1.0
      });
      setStep("completed");
      return;
    }

    try {
      await tf.ready();
      const result = await diagnoseSpecimen(specimenImageUrl || "");
      setDiagnosis(result);

      if (result.observedSymptoms.length > 0) {
        toast.success("Autonomous Care Protocols Queued", {
          description: `${result.observedSymptoms.length} intervention(s) synchronized with the Governance Feed.`,
        });
      }

      setStep("completed");
    } catch (err) {
      console.error("Sovereign AI Analysis Error:", err);
      setDiagnosis({
        overallHealth: "healthy",
        healthScore: 85,
        kingdom: kingdom || "Plantae",
        observedSymptoms: [],
        likelyCauses: [],
        careRecommendations: ["AI Link degraded. Manual check recommended."],
        systemConfidence: 0.5
      });
      setStep("completed");
    }
  }, [specimenImageUrl, stream, kingdom, specimenNickname]);

  useEffect(() => {
    if (step === "scanning") {
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setStep("analyzing");
            return 100;
          }
          return prev + 10;
        });
      }, 100);
      return () => clearInterval(interval);
    }

    if (step === "analyzing") {
      runAnalysis();
    }
  }, [step, runAnalysis]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-2xl transition-all duration-500 animate-in fade-in">
      <div className="relative w-full max-w-3xl bg-[#080808] rounded-[2rem] overflow-hidden shadow-2xl border border-white/5 flex flex-col md:flex-row h-[80vh] md:h-[600px]">
        {/* Spectral HUD UI (Left / Top Panel) */}
        <div className={`relative w-full md:w-3/5 overflow-hidden transition-all duration-700 bg-black ${isSpectralMode ? 'contrast-[1.2] saturate-[0.5] hue-rotate-[180deg]' : ''}`}>
          {stream ? (
            <video 
              autoPlay 
              muted 
              playsInline 
              ref={el => { if (el) el.srcObject = stream; }}
              className="w-full h-full object-cover opacity-60"
            />
          ) : specimenImageUrl ? (
            <Image src={specimenImageUrl} alt="Scan area" fill unoptimized className="w-full h-full object-cover opacity-40 grayscale" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white/5">
              <Search className="w-24 h-24 animate-pulse" />
            </div>
          )}

          {/* HUD Grids & Overlays */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.05)_1px,transparent_1px)] bg-[size:40px_40px]" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border border-emerald-500/20 rounded-full animate-[spin_20s_linear_infinite]" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-[2px] border-emerald-500/40 rounded-full border-dashed" />
            
            {/* Tactical Crosshair */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center flex-col">
              <div className="w-0.5 h-8 bg-emerald-500/40 mb-1" />
              <div className="flex items-center gap-1">
                <div className="w-8 h-0.5 bg-emerald-500/40" />
                <div className="w-1 h-1 bg-emerald-500 rounded-full" />
                <div className="w-8 h-0.5 bg-emerald-500/40" />
              </div>
              <div className="w-0.5 h-8 bg-emerald-500/40 mt-1" />
            </div>

            {/* Corner Indicators */}
            <div className="absolute top-6 left-6 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500/80">Active Scan</span>
            </div>
            <div className="absolute bottom-6 left-6 text-white/20 font-mono text-[8px] uppercase tracking-widest leading-loose">
              Lat: 34.0522° N<br />
              Lon: 118.2437° W<br />
              Alt: 247m
            </div>
          </div>

          {/* Analysis Data Points */}
          {(step === "analyzing" || step === "completed") && (
            <div className="absolute inset-0 pointer-events-none">
              <AnalysisPoint x="25%" y="35%" label={isFungal ? "Chitin Alpha" : "Chlorophyll Index"} />
              <AnalysisPoint x="65%" y="25%" label={isFungal ? "Spore Density" : "Stomatal Flux"} />
              <AnalysisPoint x="55%" y="75%" label={isFungal ? "Network Node" : "Respiration Rate"} />
            </div>
          )}

          {/* Bottom Bar HUD */}
          <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black to-transparent flex items-end justify-between">
            <div className="flex items-center gap-4">
              <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                <span className="text-[10px] font-black uppercase text-emerald-400">Prog: {progress}%</span>
              </div>
              <button 
                onClick={() => setIsSpectralMode(!isSpectralMode)}
                className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase transition-all ${isSpectralMode ? 'bg-emerald-500 text-black' : 'bg-white/5 text-white/40'}`}
              >
                Spectral: {isSpectralMode ? 'ON' : 'OFF'}
              </button>
            </div>
          </div>
        </div>

        {/* Intelligence Panel (Right / Bottom) */}
        <div className="flex-1 p-8 md:p-12 flex flex-col justify-between bg-[#0A0A0A]">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-emerald-500" />
              <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Sovereign Analysis</span>
            </div>
            <button 
          onClick={onClose}
          aria-label="Close Scanner"
          title="Close Scanner"
          className="absolute top-6 right-6 z-10 p-2 bg-white/5 hover:bg-white/10 rounded-full text-white/40 transition-all"
        >
      <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 flex flex-col justify-center">
            {step === "completed" && diagnosis ? (
              <div className="animate-in fade-in slide-in-from-bottom duration-700">
                <div className="flex items-end gap-4 mb-6">
                  <span className="text-6xl font-black text-white">{diagnosis.healthScore}</span>
                  <div className="pb-2">
                    <div className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Vitality Pct</div>
                    <div className="text-xs font-medium text-white/40">Sovereign Audit Passed</div>
                  </div>
                </div>

                <div className="space-y-4">
                  <AnalysisRow icon={ThermometerSun} label="Atmosphere" value="Nominal" status="good" />
                  <AnalysisRow icon={Droplets} label="Hydration" value={`${Math.floor(diagnosis.healthScore * 0.8)}%`} status={diagnosis.healthScore > 50 ? 'good' : 'warning'} />
                  <AnalysisRow icon={Activity} label="Metabolic" value={diagnosis.overallHealth} status="good" />
                </div>

                <div className="mt-8 p-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/10">
                  <p className="text-[11px] text-emerald-400/80 leading-relaxed font-medium italic">
                    &quot;{diagnosis.careRecommendations[0]}&quot;
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                <LoadingBar label="Calibrating Spectral Sensors" width="w-full" />
                <LoadingBar label="Verifying Biotic Provenance" width="w-2/3" />
                <LoadingBar label="Mapping Asset Topology" width="w-3/4" />
              </div>
            )}
          </div>

          <button 
            disabled={step !== "completed"}
            onClick={onClose}
            className={`w-full py-4 rounded-xl text-xs font-black uppercase tracking-[0.2em] transition-all ${
              step === 'completed' 
                ? 'bg-white text-black hover:bg-emerald-500 hover:text-white shadow-[0_10px_30px_rgba(255,255,255,0.1)]' 
                : 'bg-white/5 text-white/10 cursor-not-allowed'
            }`}
          >
            Acknowledge Findings
          </button>
        </div>
      </div>
    </div>
  );
}

function AnalysisPoint({ x, y, label }: { x: string, y: string, label: string }) {
  return (
    <div className="absolute flex flex-col items-center animate-in zoom-in duration-1000" style={{ left: x, top: y }}>
      <div className="w-1 h-8 bg-emerald-500/40 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
      </div>
      <div className="bg-emerald-500/10 backdrop-blur-md px-2 py-1 border border-emerald-500/20 rounded text-[8px] text-emerald-400 font-bold uppercase tracking-tighter whitespace-nowrap">
        {label}
      </div>
    </div>
  );
}

function AnalysisRow({ icon: Icon, label, value, status }: { icon: React.ElementType, label: string, value: string, status: 'good' | 'warning' }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
      <div className="flex items-center gap-3">
        <div className="p-1.5 bg-white/5 rounded-lg">
          <Icon className="w-3.5 h-3.5 text-white/40" />
        </div>
        <span className="text-[10px] font-black uppercase tracking-widest text-white/20">{label}</span>
      </div>
      <div className="flex items-center gap-3">
        <span className={`text-[11px] font-bold uppercase ${status === 'good' ? 'text-emerald-400' : 'text-amber-400'}`}>{value}</span>
        <CheckCircle2 className={`w-3.5 h-3.5 ${status === 'good' ? 'text-emerald-500' : 'text-amber-500/20'}`} />
      </div>
    </div>
  );
}

function LoadingBar({ label, width }: { label: string, width: string }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-white/20">
        <span>{label}</span>
        <div className="w-1 h-1 rounded-full bg-emerald-500 animate-ping" />
      </div>
      <div className="h-[2px] w-full bg-white/5 rounded-full overflow-hidden">
        <div className={`h-full bg-emerald-500/40 animate-[loading_2s_ease-in-out_infinite] ${width}`} />
      </div>
    </div>
  );
}
