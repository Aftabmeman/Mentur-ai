"use client"

import { useAuth } from "@/components/providers/AuthProvider"
import { useTheme } from "@/components/providers/ThemeProvider"
import { Sparkles, Moon, Sun, User, Home, BookOpen, GraduationCap, FileEdit } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

export const dynamic = 'force-dynamic';

const navItems = [
  { icon: Home, label: "Home", href: "/dashboard" },
  { icon: BookOpen, label: "Materials", href: "/dashboard/materials" },
  { icon: GraduationCap, label: "Quiz", href: "/dashboard/assessments" },
  { icon: FileEdit, label: "Essay", href: "/dashboard/essay-lab" },
  { icon: User, label: "Profile", href: "/dashboard/profile" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();

  // Hide nav on verification page
  const hideNav = pathname === "/dashboard/verify-email";

  return (
    <div className="flex flex-col h-screen w-full bg-background transition-colors duration-300 overflow-hidden">
      {/* Top Header */}
      <header className="h-16 border-b flex items-center justify-between px-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="bg-primary p-2 rounded-xl">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-bold font-headline tracking-tight">Mentur AI</span>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-full">
            {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          </Button>
          <Link href="/dashboard/profile">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 overflow-hidden">
              <User className="h-4 w-4 text-primary" />
            </div>
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto no-scrollbar pb-24 p-6">
        <div className="max-w-4xl mx-auto">
          {children}
        </div>
      </main>

      {/* Bottom Navigation */}
      {!hideNav && (
        <nav className="fixed bottom-0 left-0 right-0 h-20 bg-white/90 dark:bg-slate-900/90 border-t backdrop-blur-lg flex items-center justify-around px-2 z-50">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href} className="flex-1 flex flex-col items-center justify-center gap-1 group">
                <div className={cn(
                  "p-2 rounded-2xl transition-all duration-300",
                  isActive ? "bg-primary text-white shadow-lg shadow-primary/20 scale-110" : "text-slate-500 hover:text-primary"
                )}>
                  <item.icon className="h-6 w-6" />
                </div>
                <span className={cn(
                  "text-[10px] font-bold uppercase tracking-widest",
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
