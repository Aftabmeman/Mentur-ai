
"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { 
  Trophy, 
  Target, 
  Clock, 
  TrendingUp,
  BookOpen,
  ArrowRight,
  BrainCircuit,
  Inbox,
  Sparkles,
  Zap
} from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function DashboardPage() {
  const stats = [
    { label: "Overall Score", value: "0%", icon: Target, color: "text-primary", bg: "bg-primary/10" },
    { label: "Assessments Done", value: "0", icon: Trophy, color: "text-amber-500", bg: "bg-amber-50" },
    { label: "Study Time", value: "0h", icon: Clock, color: "text-blue-500", bg: "bg-blue-50" },
    { label: "Mastery Level", value: "Lvl 1", icon: Zap, color: "text-emerald-500", bg: "bg-emerald-50" },
  ]

  const recentMaterials: any[] = []

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 font-headline">Welcome back, Scholar</h1>
        <p className="text-muted-foreground text-lg">Your academic journey is looking bright today.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="border-none shadow-sm rounded-[24px] hover:shadow-md transition-shadow group">
            <CardContent className="p-5">
              <div className="flex flex-col gap-3">
                <div className={stat.bg + " p-3 rounded-2xl w-fit group-hover:scale-110 transition-transform"}>
                  <stat.icon className={"h-5 w-5 " + stat.color} />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{stat.label}</p>
                  <h3 className="text-xl font-bold text-slate-900">{stat.value}</h3>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card className="border-none shadow-sm rounded-[28px] overflow-hidden bg-slate-900 text-white group">
          <CardContent className="p-8 flex flex-col justify-between min-h-[220px] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[100px] -mr-32 -mt-32"></div>
            <div className="space-y-4 relative z-10">
              <div className="h-12 w-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md">
                <BrainCircuit className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-2xl font-bold font-headline leading-tight">Ready to test your knowledge?</h3>
              <p className="text-slate-400 max-w-sm">Generate a custom assessment based on your uploaded materials and get instant mentorship.</p>
            </div>
            <Button className="w-fit mt-8 h-12 px-8 bg-primary hover:bg-primary/90 text-white font-bold rounded-2xl shadow-xl shadow-primary/25 relative z-10" asChild>
              <Link href="/dashboard/assessments">Start Evaluation</Link>
            </Button>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <Card className="border-none shadow-sm rounded-[28px]">
            <CardHeader className="flex flex-row items-center justify-between px-8 pt-8">
              <CardTitle className="font-headline text-xl">Recent Materials</CardTitle>
              <Link href="/dashboard/materials">
                <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80 font-bold">View All</Button>
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              {recentMaterials.length > 0 ? (
                <div className="divide-y">
                  {recentMaterials.map((material, i) => (
                    <div key={i} className="flex items-center justify-between p-4 px-8 hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="bg-slate-100 p-2 rounded-xl">
                          <BookOpen className="h-5 w-5 text-slate-500" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{material.title}</p>
                          <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">{material.date}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="text-slate-400 hover:text-primary" asChild>
                        <Link href="/dashboard/materials">
                           <ArrowRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center px-8">
                  <Inbox className="h-10 w-10 text-slate-200 mb-4" />
                  <p className="text-slate-500 text-sm font-bold">No materials added yet.</p>
                  <p className="text-slate-400 text-xs mt-1">Upload your notes to see them here.</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm rounded-[28px] bg-white">
            <CardHeader className="px-8 pt-8">
              <CardTitle className="font-headline text-xl">Weekly Progress</CardTitle>
              <CardDescription>Your learning activity over the last 7 days</CardDescription>
            </CardHeader>
            <CardContent className="h-[200px] flex flex-col items-center justify-center text-muted-foreground px-8">
              <TrendingUp className="h-10 w-10 text-slate-100 mb-3" />
              <p className="text-xs font-bold uppercase tracking-widest">No activity data yet</p>
            </CardContent>
          </Card>
        </div>
      </div>

      <footer className="pt-8 text-center">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 flex items-center justify-center gap-2">
          <Sparkles className="h-3 w-3" /> Powered by Mentur AI Engine — Fastest Generation
        </p>
      </footer>
    </div>
  )
}
