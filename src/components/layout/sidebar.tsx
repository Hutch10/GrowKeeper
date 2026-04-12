"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Leaf, 
  Lightbulb, 
  Library, 
  CheckSquare, 
  Users, 
  Settings, 
  HelpCircle,
  RefreshCw,
  Award,
  Navigation,
  X,
  ShieldAlert,
  ClipboardList
} from "lucide-react";
import { SystemLogTerminal } from "@/components/dashboard/system-log-terminal";

const NAV_ITEMS_ALL = [
  { icon: LayoutDashboard, label: "Registry Dashboard", id: "inventory" },
  { icon: ShieldAlert, label: "Simulation Engine", id: "simulation" },
  { icon: ClipboardList, label: "Compliance Surface", id: "compliance" },
  { icon: Navigation, label: "Field Instrument", href: "/field" },
  { icon: Leaf, label: "My Specimens", href: "/plants" },
  { icon: CheckSquare, label: "Tasks", href: "/tasks", badge: 3 },
  { icon: Settings, label: "Settings", id: "settings" },
];

const IS_LOCKDOWN = process.env.NEXT_PUBLIC_ALPHA_LOCKDOWN === 'true';
const ALLOWED_LABELS = ["Registry Dashboard", "Simulation Engine", "Compliance Surface", "My Specimens", "Tasks", "Settings"];

const NAV_ITEMS = IS_LOCKDOWN 
  ? NAV_ITEMS_ALL.filter(item => ALLOWED_LABELS.includes(item.label))
  : NAV_ITEMS_ALL;

interface SidebarProps {
  className?: string;
  isOpen?: boolean;
  onClose?: () => void;
  activeTab?: string;
  onTabChange?: (id: string) => void;
}

export function Sidebar({ className, isOpen, onClose, activeTab, onTabChange }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      <aside className={`fixed left-0 top-0 h-screen w-64 glass-dark text-white p-6 flex flex-col z-50 transition-transform duration-300 lg:translate-x-0 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      } ${className || ""}`}>
      <div className="flex items-center justify-between mb-10 px-2">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-2 rounded-lg">
            <Leaf className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">GrowKeeper</span>
        </div>
        
        <button 
          onClick={onClose}
          aria-label="Close Sidebar"
          className="lg:hidden p-2 text-white/60 hover:text-white"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <nav className="flex-1 space-y-2">
        {NAV_ITEMS.map((item) => {
          // @ts-ignore - Handle hybrid items
          const isActive = activeTab === item.id || pathname === item.href;
          const content = (
            <>
              <div className="flex items-center gap-3">
                <item.icon className={`w-5 h-5 transition-colors ${
                  isActive ? "text-white" : "text-white/60 group-hover:text-white"
                }`} />
                <span className={`text-sm font-medium transition-colors ${
                  isActive ? "text-white" : "text-white/60 group-hover:text-white"
                }`}>
                  {item.label}
                </span>
              </div>
              {item.badge && (
                <span className="bg-brand-pink text-brand-dark text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                  {item.badge}
                </span>
              )}
            </>
          );

          if (item.href) {
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center justify-between px-3 py-3 rounded-xl transition-all group ${
                  isActive 
                    ? "bg-white/20 shadow-lg" 
                    : "hover:bg-white/10"
                }`}
              >
                {content}
              </Link>
            );
          }

          return (
            <button
              key={item.label}
              // @ts-ignore - Handle hybrid items
              onClick={() => onTabChange?.(item.id)}
              className={`w-full flex items-center justify-between px-3 py-3 rounded-xl transition-all group ${
                isActive 
                  ? "bg-white/20 shadow-lg" 
                  : "hover:bg-white/10"
              }`}
            >
              {content}
            </button>
          );
        })}
      </nav>
      
      {/* GLOBAL NARRATIVE LAYER: Persistent System Log */}
      <div className="mt-6 pt-6 border-t border-white/10">
        <div className="px-2 mb-4">
          <div className="flex items-center gap-2 mb-1">
             <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
             <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Registry Uplink</span>
          </div>
          <p className="text-[9px] text-white/30 font-medium leading-relaxed italic">
            &quot;Unified monitoring for biological systems—from spore to canopy.&quot;
          </p>
        </div>
        <div className="scale-90 origin-top-left -ml-2 h-[180px]">
          <SystemLogTerminal />
        </div>
      </div>

      {/* Decorative background element mirroring the leaf in reference */}
      <div className="absolute bottom-[-10%] left-[-20%] w-64 h-64 bg-white/5 blur-3xl rounded-full pointer-events-none" />
    </aside>
    </>
  );
}
