"use client";

import Image from "next/image";
import { Specimen } from "@/types/specimen";

const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&q=80&w=600",
  "https://images.unsplash.com/photo-1509587584298-0f3b3a3a1797?auto=format&fit=crop&q=80&w=600",
  "https://images.unsplash.com/photo-1459156212016-c812468e2115?auto=format&fit=crop&q=80&w=600",
  "https://images.unsplash.com/photo-1463936575829-25148e1db1b8?auto=format&fit=crop&q=80&w=600",
];

interface SpecimenSummaryCardProps {
  specimen: Specimen;
  onClick: () => void;
  active?: boolean;
}

export function SpecimenSummaryCard({ specimen, onClick, active }: SpecimenSummaryCardProps) {
  const imgSrc =
    specimen.image_url ||
    FALLBACK_IMAGES[Math.abs(specimen.id.charCodeAt(0)) % FALLBACK_IMAGES.length];

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group w-full text-left rounded-2xl overflow-hidden bg-white shadow-sm border transition-all ${
        active
          ? "border-green-500 shadow-green-100 shadow-md"
          : "border-slate-100 hover:shadow-md hover:border-slate-200"
      }`}
    >
      {/* Photo */}
      <div className="relative w-full aspect-[4/3] overflow-hidden">
        <Image
          src={imgSrc}
          alt={specimen.nickname}
          fill
          unoptimized
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>

      {/* Name */}
      <div className="px-4 py-3">
        <p className="text-sm font-semibold text-slate-800 truncate">{specimen.nickname}</p>
        {specimen.species_name && (
          <p className="text-xs text-slate-400 truncate mt-0.5">{specimen.species_name}</p>
        )}
      </div>
    </button>
  );
}
