'use client';

import { StewardOnboarding } from '@/components/marine/StewardOnboarding';

export default function OnboardingPage() {
  return (
    <div className="bg-black min-h-screen py-24 px-4 overflow-hidden relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-900/10 via-black to-black opacity-50" />
      <div className="relative z-10">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-black text-white uppercase tracking-tighter mb-2">STEWARD ONBOARDING</h1>
          <p className="text-emerald-500/50 uppercase text-[10px] tracking-widest">RAIS GENESIS // SOVEREIGN_ENROLLMENT</p>
        </div>
        <StewardOnboarding />
      </div>
    </div>
  );
}
