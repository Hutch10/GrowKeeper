import { PageShell } from "@/components/layout/page-shell";
import { Sidebar } from "@/components/layout/sidebar";
import { 
  Book, 
  MessageSquare, 
  Terminal, 
  ShieldCheck, 
  Activity,
  ChevronRight
} from "lucide-react";

export default function SupportPage() {
  return (
    <div className="flex min-h-screen bg-brand-cream font-sans">
      <Sidebar />
      <main className="flex-1 ml-64 p-8">
        <PageShell 
          title="Tactical Support Center" 
          subtitle="Direct uplink to GrowKeeper fleet command and technical documentation."
        >
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            <StatusCard 
              icon={Activity} 
              label="System Status" 
              status="All Systems Operational" 
              subtext="Uplink Latency: 42ms" 
              color="emerald" 
            />
            <StatusCard 
              icon={ShieldCheck} 
              label="Security Protocol" 
              status="Enforcement Active" 
              subtext="Last Audit: 2 mins ago" 
              color="blue" 
            />
            <StatusCard 
              icon={Terminal} 
              label="Edge Node" 
              status="Synchronized" 
              subtext="v4.5.11-Genesis" 
              color="purple" 
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <SupportSection 
              title="Field Manuals" 
              description="Comprehensive guides for specimen identification, care routines, and hardware calibration."
              icon={Book}
              links={[
                "Spectral Diagnostics Guide",
                "Substrate pH Calibration",
                "Swarm Node Configuration",
                "Emergency Care Protocols"
              ]}
            />
            <SupportSection 
              title="Command Uplink" 
              description="Open a direct communication channel with GrowKeeper technical stewards."
              icon={MessageSquare}
              links={[
                "Submit Technical Ticket",
                "Request Regulatory Clearance",
                "Bounty Program Inquiry",
                "Feature Request Portal"
              ]}
            />
          </div>

          <div className="mt-12 p-8 bg-brand-dark rounded-[2.5rem] text-white flex items-center justify-between group overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[100px] group-hover:bg-emerald-500/20 transition-all" />
            <div className="relative z-10">
              <h3 className="text-2xl font-black mb-2">Emergency Override</h3>
              <p className="text-white/60 font-medium max-w-xl">
                If you are experiencing a critical specimen health crisis during field operations, engage the emergency override for priority steward attention.
              </p>
            </div>
            <button className="relative z-10 px-8 py-4 bg-brand-pink text-brand-dark rounded-2xl font-black hover:scale-105 transition-all shadow-lg active:scale-95">
              ENGAGE OVERRIDE
            </button>
          </div>
        </PageShell>
      </main>
    </div>
  );
}

function StatusCard({ icon: Icon, label, status, subtext, color }: { icon: React.ElementType, label: string, status: string, subtext: string, color: string }) {
  const colorMap: Record<string, string> = {
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    purple: "bg-purple-50 text-purple-600 border-purple-100",
  };

  return (
    <div className={`p-6 rounded-[2rem] border bg-white shadow-sm hover:shadow-md transition-all`}>
      <div className="flex items-center gap-4 mb-4">
        <div className={`p-3 rounded-2xl ${colorMap[color].split(' ')[0]}`}>
          <Icon className={`w-6 h-6 ${colorMap[color].split(' ')[1]}`} />
        </div>
        <div>
          <span className="text-[10px] font-black text-brand-dark/20 uppercase tracking-widest block">{label}</span>
          <span className={`text-sm font-bold ${colorMap[color].split(' ')[1]}`}>{status}</span>
        </div>
      </div>
      <p className="text-xs font-medium text-brand-dark/40">{subtext}</p>
    </div>
  );
}

function SupportSection({ title, description, icon: Icon, links }: { title: string, description: string, icon: React.ElementType, links: string[] }) {
  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all h-full">
      <div className="flex items-center gap-4 mb-6">
        <div className="p-4 bg-brand-cream rounded-2xl text-brand-dark">
          <Icon className="w-6 h-6" />
        </div>
        <h3 className="text-xl font-black text-brand-dark">{title}</h3>
      </div>
      <p className="text-sm font-medium text-brand-dark/50 mb-8 leading-relaxed">
        {description}
      </p>
      <div className="space-y-3">
        {links.map((link) => (
          <button 
            key={link}
            className="w-full flex items-center justify-between p-4 bg-brand-cream/30 hover:bg-brand-cream rounded-2xl text-xs font-bold text-brand-dark transition-all group"
          >
            {link}
            <ChevronRight className="w-4 h-4 text-brand-dark/20 group-hover:text-brand-dark transition-colors" />
          </button>
        ))}
      </div>
    </div>
  );
}
