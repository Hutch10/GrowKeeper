import { PageShell } from "@/components/layout/page-shell";
import { Sidebar } from "@/components/layout/sidebar";
import { Search, Filter, Info } from "lucide-react";

export default function LibraryPage() {
  return (
    <div className="flex min-h-screen bg-brand-cream font-sans">
      <Sidebar />
      <main className="flex-1 ml-64 p-8">
        <PageShell title="Plant Library" subtitle="The definitive database of botanical specimens and their environmental requirements.">
          <div className="flex items-center gap-4 mb-8">
            <div className="flex-1 relative">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-dark/20" />
              <input 
                type="text" 
                placeholder="Search global species database..." 
                className="w-full pl-14 pr-6 py-4 bg-white rounded-2xl font-bold border-none shadow-sm focus:ring-2 focus:ring-brand-green/20"
              />
            </div>
            <button title="Filter Library" className="p-4 bg-white rounded-2xl shadow-sm hover:shadow-md transition-all">
              <Filter className="w-5 h-5 text-brand-dark/40" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            <SpeciesCard 
              name="Monstera Deliciosa" 
              origin="Central America" 
              light="Medium-Bright Indirect" 
              humidity="60-80%" 
              difficulty="Beginner"
              color="emerald"
            />
            <SpeciesCard 
              name="Sansevieria Trifasciata" 
              origin="West Africa" 
              light="Low-Direct" 
              humidity="10-40%" 
              difficulty="Expert (Indestructible)"
              color="blue"
            />
            <SpeciesCard 
              name="Ficus Lyrata" 
              origin="Western Africa" 
              light="Bright Direct" 
              humidity="High" 
              difficulty="Advanced"
              color="amber"
            />
          </div>

          <div className="mt-12 p-8 bg-brand-dark rounded-[2.5rem] text-white flex items-center justify-between">
            <div>
              <h3 className="text-xl font-black mb-2 flex items-center gap-2">
                <Info className="w-5 h-5 text-emerald-400" />
                Contributing to Open-Flora
              </h3>
              <p className="text-white/60 font-medium max-w-xl">
                The GrowKeeper library is part of the Open-Flora initiative. Verified contributors receive $GK tokens for species validation.
              </p>
            </div>
            <button className="px-8 py-4 bg-white text-brand-dark rounded-2xl font-black hover:scale-105 transition-all">
              Apply as Registrar
            </button>
          </div>
        </PageShell>
      </main>
    </div>
  );
}

function SpeciesCard({ name, origin, light, humidity, difficulty, color }: { name: string, origin: string, light: string, humidity: string, difficulty: string, color: string }) {
  return (
    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group overflow-hidden relative">
      <div className={`absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 opacity-[0.05] bg-${color}-500 rounded-full blur-2xl group-hover:opacity-20 transition-opacity`} />
      
      <h3 className="text-lg font-black text-brand-dark mb-4">{name}</h3>
      
      <div className="space-y-3">
        <DataPoint label="Origin" value={origin} />
        <DataPoint label="Ideal Light" value={light} />
        <DataPoint label="Humidity" value={humidity} />
        <DataPoint label="Difficulty" value={difficulty} color={color === 'emerald' ? 'text-emerald-500' : color === 'blue' ? 'text-blue-500' : 'text-amber-500'} />
      </div>

      <button className="w-full mt-6 py-3 bg-brand-cream rounded-xl text-[10px] font-black uppercase tracking-widest text-brand-dark/40 hover:bg-brand-green/10 hover:text-brand-green transition-all">
        View Detailed Registry
      </button>
    </div>
  );
}

function DataPoint({ label, value, color }: { label: string, value: string, color?: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[10px] font-black text-brand-dark/20 uppercase tracking-widest">{label}</span>
      <span className={`text-xs font-bold ${color || 'text-brand-dark/60'}`}>{value}</span>
    </div>
  );
}
