"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateSpecimen } from "@/app/actions/specimen-actions";
import type { Specimen } from "@/types/specimen";
import { Shield, Zap, Info } from "lucide-react";

interface EditSpecimenFormProps {
  specimen: Specimen;
  onCancel: () => void;
  onSuccess: () => void;
}

export function EditSpecimenForm({ specimen, onCancel, onSuccess }: EditSpecimenFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [nickname, setNickname] = useState(specimen.nickname);
  const [speciesName, setSpeciesName] = useState(specimen.species_name || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!nickname.trim()) {
      setError("Asset identifier required.");
      return;
    }

    startTransition(async () => {
      const result = await updateSpecimen({
        id: specimen.id,
        nickname: nickname.trim(),
        kingdom: specimen.kingdom,
        species_name: speciesName.trim() || undefined,
      });

      if (result.success) {
        onSuccess();
        router.refresh();
      } else {
        setError(result.error || "Registry update failed.");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-[#080808] p-8 rounded-2xl border border-white/5">
      <div className="flex items-center gap-3 mb-6">
        <Shield className="w-5 h-5 text-emerald-500" />
        <h2 className="text-xl font-medium text-white tracking-tight">Edit Specimen <span className="text-white/20 ml-2 text-sm">#{specimen.id.slice(0, 8)}</span></h2>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-xs font-bold text-red-400 flex items-center gap-3">
          <Info className="w-4 h-4" />
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label htmlFor="nickname" className="block text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mb-2">Nickname Target</label>
          <input
            id="nickname"
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="e.g. Venus Trappist"
            className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-all"
            disabled={isPending}
          />
        </div>

        <div>
          <label htmlFor="species" className="block text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mb-2">Species Registry</label>
          <input
            id="species"
            type="text"
            value={speciesName}
            onChange={(e) => setSpeciesName(e.target.value)}
            placeholder="e.g. Dionaea muscipula"
            className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-all"
            disabled={isPending}
          />
        </div>
      </div>

      <div className="flex items-center gap-3 pt-6">
        <button
          type="submit"
          disabled={isPending}
          className="flex-1 bg-white text-black py-4 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all disabled:opacity-20 flex items-center justify-center gap-2"
        >
          {isPending ? <Zap className="w-3 h-3 animate-spin" /> : null}
          {isPending ? "Updating Registry..." : "Commit Changes"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isPending}
          className="px-6 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white hover:bg-white/5 transition-all"
        >
          Abort
        </button>
      </div>
    </form>
  );
}
