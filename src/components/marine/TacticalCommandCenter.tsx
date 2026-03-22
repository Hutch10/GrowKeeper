import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MarineAlert, BuoyTelemetry } from '@/types/marine';
import { marineService } from '@/lib/services/marine-service';
import { payoutService } from '@/lib/services/payout-service';
import OperatorConsole from './OperatorConsole';

const TacticalCommandCenter: React.FC = () => {
  const [alerts, setAlerts] = useState<MarineAlert[]>([]);
  const [telemetry, setTelemetry] = useState<BuoyTelemetry | null>(null);
  const [pendingIds, setPendingIds] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const liveData = await marineService.fetchBuoyData('MALDIVES_01', 'MALDIVES');
        setTelemetry(liveData);
        const alert = await marineService.detectAnomalies(liveData);
        if (alert) {
          setAlerts(prev => [alert, ...prev].slice(0, 10));
          if (alert.severity === 'CRITICAL') {
            setPendingIds(prev => Array.from(new Set([...prev, alert.id])));
          }
        }
      } catch (err) {
        console.error('RAIS_LINK_FAILURE', err);
      }
    };

    const interval = setInterval(fetchData, 8000);
    fetchData(); // Initial load
    return () => clearInterval(interval);
  }, []);

  const handleApprove = async (alertId: string) => {
    try {
      const ok = await marineService.approveAction(alertId, 'OPERATOR_01');
      if (ok) {
        setPendingIds(prev => prev.filter(id => id !== alertId));
        // Trigger payout simulation
        const alert = alerts.find(a => a.id === alertId);
        if (alert) await payoutService.processParametricPayout(alert, 1.0);
      }
    } catch (err) {
      console.error('APPROVAL_ERROR', err);
    }
  };

  return (
    <div className="grid grid-cols-12 gap-4 p-6 bg-[#0B1F2A] min-h-screen text-[#00C896] font-mono">
      {/* 1. Header / Telemetry Bar */}
      <div className="col-span-12 flex justify-between items-center border-b border-[#00C896]/30 pb-2 mb-4">
        <h1 className="text-2xl font-black tracking-tighter text-[#FF4D6D]">RAIS // TACTICAL_COMMAND</h1>
        <div className="flex gap-6 text-sm">
          <span>LAT: 3.2028 N</span>
          <span>LNG: 73.2207 E</span>
          <span className={telemetry?.temperature && telemetry.temperature > 29 ? 'text-[#FF4D6D] animate-pulse' : ''}>
            TEMP: {telemetry?.temperature.toFixed(2)}°C
          </span>
          <span>pH: {telemetry?.ph.toFixed(2)}</span>
          <Badge variant="outline" className="border-[#00C896] text-[#00C896]">L1_SYNC: ACTIVE</Badge>
        </div>
      </div>

      {/* 2. Main Map / Visualization (Placeholder for Leaflet/Deck.gl) */}
      <div className="col-span-8 bg-[#1A3A4A]/50 border border-[#00C896]/20 rounded-lg p-4 relative overflow-hidden h-[600px] glassmorphism">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_#0B1F2A_100%)] pointer-events-none" />
        <div className="flex flex-col items-center justify-center h-full opacity-40">
          <div className="w-64 h-64 border-2 border-dashed border-[#00C896] rounded-full animate-spin-slow flex items-center justify-center">
             <div className="w-48 h-48 border border-[#FF4D6D] rounded-full" />
          </div>
          <p className="mt-4 tracking-widest uppercase text-xs">Awaiting Spatial Raster Data...</p>
        </div>
        
        {/* Floating Metrics Overlay */}
        <div className="absolute bottom-4 left-4 bg-black/60 p-4 border-l-2 border-[#FF4D6D]">
           <h3 className="text-[#FF4D6D] text-xs font-bold mb-1">REGIONAL_RISK</h3>
           <div className="text-xl font-black">42.8%</div>
        </div>
      </div>

      {/* 3. High-Density Alert Stream */}
      <div className="col-span-4 space-y-4 overflow-y-auto max-h-[600px] pr-2">
        <h3 className="text-xs font-bold tracking-widest text-[#00C896]/60 mb-2 uppercase">Live_Anomaly_Stream</h3>
        {alerts.length === 0 && (
           <p className="text-xs italic text-[#00C896]/30">No active anomalies detected...</p>
        )}
        {alerts.map(alert => (
          <Card key={alert.id} className={`bg-black/40 border-l-4 ${alert.severity === 'CRITICAL' ? 'border-[#FF4D6D]' : 'border-[#00C896]'} border-t-0 border-r-0 border-b-0 rounded-none`}>
            <CardContent className="p-3">
              <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] font-bold tracking-tighter opacity-70">{alert.id}</span>
                <Badge className={alert.severity === 'CRITICAL' ? 'bg-[#FF4D6D] text-white' : 'bg-[#00C896] text-black'}>
                  {alert.severity}
                </Badge>
              </div>
              <p className="text-sm font-bold leading-tight mb-2 text-white">{alert.reason}</p>
              <div className="flex justify-between items-center text-[10px]">
                <span>SCORE: {alert.zScore.toFixed(2)}</span>
                <button className="text-[#00C896] hover:underline uppercase font-bold">Details</button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 4. Operator Console Gating */}
      <div className="col-span-12">
        <OperatorConsole 
          pendingAlerts={alerts.filter(a => pendingIds.includes(a.id))} 
          onApprove={handleApprove}
        />
      </div>
    </div>
  );
};

export default TacticalCommandCenter;
