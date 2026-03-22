'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

/**
 * Transparency Portal v3.2.0
 * Live view of the Sovereign Protocol's internal enforcement mechanics.
 */
export const TransparencyPortal: React.FC = () => {
  const [incidents] = useState([
    { id: 'INC_swbf1_4930', totalPaid: 4750, latches: ['MALDIVES'], status: 'LOCKED' },
    { id: 'INC_swbf2_4930', totalPaid: 0, latches: [], status: 'OPEN' },
    { id: 'INC_swbf3_4930', totalPaid: 0, latches: ['CARIBBEAN'], status: 'LOCKED' },
  ]);

  return (
    <div className="p-4 bg-slate-950 text-emerald-500 font-mono min-h-screen border border-emerald-900/40">
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="border-b border-emerald-900/50 pb-4">
          <h1 className="text-2xl font-black italic tracking-tighter text-white">
            TRANSPARENCY_PORTAL <span className="text-emerald-500 font-normal not-italic text-sm ml-2">v3.2.0 OPEN_BETA</span>
          </h1>
          <p className="text-[10px] opacity-60">LIVE_AUDIT_STREAM // NO_BYPASS_MODE_ACTIVE</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Latch Table */}
          <Card className="bg-black/50 border-emerald-900/30">
            <CardHeader>
              <CardTitle className="text-xs uppercase tracking-widest">Active Incident Latches</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {incidents.map(inc => (
                  <div key={inc.id} className="flex justify-between items-center bg-emerald-950/10 p-2 border border-emerald-900/20 rounded">
                    <div>
                      <p className="text-[10px] text-white font-bold">{inc.id}</p>
                      <div className="flex gap-1 mt-1">
                        {inc.latches.map(l => (
                          <Badge key={l} variant="outline" className="text-[8px] border-emerald-500 text-emerald-500">{l}</Badge>
                        ))}
                        {inc.latches.length === 0 && <span className="text-[8px] opacity-40 uppercase italic">Awaiting_Event</span>}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] opacity-50">${inc.totalPaid}</p>
                      <Badge className={inc.status === 'LOCKED' ? 'bg-emerald-900 text-emerald-400' : 'bg-slate-800 text-slate-400 text-[8px]'}>
                        {inc.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Blocked Leakage Chart (Mock) */}
          <Card className="bg-black/50 border-emerald-900/30">
            <CardHeader>
              <CardTitle className="text-xs uppercase tracking-widest">Blocked Capital Leakage</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-32 flex items-end gap-1 border-b border-emerald-900/20">
                {[40, 70, 45, 90, 65, 30, 80].map((h, i) => (
                  <div key={i} className="flex-1 bg-emerald-500/20 hover:bg-emerald-500/40 transition-colors border-t border-emerald-500" style={{ height: `${h}%` }} />
                ))}
              </div>
              <div className="flex justify-between mt-2 text-[8px] opacity-50">
                <span>EPOCH_T-6</span>
                <span>TOTAL_SAVED: $42,500</span>
                <span>EPOCH_NOW</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Real-time Audit Ticker */}
        <div className="bg-emerald-950/20 border border-emerald-500/10 p-3 rounded text-[9px] h-32 overflow-y-auto">
          <p className="text-emerald-700 opacity-50 mb-1 border-b border-emerald-900/10 uppercase">Raw_Invariant_Stream</p>
          <div className="space-y-0.5">
            <p className="text-emerald-300">[09:14:02] INCIDENT_LATCH_ACQUIRED: Geohash(swbf1) &rarr; MALDI_V_NODE_01</p>
            <p className="text-amber-500">[09:14:05] CONTENTION_BLOCKED: Geohash(swbf1) claim attempted by CARIB_V_NODE_04</p>
            <p className="text-emerald-300">[09:14:08] PAYOUT_AUTHORIZED: $4,750 (Incident: swbf1_4930)</p>
            <p className="text-rose-500 font-bold">[09:14:10] DEDUPE_CANCEL: Duplicate claim from MALDI_V_NODE_07 for Geohash(swbf1)</p>
          </div>
        </div>
      </div>
    </div>
  );
};
