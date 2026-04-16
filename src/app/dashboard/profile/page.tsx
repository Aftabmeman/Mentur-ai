
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
  const [contactMessage, setContactMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
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
      toast({ title: "Language Updated", description: `Default study mix: ${newLang}` });
    } catch (error) {
      toast({ title: "Update Failed", variant: "destructive" });
    } finally {
      setIsUpdatingLang(false);
    }
  };

  if (!isMounted) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary/20" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-28">
      <div className="flex flex-col items-center pt-8 pb-4">
        <div className="relative inline-block group">
          <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-150" />
          <MenturLogo size="lg" />
          <div className="absolute -top-1 -right-1 z-10 h-10 w-10 bg-emerald-500 rounded-2xl border-4 border-white dark:border-slate-900 flex items-center justify-center shadow-lg">
             <ShieldCheck className="h-5 w-5 text-white" />
          </div>
        </div>
        <h1 className="mt-8 text-3xl font-black font-headline tracking-tight text-slate-900 dark:text-white text-center">
          {user?.displayName ?? "Scholar"}
        </h1>
        <p className="text-muted-foreground text-sm font-medium mt-1">
          {user?.email ?? "Academic Voyager"}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4 px-2">
        {[
          { icon: Coins, label: "Coins", val: profile?.totalCoins?.toString() ?? "0", color: "text-amber-500" },
          { icon: Award, label: "Level", val: profile?.level ?? "Lvl 1", color: "text-primary" },
          { icon: BookMarked, label: "Sets", val: profile?.assessmentsDone?.toString() ?? "0", color: "text-emerald-500" }
        ].map((stat, i) => (
          <Card key={i} className="p-4 flex flex-col items-center justify-center text-center rounded-[28px] border-none bg-white dark:bg-slate-900 shadow-xl shadow-black/5">
            <stat.icon className={cn("h-6 w-6 mb-2", stat.color)} />
            <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground mb-1">{stat.label}</span>
            <span className="text-xl font-black text-slate-900 dark:text-white">{stat.val}</span>
          </Card>
        ))}
      </div>

      <div className="space-y-6">
        <div className="space-y-3 px-2">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] px-2">Language Preferences</h3>
          <Card className="p-6 rounded-[32px] border-none shadow-sm dark:bg-slate-900 flex flex-col gap-4">
             <div className="flex items-center gap-2 text-primary">
                <Globe className="h-5 w-5" />
                <span className="text-xs font-black uppercase tracking-widest">Feedback Style</span>
             </div>
             <Select disabled={isUpdatingLang} value={profile?.preferredLanguage || "English"} onValueChange={handleLanguageUpdate}>
                <SelectTrigger className="h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none font-bold">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-2xl">
                   {languages.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                </SelectContent>
             </Select>
          </Card>
        </div>

        <div className="space-y-3 px-2">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] px-2">Appearance</h3>
          <Card 
            className="flex items-center justify-between p-6 rounded-[32px] cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all border-none shadow-sm group"
            onClick={toggleTheme}
          >
            <div className="flex items-center gap-5">
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                {theme === "light" ? <Moon className="h-6 w-6 text-slate-500" /> : <Sun className="h-6 w-6 text-amber-500" />}
              </div>
              <span className="font-bold text-lg text-slate-700 dark:text-slate-200">{theme === "light" ? "Dark Mode" : "Light Mode"}</span>
            </div>
            <ChevronRight className="h-6 w-6 text-slate-300" />
          </Card>
        </div>

        <div className="px-2">
          <Card 
            className="flex items-center justify-between p-6 rounded-[32px] cursor-pointer hover:bg-destructive/5 transition-all border-none shadow-sm group"
            onClick={handleLogout}
          >
            <div className="flex items-center gap-5">
              <div className="p-4 bg-destructive/5 rounded-2xl">
                <LogOut className="h-6 w-6 text-destructive" />
              </div>
              <span className="font-bold text-lg text-destructive">Sign Out</span>
            </div>
            <ChevronRight className="h-6 w-6 text-destructive/30" />
          </Card>
        </div>
      </div>
    </div>
  )
}
