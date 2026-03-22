import { PageShell } from "@/components/layout/page-shell";
import { Sidebar } from "@/components/layout/sidebar";
import { Lightbulb, Search, BookOpen, Zap } from "lucide-react";

export default function CareTipsPage() {
  return (
    <div className="flex min-h-screen bg-brand-cream font-sans">
      <Sidebar />
      <main className="flex-1 ml-64 p-8">
        <PageShell title="Botanical Intelligence" subtitle="Expert care guides and predictive insights for your collection.">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            <IntelligenceCard 
              icon={Lightbulb} 
              title="Seasonal Adjustments" 
              description="Spring is approaching. Increase nutrient delivery for your Monstera and Sansevieria by 15%."
              category="PREDICTIVE"
            />
            <IntelligenceCard 
              icon={Zap} 
              title="Substrate Optimization" 
              description="Switching to a lava rock mix can improve drainage for high-humidity specimens."
              category="HARDWARE"
            />
            <IntelligenceCard 
              icon={BookOpen} 
              title="Pathogen Alerts" 
              description="Low humidity levels in North America may increase spider mite risk this month."
              category="THREAT"
            />
          </div>

          <div className="mt-12 bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-xl">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-black text-brand-dark">Care Library</h2>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-dark/20" />
                <input 
                  type="text" 
                  placeholder="Search species..." 
                  className="pl-10 pr-4 py-2 bg-brand-cream rounded-xl text-sm font-bold border-none focus:ring-2 focus:ring-brand-green/20"
                />
              </div>
            </div>
            
            <div className="text-center py-20 bg-brand-cream/30 rounded-[2rem] border-2 border-dashed border-brand-dark/5">
              <BookOpen className="w-12 h-12 text-brand-dark/10 mx-auto mb-4" />
              <p className="text-brand-dark/40 font-bold uppercase tracking-widest text-[10px]">Reference Data loading...</p>
            </div>
          </div>
        </PageShell>
      </main>
    </div>
  );
}

function IntelligenceCard({ icon: Icon, title, description, category }: { icon: React.ElementType, title: string, description: string, category: string }) {
  return (
    <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-lg hover:shadow-xl transition-all group">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 ${
        category === 'PREDICTIVE' ? 'bg-blue-50 text-blue-500' :
        category === 'HARDWARE' ? 'bg-orange-50 text-orange-500' :
        'bg-red-50 text-red-500'
      }`}>
        <Icon className="w-6 h-6" />
      </div>
      <span className="text-[10px] font-black uppercase tracking-widest text-brand-dark/20 mb-2 block">{category}</span>
      <h3 className="text-xl font-black text-brand-dark mb-3 group-hover:text-brand-green transition-colors">{title}</h3>
      <p className="text-sm text-brand-dark/60 font-medium leading-relaxed">{description}</p>
    </div>
  );
}
