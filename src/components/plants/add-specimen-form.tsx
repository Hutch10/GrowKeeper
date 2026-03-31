"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Camera, 
  Leaf, 
  Droplets, 
  MapPin, 
  Sun, 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  Waves, 
  Flower2, 
  Heart, 
  ShieldCheck, 
  Activity,
  X
} from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import { useSpecimenData } from "@/hooks/use-specimen-data";
import { useSyncMutation } from "@/hooks/use-mutation";

const STEPS = [
  { id: "kingdom", title: "Kingdom", icon: Leaf },
  { id: "identity", title: "Identity", icon: Camera },
  { id: "care", title: "Care Guide", icon: Droplets },
  { id: "location", title: "Location", icon: MapPin },
  { id: "confirm", title: "Confirm", icon: Check },
];

const ROOM_OPTIONS = [
  "Living Room", "Bedroom", "Kitchen", "Office", "Bathroom", "Balcony", "Garden", "Other"
];

const LIGHT_OPTIONS = [
  "Low Light", "Moderate Light", "Bright, Indirect", "Direct Sunlight"
];

const WATERING_OPTIONS = [
  "Daily", "Twice a week", "Weekly", "Every 2 weeks", "Monthly"
];

interface AddSpecimenFormProps {
  isOpen?: boolean;
  onClose?: () => void;
}

/**
 * GrowKeeper Specimen Onboarding Wizard (Phase 10)
 * Refined for Industrial Intelligence standards with multi-phase transitions.
 */
