"use client";

import { useState, useRef, useEffect } from "react";
import { Send, User, Bot, Sparkles, X, Minimize2 } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "bot";
  content: string;
  timestamp: string;
}

export function BotanicalConcierge() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "bot",
      content: "Welcome to your Botanical Concierge. I have analyzed your collection's vitals and the local climate data. How can I assist your growth today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput("");

    // Simulate AI Concierge Response (Factual Simulation)
    setTimeout(() => {
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "bot",
        content: "Based on your Monstera's current 42% moisture level and the incoming heat wave, I recommend increasing the humidity and checking the soil again in 24 hours. Your collection is thriving.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, botMsg]);
    }, 1000);
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-8 p-6 bg-brand-dark text-white rounded-full shadow-2xl hover:bg-brand-green transition-all hover:scale-110 active:scale-95 group z-[100] border-4 border-white/10"
      >
        <Sparkles className="w-8 h-8 group-hover:rotate-12 transition-transform" />
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-brand-pink rounded-full border-2 border-white animate-pulse" />
      </button>
    );
  }

  return (
    <div className={`fixed bottom-8 right-8 w-96 flex flex-col bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden transition-all duration-500 z-[100] ${
      isMinimized ? "h-20" : "h-[600px]"
    }`}>
      {/* Header */}
      <div className="bg-brand-dark p-6 flex items-center justify-between text-white">
        <div className="flex items-center gap-3">
          <div className="bg-brand-green/20 p-2 rounded-xl border border-brand-green/30 text-brand-green">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-black tracking-tight">Botanical Concierge</div>
            <div className="flex items-center gap-1.5 text-[9px] font-bold text-brand-green/80 uppercase tracking-widest">
              <div className="w-1.5 h-1.5 bg-brand-green rounded-full animate-pulse" />
              Intelligence Active
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <Minimize2 className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide bg-slate-50/30">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex items-start gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                <div className={`p-2 rounded-xl border ${
                  msg.role === "bot" 
                    ? "bg-brand-green/10 border-brand-green/20 text-brand-green" 
                    : "bg-white border-slate-100 text-slate-400"
                }`}>
                  {msg.role === "bot" ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                </div>
                <div className={`max-w-[75%] p-4 rounded-2xl text-sm font-medium leading-relaxed shadow-sm ${
                  msg.role === "bot" 
                    ? "bg-white text-brand-dark rounded-tl-none border border-slate-100" 
                    : "bg-brand-dark text-white rounded-tr-none shadow-brand-dark/10"
                }`}>
                  {msg.content}
                  <div className={`text-[9px] mt-2 opacity-50 font-bold ${msg.role === "user" ? "text-right" : ""}`}>
                    {msg.timestamp}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-6 bg-white border-t border-slate-50">
            <div className="relative group">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSend()}
                placeholder="Ask about your collection..."
                className="w-full pl-5 pr-14 py-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-brand-green/10 font-bold text-sm transition-all"
              />
              <button 
                onClick={handleSend}
                className="absolute right-2 top-2 p-3 bg-brand-green text-white rounded-xl shadow-lg hover:bg-emerald-400 transition-all active:scale-90"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
