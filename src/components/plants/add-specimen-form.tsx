"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, Leaf, Droplets, MapPin, Sun, ArrowRight, ArrowLeft, Check, Waves, Flower2, Heart } from "lucide-react";
import Image from "next/image";
import { useSpecimenData } from "@/hooks/use-specimen-data";
import { type AddSpecimenInput } from "@/app/actions/specimen-actions";
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
  const [watering, setWatering] = useState(""); // Plant: Water, Fungi: Misting
  const [light, setLight] = useState(""); // Plant specific
  const [fertilizer, setFertilizer] = useState(""); // Shared
  const [substrate, setSubstrate] = useState(""); // Fungi specific
  
  // Animalia specific
  const [heartRate, setHeartRate] = useState<number | "">(""); 
  const [activityLevel, setActivityLevel] = useState<number | "">("");
  const [dietaryNotes, setDietaryNotes] = useState("");

  const [location, setLocation] = useState("Living Room");

  // Determine if we are in modal or static mode
  const isModal = isOpen !== undefined;
  
  // If isOpen is explicitly false, don't render
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

    setError(null);

    try {
      const specimenData = {
        nickname: nickname.trim(),
        species_name: speciesName.trim() || undefined,
        notes: notes.trim() || undefined,
        location,
        kingdom,
        ...(kingdom === "Plantae" ? {
          light: light || undefined,
          watering: watering || undefined,
        } : kingdom === "Fungi" ? {
          substrate: substrate || undefined,
          misting_schedule: watering || undefined,
        } : kingdom === "Animalia" ? {
          heart_rate: heartRate === "" ? undefined : Number(heartRate),
          activity_level: activityLevel === "" ? undefined : Number(activityLevel),
          dietary_notes: dietaryNotes.trim() || undefined,
        } : {}),
        image: image ? (() => {
          const formData = new FormData();
          formData.append("file", image);
          return formData;
        })() : undefined,
      };

      const result = await performAdd(specimenData as AddSpecimenInput);

      if (result.success) {
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
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="text-center space-y-2">
              <h3 className="text-2xl font-black text-brand-dark">Choose Your Path</h3>
              <p className="text-brand-dark/40 font-bold">Select the kingdom of your new specimen.</p>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <button
                type="button"
                onClick={() => { setKingdom("Plantae"); handleNext(); }}
                className={`p-8 rounded-[3rem] border-4 transition-all flex flex-col items-center gap-4 group ${
                  kingdom === "Plantae" 
                    ? "border-brand-green bg-brand-green/5 scale-105 shadow-2xl shadow-brand-green/10" 
                    : "border-brand-pink/20 bg-white hover:border-brand-green/40 hover:scale-102"
                }`}
              >
                <div className={`p-6 rounded-[2rem] transition-colors ${kingdom === "Plantae" ? "bg-brand-green text-white" : "bg-brand-pink/10 text-brand-green"}`}>
                  <Leaf className="w-12 h-12" />
                </div>
                <div>
                  <span className="block font-black text-xl text-brand-dark">Botanical</span>
                  <span className="text-[10px] font-bold text-brand-dark/30 uppercase tracking-widest">Plants & Flowers</span>
                </div>
              </button>
              <button
                type="button"
                onClick={() => { setKingdom("Fungi"); handleNext(); }}
                className={`p-8 rounded-[3rem] border-4 transition-all flex flex-col items-center gap-4 group ${
                  kingdom === "Fungi" 
                    ? "border-brand-green bg-brand-green/5 scale-105 shadow-2xl shadow-brand-green/10" 
                    : "border-brand-pink/20 bg-white hover:border-brand-green/40 hover:scale-102"
                }`}
              >
                <div className={`p-6 rounded-[2rem] transition-colors ${kingdom === "Fungi" ? "bg-brand-green text-white" : "bg-brand-pink/10 text-brand-green"}`}>
                  <Flower2 className="w-12 h-12" />
                </div>
                <div>
                  <span className="block font-black text-xl text-brand-dark">Mycology</span>
                  <span className="text-[10px] font-bold text-brand-dark/30 uppercase tracking-widest">Mushrooms & Fungi</span>
                </div>
              </button>
              <button
                type="button"
                onClick={() => { setKingdom("Animalia"); handleNext(); }}
                className={`p-8 rounded-[3rem] border-4 transition-all flex flex-col items-center gap-4 group col-span-2 ${
                  kingdom === "Animalia" 
                    ? "border-brand-green bg-brand-green/5 scale-105 shadow-2xl shadow-brand-green/10" 
                    : "border-brand-pink/20 bg-white hover:border-brand-green/40 hover:scale-102"
                }`}
              >
                <div className={`p-6 rounded-[2rem] transition-colors ${kingdom === "Animalia" ? "bg-brand-green text-white" : "bg-brand-pink/10 text-brand-green"}`}>
                  <Heart className="w-12 h-12" />
                </div>
                <div>
                  <span className="block font-black text-xl text-brand-dark">Animalia</span>
                  <span className="text-[10px] font-bold text-brand-dark/30 uppercase tracking-widest">Fauna & Wildlife</span>
                </div>
              </button>
            </div>
          </div>
        );

      case "identity":
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="flex flex-col items-center gap-6">
              <div className="relative group" title="Specimen Portrait">
                <div className={`w-44 h-44 rounded-[3rem] border-4 border-dashed transition-all duration-700 flex flex-col items-center justify-center overflow-hidden bg-brand-pink-light/30 ${
                  imagePreview ? "border-brand-pink-dark scale-105" : "border-brand-pink/40 group-hover:border-brand-pink-dark group-hover:bg-brand-pink-light/50"
                }`}>
                  {imagePreview ? (
                    <Image src={imagePreview} alt="Preview" fill unoptimized className="object-cover" />
                  ) : (
                    <div className="flex flex-col items-center gap-3 text-brand-pink-dark/40 font-black">
                      <Camera className="w-10 h-10" />
                      <span className="text-[10px] uppercase tracking-[0.2em]">Add Portrait</span>
                    </div>
                  )}
                  <input type="file" accept="image/*" onChange={onFileChange} className="absolute inset-0 opacity-0 cursor-pointer" aria-label="Upload specimen photo" />
                </div>
                  {imagePreview && (
                    <button 
                      onClick={() => { setImage(null); setImagePreview(null); }}
                      className="absolute -top-3 -right-3 bg-brand-pink-dark text-white rounded-2xl p-2 shadow-xl hover:scale-110 active:scale-90 transition-all border-4 border-white"
                      title="Remove portrait"
                      aria-label="Remove portrait"
                    >
                      <Check className="w-5 h-5 rotate-45" />
                    </button>
                  )}
              </div>
              <div className="text-center">
                <h3 className="text-2xl font-black text-brand-dark mb-1">Meet your {kingdom === "Plantae" ? "Flora" : kingdom === "Fungi" ? "Fungi" : "Companion"}</h3>
                <p className="text-brand-dark/40 font-bold">Every specimen needs a distinguished name.</p>
              </div>
            </div>

            <div className="space-y-5">
              <div className="group">
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-brand-dark/30 mb-2 ml-6">Nickname *</label>
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="e.g. Sir Moss-a-lot"
                  className="w-full px-8 py-5 bg-white border-2 border-brand-pink/10 rounded-[2rem] outline-none focus:border-brand-pink-dark focus:ring-8 focus:ring-brand-pink-light/20 transition-all font-bold text-brand-dark"
                />
              </div>
              <div className="group">
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-brand-dark/30 mb-2 ml-6">Scientific / Species Name</label>
                <input
                  type="text"
                  value={speciesName}
                  onChange={(e) => setSpeciesName(e.target.value)}
                  placeholder="e.g. Monstera Deliciosa"
                  className="w-full px-8 py-5 bg-white border-2 border-brand-pink/10 rounded-[2rem] outline-none focus:border-brand-pink-dark focus:ring-8 focus:ring-brand-pink-light/20 transition-all font-bold text-brand-dark"
                />
              </div>
            </div>
          </div>
        );

      case "care":
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="text-center space-y-2">
              <h3 className="text-2xl font-black text-brand-dark">Protocol & Care</h3>
              <p className="text-brand-dark/40 font-bold">Parameters for a thrive-first environment.</p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-brand-dark/30 mb-4 ml-6">
                  {kingdom === "Plantae" ? "Watering Frequency" : "Misting Frequency"}
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {WATERING_OPTIONS.map(option => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setWatering(option)}
                      className={`flex items-center gap-3 px-5 py-4 rounded-[1.5rem] font-bold text-sm transition-all border-2 ${
                        watering === option 
                          ? "bg-brand-green border-brand-green text-white shadow-lg shadow-brand-green/20" 
                          : "bg-white border-brand-pink/10 text-brand-dark hover:border-brand-green/30"
                      }`}
                    >
                      {kingdom === "Plantae" ? <Droplets className="w-4 h-4" /> : <Waves className="w-4 h-4" />}
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              {kingdom === "Plantae" ? (
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-brand-dark/30 mb-4 ml-6">Lighting Exposure</label>
                  <div className="grid gap-3">
                    {LIGHT_OPTIONS.map(option => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setLight(option)}
                        className={`flex items-center gap-4 px-8 py-5 rounded-[1.5rem] font-bold transition-all border-2 ${
                          light === option 
                            ? "bg-brand-pink-dark border-brand-pink-dark text-white shadow-lg shadow-brand-pink/20" 
                            : "bg-white border-brand-pink/10 text-brand-dark hover:border-brand-pink-dark/30"
                        }`}
                      >
                        <Sun className={`w-5 h-5 ${light === option ? "text-white" : "text-amber-500"}`} />
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="group">
                  <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-brand-dark/30 mb-2 ml-6">Substrate Type</label>
                  <input
                    type="text"
                    value={substrate}
                    onChange={(e) => setSubstrate(e.target.value)}
                    placeholder="e.g. Hardwood Sawdust / Oat Bran"
                    className="w-full px-8 py-5 bg-white border-2 border-brand-pink/10 rounded-[2rem] outline-none focus:border-brand-pink-dark transition-all font-bold text-brand-dark"
                  />
                </div>
              )}

              <div className="group">
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-brand-dark/30 mb-2 ml-6">Fertilizer / Supplements (Optional)</label>
                <input
                  type="text"
                  value={fertilizer}
                  onChange={(e) => setFertilizer(e.target.value)}
                  placeholder="e.g. Monthly liquid feed"
                  className="w-full px-8 py-5 bg-white border-2 border-brand-pink/10 rounded-[2rem] outline-none focus:border-brand-pink-dark transition-all font-bold text-brand-dark"
                />
              </div>

              {kingdom === "Animalia" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="group">
                      <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-brand-dark/30 mb-2 ml-6">Target Heart Rate (BPM)</label>
                      <input
                        type="number"
                        value={heartRate}
                        onChange={(e) => setHeartRate(e.target.value ? parseInt(e.target.value) : "")}
                        placeholder="e.g. 80"
                        className="w-full px-8 py-5 bg-white border-2 border-brand-pink/10 rounded-[2rem] outline-none focus:border-brand-pink-dark transition-all font-bold text-brand-dark"
                      />
                    </div>
                    <div className="group">
                      <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-brand-dark/30 mb-2 ml-6">Daily Activity Target (%)</label>
                      <input
                        type="number"
                        value={activityLevel}
                        onChange={(e) => setActivityLevel(e.target.value ? parseInt(e.target.value) : "")}
                        placeholder="e.g. 100"
                        className="w-full px-8 py-5 bg-white border-2 border-brand-pink/10 rounded-[2rem] outline-none focus:border-brand-pink-dark transition-all font-bold text-brand-dark"
                      />
                    </div>
                  </div>
                  <div className="group">
                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-brand-dark/30 mb-2 ml-6">Dietary Notes / Schedule</label>
                    <textarea
                      value={dietaryNotes}
                      onChange={(e) => setDietaryNotes(e.target.value)}
                      placeholder="e.g. High-protein, grain-free. Feeding at 08h and 19h."
                      className="w-full px-8 py-5 border-2 border-brand-pink/10 rounded-[2rem] outline-none focus:border-brand-pink-dark focus:ring-8 focus:ring-brand-pink-light/20 transition-all font-bold text-brand-dark resize-none h-32"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case "location":
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="text-center space-y-2">
              <h3 className="text-2xl font-black text-brand-dark">Sanctuary Location</h3>
              <p className="text-brand-dark/40 font-bold">Deployment zone within your habitat.</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {ROOM_OPTIONS.map(room => (
                <button
                  key={room}
                  type="button"
                  onClick={() => setLocation(room)}
                  className={`px-4 py-6 rounded-[2rem] font-black text-[10px] uppercase tracking-widest transition-all border-2 flex flex-col items-center gap-3 ${
                    location === room 
                      ? "bg-brand-dark border-brand-dark text-white shadow-xl scale-105" 
                      : "bg-white border-brand-pink/10 text-brand-dark/40 hover:border-brand-dark/30"
                  }`}
                >
                  <MapPin className="w-5 h-5 opacity-40" />
                  {room}
                </button>
              ))}
            </div>
          </div>
        );

      case "confirm":
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500 text-center">
            <div className="relative w-48 h-48 mx-auto rounded-[3rem] overflow-hidden border-8 border-white shadow-2xl scale-110 mb-12">
              {imagePreview ? (
                <Image src={imagePreview} alt={nickname} fill unoptimized className="object-cover" />
              ) : (
                <div className="w-full h-full bg-brand-pink-light/30 flex items-center justify-center">
                  {kingdom === "Plantae" ? <Leaf className="w-16 h-16 text-brand-green" /> : <Flower2 className="w-16 h-16 text-brand-green" />}
                </div>
              )}
            </div>
            <div className="space-y-2">
              <h3 className="text-4xl font-black text-brand-dark uppercase tracking-tighter">{nickname}</h3>
              <p className="text-brand-green font-black uppercase text-xs tracking-[0.3em]">{speciesName || "New Lifeform"}</p>
            </div>
            
            <div className="bg-white/50 border border-brand-pink/20 rounded-[2.5rem] p-8 grid grid-cols-2 gap-8 text-left shadow-inner">
              <div className="space-y-1">
                <span className="text-[9px] font-black text-brand-dark/30 uppercase tracking-widest">Kingdom</span>
                <p className="font-extrabold text-brand-dark">{kingdom === "Plantae" ? "Botanical" : kingdom === "Fungi" ? "Mycology" : "Animalia"}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[9px] font-black text-brand-dark/30 uppercase tracking-widest">Location</span>
                <p className="font-extrabold text-brand-dark">{location}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[9px] font-black text-brand-dark/30 uppercase tracking-widest">
                  {kingdom === "Plantae" ? "Light" : kingdom === "Fungi" ? "Substrate" : "Activity Target"}
                </span>
                <p className="font-extrabold text-brand-dark">
                  {kingdom === "Plantae" ? (light || "Default") : kingdom === "Fungi" ? (substrate || "Default") : (activityLevel ? `${activityLevel}%` : "Default")}
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-[9px] font-black text-brand-dark/30 uppercase tracking-widest">
                  {kingdom === "Animalia" ? "Heart Rate" : "Care"}
                </span>
                <p className="font-extrabold text-brand-dark">
                  {kingdom === "Animalia" ? (heartRate ? `${heartRate} BPM` : "Analyzed") : (watering || "As needed")}
                </p>
              </div>
            </div>
            
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Final notes (optional)..."
              className="w-full px-8 py-5 bg-white border-2 border-brand-pink/10 rounded-[2rem] outline-none focus:border-brand-pink-dark transition-all font-bold text-brand-dark resize-none h-24"
            />
          </div>
        );
      default:
        return null;
    }
  };

  const formContent = (
    <div className={`${isModal ? "max-w-3xl w-full max-h-[90vh] overflow-y-auto selection:bg-brand-green/20 tactical-panel border-white/10 p-8 sm:p-12 relative shadow-2xl" : "w-full p-6"} space-y-12`}>
      {isModal && (
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-white/20 hover:text-white transition-colors"
          title="Close"
        >
          <Check className="w-6 h-6 rotate-45" />
        </button>
      )}

      {/* Progress Header */}
      <div className={`flex justify-between relative mb-8 px-4 ${isModal ? "" : "text-brand-dark"}`}>
        <div className={`absolute top-6 left-6 right-6 h-[1px] ${isModal ? "bg-white/10" : "bg-brand-dark/10"}`} />
        <div 
          className="absolute top-6 left-6 h-[1px] bg-brand-green transition-all duration-700 ease-out" 
          style={{ width: `${Math.round((currentStep / (STEPS.length - 1)) * 100)}%` }}
        />
        {STEPS.map((step, idx) => {
          const Icon = step.icon;
          const isActive = idx === currentStep;
          const isCompleted = idx < currentStep;
          
          return (
            <div key={step.id} className="relative z-10 flex flex-col items-center gap-3">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-500 border ${
                isActive 
                  ? "bg-brand-green text-black scale-110 shadow-[0_0_20px_rgba(52,211,153,0.3)]" 
                  : isCompleted 
                    ? "bg-brand-green/20 border-brand-green text-brand-green" 
                    : isModal ? "bg-white/5 text-white/20 border-white/10" : "bg-brand-dark/5 text-brand-dark/20 border-brand-dark/10"
              }`}>
                {isCompleted ? <Check className="w-5 h-5 stroke-[3]" /> : <Icon className="w-5 h-5" />}
              </div>
              <span className={`text-[8px] font-black uppercase tracking-[0.2em] transition-colors duration-500 ${
                isActive ? "text-brand-green" : isModal ? "text-white/20" : "text-brand-dark/20"
              }`}>
                {step.title}
              </span>
            </div>
          );
        })}
      </div>

      {error && (
        <div className="p-5 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3 animate-in zoom-in-95 duration-300">
           <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
           {error}
        </div>
      )}

      {renderStep()}

      <div className={`pt-12 border-t flex items-center justify-between ${isModal ? "border-white/5" : "border-brand-dark/5"}`}>
        <button
          type="button"
          onClick={currentStep === 0 ? onClose : handleBack}
          className={`group flex items-center gap-3 px-8 py-4 rounded-xl font-black transition-all active:scale-95 ${
            isModal ? "text-white/30 hover:text-white" : "text-brand-dark/30 hover:text-brand-dark"
          }`}
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span className="text-[10px] uppercase tracking-widest">{currentStep === 0 ? "Abort" : "Previous"}</span>
        </button>

        {currentStep < STEPS.length - 1 ? (
          <button
            type="button"
            onClick={handleNext}
            className={`group flex items-center gap-4 px-10 py-4 rounded-xl font-black border transition-all ${
              isModal 
                ? "bg-white/10 text-white border-white/10 hover:bg-white/20 hover:scale-105" 
                : "bg-brand-dark/10 text-brand-dark border-brand-dark/10 hover:bg-brand-dark/20 hover:scale-105"
            }`}
          >
            <span className="text-[10px] uppercase tracking-widest">Next Phase</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={isPending}
            className="flex items-center gap-4 px-12 py-4 bg-brand-green text-black rounded-xl font-black shadow-2xl shadow-brand-green/20 hover:bg-white hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:grayscale"
          >
            <span className="text-[10px] uppercase tracking-widest">{isPending ? "Integrating Lifeform..." : "Commence Governance"}</span>
            <Check className="w-5 h-5 stroke-[3]" />
          </button>
        )}
      </div>
    </div>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-xl animate-in fade-in duration-300">
        {formContent}
      </div>
    );
  }

  return formContent;
}
