import Link from "next/link";
import Image from "next/image";
import { formatDate } from "@/lib/date";
import { Leaf, Waves, Heart, ShieldCheck } from "lucide-react";
import type { SpecimenRow } from "@/app/actions/types";

interface SpecimenListProps {
  specimens: SpecimenRow[];
}

export function SpecimenList({ specimens }: SpecimenListProps) {
  if (specimens.length === 0) {
    return (
      <div className="rounded-xl border border-brand-pink/30 bg-white p-8 text-center text-brand-dark/50 font-medium">
        No specimens yet. Add your first specimen above!
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {specimens.map((specimen) => (
        <Link href={`/plants/${specimen.id}`} key={specimen.id} className="block group">
          <article className="overflow-hidden rounded-xl border border-brand-pink/30 bg-white shadow-sm transition-all hover:shadow-md hover:border-brand-pink/60">
            <div className="aspect-[4/3] w-full bg-brand-pink-light">
              {specimen.image_url ? (
                <Image
                  src={specimen.image_url}
                  alt={specimen.nickname}
                  fill
                  className="h-full w-full object-cover transition-transform group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full items-center justify-center bg-brand-pink/5">
                  {specimen.kingdom === 'Plantae' ? <Leaf className="w-16 h-16 text-brand-green/20" /> :
                   specimen.kingdom === 'Fungi' ? <Waves className="w-16 h-16 text-blue-500/20" /> :
                   specimen.kingdom === 'Animalia' ? <Heart className="w-16 h-16 text-brand-pink/20" /> :
                   <Leaf className="w-16 h-16 text-brand-dark/10" />}
                </div>
              )}
            </div>
            <div className="p-5 relative">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-lg font-black text-brand-dark truncate">{specimen.nickname}</h3>
                {specimen.hardware_attestation_statement && (
                  <ShieldCheck className="w-4 h-4 text-brand-green shrink-0" />
                )}
              </div>

              {specimen.species_name && (
                <p className="mt-1 text-sm italic text-brand-dark/70 truncate">{specimen.species_name}</p>
              )}

              <p className="mt-4 text-xs text-brand-dark/40 font-medium">
                Added {formatDate(specimen.created_at)}
              </p>
            </div>
          </article>
        </Link>
      ))}
    </div>
  );
}
