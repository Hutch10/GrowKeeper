"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { X, Send, AlertCircle, CheckCircle2 } from "lucide-react";
import { submitFeedback } from "@/app/actions/feedback-actions";
import { toast } from "sonner";

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FeedbackModal({ isOpen, onClose }: FeedbackModalProps) {
  const pathname = usePathname();
  const [content, setContent] = useState("");
  const [actionAttempted, setActionAttempted] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSubmitting(true);
    try {
      const result = await submitFeedback({
        route: pathname,
        content: content.trim(),
        action_attempted: actionAttempted.trim() || undefined,
      });

      if (result.success) {
        setIsSuccess(true);
        setContent("");
        setActionAttempted("");
        setTimeout(() => {
          setIsSuccess(false);
          onClose();
        }, 2000);
      } else {
        toast.error("Failed to submit feedback", {
          description: result.error,
        });
      }
    } catch {
      toast.error("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="w-full max-w-lg bg-white rounded-[2.5rem] overflow-hidden shadow-2xl border border-brand-dark/5 tactical-panel p-8 relative">
              <button
                onClick={onClose}
                title="Close"
                className="absolute top-6 right-6 p-2 text-brand-dark/20 hover:text-brand-dark transition-colors"
              >
          <X className="w-6 h-6" />
        </button>

        {isSuccess ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-4 animate-in zoom-in-95 duration-500">
            <div className="w-20 h-20 bg-brand-green/10 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-brand-green" />
            </div>
            <h3 className="text-2xl font-black text-brand-dark">Feedback Captured</h3>
            <p className="text-brand-dark/40 font-bold text-center px-8 text-sm">
              Your alpha signal has been synchronized with the core team. Thank you for your contribution.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-2">
              <div className="flex items-center gap-3 mb-2">
                <AlertCircle className="w-5 h-5 text-brand-dark/40" />
                <h3 className="text-2xl font-black text-brand-dark">Report a Problem</h3>
              </div>
              <p className="text-brand-dark/40 font-bold text-sm">
                Describe the issue you encountered. Environment context (route: {pathname}) is captured automatically.
              </p>
            </div>

            <div className="space-y-6">
              <div className="group">
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-brand-dark/30 mb-2 ml-6">
                  What happened? *
                </label>
                <textarea
                  required
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="The image upload failed after 5 seconds..."
                  className="w-full px-8 py-5 bg-slate-50 border-2 border-transparent rounded-[2rem] outline-none focus:bg-white focus:border-brand-dark transition-all font-bold text-brand-dark resize-none h-32"
                />
              </div>

              <div className="group">
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-brand-dark/30 mb-2 ml-6">
                  Action Attempted (Optional)
                </label>
                <input
                  type="text"
                  value={actionAttempted}
                  onChange={(e) => setActionAttempted(e.target.value)}
                  placeholder="e.g. Adding a new specimen"
                  className="w-full px-8 py-5 bg-slate-50 border-2 border-transparent rounded-[2rem] outline-none focus:bg-white focus:border-brand-dark transition-all font-bold text-brand-dark"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !content.trim()}
              className="w-full py-5 bg-brand-dark text-white rounded-[2rem] font-black text-[10px] uppercase tracking-[0.2em] shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:grayscale disabled:hover:scale-100"
            >
              {isSubmitting ? (
                "Synchronizing..."
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Submit Alpha Report
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
