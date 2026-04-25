"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Leaf,
  Lightbulb,
  BookOpen,
  CheckSquare,
  Users,
  Settings,
  HelpCircle,
} from "lucide-react";

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: "Dashboard",    href: "/dashboard" },
  { icon: Leaf,            label: "My Plants",    href: "/plants" },
  { icon: Lightbulb,       label: "Care Tips",    href: "#" },
  { icon: BookOpen,        label: "Plant Library", href: "#" },
  { icon: CheckSquare,     label: "Tasks",        href: "/tasks", badge: 3 },
  { icon: Users,           label: "Community",    href: "#" },
  { icon: Settings,        label: "Settings",     href: "#" },
  { icon: HelpCircle,      label: "Support",      href: "#" },
];

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className={`fixed left-0 top-0 h-screen w-64 bg-green-800 flex flex-col z-50 ${className ?? ""}`}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-6 mb-2">
        <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
          <Leaf className="w-5 h-5 text-white" />
        </div>
        <span className="text-white font-bold text-base leading-tight">All About Plants</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href !== "#" &&
            (pathname === item.href || pathname.startsWith(item.href + "/"));

          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center justify-between px-4 py-2.5 rounded-xl transition-all ${
                isActive
                  ? "bg-white/20 text-white"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              <div className="flex items-center gap-3">
                <item.icon className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm font-medium">{item.label}</span>
              </div>
              {item.badge && (
                <span className="bg-orange-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
