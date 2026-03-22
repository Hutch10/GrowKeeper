"use client";

import { Sun, Thermometer, Wind, AlertTriangle, CheckCircle2 } from "lucide-react";
import type { WeatherData } from "@/app/actions/weather";

export function WeatherBanner({ weather }: { weather: WeatherData }) {
  const isOptimal = weather.impact === "Optimal Growth";

  return (
    <div className={`relative overflow-hidden rounded-[2.5rem] p-8 mb-12 border transition-all duration-700 ${
      isOptimal 
        ? "bg-gradient-to-br from-emerald-500 to-teal-600 border-emerald-400/30 text-white shadow-2xl shadow-emerald-200" 
        : "bg-gradient-to-br from-amber-400 to-orange-600 border-amber-400/30 text-white shadow-2xl shadow-orange-200"
    }`}>
      {/* Background Decor */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-black/10 rounded-full blur-3xl" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="flex items-start gap-6">
          <div className="bg-white/20 backdrop-blur-md p-4 rounded-3xl border border-white/30 shadow-xl">
            {isOptimal ? <Sun className="w-10 h-10" /> : <AlertTriangle className="w-10 h-10" />}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] bg-black/20 px-3 py-1 rounded-full">
                Climate Intelligence
              </span>
              {isOptimal ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-100" />
              ) : (
                <div className="w-2 h-2 bg-white rounded-full animate-ping" />
              )}
            </div>
            <h2 className="text-3xl font-black mb-1 leading-tight">
              {weather.impact}: {weather.condition}
            </h2>
            <p className="text-lg font-bold text-white/90 max-w-xl">
              {weather.recommendation}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 flex items-center gap-3">
            <Thermometer className="w-5 h-5 opacity-70" />
            <div>
              <div className="text-[10px] font-black uppercase tracking-widest text-white/50">Temp</div>
              <div className="text-lg font-black">{weather.temp}°F</div>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 flex items-center gap-3">
            <Wind className="w-5 h-5 opacity-70" />
            <div>
              <div className="text-[10px] font-black uppercase tracking-widest text-white/50">Humidity</div>
              <div className="text-lg font-black">{weather.humidity}%</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
