"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Dumbbell,
  TrendingUp,
  Trophy,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeSwitcher } from "@/components/theme-switcher";
import type { ReactNode } from "react";

const navItems = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/routines", label: "Routines", icon: Dumbbell },
  { href: "/progress", label: "Progress", icon: TrendingUp },
  { href: "/achievements", label: "Achieve", icon: Trophy },
  { href: "/ai-assistant", label: "AI", icon: Sparkles },
];

interface NavProps {
  authButton: ReactNode;
}

export function Nav({ authButton }: NavProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop: Top navbar */}
      <nav className="hidden md:flex w-full justify-center border-b border-b-foreground/10 h-16">
        <div className="w-full max-w-5xl flex justify-between items-center p-3 px-5 text-sm">
          <div className="flex gap-5 items-center">
            <Link href="/dashboard" className="font-bold text-lg text-foreground">
              Pulse
            </Link>
            <div className="flex gap-4 text-muted-foreground">
              {navItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "hover:text-brand transition-colors",
                      isActive && "text-brand font-medium"
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <ThemeSwitcher />
            {authButton}
          </div>
        </div>
      </nav>

      {/* Mobile: Top header (minimal) */}
      <header className="md:hidden w-full flex justify-between items-center p-4 border-b border-b-foreground/10">
        <Link href="/dashboard" className="font-bold text-lg text-brand">
          Pulse
        </Link>
        <div className="flex items-center gap-3">
          <ThemeSwitcher />
          {authButton}
        </div>
      </header>

      {/* Mobile: Bottom tab bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-lg border-t">
        <div className="flex items-center justify-around h-16 px-2 pb-[env(safe-area-inset-bottom)]">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl transition-all min-w-[4rem]",
                  isActive
                    ? "text-brand"
                    : "text-muted-foreground"
                )}
              >
                <Icon
                  className={cn("h-5 w-5", isActive && "scale-110")}
                  strokeWidth={isActive ? 2.5 : 2}
                />
                <span className={cn("text-[10px]", isActive ? "font-bold" : "font-medium")}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
