"use client";

import { useEffect, useState } from "react";
import { Cloud, Sun, Droplets, Wind, AlertTriangle, CheckCircle2, RefreshCw } from "lucide-react";
import { getWeatherData, WeatherData } from "@/app/actions/weather";

export function WeatherAdvisory() {
  const [data, setData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWeather = async () => {
    setLoading(true);
    const result = await getWeatherData("New York, NY"); // Default for Phase 0.2.2
    if (result.success) {
      setData(result.data);
      setError(null);
    } else {
      setError(result.error || "Failed to fetch weather data.");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchWeather();
  }, []);

  if (loading) {
    return (
      <div className="w-full bg-white/50 backdrop-blur-md border border-brand-pink/20 rounded-[2.5rem] p-8 animate-pulse flex items-center justify-center gap-4">
        <RefreshCw className="w-5 h-5 text-brand-pink/40 animate-spin" />
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-dark/20">Analyzing Local Climate...</span>
      </div>
    );
  }

  if (error || !data) {
    return null;
  }

  const isWarning = data.impact.toLowerCase().includes("warning") || data.impact.toLowerCase().includes("alert");

  return (
    <div className={`w-full relative overflow-hidden group transition-all duration-700 hover:shadow-2xl hover:shadow-brand-pink/10 rounded-[2.5rem] border-2 ${
      isWarning ? "bg-amber-50 border-amber-200" : "bg-white border-brand-pink/20"
    }`}>
      {/* Dynamic Background Element */}
      <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none transition-transform duration-1000 group-hover:scale-110 group-hover:rotate-12">
        {data.condition === "Sunny" ? <Sun size={200} /> : <Cloud size={200} />}
      </div>

      <div className="relative p-8 md:p-10 flex flex-col md:flex-row items-start md:items-center gap-8 md:gap-12">
        {/* Main Stats */}
        <div className="flex items-center gap-6">
          <div className={`p-6 rounded-[2rem] transition-all duration-500 ${
            isWarning ? "bg-amber-500 text-white shadow-xl shadow-amber-500/20" : "bg-brand-pink/10 text-brand-pink-dark"
          }`}>
            {data.condition === "Sunny" ? <Sun size={40} /> : <Cloud size={40} />}
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-black text-brand-dark tracking-tighter">{data.temp}°</span>
              <span className="text-lg font-bold text-brand-dark/30 uppercase tracking-widest">F</span>
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-dark/40 mt-1">{data.condition} · {data.location}</p>
          </div>
        </div>

        {/* Separator */}
        <div className="hidden md:block w-px h-16 bg-brand-pink/10" />

        {/* Impact & Recommendation */}
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-2">
            {isWarning ? (
              <AlertTriangle className="w-5 h-5 text-amber-600 animate-bounce" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            )}
            <span className={`text-xs font-black uppercase tracking-widest ${isWarning ? "text-amber-700" : "text-emerald-600"}`}>
              {data.impact}
            </span>
          </div>
          <p className="text-brand-dark font-extrabold text-sm leading-relaxed max-w-xl">
            {data.recommendation}
          </p>
        </div>

        {/* Sensors */}
        <div className="flex items-center gap-4 md:gap-8 bg-brand-pink/5 px-8 py-5 rounded-[2rem] border border-brand-pink/10">
          <div className="flex flex-col items-center gap-1">
            <Droplets className="w-4 h-4 text-brand-pink-dark/40" />
            <span className="text-[10px] font-black text-brand-dark">{data.humidity}%</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Sun className="w-4 h-4 text-amber-500/40" />
            <span className="text-[10px] font-black text-brand-dark">UV {data.uvIndex}</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Wind className="w-4 h-4 text-emerald-500/40" />
            <span className="text-[10px] font-black text-brand-dark">Low</span>
          </div>
        </div>
      </div>
    </div>
  );
}
