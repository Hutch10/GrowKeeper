import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

/**
 * Steward Onboarding Workflow v4.0.0
 * Handles the multi-step registration for Tier 1 Private Beta.
 */
export const StewardOnboarding: React.FC = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');

  return (
    <div className="bg-black text-emerald-500 font-mono p-8 rounded-none border border-emerald-900/40 max-w-lg mx-auto shadow-[0_0_50px_rgba(16,185,129,0.1)]">
      <div className="space-y-6">
        <div className="flex justify-between items-center mb-8">
          <Badge className="bg-emerald-900/30 text-emerald-400 border-none px-3 py-1 text-[10px]">TIER_1_PRIVATE_ACCESS</Badge>
          <span className="text-[10px] opacity-50">STEP 0{step}/03</span>
        </div>

        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-black text-white uppercase tracking-tight">Identity Verification</h2>
            <p className="text-sm opacity-60">Enter your credentials to apply for the Genesis Shield program.</p>
            <Input 
              type="email" 
              placeholder="OP_EMAIL@AGENCY.DOMAIN" 
              className="bg-emerald-950/20 border-emerald-900/50 text-emerald-500 rounded-none h-12 uppercase text-xs"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Button 
              className="w-full bg-emerald-500 text-black font-black uppercase rounded-none h-12"
              onClick={() => setStep(2)}
              disabled={!email}
            >
              Request ZK-Credential // Next
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-black text-white uppercase tracking-tight">Geofence Selection</h2>
            <p className="text-sm opacity-60">Select your active monitoring sector for station deployment.</p>
            <div className="grid grid-cols-2 gap-2">
              {['swbf1', 'd7p', 'c23', 'ez'].map(cell => (
                <Button key={cell} variant="outline" className="border-emerald-900/50 text-emerald-500 uppercase rounded-none text-[10px] hover:bg-emerald-500/10">
                  SECTOR_{cell}
                </Button>
              ))}
            </div>
            <Button 
              className="w-full bg-emerald-500 text-black font-black uppercase rounded-none h-12"
              onClick={() => setStep(3)}
            >
              Initialize Latch // Next
            </Button>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4 text-center">
            <div className="w-16 h-16 border-2 border-emerald-500 animate-spin mx-auto mb-4 border-t-transparent rounded-full" />
            <h2 className="text-2xl font-black text-white uppercase tracking-tight">Finalizing Handshake</h2>
            <p className="text-[10px] opacity-40 uppercase tracking-widest">Generating ZK-Privacy Proof...</p>
            <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30">ENFORCEMENT_WAITLIST_POSITION: #42</Badge>
          </div>
        )}
      </div>
    </div>
  );
};
