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
  X
} from "lucide-react";

const NAV_ITEMS_ALL = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: Navigation, label: "Field Instrument", href: "/field" },
  { icon: Leaf, label: "My Specimens", href: "/plants" },
  { icon: Lightbulb, label: "Care Tips", href: "/care-tips" },
  { icon: Library, label: "Specimen Library", href: "/library" },
  { icon: CheckSquare, label: "Tasks", href: "/tasks", badge: 3 },
  { icon: Users, label: "Community", href: "/community/profile/guest-user" },
  { icon: RefreshCw, label: "Swap Board", href: "/community/swap" },
  { icon: Award, label: "Premium Ops", href: "/settings/billing" },
  { icon: Settings, label: "Settings", href: "/settings" },
  { icon: HelpCircle, label: "Support", href: "/support" },
];

const IS_LOCKDOWN = process.env.NEXT_PUBLIC_ALPHA_LOCKDOWN === 'true';
const ALLOWED_LABELS = ["Dashboard", "My Specimens", "Tasks", "Settings"];

const NAV_ITEMS = IS_LOCKDOWN 
  ? NAV_ITEMS_ALL.filter(item => ALLOWED_LABELS.includes(item.label))
  : NAV_ITEMS_ALL;

interface SidebarProps {
  className?: string;
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ className, isOpen, onClose }: SidebarProps) {
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
          const isActive = pathname === item.href;
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
            </Link>
          );
        })}
      </nav>

      {/* Decorative background element mirroring the leaf in reference */}
      <div className="absolute bottom-[-10%] left-[-20%] w-64 h-64 bg-white/5 blur-3xl rounded-full pointer-events-none" />
    </aside>
    </>
  );
}
