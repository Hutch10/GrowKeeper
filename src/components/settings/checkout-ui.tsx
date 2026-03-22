"use client";

import { useState } from "react";
import { ShieldCheck, CreditCard, Lock, ArrowRight, CheckCircle2, Leaf, Sparkles } from "lucide-react";

interface CheckoutProps {
  planName?: string;
  price?: string;
  onSuccess?: () => void;
}

export function CheckoutUI({ planName = "Master Grower", price = "$24.99", onSuccess }: CheckoutProps) {
  const [step, setStep] = useState<"details" | "processing" | "success">("details");

  const handlePayment = () => {
    setStep("processing");
    setTimeout(() => {
      setStep("success");
      if (onSuccess) onSuccess();
    }, 2500);
  };

  if (step === "success") {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in zoom-in duration-500">
        <div className="w-24 h-24 bg-brand-green/20 text-brand-green rounded-full flex items-center justify-center mb-8 border-4 border-brand-green/10">
          <CheckCircle2 className="w-12 h-12" />
        </div>
        <h2 className="text-4xl font-black text-brand-dark mb-4 italic">Welcome to the Inner Circle</h2>
        <p className="text-slate-500 font-bold max-w-sm mb-10">
          Your {planName} membership is now active. The Botanical Concierge has been notified of your priority status.
        </p>
        <button 
          onClick={() => window.location.href = "/dashboard"}
          className="px-10 py-5 bg-brand-dark text-white font-black rounded-2xl shadow-2xl hover:bg-brand-green transition-all active:scale-95"
        >
          Enter Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start max-w-5xl mx-auto py-12 px-6">
      {/* Order Summary */}
      <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-100/50">
        <div className="flex items-center gap-3 mb-10">
          <div className="p-3 bg-brand-pink/10 text-brand-pink rounded-2xl border border-brand-pink/20">
            <Leaf className="w-6 h-6" />
          </div>
          <h3 className="text-2xl font-black text-brand-dark">Investment Summary</h3>
        </div>

        <div className="space-y-6 mb-10">
          <div className="flex justify-between items-center py-4 border-b border-slate-50">
            <div>
              <div className="font-black text-brand-dark text-lg">{planName} Membership</div>
              <div className="text-sm font-bold text-slate-400 italic">Billed Monthly • Cancel anytime</div>
            </div>
            <div className="font-black text-lg">{price}</div>
          </div>
          <div className="flex justify-between items-center py-4 border-b border-slate-50">
            <div className="font-bold text-slate-500">Botanical AI Surcharge</div>
            <div className="font-bold text-brand-green">INCLUDED</div>
          </div>
          <div className="flex justify-between items-center pt-4">
            <div className="text-xl font-black text-brand-dark">Total Due Today</div>
            <div className="text-3xl font-black text-brand-green tracking-tight">{price}</div>
          </div>
        </div>

        <div className="bg-brand-green/5 p-6 rounded-2xl border border-brand-green/10 flex gap-4">
          <Sparkles className="w-5 h-5 text-brand-green shrink-0" />
          <p className="text-xs font-bold text-emerald-800 leading-relaxed">
            As a {planName}, you&apos;ll receive a 100% discount on all Marketplace Health Certificates and priority Botanical Concierge support.
          </p>
        </div>
      </div>

      {/* Payment Form */}
      <div className="space-y-8">
        <div className="bg-brand-dark p-10 rounded-[3rem] text-white shadow-2xl shadow-slate-300">
          <header className="flex justify-between items-center mb-10">
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-brand-green" />
              <span className="text-xs font-black uppercase tracking-widest">Secure Payment</span>
            </div>
            <Lock className="w-4 h-4 text-slate-500" />
          </header>

          <div className="space-y-6">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Cardholder Name</label>
              <input 
                type="text" 
                placeholder="GENE GROWER"
                className="w-full bg-slate-800 border-none rounded-xl py-4 px-5 text-sm font-black focus:ring-2 focus:ring-brand-green/50 transition-all uppercase placeholder:opacity-20"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Card Information</label>
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="4242 4242 4242 4242"
                  className="w-full bg-slate-800 border-none rounded-xl py-4 px-5 text-sm font-black focus:ring-2 focus:ring-brand-green/50 transition-all placeholder:opacity-20"
                />
                <CreditCard className="absolute right-4 top-4 w-5 h-5 text-slate-600" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Expiry</label>
                <input 
                  type="text" 
                  placeholder="MM / YY"
                  className="w-full bg-slate-800 border-none rounded-xl py-4 px-5 text-sm font-black focus:ring-2 focus:ring-brand-green/50 transition-all placeholder:opacity-20 text-center"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">CVC</label>
                <input 
                  type="text" 
                  placeholder="•••"
                  className="w-full bg-slate-800 border-none rounded-xl py-4 px-5 text-sm font-black focus:ring-2 focus:ring-brand-green/50 transition-all placeholder:opacity-20 text-center"
                />
              </div>
            </div>
          </div>

          <button 
            onClick={handlePayment}
            disabled={step === "processing"}
            className="w-full mt-10 py-5 bg-brand-green text-white font-black rounded-2xl shadow-xl shadow-emerald-900/50 hover:bg-emerald-400 transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {step === "processing" ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                Confirm Investment
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

        <div className="flex items-center justify-center gap-6 opacity-40 grayscale group hover:grayscale-0 transition-all duration-700">
          <ShieldCheck className="w-10 h-10 text-brand-green" />
          <div className="text-[10px] font-black uppercase tracking-wider text-slate-500 leading-tight">
            Encrypted by GrowKeeper Trust Architecture<br />
            $100M SECURE VAULT COMPLIANT
          </div>
        </div>
      </div>
    </div>
  );
}
