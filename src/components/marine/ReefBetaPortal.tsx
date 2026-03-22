'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { logger } from '@/lib/observability/logger';

/**
 * Reef Beta Portal v3.0.0
 * The tactical onboarding interface for real-world reef stewards.
 */
export const ReefBetaPortal: React.FC = () => {
  const [coverageStatus, setCoverageStatus] = useState<'INACTIVE' | 'REGISTERING' | 'PROTECTED'>('INACTIVE');
  const [stats] = useState({
    activeStewards: 142,
    totalProtectedArea: '8.4k km²',
    poolSolvency: '$250k',
    uptime: '100.00%'
  });

  const handleRegister = async () => {
    setCoverageStatus('REGISTERING');
    logger.info('Beta', 'New Steward onboarding initiated...');
    
    // Simulation: 2.5s verification handshake
    setTimeout(() => {
      setCoverageStatus('PROTECTED');
      logger.info('Beta', 'Steward registration complete. Sovereign Shield Active.');
    }, 2500);
  };

  return (
    <div className="p-6 bg-slate-950 text-emerald-400 min-h-screen font-mono border-l border-emerald-900/30">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-end border-b border-emerald-900/50 pb-4">
          <div>
            <h1 className="text-3xl font-black tracking-tighter uppercase italic text-emerald-500">
              RAIS PROTOCOL <span className="text-white text-sm not-italic opacity-50 font-normal ml-2">v3.0.0-GRADUATE</span>
            </h1>
            <p className="text-xs opacity-70">SOVEREIGN_BETA_PROGRAM // MAINNET_CANDIDATE_77</p>
          </div>
          <div className="text-right">
            <Badge variant="outline" className="border-emerald-500 text-emerald-500 animate-pulse">
              LIVE_FRONTIER_NODES: 12
            </Badge>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-4">
          {Object.entries(stats).map(([key, val]) => (
            <Card key={key} className="bg-slate-900/50 border-emerald-900/30">
              <CardContent className="pt-4">
                <p className="text-[10px] uppercase opacity-50">{key.replace(/([A-Z])/g, ' $1')}</p>
                <p className="text-xl font-bold text-white">{val}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Onboarding Section */}
        <Card className="bg-emerald-950/10 border-emerald-500/30 overflow-hidden relative">
          <div className="absolute top-0 right-0 p-2 opacity-10">
            <div className="w-24 h-24 border-4 border-emerald-500 rounded-full flex items-center justify-center font-black text-4xl italic">
              GK
            </div>
          </div>

          <CardHeader>
            <CardTitle className="text-emerald-500 uppercase tracking-widest text-lg">
              Steward Onboarding
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm opacity-80 leading-relaxed">
              RAIS (Regenerative AI Insurance Sovereign) is now accepting real-world reef steward registrations. 
              By anchoring your station, you gain access to the **Absolute Sovereign Shield**—parametric payouts 
              verified by our decentralized Knowledge Moat and 8-neighbor correlation engine.
            </p>

            <div className="bg-black/50 p-4 border border-emerald-900/50 rounded flex justify-between items-center">
              <div>
                <p className="text-xs uppercase opacity-50">Current Status</p>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${coverageStatus === 'PROTECTED' ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-slate-700'}`} />
                  <span className={`font-bold ${coverageStatus === 'PROTECTED' ? 'text-emerald-500' : 'text-slate-400'}`}>
                    {coverageStatus}
                  </span>
                </div>
              </div>

              {coverageStatus === 'INACTIVE' && (
                <Button 
                  onClick={handleRegister}
                  className="bg-emerald-600 hover:bg-emerald-500 text-black font-black uppercase italic tracking-tighter"
                >
                  Anchor Station
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Console Log */}
        <div className="bg-black border border-emerald-900/30 p-4 text-[10px] opacity-60">
          <p className="text-emerald-700 font-bold mb-2 uppercase tracking-widest border-b border-emerald-900/20 pb-1">System_Telemetry_Log</p>
          <div className="space-y-1">
            <p>[09:05:22] CONSTITUTIONAL_BOOT: OK</p>
            <p>[09:05:24] DISTRIBUTED_LATCH_ONLINE: 12 NODES_CONSENSUS</p>
            <p>[09:05:28] MOAT_SYNC_COMPLETE: 1.4M SAMPLES_INDEXED</p>
            {coverageStatus === 'REGISTERING' && <p className="text-emerald-400 animate-pulse font-bold">[09:05:30] PENDING_STATION_HANDSHAKE: 0x8a7...f2d</p>}
            {coverageStatus === 'PROTECTED' && <p className="text-white font-bold">[09:05:32] SHIELD_ENGAGED: GEOHASH_PRECISION_5_ENABLED</p>}
          </div>
        </div>
      </div>
    </div>
  );
};
