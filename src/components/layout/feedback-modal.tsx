"use client";

import { useState } from "react";
import { MessageSquare, X, Send, Loader2 } from "lucide-react";
import { sendFeedback } from "@/app/actions/feedback";
import { useSyncMutation } from "@/hooks/use-mutation";
import { usePathname } from "next/navigation";

export function FeedbackModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [note, setNote] = useState("");
  const { mutate: transmitFeedback, isPending: isSending } = useSyncMutation(sendFeedback);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const pathname = usePathname();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!note.trim()) return;

    const result = await transmitFeedback({
      route: pathname,
      note: note.trim(),
    });

    if (result.success) {
      setStatus('success');
      setNote("");
      setTimeout(() => {
        setIsOpen(false);
        setStatus('idle');
      }, 2000);
    } else {
      setStatus('error');
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 p-4 bg-brand-pink text-white rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all group"
        title="Report Issue / Send Feedback"
      >
        <MessageSquare className="w-6 h-6 group-hover:rotate-12 transition-transform" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-brand-pink/10">
            <div className="bg-brand-pink p-6 text-white flex justify-between items-center">
              <div>
                <h3 className="text-xl font-black uppercase">Alpha Feedback</h3>
                <p className="text-xs font-bold opacity-80 uppercase tracking-tighter">Help us harden the ecosystem</p>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
                aria-label="Close"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {status === 'success' ? (
                <div className="py-8 text-center space-y-2">
                  <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Send className="w-6 h-6" />
                  </div>
                  <h4 className="text-lg font-black text-brand-dark">Report Anchored</h4>
                  <p className="text-sm text-brand-dark/40 font-bold">Thank you for your contribution to the registry.</p>
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-[10px] font-black text-brand-dark/40 uppercase tracking-widest mb-1.5 ml-1">
                      Your Observations
                    </label>
                    <textarea
                      autoFocus
                      required
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="What happened? Any bugs or suggestions?"
                      className="w-full h-32 p-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-brand-pink/20 focus:bg-white transition-all resize-none text-sm font-bold text-brand-dark outline-none"
                    />
                  </div>

                  {status === 'error' && (
                    <p className="text-[10px] font-black text-red-500 uppercase text-center px-4">
                      Transmission failed. Please check your connection.
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={isSending || !note.trim()}
                    className="w-full py-4 bg-brand-dark text-white rounded-xl font-black uppercase tracking-widest hover:bg-black transition-all shadow-lg active:scale-95 disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2"
                  >
                    {isSending ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Transmit Report
                      </>
                    )}
                  </button>
                </>
              )}
            </form>
          </div>
        </div>
      )}
    </>
  );
}
