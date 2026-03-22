"use client";

import { useState } from "react";
import { sensorManager } from "@/lib/sensors";
import { Sliders, RefreshCw, AlertTriangle } from "lucide-react";

export function SensorCalibration() {
  const [isConnected, setIsConnected] = useState(false);
  const [deviceName, setDeviceName] = useState("");
  const [offset, setOffset] = useState(0);
  const [isCalibrating, setIsCalibrating] = useState(false);

  const handleConnect = async () => {
    try {
      const name = await sensorManager.requestConnection();
      setDeviceName(name);
      setIsConnected(true);
    } catch (err) {
      alert(err instanceof Error ? err.message : "HID Connection Failed");
    }
  };

  const handleCalibrate = async () => {
    setIsCalibrating(true);
    try {
      await sensorManager.calibrate(offset);
      // Simulate confirmation lag
      await new Promise(resolve => setTimeout(resolve, 800));
    } catch (err) {
      console.error("[HID] Calibration failed:", err);
      alert("Calibration failed: Instrument did not respond.");
    } finally {
      setIsCalibrating(false);
    }
  };

  return (
    <div className="bg-zinc-900/50 backdrop-blur-md border border-white/5 p-6 rounded-[2.5rem] flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-amber-500/10 rounded-lg flex items-center justify-center border border-amber-500/20">
            <Sliders className="w-4 h-4 text-amber-400" />
          </div>
          <h3 className="text-white text-xs font-black uppercase tracking-widest">Calibration Hub</h3>
        </div>
        {isConnected && <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />}
      </div>

      {!isConnected ? (
        <button 
          onClick={handleConnect}
          className="w-full py-4 bg-amber-400 text-black rounded-2xl text-[10px] font-black uppercase hover:bg-amber-300 transition-all"
        >
          Initialize HID Protocol
        </button>
      ) : (
        <div className="space-y-6">
          <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
            <div className="text-[8px] text-white/40 font-black uppercase mb-1">Active Hardware</div>
            <div className="text-white text-sm font-bold">{deviceName}</div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-white/40 font-black uppercase">Zero-Offset Adjustment</span>
              <span className="text-xs text-amber-400 font-bold">{offset > 0 ? `+${offset}` : offset}%</span>
            </div>
            <input 
              type="range" 
              min="-20" 
              max="20" 
              aria-label="Sensor Calibration Offset"
              value={offset} 
              onChange={(e) => setOffset(parseInt(e.target.value))}
              className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-amber-400"
            />
            <div className="flex justify-between text-[8px] text-white/20 font-bold">
              <span>-20% (DRY)</span>
              <span>+20% (WET)</span>
            </div>
          </div>

          <button 
            onClick={handleCalibrate}
            disabled={isCalibrating}
            className="w-full py-4 bg-white text-black rounded-2xl text-[10px] font-black uppercase flex items-center justify-center gap-2 hover:bg-white/90 transition-all disabled:opacity-50"
          >
            {isCalibrating ? (
              <RefreshCw className="w-3 h-3 animate-spin" />
            ) : (
              "Commit Calibration to ROM"
            )}
          </button>

          <div className="flex items-start gap-3 p-4 bg-orange-400/5 rounded-2xl border border-orange-400/10">
            <AlertTriangle className="w-4 h-4 text-orange-400 shrink-0" />
            <p className="text-[9px] text-orange-400/80 leading-relaxed font-medium">
              CRITICAL: Manual calibration overrides factory sensor scales. Use only with certified reference instruments.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
