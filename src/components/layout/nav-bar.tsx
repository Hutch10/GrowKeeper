"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavBarProps {
  overdueCount?: number;
}

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/plants", label: "Plants" },
  { href: "/reminders", label: "Reminders" },
];

export function NavBar({ overdueCount = 0 }: NavBarProps) {
  const pathname = usePathname();

  return (
    <nav className="border-b border-brand-pink/30 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="text-2xl">🌱</span>
          <span className="text-xl font-bold text-brand-dark">GrowKeeper</span>
        </Link>

        <div className="flex items-center gap-1">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const isReminders = item.href === "/reminders";

            return (
              <Link
                key={item.href}
                href={item.href}
                  className={`relative rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
                    isActive
                      ? "bg-brand-pink-light text-brand-green border border-brand-pink/20"
                      : "text-brand-dark/60 hover:bg-brand-pink-light/50 hover:text-brand-green"
                  }`}
                >
                {item.label}
                {isReminders && overdueCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                    {overdueCount > 9 ? "9+" : overdueCount}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
