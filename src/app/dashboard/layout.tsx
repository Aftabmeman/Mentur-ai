
"use client"

import { useAuth } from "@/components/providers/AuthProvider"
import { useTheme } from "@/components/providers/ThemeProvider"
import { Moon, Sun, User, Home, BookOpen, GraduationCap, FileEdit, BrainCircuit } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useState } from "react"

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
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();
  const [logoLoaded, setLogoLoaded] = useState(false);
  const [logoError, setLogoError] = useState(false);

  const hideNav = pathname === "/dashboard/verify-email";

  return (
    <div className="flex flex-col h-screen w-full bg-background transition-colors duration-300 overflow-hidden relative">
      <header className="h-16 border-b flex items-center justify-between px-6 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="relative h-8 w-8 flex items-center justify-center">
            {!logoError ? (
               <Image 
                  src="/logo.png" 
                  alt="Mentur Logo" 
                  fill 
                  className={cn("object-contain transition-opacity duration-300", logoLoaded ? "opacity-100" : "opacity-0")}
                  onLoad={() => setLogoLoaded(true)}
                  onError={() => { setLogoError(true); setLogoLoaded(true); }}
                />
            ) : null}
            {(logoError || !logoLoaded) && (
              <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
                <BrainCircuit className="h-4 w-4 text-white" />
              </div>
            )}
          </div>
          <span className="text-base font-bold font-headline tracking-tight">Mentur AI</span>
        </div>
        
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-full h-10 w-10">
            {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </Button>
          <Link href="/dashboard/profile">
            <div className="h-9 w-9 rounded-full bg-primary/5 flex items-center justify-center border border-primary/10 overflow-hidden">
              <User className="h-4 w-4 text-primary" />
            </div>
          </Link>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto no-scrollbar pb-28 p-6">
        <div className="max-w-2xl mx-auto">
          {children}
        </div>
      </main>

      {!hideNav && (
        <nav className="fixed bottom-6 left-6 right-6 h-20 bg-white/70 dark:bg-slate-900/70 border border-white/20 dark:border-slate-800/20 backdrop-blur-[24px] rounded-[32px] flex items-center justify-around px-2 z-50 shadow-2xl shadow-black/10">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href} className="flex-1 flex flex-col items-center justify-center gap-1 group">
                <div className={cn(
                  "p-2 rounded-2xl transition-all duration-300",
                  isActive ? "bg-primary text-white shadow-xl shadow-primary/30 scale-110" : "text-slate-400 hover:text-primary"
                )}>
                  <item.icon className="h-6 w-6" />
                </div>
                <span className={cn(
                  "text-[8px] font-black uppercase tracking-[0.15em] transition-colors",
                  isActive ? "text-primary" : "text-slate-400"
                )}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>
      )}
    </div>
  )
}
