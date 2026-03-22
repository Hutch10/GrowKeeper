'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

/**
 * Beta Launch Dashboard v3.1.0
 * Live monitoring of the 'Closed Beta' deployment.
 */
export const BetaLaunchDashboard: React.FC = () => {
  const [activeTesters] = useState([
    { id: 'ST-001', region: 'MALDIVES', status: 'MAINNET_ENFORCED', coverage: '1.2 km²' },
    { id: 'ST-002', region: 'MALDIVES', status: 'MAINNET_ENFORCED', coverage: '0.9 km²' },
    { id: 'ST-003', region: 'CARIBBEAN', status: 'ACTIVE', coverage: '2.4 km²' },
  ]);

  return (
    <div className="p-4 bg-black text-emerald-500 font-mono min-h-screen border border-emerald-900/50">
      <div className="max-w-6xl mx-auto space-y-4">
        <div className="flex justify-between items-end border-b border-emerald-900/30 pb-2">
          <h2 className="text-xl font-bold uppercase tracking-widest">
            RAIS_SOVEREIGN_MAINNET // PHASE_3.3_GRADUATION
          </h2>
          <Badge className="bg-emerald-500 text-black font-black animate-pulse">100/100 SOVEREIGN</Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-slate-900 border-emerald-900/40">
            <CardHeader>
              <CardTitle className="text-xs uppercase opacity-50 text-emerald-400">Total Beta Coverage</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-black text-white">4.5 km²</p>
              <p className="text-[10px] text-emerald-600 mt-1">+12% vs last epoch</p>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-900 border-emerald-900/40">
            <CardHeader>
              <CardTitle className="text-xs uppercase opacity-50 text-emerald-400">Sovereign Reserve</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-black text-white">$248,500</p>
              <p className="text-[10px] text-emerald-600 mt-1">Pool Utilization: 0.6%</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-emerald-900/40">
            <CardHeader>
              <CardTitle className="text-xs uppercase opacity-50 text-emerald-400">Active Handshakes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-black text-white">12 Stations</p>
              <p className="text-[10px] text-emerald-600 mt-1">Auth: ZK-SNARK Verified</p>
            </CardContent>
          </Card>
        </div>

        <div className="bg-emerald-950/10 border border-emerald-500/20 p-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-emerald-900/30 opacity-50">
                <th className="pb-2">STEWARD_ID</th>
                <th className="pb-2">REGION</th>
                <th className="pb-2">STATUS</th>
                <th className="pb-2">KM²</th>
              </tr>
            </thead>
            <tbody>
              {activeTesters.map(t => (
                <tr key={t.id} className="border-b border-emerald-900/10">
                  <td className="py-2 text-white">{t.id}</td>
                  <td className="py-2">{t.region}</td>
                  <td className="py-2">
                    <Badge variant="outline" className={`text-[8px] ${t.status === 'ACTIVE' ? 'border-emerald-500 text-emerald-500' : 'border-amber-500 text-amber-500'}`}>
                      {t.status}
                    </Badge>
                  </td>
                  <td className="py-2">{t.coverage}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
