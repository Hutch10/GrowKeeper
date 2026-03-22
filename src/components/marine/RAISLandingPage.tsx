import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, Globe, Lock } from 'lucide-react';

/**
 * RAIS Landing Page v4.0.0
 * The 'Tactical Geologist' GTM Portal.
 */
export const RAISLandingPage: React.FC = () => {
  return (
    <div className="bg-black text-emerald-500 font-mono min-h-screen selection:bg-emerald-500 selection:text-black">
      {/* Telemetry Bar */}
      <div className="border-b border-emerald-900/30 bg-black/80 backdrop-blur-md sticky top-0 z-50 p-2 text-[10px] flex justify-between uppercase tracking-tighter">
        <div className="flex gap-4">
          <span className="text-emerald-300">SYSTEM: GENESIS_LIVE</span>
          <span className="opacity-50">|</span>
          <span>EPOCH: {new Date().toISOString().split('T')[0]}</span>
          <span className="opacity-50">|</span>
          <span className="animate-pulse text-red-500">THREAT_LEVEL: NOMINAL</span>
        </div>
        <div className="flex gap-4">
          <span>ZK_CIRCUIT: ACTIVE</span>
          <span className="text-emerald-400">NODES: 04/12</span>
        </div>
      </div>

      {/* Hero Section */}
      <header className="relative py-24 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-900/10 via-black to-black opacity-50" />
        <div className="max-w-6xl mx-auto relative z-10 text-center">
          <Badge className="mb-6 bg-emerald-500 text-black border-none px-4 py-1 font-black tracking-[0.3em]">
            TERMINAL_SOVEREIGNTY_ESTABLISHED
          </Badge>
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-white mb-6 uppercase">
            RAIS <span className="text-emerald-500">GENESIS</span>
          </h1>
          <p className="max-w-2xl mx-auto text-emerald-400/70 text-lg mb-12 uppercase tracking-tight">
            The world&apos;s first autonomous economic shield for ecological truth. 
            Enforced by structure. Protected by invariants.
          </p>
          <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
            <Button className="bg-emerald-500 hover:bg-emerald-400 text-black px-12 py-8 text-xl font-black uppercase rounded-none transition-all hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
              Join the Shield // Private Beta
            </Button>
            <Button variant="outline" className="border-emerald-500/30 hover:bg-emerald-500/10 text-emerald-500 px-8 py-8 text-lg font-bold uppercase rounded-none">
              View Invariants
            </Button>
          </div>
        </div>
      </header>

      {/* Mechanics Grid */}
      <section className="py-24 px-4 border-t border-emerald-900/20">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-4">
            <Lock className="w-12 h-12 text-emerald-400" />
            <h3 className="text-2xl font-black text-white uppercase">Zero-Leakage</h3>
            <p className="text-sm opacity-60 leading-relaxed">
              Geohash-temporal bucketing ensures one ecological incident results in exactly one economic outcome. No fragmentation. No exploits.
            </p>
          </div>
          <div className="space-y-4">
            <Shield className="w-12 h-12 text-emerald-400" />
            <h3 className="text-2xl font-black text-white uppercase">Fail-Closed</h3>
            <p className="text-sm opacity-60 leading-relaxed">
              If consensus fails or constitutional invariants are breached, the protocol enters SPARSE_SHIELD. Capital movement stops instantly.
            </p>
          </div>
          <div className="space-y-4">
            <Globe className="w-12 h-12 text-emerald-400" />
            <h3 className="text-2xl font-black text-white uppercase">Global Latch</h3>
            <p className="text-sm opacity-60 leading-relaxed">
              Deterministic single-winner arbitration across 12 nodes ensures that regional boundaries never create double-payout loops.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <div className="bg-emerald-950/20 border-y border-emerald-900/30 py-8 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between gap-8 text-center md:text-left">
          <div>
            <p className="text-[10px] uppercase opacity-50 mb-1">Total Coverage</p>
            <p className="text-4xl font-black text-white tracking-widest">4,502 <span className="text-sm opacity-30">KM²</span></p>
          </div>
          <div>
            <p className="text-[10px] uppercase opacity-50 mb-1">Genesis Reserve</p>
            <p className="text-4xl font-black text-white tracking-widest">$248,500 <span className="text-sm opacity-30">USD</span></p>
          </div>
          <div>
            <p className="text-[10px] uppercase opacity-50 mb-1">Adversarial Bounties</p>
            <p className="text-4xl font-black text-white tracking-widest">0 <span className="text-sm opacity-30">HITS</span></p>
          </div>
        </div>
      </div>

      {/* Call to Action Footer */}
      <footer className="py-24 px-4 text-center border-t border-emerald-900/20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]">
        <h2 className="text-3xl font-black text-white uppercase mb-8 tracking-widest">Protecting the Unprotectable</h2>
        <p className="mb-12 opacity-50 text-xs">RAIS PROTOCOL // MAINNET_ENFORCEMENT // v3.6.0</p>
        <div className="flex gap-4 justify-center">
          <Badge className="bg-black border border-emerald-900/50 text-emerald-500 rounded-none px-4">X // @RAIS_SHIELD</Badge>
          <Badge className="bg-black border border-emerald-900/50 text-emerald-500 rounded-none px-4">DISCORD // SOVEREIGN_REEF</Badge>
        </div>
      </footer>
    </div>
  );
};
