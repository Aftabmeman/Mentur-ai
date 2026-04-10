"use client"

import { useAuth } from "@/components/providers/AuthProvider"
import { useTheme } from "@/components/providers/ThemeProvider"
import { Moon, Sun, User, Home, BookOpen, GraduationCap, FileEdit } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { MenturLogo } from "@/components/MenturLogo"
import { NotificationManager } from "@/components/NotificationManager"

export const dynamic = 'force-dynamic';

const navItems = [
  { icon: Home, label: "Home", href: "/dashboard" },
  { icon: BookOpen, label: "Library", href: "/dashboard/materials" },
  { icon: GraduationCap, label: "Practice", href: "/dashboard/assessments" },
  { icon: FileEdit, label: "Writing", href: "/dashboard/essay-lab" },
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
      <header className="h-20 border-b flex items-center justify-between px-6 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl sticky top-0 z-50">
        <Link href="/dashboard" className="flex items-center gap-2">
          <MenturLogo size="sm" />
          <span className="font-black font-headline text-2xl tracking-tighter bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
            Mentur AI
          </span>
        </Link>
        
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-full h-11 w-11 bg-slate-50 dark:bg-slate-800">
            {theme === "light" ? <Moon className="h-5 w-5 text-slate-700" /> : <Sun className="h-5 w-5 text-amber-400" />}
          </Button>
          <Link href="/dashboard/profile">
            <div className="h-11 w-11 rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary/20 overflow-hidden">
              <User className="h-5 w-5 text-primary" />
            </div>
          </Link>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto no-scrollbar pb-32 p-6">
        <div className="max-w-2xl mx-auto">
          {children}
        </div>
      </main>

      {!hideNav && (
        <nav className="fixed bottom-8 left-6 right-6 h-22 bg-white/80 dark:bg-slate-900/80 border border-white/20 dark:border-slate-800/20 backdrop-blur-3xl rounded-[40px] flex items-center justify-around px-4 z-50 shadow-2xl shadow-black/10">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href} className="flex-1 flex flex-col items-center justify-center gap-1 group">
                <div className={cn(
                  "p-3 rounded-[20px] transition-all duration-300",
                  isActive ? "bg-primary text-white shadow-xl shadow-primary/40 scale-110 -translate-y-2" : "text-slate-400 hover:text-primary hover:bg-primary/5"
                )}>
                  <item.icon className="h-6 w-6" />
                </div>
                {!isActive && (
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
                    {item.label}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      )}
    </div>
  )
}