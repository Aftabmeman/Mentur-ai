
"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/providers/AuthProvider"
import { useTheme } from "@/components/providers/ThemeProvider"
import { auth, firestore } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { LogOut, ShieldCheck, Moon, Sun, ChevronRight, Award, BookMarked, Send, Loader2, Coins, Globe } from "lucide-react"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { MenturLogo } from "@/components/MenturLogo"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { useDoc, useMemoFirebase } from "@/firebase"
import { doc, updateDoc } from "firebase/firestore"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const languages = [
  "English", "Hinglish", "Marathish", "Gujaratinglish", "Bengalish", 
  "Punjabish", "Tamilish", "Telugush", "Kannadish", "Malayalish"
];

export default function ProfilePage() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const { toast } = useToast();

  const [isMounted, setIsMounted] = useState(false);
  const [isUpdatingLang, setIsUpdatingLang] = useState(false);

  const profileRef = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return doc(firestore, "users", user.uid, "profile", "stats");
  }, [user?.uid]);

  const { data: profile } = useDoc(profileRef);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      router.push("/login");
    } catch (e) {
      console.error("Sign out error", e);
    }
  };

  const handleLanguageUpdate = async (newLang: string) => {
    if (!profileRef) return;
    setIsUpdatingLang(true);
    try {
      await updateDoc(profileRef, { preferredLanguage: newLang });
      toast({ title: "Mix Style Updated", description: `Default study mix is now ${newLang}` });
    } catch (error) {
      toast({ title: "Update Failed", variant: "destructive" });
    } finally {
      setIsUpdatingLang(false);
    }
  };

  if (!isMounted) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-10 w-10 animate-spin text-primary/10" />
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700 pb-40">
      <div className="flex flex-col items-center pt-10 pb-6">
        <div className="relative inline-block group">
          <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full scale-150 transition-all group-hover:bg-primary/30" />
          <MenturLogo size="lg" />
          <div className="absolute -top-1 -right-1 z-10 h-12 w-12 bg-emerald-500 rounded-[20px] border-4 border-white dark:border-slate-900 flex items-center justify-center shadow-2xl">
             <ShieldCheck className="h-6 w-6 text-white" />
          </div>
        </div>
        <div className="mt-10 text-center space-y-2">
          <h1 className="text-4xl font-black font-headline tracking-tighter text-slate-900 dark:text-white">
            {user?.displayName ?? "Scholar"}
          </h1>
          <p className="text-slate-500 text-base font-bold tracking-wide">
            {user?.email ?? "Elite Academic Voyager"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-5 px-2">
        {[
          { icon: Coins, label: "Coins", val: profile?.totalCoins?.toString() ?? "0", color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-900/10" },
          { icon: Award, label: "Level", val: profile?.level ?? "Lvl 1", color: "text-primary", bg: "bg-primary/10" },
          { icon: BookMarked, label: "Sets", val: profile?.assessmentsDone?.toString() ?? "0", color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-900/10" }
        ].map((stat, i) => (
          <Card key={i} className="p-6 flex flex-col items-center justify-center text-center rounded-[36px] border-none bg-white dark:bg-slate-900 shadow-2xl shadow-black/5">
            <div className={cn("p-4 rounded-2xl mb-4 shadow-sm", stat.bg)}>
              <stat.icon className={cn("h-6 w-6", stat.color)} />
            </div>
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">{stat.label}</span>
            <span className="text-2xl font-black text-slate-900 dark:text-white">{stat.val}</span>
          </Card>
        ))}
      </div>

      <div className="space-y-8 px-2">
        <div className="space-y-4">
          <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] px-4">Study Preferences</h3>
          <Card className="p-8 rounded-[40px] border-none shadow-3xl bg-white dark:bg-slate-900 space-y-6">
             <div className="flex items-center gap-3 text-primary">
                <Globe className="h-6 w-6" />
                <span className="text-[11px] font-black uppercase tracking-[0.2em]">Feedback Mix Style</span>
             </div>
             <Select disabled={isUpdatingLang} value={profile?.preferredLanguage || "English"} onValueChange={handleLanguageUpdate}>
                <SelectTrigger className="h-20 rounded-[28px] bg-slate-50 dark:bg-slate-950 border-none font-black text-lg px-10 shadow-inner">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-[28px] border-none shadow-3xl">
                   {languages.map(l => <SelectItem key={l} value={l} className="h-14 font-bold">{l}</SelectItem>)}
                </SelectContent>
             </Select>
             <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest text-center px-6 leading-relaxed">AI Mentor will evaluate your essays using this regional mix.</p>
          </Card>
        </div>

        <div className="space-y-4">
          <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] px-4">Appearance</h3>
          <Card 
            className="flex items-center justify-between p-8 rounded-[40px] cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all border-none shadow-2xl bg-white dark:bg-slate-900 group"
            onClick={toggleTheme}
          >
            <div className="flex items-center gap-6">
              <div className="p-5 bg-slate-50 dark:bg-slate-800 rounded-2xl shadow-sm group-hover:scale-110 transition-transform">
                {theme === "light" ? <Moon className="h-7 w-7 text-slate-600" /> : <Sun className="h-7 w-7 text-amber-500" />}
              </div>
              <span className="font-black text-xl text-slate-800 dark:text-slate-100">{theme === "light" ? "Dark Mode" : "Light Mode"}</span>
            </div>
            <ChevronRight className="h-7 w-7 text-slate-200 group-hover:translate-x-1 transition-transform" />
          </Card>
        </div>

        <div className="pt-6">
          <Card 
            className="flex items-center justify-between p-8 rounded-[40px] cursor-pointer hover:bg-destructive/5 transition-all border-none shadow-2xl bg-white dark:bg-slate-900 group"
            onClick={handleLogout}
          >
            <div className="flex items-center gap-6">
              <div className="p-5 bg-destructive/5 rounded-2xl group-hover:scale-110 transition-transform">
                <LogOut className="h-7 w-7 text-destructive" />
              </div>
              <span className="font-black text-xl text-destructive">Sign Out</span>
            </div>
            <ChevronRight className="h-7 w-7 text-destructive/20 group-hover:translate-x-1 transition-transform" />
          </Card>
        </div>
      </div>
    </div>
  )
}
