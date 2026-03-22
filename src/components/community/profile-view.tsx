"use client";

import Image from "next/image";
import { Award, Share2, Heart, MessageCircle, MapPin } from "lucide-react";
import type { PublicProfile } from "@/app/actions/profiles";
import type { SpecimenRow } from "@/app/actions/types";

export function ProfileView({ profile }: { profile: PublicProfile }) {
  return (
    <div className="max-w-6xl mx-auto px-6 py-12 pb-24">
      {/* Profile Header */}
      <header className="mb-16 flex flex-col items-center text-center">
        <div className="relative mb-8 group">
          <div className="w-32 h-32 rounded-[2.5rem] overflow-hidden border-4 border-white shadow-2xl shadow-brand-green/20">
            <Image 
              src={profile.avatar_url || "https://images.unsplash.com/photo-1544256718-3bcf237f3974?q=80&w=200&h=200&auto=format&fit=crop"} 
              alt={profile.nickname}
              width={128}
              height={128}
              className="object-cover"
            />
          </div>
          {/* Status Badge */}
          <div className="absolute -bottom-2 -right-2 bg-white px-3 py-1 rounded-full shadow-lg border border-slate-100 flex items-center gap-1.5 animate-bounce">
            <Award className="w-3.5 h-3.5 text-amber-500 fill-current" />
            <span className="text-[10px] font-black text-brand-dark uppercase tracking-widest">Master Grower</span>
          </div>
        </div>

        <h1 className="text-4xl font-black text-brand-dark mb-2 tracking-tight">{profile.nickname}</h1>
        <div className="flex items-center gap-2 mb-6 text-slate-400 font-bold">
          <MapPin className="w-4 h-4" />
          <span className="text-sm">Botanical Sanctuary, Earth</span>
        </div>

        <p className="max-w-xl text-lg font-bold text-slate-500/80 leading-relaxed mb-8">
          {profile.bio || "Exploring the intersection of technology and botany. Curator of rare tropicals."}
        </p>

        <div className="flex gap-12">
          <div className="text-center">
            <div className="text-3xl font-black text-brand-green mb-1">{profile.total_plants}</div>
            <div className="text-[10px] font-black text-brand-dark/20 uppercase tracking-widest">Plants</div>
          </div>
          <div className="w-px h-12 bg-slate-200" />
          <div className="text-center">
            <div className="text-3xl font-black text-brand-pink-dark mb-1">{profile.thriving_count}</div>
            <div className="text-[10px] font-black text-brand-dark/20 uppercase tracking-widest">Thriving</div>
          </div>
          <div className="w-px h-12 bg-slate-200" />
          <div className="text-center">
            <div className="text-3xl font-black text-brand-dark mb-1">124</div>
            <div className="text-[10px] font-black text-brand-dark/20 uppercase tracking-widest">Followers</div>
          </div>
        </div>

        <div className="flex gap-4 mt-10">
          <button className="px-8 py-3 bg-brand-green text-white rounded-2xl font-black text-sm shadow-xl shadow-emerald-200 hover:scale-105 transition-all flex items-center gap-2">
            <Heart className="w-4 h-4 fill-current" />
            Follow Collection
          </button>
          <button className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-brand-green hover:border-brand-green transition-all shadow-sm">
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* The Shelfie Grid */}
      <section>
        <div className="flex items-center justify-between mb-12">
          <h2 className="text-2xl font-black text-brand-dark">The Plant Shelfie</h2>
          <div className="h-px flex-1 mx-8 bg-brand-dark/10" />
          <div className="flex gap-2">
            <div className="px-4 py-2 bg-slate-100 rounded-xl text-[10px] font-black text-slate-400 uppercase tracking-widest">All</div>
            <div className="px-4 py-2 bg-white border border-slate-100 rounded-xl text-[10px] font-black text-slate-400 uppercase tracking-widest">Rare</div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {profile.plants.map((plant: SpecimenRow) => (
            <div key={plant.id} className="group cursor-pointer">
              <div className="relative aspect-[4/5] rounded-[2.5rem] overflow-hidden shadow-2xl mb-6 transition-all duration-500 group-hover:scale-105 group-hover:-rotate-1">
                <Image 
                  src={plant.image_url || "https://images.unsplash.com/photo-1545241047-6083a3684587?q=80&w=400&h=500&auto=format&fit=crop"} 
                  alt={plant.nickname}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/60 via-transparent to-transparent opacity-60" />
                
                {/* Plant Labels */}
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-1 bg-white/20 backdrop-blur-md rounded-lg text-[9px] font-black text-white uppercase tracking-widest border border-white/30">
                      {plant.species_name || "Unknown Species"}
                    </span>
                  </div>
                  <h3 className="text-xl font-black text-white">{plant.nickname}</h3>
                </div>

                {/* Like / Comment Interaction overlays */}
                <div className="absolute top-6 right-6 flex flex-col gap-3 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                   <button className="w-10 h-10 rounded-xl bg-white/90 backdrop-blur-md flex items-center justify-center text-brand-pink-dark shadow-xl hover:bg-brand-pink text-white transition-all">
                     <Heart className="w-5 h-5" />
                   </button>
                   <button className="w-10 h-10 rounded-xl bg-white/90 backdrop-blur-md flex items-center justify-center text-brand-dark/60 shadow-xl hover:bg-brand-green text-white transition-all">
                     <MessageCircle className="w-5 h-5" />
                   </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Shareable Invite Modal / Call to action */}
      <footer className="mt-24 p-12 bg-gradient-to-br from-brand-pink/10 to-emerald-50 rounded-[3rem] border border-brand-pink/20 text-center relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-2xl font-black text-brand-dark mb-4">Start Your Own Sanctuary</h2>
          <p className="max-w-md mx-auto text-slate-500 font-bold mb-8">
            Join the global network of 10,000+ botanical masters. Track, grow, and trade in a premium ecosystem.
          </p>
          <button className="px-10 py-4 bg-brand-dark text-white rounded-[1.5rem] font-black text-sm shadow-2xl hover:bg-brand-green transition-all">
            Join GrowKeeper Now
          </button>
        </div>
        <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-brand-green/5 rounded-full blur-3xl" />
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-brand-pink/5 rounded-full blur-3xl" />
      </footer>
    </div>
  );
}
