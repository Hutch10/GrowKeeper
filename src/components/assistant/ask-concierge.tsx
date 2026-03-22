"use client";

import { useState, useRef, useEffect } from "react";
import { X, Send, Bot, Sparkles, Loader2, Minimize2, Maximize2, Image as ImageIcon } from "lucide-react";
import { concierge } from "@/lib/services/botanical-concierge";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export function AskConcierge() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Greetings! I am your Botanical Concierge. How can I assist your laboratory today?" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setIsLoading(true);

    try {
      const response = await concierge.askConcierge(userMsg);
      setMessages(prev => [...prev, { role: "assistant", content: response }]);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Apologies, my synaptic link is flickering. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Simulate identification flow
    setIsLoading(true);
    setTimeout(() => {
      setMessages(prev => [...prev, 
        { role: "user", content: "[Image Uploaded]" },
        { role: "assistant", content: "I've analyzed the specimen. It appears to be a *Monstera Deliciosa*. Would you like me to create a Digital Twin log for your laboratory?" }
      ]);
      setIsLoading(false);
    }, 2000);
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        aria-label="Open Botanical Concierge"
        title="Open Botanical Concierge"
        className="fixed bottom-8 right-8 w-16 h-16 bg-brand-dark text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-50 group border-4 border-white"
      >
        <div className="absolute inset-0 bg-brand-green rounded-full animate-ping opacity-20 group-hover:opacity-40" />
        <Bot className="w-8 h-8 relative z-10" />
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-brand-pink rounded-full flex items-center justify-center text-[10px] font-black animate-bounce shadow-lg">
          AI
        </div>
      </button>
    );
  }

  return (
    <div className={`fixed bottom-8 right-8 w-[400px] ${isMinimized ? 'h-16' : 'h-[600px]'} bg-white/80 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl flex flex-col z-50 border border-white/50 transition-all duration-500 overflow-hidden`}>
      {/* Header */}
      <div className="p-6 bg-brand-dark text-white flex items-center justify-between rounded-t-[2.5rem]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-brand-green/20 rounded-2xl flex items-center justify-center border border-brand-green/30">
            <Bot className="w-6 h-6 text-brand-green" />
          </div>
          <div>
            <h3 className="font-black text-sm uppercase tracking-widest leading-none">Botanical Concierge</h3>
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-tighter">Expert Mode Active</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsMinimized(!isMinimized)} 
            aria-label={isMinimized ? "Maximize" : "Minimize"}
            title={isMinimized ? "Maximize" : "Minimize"}
            className="p-2 hover:bg-white/10 rounded-xl transition-colors"
          >
            {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
          </button>
          <button 
            onClick={() => setIsOpen(false)} 
            aria-label="Close"
            title="Close"
            className="p-2 hover:bg-white/10 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Chat Area */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] p-4 rounded-2xl text-sm font-medium leading-relaxed ${
                  msg.role === "user" 
                    ? "bg-brand-green text-white rounded-tr-none shadow-lg shadow-emerald-100" 
                    : "bg-slate-100 text-brand-dark rounded-tl-none border border-slate-200"
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-slate-100 p-4 rounded-2xl rounded-tl-none border border-slate-200 flex items-center gap-3">
                  <Loader2 className="w-4 h-4 text-brand-green animate-spin" />
                  <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Consulting Archives...</span>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-6 border-t border-slate-100 bg-white/50">
            <div className="relative flex items-center gap-2">
              <label 
                aria-label="Upload specimen image for identification"
                title="Upload specimen image for identification"
                className="p-4 bg-slate-50 border-2 border-transparent hover:border-brand-green/30 rounded-2xl cursor-pointer transition-all"
              >
                <ImageIcon className="w-5 h-5 text-slate-400" />
                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
              </label>
              <div className="relative flex-1">
                <input 
                  type="text" 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder="Ask your concierge..."
                  className="w-full bg-slate-50 border-2 border-transparent focus:border-brand-green/30 focus:bg-white px-6 py-4 rounded-2xl outline-none transition-all pr-14 text-sm font-bold text-brand-dark shadow-inner"
                />
                <button 
                  onClick={handleSend}
                  disabled={isLoading || !input.trim()}
                  aria-label="Send message"
                  title="Send message"
                  className="absolute right-2 top-2 w-10 h-10 bg-brand-dark text-white rounded-xl flex items-center justify-center hover:bg-brand-green transition-all shadow-xl disabled:opacity-30"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 justify-center">
              <Sparkles className="w-3 h-3 text-brand-pink" />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Powered by GrowKeeper AI Platinum</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
