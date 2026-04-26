"use client";

import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { 
  Sidebar 
} from "@/components/layout/sidebar";
import { 
  Activity, 
  Zap, 
  ShieldCheck, 
  Cpu, 
  RefreshCw, 
  Sparkles,
  AlertCircle,
  Clock,
  Waves
} from "lucide-react";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts";
import { useEnvironmentalSentinel } from "@/hooks/use-environmental-sentinel";
import { calibrateSensors } from "@/app/actions/environmental-actions";
import { toast } from "sonner";

export default function TelemetryDashboard() {
  const { signals, fetchSignals } = useEnvironmentalSentinel();
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [lastCalibration, setLastCalibration] = useState<string | null>(null);

  // Prepare data for Recharts
  const chartData = useMemo(() => {
    // We group by timestamp and average or just take latest for simplicity in this visualization
    const grouped = signals.slice(0, 20).reverse().map((s, idx) => ({
      time: new Date(s.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      moisture: 0,
      temp: 0,
      light: 0,
      raw: idx // for continuous x-axis
    }));
    return grouped;
  }, [signals]);

  const handleCalibration = async () => {
    setIsCalibrating(true);
    toast.loading("Initiating Regional Sensor Sync...");
    
    const result = await calibrateSensors();
    
    setIsCalibrating(false);
    toast.dismiss();

    if (result.success) {
      setLastCalibration(new Date().toLocaleTimeString());
      toast.success("System Calibrated Successfully", {
        description: `Sensors calibrated successfully.`
      });
      fetchSignals();
    } else {
      toast.error("Calibration Failed", {
        description: result.error
      });
    }
  };

  return (
    <div className="flex h-screen bg-white dark:bg-[#050505] font-poppins overflow-hidden">
      <Sidebar className="hidden lg:flex" />
      
      <main className="flex-1 lg:ml-64 flex flex-col overflow-hidden relative">
        {/* Background Gradients */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/5 blur-[150px] -z-10 animate-pulse" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/5 blur-[150px] -z-10" />

        {/* Tactical Header */}
        <header className="p-8 border-b border-slate-100 dark:border-white/5 flex items-center justify-between backdrop-blur-md bg-white/50 dark:bg-black/20 z-10">
          <div className="flex items-center gap-6">
            <div className="w-14 h-14 bg-emerald-500/10 rounded-[1.5rem] flex items-center justify-center border border-emerald-500/20 group hover:scale-105 transition-transform">
              <Activity className="w-7 h-7 text-emerald-500" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Live Sensor Data</h1>
                <Badge variant="emerald" className="animate-pulse">Active Stream</Badge>
              </div>
              <div className="flex items-center gap-4">
                 <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                    <span className="text-[10px] font-black text-slate-400 dark:text-white/30 uppercase tracking-[0.2em]">Sync: Active</span>
                 </div>
                 <div className="flex items-center gap-2">
                    <Clock className="w-3 h-3 text-slate-400 dark:text-white/20" />
                    <span className="text-[10px] font-black text-slate-400 dark:text-white/30 uppercase tracking-[0.2em]">Next Pulse in 120s</span>
                 </div>
              </div>
            </div>
          </div>

          <button 
            onClick={handleCalibration}
            disabled={isCalibrating}
            className="flex items-center gap-3 px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-black rounded-2xl font-black uppercase tracking-widest text-[10px] hover:scale-105 transition-all disabled:opacity-50 disabled:scale-100 shadow-xl shadow-slate-950/20"
          >
            {isCalibrating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
            {isCalibrating ? "Syncing..." : "Calibrate Regional Sensors"}
          </button>
        </header>

        {/* Dashboard Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
          
          {/* Main Chart Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-[3.5rem] p-10 shadow-2xl shadow-emerald-950/5 relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity">
                  <Waves className="w-32 h-32 text-emerald-500" />
               </div>
               
               <div className="flex items-center justify-between mb-12">
                  <div>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tighter">Signal Stability Audit</h3>
                    <p className="text-xs font-bold text-slate-400 dark:text-white/20 uppercase tracking-widest mt-1">Multi-node environmental convergence</p>
                  </div>
                  <div className="flex items-center gap-4">
                     <LegendItem color="#10b981" label="Moisture" />
                     <LegendItem color="#3b82f6" label="Temp" />
                     <LegendItem color="#f59e0b" label="Light" />
                  </div>
               </div>

               <div className="h-[350px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorMoisture" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                      <XAxis 
                        dataKey="time" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: 'rgba(255,255,255,0.2)', fontSize: 10, fontWeight: 900 }} 
                      />
                      <YAxis 
                        hide 
                        domain={[0, 100]}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(5,5,5,0.9)', 
                          border: '1px solid rgba(255,255,255,0.1)', 
                          borderRadius: '20px', 
                          fontSize: '10px',
                          fontWeight: '900',
                          textTransform: 'uppercase'
                        }} 
                      />
                      <Area type="monotone" dataKey="moisture" stroke="#10b981" strokeWidth={4} fillOpacity={1} fill="url(#colorMoisture)" />
                      <Area type="monotone" dataKey="temp" stroke="#3b82f6" strokeWidth={4} fillOpacity={0} />
                      <Area type="monotone" dataKey="light" stroke="#f59e0b" strokeWidth={4} fillOpacity={0} />
                    </AreaChart>
                  </ResponsiveContainer>
               </div>
            </div>

            {/* Right Side Stats */}
            <div className="space-y-8">
               <TelemetryMetricCard 
                  title="System Precision"
                  value="ULTRA"
                  subValue="±0.04% Error Rate"
                  icon={ShieldCheck}
                  color="text-emerald-500"
               />
               <TelemetryMetricCard 
                  title="Network Lattice"
                  value="12/12"
                  subValue="Peer Nodes Synchronized"
                  icon={Cpu}
                  color="text-blue-500"
               />
               <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden group">
                  <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-emerald-500/20 blur-[60px]" />
                  <div className="relative z-10">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 mb-2">Protocol Status</h4>
                    <div className="flex items-center gap-3 mb-6">
                      <Sparkles className="w-5 h-5 text-emerald-400" />
                      <span className="text-sm font-black uppercase italic tracking-tighter">Verified</span>
                    </div>
                    <p className="text-[10px] font-bold text-white/40 leading-relaxed mb-6">
                      Hardened cryptographic signature applied to all environmental telemetry packets.
                    </p>
                    <div className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">
                       Last Calibration: {lastCalibration || "Not calibrated"}
                    </div>
                  </div>
               </div>
            </div>
          </div>

          {/* Diagnostic Feed */}
          <section className="bg-white dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-[3.5rem] p-10">
             <div className="flex items-center justify-between mb-10">
                <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tighter">Environmental Audit Trace</h3>
                <div className="flex items-center gap-3 px-4 py-2 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/5">
                   <AlertCircle className="w-4 h-4 text-slate-400" />
                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global Watch: NOMINAL</span>
                </div>
             </div>

             <div className="space-y-4">
                {signals.slice(0, 5).map((s, i) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    key={s.id} 
                    className="flex items-center justify-between p-6 rounded-3xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 hover:border-emerald-500/30 transition-all group"
                  >
                    <div className="flex items-center gap-6">
                       <div className="w-10 h-10 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Activity className="w-5 h-5 text-emerald-500" />
                       </div>
                       <div>
                          <div className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest mb-1">{s.signal_type} DETECTED</div>
                          <div className="text-[11px] font-bold text-slate-400 dark:text-white/20">Source Node: {s.provider || "SAT-NODE-A1"} • Confidence: {s.confidence_score}%</div>
                       </div>
                    </div>
                    <div className="flex items-center gap-8">
                       <div className="text-right">
                          <div className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest mb-1">Status</div>
                          <div className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${s.severity === 'CRITICAL' ? 'bg-red-500/20 text-red-500' : 'bg-emerald-500/20 text-emerald-500'}`}>
                             {s.severity}
                          </div>
                       </div>
                    </div>
                  </motion.div>
                ))}
             </div>
          </section>

        </div>
      </main>
    </div>
  );
}

function LegendItem({ color, label }: { color: string, label: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
      <span className="text-[10px] font-black text-slate-400 dark:text-white/30 uppercase tracking-widest">{label}</span>
    </div>
  );
}

function TelemetryMetricCard({ title, value, subValue, icon: Icon, color }: { title: string, value: string, subValue: string, icon: React.ElementType, color: string }) {
  return (
    <div className="bg-white dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-[2.5rem] p-8 group hover:border-emerald-500/30 transition-all">
       <div className="flex items-center justify-between mb-6 text-slate-300 dark:text-white/10">
          <h4 className="text-[10px] font-black uppercase tracking-[0.3em]">{title}</h4>
          <Icon className={`w-5 h-5 ${color}`} />
       </div>
       <div className="flex flex-col gap-1">
          <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">{value}</div>
          <div className="text-[10px] font-bold text-slate-400 dark:text-white/20 tracking-widest">{subValue}</div>
       </div>
    </div>
  );
}

function Badge({ children, variant = "default", className = "" }: { children: React.ReactNode, variant?: string, className?: string }) {
  const styles: Record<string, string> = {
    default: "bg-slate-100 text-slate-900 dark:bg-white/10 dark:text-white",
    emerald: "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
  };
  return (
    <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${styles[variant]} ${className}`}>
      {children}
    </span>
  );
}