export function AddSpecimenForm({ isOpen, onClose }: AddSpecimenFormProps) {
  const router = useRouter();
  const { addSpecimen } = useSpecimenData();
  const { mutate: performAdd, isPending } = useSyncMutation(addSpecimen);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);

  // Form State
  const [kingdom, setKingdom] = useState<"Plantae" | "Fungi" | "Animalia">("Plantae");
  const [nickname, setNickname] = useState("");
  const [speciesName, setSpeciesName] = useState("");
  const [notes, setNotes] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Care fields (shared or kingdom-specific)
  const [watering, setWatering] = useState(""); 
  const [light, setLight] = useState(""); 
  const [fertilizer, setFertilizer] = useState(""); 
  const [substrate, setSubstrate] = useState(""); 
  
  // Animalia specific
  const [heartRate, setHeartRate] = useState<number | "">(""); 
  const [activityLevel, setActivityLevel] = useState<number | "">("");
  const [dietaryNotes, setDietaryNotes] = useState("");

  const [location, setLocation] = useState("Living Room");
  const [lat, setLat] = useState<number | null>(null);
  const [lon, setLon] = useState<number | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  if (isOpen === false) return null;

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const captureLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser.");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLat(position.coords.latitude);
        setLon(position.coords.longitude);
        setIsLocating(false);
        toast.success("Coordinates anchored to specimen.");
      },
      (error) => {
        setIsLocating(false);
        console.error("Error capturing location:", error);
        toast.error("Failed to capture GPS coordinates.");
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  };

  const handleNext = () => {
    if (currentStep === 1 && !nickname.trim()) {
      setError("Please give your specimen a nickname.");
      return;
    }
    setError(null);
    if (currentStep < STEPS.length - 1) setCurrentStep((s) => s + 1);
  };

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep((s) => s - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname.trim()) {
      setError("Nickname is required.");
      return;
    }

    const data: Record<string, string | number | null> = {
      nickname: nickname.trim(),
      species_name: speciesName.trim(),
      notes: notes.trim(),
      location,
      kingdom,
    };

    if (kingdom === "Plantae") {
      data.light = light;
      data.watering = watering;
    } else if (kingdom === "Fungi") {
      data.substrate = substrate;
      data.misting_schedule = watering;
    } else if (kingdom === "Animalia") {
      if (heartRate !== "") data.heart_rate = heartRate;
      if (activityLevel !== "") data.activity_level = activityLevel;
      data.dietary_notes = dietaryNotes.trim();
    }
    
    if (lat !== null) data.lat = lat;
    if (lon !== null) data.lon = lon;

    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formData.append(key, String(value));
        }
      });

      if (image) formData.append("file", image);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await performAdd(formData as any);

      if (result.success) {
        toast.success("Specimen successfully anchored to the Sovereign Registry.");
        onClose?.();
        router.refresh();
      } else {
        setError(result.error || "Failed to add specimen.");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
    }
  };

  const renderStep = () => {
    switch (STEPS[currentStep].id) {
      case "kingdom":
        return (
          <div className="space-y-12 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="text-center space-y-4">
              <h3 className="text-5xl font-black text-slate-800 dark:text-white tracking-tighter uppercase mb-2">Choose Your Path</h3>
              <p className="text-xl font-bold text-slate-400 dark:text-white/20">Select the kingdom of your new specimen.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { id: "Plantae", title: "Botanical", desc: "Plants & Flowers", icon: Leaf, color: "bg-emerald-500 text-black", border: "border-emerald-500/20" },
                { id: "Fungi", title: "Mycology", desc: "Mushrooms & Fungi", icon: Flower2, color: "bg-amber-400 text-black", border: "border-amber-400/20" },
                { id: "Animalia", title: "Animalia", desc: "Fauna & Wildlife", icon: Heart, color: "bg-rose-400 text-black", border: "border-rose-400/20" }
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => { setKingdom(item.id as any); handleNext(); }}
                  className={`relative p-12 rounded-[3.5rem] border-2 transition-all flex flex-col items-center gap-6 group overflow-hidden ${
                    kingdom === item.id 
                      ? `${item.border} bg-white dark:bg-white/5 scale-105 shadow-2xl shadow-emerald-500/10` 
                      : "border-transparent bg-slate-50 dark:bg-white/[0.02] hover:scale-102 hover:bg-white dark:hover:bg-white/5"
                  }`}
                >
                  <div className={`p-8 rounded-[2.5rem] transition-all duration-500 ${kingdom === item.id ? item.color : "bg-slate-200 dark:bg-white/5 text-slate-400 dark:text-white/20 group-hover:scale-110"}`}>
                    <item.icon className="w-12 h-12" />
                  </div>
                  <div className="text-center">
                    <span className="block font-black text-2xl text-slate-800 dark:text-white uppercase tracking-tighter mb-1">{item.title}</span>
                    <span className="text-[10px] font-black text-slate-400 dark:text-white/20 uppercase tracking-[0.2em]">{item.desc}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        );

      case "identity":
        return (
          <div className="space-y-12 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="flex flex-col items-center gap-8">
              <div className="relative group" title="Specimen Portrait">
                <div className={`w-56 h-56 rounded-[4rem] border-2 border-dashed transition-all duration-700 flex flex-col items-center justify-center overflow-hidden bg-slate-50 dark:bg-white/5 ${
                  imagePreview ? "border-emerald-500 scale-105" : "border-slate-200 dark:border-white/10 group-hover:border-emerald-500/50"
                }`}>
                  {imagePreview ? (
                    <Image src={imagePreview} alt="Preview" fill unoptimized className="object-cover" />
                  ) : (
                    <div className="flex flex-col items-center gap-4 text-slate-300 dark:text-white/10 font-black">
                      <Camera className="w-12 h-12" />
                      <span className="text-[10px] uppercase tracking-[0.3em]">Add Portrait</span>
                    </div>
                  )}
                  <input type="file" accept="image/*" onChange={onFileChange} className="absolute inset-0 opacity-0 cursor-pointer" aria-label="Upload specimen photo" />
                </div>
              </div>
              <div className="text-center">
                <h3 className="text-3xl font-black text-slate-800 dark:text-white mb-2 uppercase tracking-tighter">Meet your {kingdom === "Plantae" ? "Flora" : kingdom === "Fungi" ? "Fungi" : "Companion"}</h3>
                <p className="text-lg font-bold text-slate-400 dark:text-white/20">Every specimen needs a distinguished name.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-12">
              <div className="space-y-4">
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-white/20 ml-6">Nickname *</label>
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="e.g. Sir Moss-a-lot"
                  className="w-full px-8 py-5 bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-[2rem] outline-none focus:border-emerald-500/50 transition-all font-bold text-slate-800 dark:text-white placeholder:text-slate-300 dark:placeholder:text-white/10 shadow-sm"
                />
              </div>
              <div className="space-y-4">
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-white/20 ml-6">Scientific Name</label>
                <input
                  type="text"
                  value={speciesName}
                  onChange={(e) => setSpeciesName(e.target.value)}
                  placeholder="e.g. Monstera Deliciosa"
                  className="w-full px-8 py-5 bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-[2rem] outline-none focus:border-emerald-500/50 transition-all font-bold text-slate-800 dark:text-white placeholder:text-slate-300 dark:placeholder:text-white/10 shadow-sm"
                />
              </div>
            </div>
          </div>
        );

      case "care":
        return (
          <div className="space-y-12 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="text-center space-y-4">
              <h3 className="text-3xl font-black text-slate-800 dark:text-white uppercase tracking-tighter">Protocol & Care</h3>
              <p className="text-xl font-bold text-slate-400 dark:text-white/20">Parameters for a thrive-first environment.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 px-12">
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-white/20 mb-6 ml-6">
                    {kingdom === "Plantae" ? "Watering Frequency" : "Misting Frequency"}
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    {WATERING_OPTIONS.map(option => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setWatering(option)}
                        className={`flex items-center gap-3 px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all border ${
                          watering === option 
                            ? "bg-emerald-500 border-emerald-500 text-black shadow-lg shadow-emerald-500/20 scale-105" 
                            : "bg-white dark:bg-white/5 border-slate-100 dark:border-white/10 text-slate-400 hover:border-emerald-500/30"
                        }`}
                      >
                        <Droplets className="w-4 h-4" />
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                {kingdom === "Plantae" ? (
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-white/20 mb-6 ml-6">Lighting Exposure</label>
                    <div className="space-y-3">
                      {LIGHT_OPTIONS.map(option => (
                        <button
                          key={option}
                          type="button"
                          onClick={() => setLight(option)}
                          className={`w-full flex items-center justify-between px-8 py-5 rounded-[2rem] font-black uppercase tracking-widest text-[10px] transition-all border ${
                            light === option 
                              ? "bg-amber-400 border-amber-400 text-black shadow-lg" 
                              : "bg-white dark:bg-white/5 border-slate-100 dark:border-white/10 text-slate-400 hover:border-amber-400/30"
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            <Sun className="w-5 h-5" />
                            {option}
                          </div>
                          {light === option && <Check className="w-4 h-4" />}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-white/20 ml-6">Substrate Type</label>
                    <input
                      type="text"
                      value={substrate}
                      onChange={(e) => setSubstrate(e.target.value)}
                      placeholder="e.g. Hardwood Sawdust / Oat Bran"
                      className="w-full px-8 py-5 bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-[2rem] font-bold text-slate-800 dark:text-white outline-none focus:border-emerald-500/50"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case "location":
        return (
          <div className="space-y-12 animate-in fade-in slide-in-from-right-4 duration-500 px-12">
            <div className="text-center space-y-4">
              <h3 className="text-3xl font-black text-slate-800 dark:text-white uppercase tracking-tighter">Sanctuary Location</h3>
              <p className="text-xl font-bold text-slate-400 dark:text-white/20">Deployment zone within your habitat.</p>
            </div>

            <div className="bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/5 rounded-[3rem] p-10 flex items-center justify-between shadow-inner">
              <div className="flex items-center gap-6">
                <div className={`p-6 rounded-[2rem] transition-all duration-700 ${lat ? "bg-emerald-500 text-black shadow-2xl shadow-emerald-500/20" : "bg-white/10 text-slate-400"}`}>
                  <MapPin className="w-8 h-8" />
                </div>
                <div>
                  <span className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-white/20 mb-1">GPS Anchoring</span>
                  <p className="text-2xl font-black text-slate-800 dark:text-white tracking-tighter">
                    {isLocating ? "Acquiring Signal..." : lat && lon ? `${lat.toFixed(6)}, ${lon.toFixed(6)}` : "No GPS signal captured"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={captureLocation}
                disabled={isLocating}
                className={`px-10 py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${
                  isLocating ? "opacity-50 cursor-not-allowed" : "bg-black text-white hover:scale-105 active:scale-95 shadow-xl"
                }`}
              >
                {isLocating ? "Locating..." : lat ? "Recapture" : "Capture Location"}
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {ROOM_OPTIONS.map(room => (
                <button
                  key={room}
                  type="button"
                  onClick={() => setLocation(room)}
                  className={`px-6 py-8 rounded-[2.5rem] font-black text-[10px] uppercase tracking-[0.2em] transition-all border flex flex-col items-center gap-4 ${
                    location === room 
                      ? "bg-slate-800 dark:bg-white border-slate-800 dark:border-white text-white dark:text-black scale-105 shadow-2xl" 
                      : "bg-white dark:bg-white/5 border-slate-100 dark:border-white/5 text-slate-400 hover:border-slate-800/20"
                  }`}
                >
                  <MapPin className="w-6 h-6 opacity-40 shrink-0" />
                  {room}
                </button>
              ))}
            </div>
          </div>
        );

      case "confirm":
        return (
          <div className="space-y-12 animate-in fade-in slide-in-from-right-4 duration-500 text-center px-12">
            <div className="relative w-64 h-64 mx-auto rounded-[4rem] overflow-hidden border-[12px] border-white dark:border-white/5 shadow-2xl scale-110 mb-12">
              {imagePreview ? (
                <Image src={imagePreview} alt={nickname} fill unoptimized className="object-cover" />
              ) : (
                <div className="w-full h-full bg-slate-50 dark:bg-white/5 flex items-center justify-center">
                   <ShieldCheck className="w-24 h-24 text-emerald-500/20" />
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <h3 className="text-5xl font-black text-slate-800 dark:text-white uppercase tracking-tighter leading-none">{nickname}</h3>
              <p className="text-emerald-500 font-black uppercase text-xs tracking-[0.4em]">{speciesName || "New Biological Asset"}</p>
            </div>
            
            <div className="bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 rounded-[3.5rem] p-12 grid grid-cols-2 gap-12 text-left shadow-inner max-w-2xl mx-auto">
              <div className="space-y-1">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Biological Class</span>
                <p className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-tighter">{kingdom === "Plantae" ? "Botanical" : kingdom === "Fungi" ? "Mycology" : "Animalia"}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Deployment Zone</span>
                <p className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-tighter">{location}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                  {kingdom === "Plantae" ? "Solar Cycle" : kingdom === "Fungi" ? "Substrate" : "Activity Target"}
                </span>
                <p className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-tighter">
                  {kingdom === "Plantae" ? (light || "Nominal") : kingdom === "Fungi" ? (substrate || "Standard") : (activityLevel ? `${activityLevel}%` : "Analyzed")}
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Institutional Care</span>
                <p className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-tighter">
                  {watering || "Adaptive"}
                </p>
              </div>
            </div>
            
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Operational notes regarding specimen state..."
              className="w-full max-w-2xl mx-auto px-10 py-8 bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-[2.5rem] outline-none focus:border-emerald-500/30 transition-all font-bold text-slate-800 dark:text-white resize-none h-32 placeholder:text-slate-200"
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-8 bg-black/80 backdrop-blur-2xl animate-in fade-in duration-500">
      <div className="max-w-6xl w-full h-[90vh] bg-white dark:bg-[#050505] rounded-[4rem] border border-white/5 overflow-hidden flex flex-col shadow-[0_0_100px_rgba(0,0,0,0.5)] relative">
        {/* Header Progress */}
        <div className="px-16 py-12 flex justify-between relative bg-slate-50/50 dark:bg-white/[0.01] border-b border-white/5">
          <div className="absolute bottom-[-1px] left-16 right-16 h-[2px] bg-slate-200 dark:bg-white/5" />
          <div 
            className="absolute bottom-[-1px] left-16 h-[2px] bg-emerald-500 transition-all duration-1000 ease-in-out shadow-[0_0_15px_rgba(16,185,129,0.5)]" 
            style={{ width: `calc(${Math.round((currentStep / (STEPS.length - 1)) * 100)}% - 8rem)` }}
          />
          {STEPS.map((step, idx) => {
            const Icon = step.icon;
            const isActive = idx === currentStep;
            const isCompleted = idx < currentStep;
            
            return (
              <div key={step.id} className="relative z-10 flex flex-col items-center gap-4">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-500 border-2 ${
                  isActive 
                    ? "bg-emerald-500 border-emerald-500 text-black scale-110 shadow-2xl shadow-emerald-500/20" 
                    : isCompleted 
                      ? "bg-emerald-500/10 border-emerald-500 text-emerald-500" 
                      : "bg-white dark:bg-white/5 border-slate-100 dark:border-white/5 text-slate-300 dark:text-white/10"
                }`}>
                  {isCompleted ? <Check className="w-6 h-6 stroke-[3]" /> : <Icon className="w-6 h-6" />}
                </div>
                <span className={`text-[10px] font-black uppercase tracking-[0.3em] transition-colors duration-500 ${
                  isActive ? "text-emerald-500" : "text-slate-300 dark:text-white/10"
                }`}>
                  {step.title}
                </span>
              </div>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-16">
          {error && (
            <div className="mb-12 p-6 bg-red-500/10 border border-red-500/20 rounded-3xl text-red-500 text-[11px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-4 animate-in zoom-in-95 duration-500">
               <Activity className="w-4 h-4 animate-pulse" />
               {error}
            </div>
          )}
          {renderStep()}
        </div>

        {/* Footer Actions */}
        <div className="px-16 py-12 border-t border-white/5 flex items-center justify-between bg-white/50 dark:bg-transparent backdrop-blur-md">
          <button
            type="button"
            onClick={currentStep === 0 ? onClose : handleBack}
            className="group flex items-center gap-6 px-10 py-5 rounded-2xl font-black transition-all hover:bg-slate-50 dark:hover:bg-white/5 text-slate-400 dark:text-white/20"
          >
            <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-2" />
            <span className="text-[11px] uppercase tracking-[0.4em] mb-[-2px]">{currentStep === 0 ? "Abort" : "Previous Phase"}</span>
          </button>

          {currentStep < STEPS.length - 1 ? (
            <button
              type="button"
              onClick={handleNext}
              className="group flex items-center gap-6 px-12 py-5 bg-black text-white rounded-2xl font-black shadow-2xl transition-all hover:scale-105 active:scale-95"
            >
              <span className="text-[11px] uppercase tracking-[0.4em] mb-[-2px]">Next Phase</span>
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-2" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isPending}
              className="flex items-center gap-6 px-16 py-5 bg-emerald-500 text-black rounded-2xl font-black shadow-[0_20px_40px_rgba(16,185,129,0.3)] hover:scale-105 active:scale-95 transition-all disabled:opacity-50 border border-emerald-400"
            >
              <span className="text-[11px] uppercase tracking-[0.4em] mb-[-2px]">{isPending ? "Integrating Lifeform..." : "Commence Governance"}</span>
              <ShieldCheck className="w-6 h-6" />
            </button>
          )}
        </div>
        
        {/* Close Interaction */}
        <button 
          onClick={onClose}
          title="Exit Wizard"
          className="absolute top-8 right-8 p-4 text-slate-300 dark:text-white/10 hover:text-red-500 transition-colors bg-white/5 hover:bg-red-500/10 rounded-2xl border border-white/5"
        >
          <X className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}
