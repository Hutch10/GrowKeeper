"use client";

import { MessageSquarePlus } from "lucide-react";
import { useState } from "react";
import { FeedbackModal } from "@/components/feedback/feedback-modal";

export function FeedbackButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 p-4 bg-brand-dark text-white rounded-2xl shadow-2xl hover:scale-105 active:scale-95 transition-all group flex items-center gap-3 border border-white/10"
        title="Report a problem"
      >
        <MessageSquarePlus className="w-5 h-5" />
        <span className="text-[10px] font-black uppercase tracking-widest hidden md:block">Report Issue</span>
      </button>

      <FeedbackModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
