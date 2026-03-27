"use client";

import { SovereigntyHub } from "@/components/dashboard/sovereignty-hub";
import { DashboardHeader } from "@/components/dashboard/header";
import { Sidebar } from "@/components/layout/sidebar";

export default function SovereigntyPage() {
  return (
    <div className="flex h-screen bg-black overflow-hidden font-sans">
      <Sidebar className="hidden lg:flex" />
      
      <main className="flex-1 flex flex-col min-w-0 bg-[#070707] relative">
        {/* Background Mesh Gradients */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-green/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-brand-pink/5 blur-[150px] rounded-full pointer-events-none" />
        
        <DashboardHeader />
        
        <div className="flex-1 overflow-y-auto scrollbar-hide">
          <SovereigntyHub />
        </div>
      </main>
    </div>
  );
}
