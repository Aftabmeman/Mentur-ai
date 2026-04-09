
"use client"

import { useAuth } from "@/components/providers/AuthProvider"
import { useTheme } from "@/components/providers/ThemeProvider"
import { auth } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { LogOut, User, Mail, ShieldCheck, Moon, Sun, ChevronRight, Award, Clock, BookMarked, Sparkles } from "lucide-react"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"

export default function ProfilePage() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();

  const handleLogout = async () => {
    await auth.signOut();
    router.push("/login");
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-28">
      <div className="flex flex-col items-center pt-8 pb-8">
        <div className="h-28 w-28 rounded-[32px] bg-primary/10 border-4 border-background shadow-2xl flex items-center justify-center relative group">
          <User className="h-14 w-14 text-primary" />
          <div className="absolute -bottom-2 -right-2 h-8 w-8 bg-emerald-500 rounded-2xl border-4 border-background flex items-center justify-center">
             <ShieldCheck className="h-4 w-4 text-white" />
          </div>
        </div>
        <h1 className="mt-6 text-2xl font-bold font-headline">{user?.displayName || "Scholar"}</h1>
        <p className="text-muted-foreground flex items-center gap-1 text-sm font-medium">
          {user?.email}
        </p>
        <Badge variant="secondary" className="mt-3 bg-primary/10 text-primary border-none px-4 py-1 rounded-full font-bold uppercase text-[10px] tracking-widest">
           Verified Student
        </Badge>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: Award, label: "Lvl", val: "12", color: "text-primary", bg: "bg-primary/5" },
          { icon: Clock, label: "Hrs", val: "24", color: "text-amber-500", bg: "bg-amber-50" },
          { icon: BookMarked, label: "Sets", val: "8", color: "text-emerald-500", bg: "bg-emerald-50" }
        ].map((stat, i) => (
          <Card key={i} className="p-4 flex flex-col items-center justify-center text-center rounded-[24px] border-none bg-white shadow-sm">
            <stat.icon className={cn("h-6 w-6 mb-2", stat.color)} />
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{stat.label}</span>
            <span className="text-lg font-black">{stat.val}</span>
          </Card>
        ))}
      </div>

      <div className="space-y-3">
        <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] px-2 mb-2">Account Settings</h3>
        
        <div className="space-y-2">
          <Card 
            className="flex items-center justify-between p-5 rounded-[24px] cursor-pointer hover:bg-slate-50 transition-colors border-none shadow-sm group"
            onClick={toggleTheme}
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-slate-50 rounded-2xl group-hover:bg-primary/5 transition-colors">
                {theme === "light" ? <Moon className="h-5 w-5 text-slate-500 group-hover:text-primary" /> : <Sun className="h-5 w-5 text-slate-500 group-hover:text-primary" />}
              </div>
              <span className="font-bold text-slate-700">{theme === "light" ? "Dark Mode" : "Light Mode"}</span>
            </div>
            <ChevronRight className="h-5 w-5 text-slate-300" />
          </Card>

          <Card 
            className="flex items-center justify-between p-5 rounded-[24px] cursor-pointer hover:bg-destructive/5 transition-colors border-none shadow-sm group"
            onClick={handleLogout}
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-destructive/5 rounded-2xl group-hover:bg-destructive/10 transition-colors">
                <LogOut className="h-5 w-5 text-destructive" />
              </div>
              <span className="font-bold text-destructive">Log Out</span>
            </div>
            <ChevronRight className="h-5 w-5 text-destructive/30" />
          </Card>
        </div>
      </div>

      <footer className="pt-10 text-center space-y-4">
        <div className="flex items-center justify-center gap-2 text-primary">
          <Sparkles className="h-4 w-4" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em]">Mentur AI Engine</span>
        </div>
        <p className="text-[8px] text-slate-400 max-w-[200px] mx-auto leading-relaxed">
          FASTEST ACADEMIC GENERATION SYSTEM ACTIVE — CORE VERSION 2.5.4
        </p>
      </footer>
    </div>
  )
}
