"use client";

import { Check, Award, ShieldCheck, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";

const TIERS = [
  {
    name: "Sprout",
    price: "$0",
    description: "Essential care for casual hobbyists.",
    features: [
      "Track up to 5 Plants",
      "Basic Care Reminders",
      "Community Profile Access",
      "Limited Plant Library",
    ],
    buttonText: "Current Plan",
    current: true,
  },
  {
    name: "Pro",
    price: "$9.99",
    description: "Advanced intelligence for serious collectors.",
    features: [
      "Unlimited Plant Tracking",
      "AI Deep Scan Diagnostics",
      "Predictive Weather Syncing",
      "Digital Twin Happiness Mapping",
      "Priority Marketplace Access",
    ],
    buttonText: "Upgrade to Pro",
    popular: true,
  },
  {
    name: "Master Grower",
    price: "$24.99",
    description: "The ultimate botanical management suite.",
    features: [
      "Everything in Pro",
      "Botanical Concierge AI (24/7)",
      "Bulk Asset Management",
      "Health Verification Certificates",
      "Zero Marketplace Commissions",
      "Early Access to Rare Drops",
    ],
    buttonText: "Become a Master",
    exclusive: true,
  },
];

export function BillingUI() {
  const router = useRouter();

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <header className="text-center mb-20">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-green/10 rounded-full text-brand-green font-black text-[10px] uppercase tracking-widest mb-6 border border-brand-green/20">
          <Sparkles className="w-3 h-3" />
          Monetization Alpha
        </div>
        <h1 className="text-5xl font-black text-brand-dark mb-6 tracking-tight italic">
          Elevate Your <span className="text-brand-green underline decoration-brand-pink/30 underline-offset-8">Botanical Portfolio</span>
        </h1>
        <p className="text-lg font-bold text-slate-500/80 max-w-2xl mx-auto leading-relaxed">
          Choose a tier that matches your collection&apos;s value. All plans include our signature high-fidelity botanical experience.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
        {TIERS.map((tier) => (
          <div 
            key={tier.name} 
            className={`relative group flex flex-col p-8 rounded-[3rem] transition-all duration-500 border ${
              tier.popular 
                ? "bg-brand-dark text-white border-brand-dark shadow-2xl shadow-slate-300 scale-105 z-10" 
                : tier.exclusive
                  ? "bg-white border-amber-200 shadow-xl shadow-amber-50"
                  : "bg-white border-slate-100 shadow-sm hover:shadow-xl"
            }`}
          >
            {tier.popular && (
              <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-brand-pink text-white px-6 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl">
                Most Valued
              </div>
            )}
            
            {tier.exclusive && (
              <div className="absolute top-8 right-8 text-amber-500">
                <Award className="w-8 h-8 fill-current opacity-20" />
              </div>
            )}

            <div className="mb-10">
              <h3 className={`text-2xl font-black mb-2 ${tier.popular ? "text-white" : "text-brand-dark"}`}>
                {tier.name}
              </h3>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-4xl font-black">{tier.price}</span>
                <span className={`text-sm font-bold ${tier.popular ? "text-slate-400" : "text-slate-400"}`}>/month</span>
              </div>
              <p className={`text-sm font-bold leading-relaxed ${tier.popular ? "text-slate-300" : "text-slate-500/80"}`}>
                {tier.description}
              </p>
            </div>

            <div className="flex-1 space-y-5 mb-12">
              {tier.features.map((feature) => (
                <div key={feature} className="flex items-start gap-3 group/feat">
                  <div className={`mt-0.5 p-1 rounded-full ${
                    tier.popular ? "bg-brand-green/20 text-brand-green" : "bg-brand-green/10 text-brand-green"
                  }`}>
                    <Check className="w-3 h-3" />
                  </div>
                  <span className={`text-sm font-bold transition-colors ${
                    tier.popular ? "text-slate-200 group-hover/feat:text-white" : "text-slate-600 group-hover/feat:text-brand-dark"
                  }`}>
                    {feature}
                  </span>
                </div>
              ))}
            </div>

            <button 
              onClick={() => {
                const query = new URLSearchParams({ plan: tier.name, price: tier.price }).toString();
                router.push(`/settings/checkout?${query}`);
              }}
              className={`w-full py-5 rounded-2xl font-black text-sm transition-all shadow-lg active:scale-95 ${
              tier.popular 
                ? "bg-brand-green text-white hover:bg-emerald-400 shadow-emerald-900/40" 
                : tier.exclusive
                  ? "bg-amber-500 text-white hover:bg-amber-400 shadow-amber-200"
                  : "bg-slate-100 text-slate-400 cursor-not-allowed"
            }`}>
              {tier.buttonText}
            </button>
            
            {!tier.current && (
              <div className={`mt-4 text-center flex items-center justify-center gap-1.5 text-[9px] font-black uppercase tracking-widest opacity-40 ${
                tier.popular ? "text-white" : "text-brand-dark"
              }`}>
                <ShieldCheck className="w-3 h-3" />
                Secure Checkout
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-24 bg-brand-pink/5 rounded-[4rem] p-12 text-center border border-brand-pink/10 md:flex items-center justify-between gap-12">
        <div className="text-left max-w-xl mb-8 md:mb-0">
          <h4 className="text-2xl font-black text-brand-dark mb-4">Corporate & Nursery Accounts</h4>
          <p className="font-bold text-slate-500 leading-relaxed">
            Managing over 500 assets? We offer white-labeled AI Diagnostic APIs and bulk health certification for professional botanical businesses.
          </p>
        </div>
        <button className="px-10 py-5 bg-white border border-brand-pink/30 text-brand-pink font-black text-sm rounded-2xl hover:bg-brand-pink hover:text-white transition-all shadow-xl shadow-brand-pink/5">
          Contact Sales
        </button>
      </div>
    </div>
  );
}
