"use client";

export const dynamic = "force-dynamic";

import { Sidebar } from "@/components/layout/sidebar";
import FieldMap from "@/components/maps/field-map";
import { 
  Activity, 
  Battery, 
  Cpu, 
  Database,
  Zap,
  Bluetooth as BluetoothIcon
} from "lucide-react";
import { useState, useEffect } from "react";
import { specimensDB } from "@/lib/pouchdb";
import { p2pSync } from "@/lib/p2p-sync";
import { SpecimenScanner } from "@/components/plants/specimen-scanner";
import { instrumentManager } from "@/lib/bluetooth-sync";
import { SensorCalibration } from "@/components/diagnostics/sensor-calibration";

export default function FieldInstrumentPage() {
  const [isOnline, setIsOnline] = useState<boolean | null>(null);
  const [localDocCount, setLocalDocCount] = useState(0);
  const [isBTConnected, setIsBTConnected] = useState(false);
  const [btDeviceName, setBtDeviceName] = useState("");
  const [swarmStatus, setSwarmStatus] = useState<{ active: boolean; connected: boolean; peers: number } | null>(null);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [telemetry, setTelemetry] = useState<Record<string, number | { lat: number; lng: number }>>({
    uv: 0,
    moisture: 0,
  });

  const [logs, setLogs] = useState<Array<{ message: string; status: 'ok' | 'warning' | 'error' }>>([]);

  const addLog = (message: string, status: 'ok' | 'warning' | 'error' = 'ok') => {
    setLogs(prev => [...prev, { message, status }].slice(-10));
  };

  useEffect(() => {
    addLog("Initializing PouchDB cache...");
    specimensDB.info()
      .then(info => {
        setLocalDocCount(info.doc_count);
        addLog(`PouchDB Synchronized: ${info.doc_count} docs available.`);
      })
      .catch(err => addLog(`PouchDB Error: ${err.message}`, 'error'));

    addLog("Scanning local geofence layers...");
    
    p2pSync.init('growkeeper-swarm-tactical').then(() => {
      addLog("P2P Swarm Handler active.");
      const interval = setInterval(() => {
        const status = p2pSync.getSwarmStatus();
        setSwarmStatus(status as { active: boolean; connected: boolean; peers: number });
      }, 2000);
      return () => clearInterval(interval);
    });

    // Mocking TFJS load for UI flavor
    setTimeout(() => addLog("Loading TFJS MobileNet kernels..."), 800);
    setTimeout(() => addLog("Calibrating sensor offsets...", 'warning'), 1500);
    setTimeout(() => addLog("Instrument armed and ready."), 2200);

    // Online/Offline
    setIsOnline(navigator.onLine);
    const handleOnline = () => {
      setIsOnline(true);
      addLog("Network connection restored.");
    };
    const handleOffline = () => {
      setIsOnline(false);
      addLog("Network lost: Switching to L1 Local Store.", 'warning');
    };
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      p2pSync.destroy();
      instrumentManager.disconnect();
    };
  }, []);

  const handleBTConnect = async () => {
    addLog("Requesting Bluetooth Hardware Link...");
    try {
      const name = await instrumentManager.connect();
      setBtDeviceName(name);
      setIsBTConnected(true);
      addLog(`Connected to ${name}`, 'ok');
      
      instrumentManager.startNotifications((data) => {
        setTelemetry(prev => ({
          ...prev,
          [data.type]: data.value
        }));
      });
    } catch (err: unknown) {
      addLog(`Bluetooth Error: ${(err as Error).message || 'Connection failed'}`, 'error');
      alert("Bluetooth connection failed.");
    }
  };

  return (
    <div className="flex h-screen bg-black font-mono selection:bg-emerald-500/30 overflow-hidden">
      <Sidebar className="hidden lg:flex" />
      
      <main className="flex-1 lg:ml-64 p-4 lg:p-6 flex flex-col gap-4 overflow-hidden">
        {/* Tactical Header */}
        <div className="flex items-center justify-between bg-zinc-900/50 backdrop-blur-md border border-white/5 p-4 rounded-3xl">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/20">
              <Zap className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-white text-sm font-black tracking-widest uppercase">Field Instrument v7.1</h1>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isOnline === null ? 'bg-zinc-700' : isOnline ? 'bg-emerald-400' : 'bg-orange-400 animate-pulse'}`} />
                <span className="text-[10px] text-white/40 font-bold uppercase">
                  {isOnline === null ? 'Initializing...' : isOnline ? 'Network: Synchronized' : 'Network: LOCAL-ONLY (DEAD ZONE)'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <TelemetryItem icon={Zap} label="Swarm Sync" value={swarmStatus?.connected ? `${swarmStatus.peers} Peers` : (swarmStatus ? 'Connecting...' : '...')} active={swarmStatus?.connected || false} />
            <TelemetryItem icon={Cpu} label="Edge AI" value="Ready" active={true} />
            <TelemetryItem icon={Database} label="Local Sync" value={`${localDocCount} Docs`} active={true} />
            <TelemetryItem icon={Battery} label="Power" value="84%" active={true} />
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col lg:flex-row gap-4 overflow-hidden">
          {/* Mapping Engine */}
          <div className="flex-[2] relative min-h-[400px]">
            <FieldMap />
          </div>

          {/* Right Control Panel */}
          <div className="flex-1 flex flex-col gap-4">
            {/* Bluetooth Config */}
            <div className="bg-zinc-900/50 backdrop-blur-md border border-white/5 p-6 rounded-[2.5rem] flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="text-white text-xs font-black uppercase tracking-widest">Hardware Link</h3>
                <BluetoothIcon className={`w-4 h-4 ${isBTConnected ? 'text-emerald-400' : 'text-white/20'}`} />
              </div>
              
              {isBTConnected ? (
                <div className="flex flex-col gap-4">
                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
                    <div className="text-[10px] text-emerald-400 font-black uppercase mb-1">Authenticated</div>
                    <div className="text-white font-bold">{btDeviceName}</div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-4 bg-white/5 border border-white/5 rounded-2xl">
                      <div className="text-[8px] text-white/40 font-black uppercase mb-1 tracking-widest">UV Index</div>
                      <div className="text-xl text-white font-black">{telemetry.uv as number} <span className="text-[10px] text-white/20">UVI</span></div>
                    </div>
                    <div className="p-4 bg-white/5 border border-white/5 rounded-2xl">
                      <div className="text-[8px] text-white/40 font-black uppercase mb-1 tracking-widest">Moisture</div>
                      <div className="text-xl text-white font-black">{telemetry.moisture as number}%</div>
                    </div>
                  </div>
                </div>
              ) : (
                <button 
                  onClick={handleBTConnect}
                  className="w-full py-4 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-2xl text-xs font-black transition-all active:scale-95"
                >
                  Pair External Instrument
                </button>
              )}
            </div>

            {/* AI Diagnostics Feed */}
            <div className="bg-zinc-900/50 backdrop-blur-md border border-white/5 p-6 rounded-[2.5rem] flex flex-col gap-4 max-h-[300px] overflow-hidden">
              <h3 className="text-white text-xs font-black uppercase tracking-widest">Spectral Diagnostics</h3>
              <div className="flex-1 space-y-4 overflow-y-auto no-scrollbar pr-2">
                {logs.map((log, i) => (
                  <DiagnosticLog key={i} message={log.message} status={log.status} />
                ))}
              </div>
              <div className="pt-4 border-t border-white/5">
                <button 
                  id="btn-initiate-scan"
                  onClick={() => {
                    addLog("Initiating Spectral Scan...");
                    setIsScannerOpen(true);
                  }}
                  className="w-full h-12 flex items-center justify-between bg-emerald-400 text-black px-4 rounded-xl font-black text-[10px] cursor-pointer hover:bg-emerald-300 transition-all active:scale-95 outline-none border-none"
                >
                  <span>INITIATE SCAN</span>
                  <Activity className="w-4 h-4 animate-pulse" />
                </button>
              </div>
            </div>
            {/* HID Calibration Hub */}
            <SensorCalibration />
          </div>
        </div>

        <SpecimenScanner 
          isOpen={isScannerOpen} 
          onClose={() => setIsScannerOpen(false)} 
          specimenNickname="FIELD-NODE-ALPHA"
        />
      </main>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}

function TelemetryItem({ icon: Icon, label, value, active }: { icon: React.ElementType, label: string, value: string, active: boolean }) {
  return (
    <div className="hidden sm:flex flex-col items-end">
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-white/20 font-black uppercase tracking-tighter">{label}</span>
        <Icon className={`w-3 h-3 ${active ? 'text-emerald-400' : 'text-white/20'}`} />
      </div>
      <div className="text-white text-xs font-black">{value}</div>
    </div>
  );
}

function DiagnosticLog({ message, status }: { message: string, status: 'ok' | 'warning' | 'error' }) {
  const colors = {
    ok: 'bg-emerald-400',
    warning: 'bg-orange-400',
    error: 'bg-red-400'
  };
  return (
    <div className="flex gap-3">
      <div className={`mt-1.5 w-1 h-1 rounded-full ${colors[status]} shrink-0`} />
      <span className="text-[10px] text-white/40 font-bold leading-relaxed">{message}</span>
    </div>
  );
}
