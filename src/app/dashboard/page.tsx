"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { 
  Trophy, 
  Target, 
  TrendingUp,
  BrainCircuit,
  Sparkles,
  Zap,
  Coins,
  Loader2,
  Clock,
  PlayCircle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase"
import { doc } from "firebase/firestore"
import { cn } from "@/lib/utils"
import { RewardedAdButton } from "@/components/RewardedAdButton"

export default function DashboardPage() {
  const { user } = useUser()
  const db = useFirestore()
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const profileRef = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return doc(db, "users", user.uid, "profile", "stats");
  }, [db, user?.uid]);

  const { data: profile } = useDoc(profileRef);

  if (!isMounted) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-10 w-10 animate-spin text-primary/10" />
      </div>
    );
  }

  // Display logic for balance and daily quota
  const currentBalance = typeof profile?.coinBalance === 'number' ? profile.coinBalance : 50;
  const dailyUsed = profile?.dailyCoinsUsed || 0;
  const quotaRemaining = Math.max(0, 5 - dailyUsed);

  const statsConfig = [
    { 
      label: "Credits", 
      value: currentBalance.toString(), 
      icon: Coins, 
      color: "text-amber-500", 
      bg: "bg-amber-100/50",
      desc: "Available Balance"
    },
    { 
      label: "Quota", 
      value: `${quotaRemaining}/5`, 
      icon: Zap, 
      color: "text-primary", 
      bg: "bg-primary/10",
      desc: "Daily Limit"
    },
    { 
      label: "Sets", 
      value: profile?.assessmentsDone?.toString() ?? "0", 
      icon: Trophy, 
      color: "text-blue-500", 
      bg: "bg-blue-50",
      desc: "Total Mastered"
    },
    { 
      label: "Status", 
      value: profile?.level ?? `Lvl 1`, 
      icon: Target, 
      color: "text-emerald-500", 
      bg: "bg-emerald-50",
      desc: "Academic Level"
    },
  ]

  return (
    <div className="space-y-8 sm:space-y-14 animate-in fade-in duration-700 pb-40 max-w-2xl mx-auto px-4">
      <div className="flex flex-col gap-2 sm:gap-4 text-center sm:text-left pt-6 sm:pt-10">
        <h1 className="text-2xl sm:text-5xl font-black tracking-tighter text-slate-900 dark:text-white font-headline leading-tight text-balance">
          Welcome, {user?.displayName?.split(' ')[0] || 'Scholar'}
        </h1>
        <p className="text-slate-500 text-sm sm:text-lg font-medium leading-relaxed">System status: Normal. Daily quota synchronized.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:gap-8">
        {statsConfig.map((stat) => (
          <Card key={stat.label} className="border-none shadow-xl rounded-[2rem] hover:shadow-2xl transition-all duration-500 group dark:bg-slate-900/50 bg-white border border-slate-50 dark:border-white/5">
            <CardContent className="p-6 sm:p-10">
              <div className="flex flex-col gap-4 sm:gap-6">
                <div className={cn("p-4 rounded-2xl w-fit group-hover:scale-110 transition-transform shadow-sm", stat.bg)}>
                  <stat.icon className={cn("h-5 w-5 sm:h-8 sm:w-8", stat.color)} />
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 mb-1">{stat.label}</p>
                  <h3 className="text-xl sm:text-4xl font-black text-slate-900 dark:text-white leading-none tracking-tighter">{stat.value}</h3>
                  <p className="text-[7px] font-bold text-slate-300 uppercase mt-2 tracking-widest">{stat.desc}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Ad Refill Card */}
      <Card className="border-none shadow-2xl rounded-[2.5rem] bg-amber-50 dark:bg-amber-900/10 border-2 border-amber-200 dark:border-amber-800/30 overflow-hidden relative group">
        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-125 transition-transform duration-700">
           <Coins className="h-32 w-32 text-amber-500" />
        </div>
        <CardContent className="p-8 sm:p-12 relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="text-center sm:text-left space-y-2">
            <h3 className="text-xl sm:text-2xl font-black font-headline text-amber-800 dark:text-amber-400">Refill Academic Credits</h3>
            <p className="text-amber-700/70 dark:text-amber-500/70 text-sm font-medium max-w-xs">Watch a brief rewarded session to add 1 Coin to your wallet instantly.</p>
          </div>
          <RewardedAdButton 
            variant="default"
            className="w-full sm:w-auto bg-amber-500 hover:bg-amber-600 text-white border-none h-14 sm:h-16 px-10 rounded-[1.2rem] shadow-xl shadow-amber-500/20"
          />
        </CardContent>
      </Card>

      <div className="space-y-8 sm:space-y-12">
        <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-slate-950 text-white relative border border-white/5">
          <CardContent className="p-8 sm:p-16 flex flex-col justify-between min-h-[320px] sm:min-h-[400px] relative z-10">
            <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-primary/20 rounded-full blur-[120px] -mr-40 -mt-40 opacity-70"></div>
            
            <div className="space-y-6 sm:space-y-10">
              <div className="h-14 w-14 sm:h-20 sm:w-20 bg-white/10 rounded-[1.5rem] flex items-center justify-center backdrop-blur-xl border border-white/10 shadow-lg">
                <BrainCircuit className="h-7 w-7 sm:h-10 sm:w-10 text-primary" />
              </div>
              <div className="space-y-3 sm:space-y-5">
                <h3 className="text-2xl sm:text-4xl font-black font-headline leading-tight tracking-tight">Forge Your Elite Potential</h3>
                <p className="text-slate-400 text-sm sm:text-lg font-medium leading-relaxed max-w-[400px]">System ready for generation. Assessment cost: 1 Credit.</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              <Button className="flex-1 h-14 sm:h-18 px-8 bg-primary hover:bg-primary/90 text-white font-black rounded-[1.5rem] shadow-xl text-lg sm:text-xl active:scale-95 transition-all" asChild>
                <Link href="/dashboard/assessments">Start Sequence</Link>
              </Button>
              <Button variant="ghost" className="flex-1 h-14 sm:h-18 px-8 border border-white/10 text-white hover:bg-white/10 rounded-[1.5rem] font-black bg-transparent text-lg sm:text-xl active:scale-95 transition-all" asChild>
                <Link href="/dashboard/essay-lab">Writing Lab</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <footer className="pt-20 pb-10 text-center opacity-40">
        <p className="text-[9px] font-black uppercase tracking-[0.5em] text-slate-300 dark:text-slate-600 flex items-center justify-center gap-3">
          <Sparkles className="h-5 w-5" /> Discate Engine — Consumption Controlled
        </p>
      </footer>
    </div>
  )
}
