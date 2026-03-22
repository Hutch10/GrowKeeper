import React from 'react';

import { ShieldCheck, FileText, Lock, Globe } from 'lucide-react';

export const InsuranceReportViewer: React.FC = () => {
  return (
    <div className="max-w-2xl mx-auto p-6 bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl font-mono">
      <div className="flex justify-between items-start mb-8 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-bold text-blue-400">RAIS INTELLIGENCE AUDIT</h1>
          <p className="text-xs text-slate-500">ID: RAIS_REPORT_2026_03_20_001</p>
        </div>
        <div className="flex flex-col items-end">
          <ShieldCheck className="w-8 h-8 text-emerald-500" />
          <span className="text-[10px] text-emerald-500 uppercase mt-1">Verifiable ZK-Proof</span>
        </div>
      </div>

      <div className="space-y-6">
        <section>
          <div className="flex items-center gap-2 mb-2">
            <Globe className="w-4 h-4 text-blue-500" />
            <h2 className="text-sm font-semibold text-slate-300">ASSET METADATA</h2>
          </div>
          <div className="bg-slate-900/50 p-3 rounded rounded-lg text-sm text-slate-400">
            <p>Steward: <span className="text-slate-100">Maldives Sapphire Reef</span></p>
            <p>Asset Value: <span className="text-slate-100">$12.5M (Bio-Equity)</span></p>
          </div>
        </section>

        <section>
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-4 h-4 text-orange-500" />
            <h2 className="text-sm font-semibold text-slate-300">TELEMETRY AUDIT</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-900/50 p-3 rounded rounded-lg">
              <p className="text-[10px] text-slate-500">PEAK TEMP</p>
              <p className="text-lg font-bold text-rose-400">31.4°C</p>
            </div>
            <div className="bg-slate-900/50 p-3 rounded rounded-lg">
              <p className="text-[10px] text-slate-500">MAX Z-SCORE</p>
              <p className="text-lg font-bold text-rose-400">2.14</p>
            </div>
          </div>
        </section>

        <section className="border-t border-slate-800 pt-6">
          <div className="flex items-center gap-2 mb-2">
            <Lock className="w-4 h-4 text-emerald-500" />
            <h2 className="text-sm font-semibold text-slate-300">CRYPTOGRAPHIC PROOF</h2>
          </div>
          <div className="bg-emerald-950/20 border border-emerald-900/30 p-3 rounded rounded-lg">
            <p className="text-[10px] text-emerald-500 opacity-70">PROOF STRING (GROTH16)</p>
            <p className="text-[10px] break-all text-emerald-400 font-mono">SNARK_ZK_7x8b9c2a1d4e5f6g7h8i9j0k3l2m1n0p9q8r7s6t5u4v3w2x1y0z...</p>
          </div>
        </section>
      </div>

      <div className="mt-8 pt-4 border-t border-slate-800 flex justify-between items-center">
        <button className="text-[10px] text-slate-500 hover:text-slate-100 transition-colors">EXPORT FOR BROKER (.PDF)</button>
        <span className="text-[10px] text-slate-500 italic">Certified by GrowKeeper Protocol v7.2</span>
      </div>
    </div>
  );
};
