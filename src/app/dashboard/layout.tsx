
"use client"

import { useAuth } from "@/components/providers/AuthProvider"
import { useTheme } from "@/components/providers/ThemeProvider"
import { Moon, Sun, User, Home, GraduationCap, FileEdit, Youtube } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { DiscateLogo } from "@/components/DiscateLogo"
import { NotificationManager } from "@/components/NotificationManager"

export const dynamic = 'force-dynamic';

const navItems = [
  { icon: Home, label: "Home", href: "/dashboard" },
  { icon: GraduationCap, label: "Practice", href: "/dashboard/assessments" },
  { icon: FileEdit, label: "Writing", href: "/dashboard/essay-lab" },
  { icon: Youtube, label: "YouTube", href: "/dashboard/youtube-lab" },
  { icon: User, label: "Account", href: "/dashboard/profile" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();

  const hideNav = pathname === "/dashboard/verify-email";

  return (
    <div className="flex flex-col h-screen w-full bg-background transition-colors duration-300 overflow-hidden relative">
      <NotificationManager />
      <header className="h-16 sm:h-20 border-b flex items-center justify-between px-4 sm:px-8 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl sticky top-0 z-50">
        <Link href="/dashboard" className="flex items-center">
          <DiscateLogo size="sm" />
        </Link>
        
        <div className="flex items-center gap-1 sm:gap-2">
          <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-full h-9 w-9 sm:h-10 sm:w-10 bg-slate-50 dark:bg-slate-800 border dark:border-slate-700">
            {theme === "light" ? <Moon className="h-4 w-4 sm:h-5 sm:w-5 text-slate-700" /> : <Sun className="h-4 w-4 sm:h-5 sm:w-5 text-amber-400" />}
          </Button>
          <Link href="/dashboard/profile">
            <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary/20 overflow-hidden">
              <User className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            </div>
          </Link>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto no-scrollbar pb-32 sm:pb-40 px-4 sm:px-5 pt-4 sm:pt-6">
        <div className="max-w-2xl mx-auto">
          {children}
        </div>
      </main>

      {!hideNav && (
        <nav className="fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-lg h-16 sm:h-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-3xl rounded-[24px] sm:rounded-[32px] flex items-center justify-around px-1 sm:px-2 z-50 shadow-2xl">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href} className="flex-1 flex flex-col items-center justify-center gap-0.5 sm:gap-1 group relative h-full">
                <div className={cn(
                  "p-2 sm:p-3 rounded-xl sm:rounded-2xl transition-all duration-300",
                  isActive ? "bg-primary text-white shadow-lg -translate-y-1.5 sm:-translate-y-2 scale-105 sm:scale-110" : "text-slate-400 hover:text-primary"
                )}>
                  <item.icon className={cn("h-5 w-5 sm:h-6 sm:w-6", isActive ? "stroke-[2.5px]" : "stroke-2")} />
                </div>
                {!isActive ? (
                  <span className="text-[7px] sm:text-[8px] font-black uppercase tracking-[0.1em] text-slate-400/80">
                    {item.label}
                  </span>
                ) : (
                  <div className="absolute bottom-1.5 sm:bottom-2 h-1 w-1 bg-primary rounded-full animate-in zoom-in-50" />
                )}
              </Link>
            );
          })}
        </nav>
      )}
    </div>
  )
}
