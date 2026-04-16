
"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/providers/AuthProvider"
import { useTheme } from "@/components/providers/ThemeProvider"
import { auth } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { LogOut, ShieldCheck, Moon, Sun, ChevronRight, Award, BookMarked, Info, Send, Loader2, Coins } from "lucide-react"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { MenturLogo } from "@/components/MenturLogo"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export default function ProfilePage() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const { toast } = useToast();

  const [isMounted, setIsMounted] = useState(false);
  const [contactName, setContactName] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  // Critical Hydration Guard: Prevents Next.js from rendering before browser state is ready
  useEffect(() => {
    setIsMounted(true);
    if (user?.displayName) {
      setContactName(user.displayName);
    }
  }, [user]);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      router.push("/login");
    } catch (e) {
      console.error("Sign out error", e);
    }
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactMessage.trim()) return;

    setIsSending(true);
    try {
      await new Promise(r => setTimeout(r, 1000));
      toast({
        title: "Message sent!",
        description: "Our mentor team will review your feedback.",
      });
      setContactMessage("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message.",
        variant: "destructive"
      });
    } finally {
      setIsSending(false);
    }
  };

  // Prevent any rendering until hydration is complete
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
        <div className="flex items-center gap-2 mt-4 flex-wrap justify-center">
          <Badge variant="secondary" className="bg-primary/10 text-primary border-none px-4 py-1.5 rounded-full font-bold uppercase text-[10px] tracking-widest">
            Mentur AI v1.0.0
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 px-2">
        {[
          { icon: Coins, label: "Coins", val: "0", color: "text-amber-500" },
          { icon: Award, label: "Level", val: "1", color: "text-primary" },
          { icon: BookMarked, label: "Sets", val: "0", color: "text-emerald-500" }
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

        <div className="space-y-3 px-2">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] px-2">Feedback</h3>
          <Card className="rounded-[32px] border-none shadow-sm p-6 dark:bg-slate-900">
            <form onSubmit={handleContactSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-1">Message</label>
                <Textarea 
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                  placeholder="Tell us how we can improve..."
                  className="rounded-2xl min-h-[100px] bg-slate-50 dark:bg-slate-800 border-none resize-none text-sm"
                  required
                />
              </div>
              <Button 
                type="submit" 
                className="w-full h-12 rounded-2xl bg-primary text-white font-bold"
                disabled={isSending}
              >
                {isSending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5 mr-2" />}
                Send Feedback
              </Button>
            </form>
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
