"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addSpecimenEvent } from "@/app/actions/specimen-events";
import { hardwareSecurity } from "@/lib/services/hardware-security";
import { toast } from "sonner";
import type { CareEventType } from "@/types/database";
import { 
  Droplets, 
  Leaf, 
  Scissors, 
  Repeat, 
  Shield, 
  ShieldCheck, 
  Fingerprint, 
  AlertTriangle,
  Lock,
  Unlock
} from "lucide-react";

import { LucideIcon } from "lucide-react";

interface LogCareEventProps {
  specimenId: string;
}

const CARE_EVENTS: { type: CareEventType; label: string; emoji: string; icon: LucideIcon }[] = [
  { type: "watered", label: "Water", emoji: "💧", icon: Droplets },
  { type: "fertilized", label: "Fertilize", emoji: "🌱", icon: Leaf },
  { type: "pruned", label: "Prune", emoji: "✂️", icon: Scissors },
  { type: "repotted", label: "Repot", emoji: "🪴", icon: Repeat },
];

export function LogCareEvent({ specimenId }: LogCareEventProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [selectedType, setSelectedType] = useState<CareEventType | null>(null);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSecureArmed, setIsSecureArmed] = useState(hardwareSecurity.isEnrolled());

  const handleEnroll = async () => {
    setIsEnrolling(true);
    try {
      toast.loading("Enrolling device in TEE Swarm...", { id: "enroll" });
      await hardwareSecurity.enrollDevice("CURRENT_USER"); // Simulated user
      setIsSecureArmed(true);
      toast.success("Hardware Provenance Activated", { id: "enroll" });
    } catch {
      toast.error("Enrollment failed");
    } finally {
      setIsEnrolling(false);
    }
  };

  const handleQuickLog = (type: CareEventType) => {
    setError(null);
    setSuccess(null);

    startTransition(async () => {
      let signatureData = {};
      
      if (isSecureArmed) {
        try {
          toast.loading("Communicating with Secure Enclave...", { id: "sec-sign" });
          signatureData = await hardwareSecurity.signWithHardware({ 
            specimen_id: specimenId, 
            event_type: type, 
            timestamp: new Date().toISOString() 
          });
          toast.success("Vital sign cryptographically anchored", { id: "sec-sign" });
        } catch {
          toast.error("Security Enclave rejected request. Reverting to standard log.", { id: "sec-sign" });
        }
      }

      const result = await addSpecimenEvent(specimenId, {
        event_type: type,
        ...signatureData
      });

      if (result.success) {
        const eventLabel = CARE_EVENTS.find((e) => e.type === type)?.label || type;
        setSuccess(`${eventLabel} logged!`);
        setTimeout(() => setSuccess(null), 2000);
        router.refresh();
      } else {
        setError(result.error || "Failed to log care event.");
      }
    });
  };

  const handleLogWithNotes = () => {
    if (!selectedType) return;

    setError(null);
    startTransition(async () => {
      let signatureData = {};
      
      if (isSecureArmed) {
        try {
          toast.loading("TEE-Biometric prompt active...", { id: "sec-sign" });
          signatureData = await hardwareSecurity.signWithHardware({ 
            specimen_id: specimenId, 
            event_type: selectedType, 
            notes: notes.trim(),
            timestamp: new Date().toISOString() 
          });
          toast.success("Hardware Attestation Sealed", { id: "sec-sign" });
        } catch {
          toast.error("Hardware signing bypassed.", { id: "sec-sign" });
        }
      }

      const result = await addSpecimenEvent(specimenId, {
        event_type: selectedType,
        notes: notes.trim() || undefined,
        ...signatureData
      });

      if (result.success) {
        setShowNotes(false);
        setSelectedType(null);
        setNotes("");
        const eventLabel = CARE_EVENTS.find((e) => e.type === selectedType)?.label || selectedType;
        setSuccess(`${eventLabel} logged!`);
        setTimeout(() => setSuccess(null), 2000);
        router.refresh();
      } else {
        setError(result.error || "Failed to log care event.");
      }
    });
  };

  const openNotesModal = (type: CareEventType) => {
    setSelectedType(type);
    setNotes("");
    setShowNotes(true);
    setError(null);
  };

  return (
    <div className="space-y-4">
      {/* Tactical Security Status */}
      <div className={`p-4 rounded-2xl border transition-all ${isSecureArmed ? 'bg-brand-green/5 border-brand-green/20' : 'bg-brand-pink-dark/5 border-brand-pink-dark/20'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${isSecureArmed ? 'bg-brand-green/20 text-brand-green' : 'bg-brand-pink-dark/20 text-brand-pink-dark'}`}>
              {isSecureArmed ? <ShieldCheck className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
            </div>
            <div>
              <h4 className="text-[11px] font-black text-white uppercase tracking-widest leading-none mb-1">Secure Enclave</h4>
              <p className="text-[9px] font-black uppercase tracking-tighter opacity-40">
                {isSecureArmed ? 'Hardware Provenance: ENFORCED' : 'Hardware Provenance: INACTIVE'}
              </p>
            </div>
          </div>
          
          {hardwareSecurity.isEnrolled() ? (
            <button 
              onClick={() => setIsSecureArmed(!isSecureArmed)}
              className={`p-2 rounded-lg transition-all ${isSecureArmed ? 'bg-brand-green text-black' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}
              title={isSecureArmed ? "Disarm Hardware Protocol" : "Arm Hardware Protocol"}
            >
              {isSecureArmed ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
            </button>
          ) : (
            <button 
              onClick={handleEnroll}
              disabled={isEnrolling}
              className="px-3 py-1.5 bg-brand-green/10 hover:bg-brand-green/20 text-brand-green border border-brand-green/30 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2"
            >
              {isEnrolling ? (
                <div className="w-2.5 h-2.5 border-2 border-brand-green border-t-transparent rounded-full animate-spin" />
              ) : (
                <Fingerprint className="w-3 h-3" />
              )}
              {isEnrolling ? 'ENROLLING...' : 'Enroll Device'}
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h3 className="text-[11px] font-black text-white/40 uppercase tracking-widest">Protocol Logger</h3>
        {success && (
          <span className="flex items-center gap-2 text-[10px] font-black text-brand-green uppercase tracking-widest animate-in fade-in slide-in-from-right duration-300">
            <div className="w-1.5 h-1.5 bg-brand-green rounded-full animate-pulse" />
            {success}
          </span>
        )}
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 animate-in shake duration-500">
           <AlertTriangle className="w-4 h-4 text-red-500" />
           <span className="text-[10px] font-black text-red-400 uppercase tracking-tight">{error}</span>
        </div>
      )}

      {/* Quick action buttons */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {CARE_EVENTS.map((event) => (
          <div key={event.type} className="flex flex-col gap-2">
            <button
              onClick={() => handleQuickLog(event.type)}
              disabled={isPending}
              className="flex flex-col items-center justify-center gap-2 aspect-square rounded-2xl border border-white/5 bg-white/5 p-3 text-center transition-all hover:border-brand-green/40 hover:bg-brand-green/5 disabled:opacity-40 group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                 <div className="w-1.5 h-1.5 rounded-full bg-brand-green" />
              </div>
              <event.icon className="w-6 h-6 text-white/30 group-hover:text-brand-green transition-colors" />
              <span className="text-[10px] font-black text-white/50 uppercase tracking-widest group-hover:text-white transition-colors">
                {event.label}
              </span>
            </button>
            <button
              onClick={() => openNotesModal(event.type)}
              disabled={isPending}
              className="py-1 text-[8px] font-black text-white/20 hover:text-brand-green uppercase tracking-widest transition-colors"
            >
              + Add Protocol Note
            </button>
          </div>
        ))}
      </div>

      {/* Notes modal */}
      {showNotes && selectedType && (
        <div className="p-5 rounded-[2rem] border border-white/10 bg-white/5 shadow-2xl animate-in zoom-in duration-300">
          <div className="mb-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-brand-green/10 text-brand-green">
              {(() => {
                const Icon = CARE_EVENTS.find((e) => e.type === selectedType)?.icon;
                return Icon ? <Icon className="w-5 h-5" /> : null;
              })()}
            </div>
            <div>
              <h4 className="text-[12px] font-black text-white uppercase tracking-widest leading-none mb-1">
                {CARE_EVENTS.find((e) => e.type === selectedType)?.label} Update
              </h4>
              <p className="text-[9px] font-black text-white/30 uppercase tracking-tight">Manual Entry Protocol</p>
            </div>
          </div>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Enter technical observations..."
            rows={3}
            className="mb-4 w-full resize-none rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-[11px] font-bold text-white placeholder-white/20 focus:border-brand-green focus:outline-none transition-all"
            disabled={isPending}
          />
          <div className="flex items-center gap-3">
            <button
              onClick={handleLogWithNotes}
              disabled={isPending}
              className="flex-1 py-3.5 bg-brand-green text-black rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white transition-all shadow-lg flex items-center justify-center gap-2"
            >
              {isPending ? (
                <div className="w-3 h-3 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                <Fingerprint className="w-3 h-3" />
              )}
              {isPending ? "SEALING..." : "Commit Event"}
            </button>
            <button
              onClick={() => setShowNotes(false)}
              disabled={isPending}
              className="px-6 py-3.5 text-white/40 hover:text-white text-[10px] font-black uppercase tracking-widest transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
