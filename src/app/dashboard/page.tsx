
"use client"

import { useState, useEffect } from "react"
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
  Zap,
  Loader2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useUser, useFirestore } from "@/firebase"
import { collection, query, where, getDocs, Timestamp, orderBy } from "firebase/firestore"
import { Skeleton } from "@/components/ui/skeleton"

export default function DashboardPage() {
  const { user } = useUser()
  const db = useFirestore()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    avgScore: 0,
    assessmentsDone: 0,
    studyTime: 0,
    masteryLevel: 1
  })
  const [recentMaterials, setRecentMaterials] = useState<any[]>([])

  useEffect(() => {
    async function fetchStats() {
      if (!user || !db) return

      try {
        // Fetch attempts from the last 7 days
        const sevenDaysAgo = new Date()
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
        
        const attemptsRef = collection(db, "users", user.uid, "assessment_attempts")
        const q = query(
          attemptsRef, 
          where("attemptDate", ">=", sevenDaysAgo.toISOString()),
          orderBy("attemptDate", "desc")
        )
        
        const querySnapshot = await getDocs(q)
        let totalScore = 0
        let totalTime = 0
        let count = 0

        querySnapshot.forEach((doc) => {
          const data = doc.data()
          totalScore += data.overallScore || 0
          totalTime += data.durationSeconds || 0
          count++
        })

        const avg = count > 0 ? Math.round(totalScore / count) : 0
        const studyHrs = count > 0 ? Math.round(totalTime / 60) : 0 // in minutes for now for visibility
        
        setStats({
          avgScore: avg,
          assessmentsDone: count,
          studyTime: studyHrs,
          masteryLevel: Math.floor(count / 5) + 1
        })

        // Fetch recent materials (limited to 3)
        const materialsRef = collection(db, "users", user.uid, "study_materials")
        const mq = query(materialsRef, orderBy("uploadDate", "desc"), where("userId", "==", user.uid))
        const mSnapshot = await getDocs(mq)
        const mats: any[] = []
        mSnapshot.forEach(doc => {
          const d = doc.data()
          mats.push({
            title: d.title,
            date: new Date(d.uploadDate).toLocaleDateString()
          })
        })
        setRecentMaterials(mats.slice(0, 3))

      } catch (error) {
        console.error("Error fetching stats:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [user, db])

  const statsConfig = [
    { label: "Overall Score", value: `${stats.avgScore}%`, icon: Target, color: "text-primary", bg: "bg-primary/10" },
    { label: "Assessments Done", value: stats.assessmentsDone.toString(), icon: Trophy, color: "text-amber-500", bg: "bg-amber-50" },
    { label: "Study Time", value: stats.studyTime > 60 ? `${Math.floor(stats.studyTime/60)}h` : `${stats.studyTime}m`, icon: Clock, color: "text-blue-500", bg: "bg-blue-50" },
    { label: "Mastery Level", value: `Lvl ${stats.masteryLevel}`, icon: Zap, color: "text-emerald-500", bg: "bg-emerald-50" },
  ]

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white font-headline">Welcome back, Scholar</h1>
        <p className="text-muted-foreground text-lg">Your academic journey is looking bright today.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {loading ? (
          Array(4).fill(0).map((_, i) => (
            <Card key={i} className="border-none shadow-sm rounded-[24px]">
              <CardContent className="p-5 space-y-3">
                <Skeleton className="h-10 w-10 rounded-2xl" />
                <div className="space-y-2">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-6 w-10" />
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          statsConfig.map((stat) => (
            <Card key={stat.label} className="border-none shadow-sm rounded-[24px] hover:shadow-md transition-shadow group dark:bg-slate-900/50">
              <CardContent className="p-5">
                <div className="flex flex-col gap-3">
                  <div className={stat.bg + " p-3 rounded-2xl w-fit group-hover:scale-110 transition-transform"}>
                    <stat.icon className={"h-5 w-5 " + stat.color} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground dark:text-slate-400">{stat.label}</p>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">{stat.value}</h3>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card className="border-none shadow-sm rounded-[28px] overflow-hidden bg-slate-900 text-white group">
          <CardContent className="p-8 flex flex-col justify-between min-h-[220px] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[100px] -mr-32 -mt-32"></div>
            <div className="space-y-4 relative z-10">
              <div className="h-12 w-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md">
                <BrainCircuit className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-2xl font-bold font-headline leading-tight dark:text-white">Ready to test your knowledge?</h3>
              <p className="text-slate-400 max-w-sm">Generate a custom assessment based on your uploaded materials and get instant mentorship.</p>
            </div>
            <Button className="w-fit mt-8 h-12 px-8 bg-primary hover:bg-primary/90 text-white font-bold rounded-2xl shadow-xl shadow-primary/25 relative z-10" asChild>
              <Link href="/dashboard/assessments">Start Evaluation</Link>
            </Button>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <Card className="border-none shadow-sm rounded-[28px] dark:bg-slate-900/50">
            <CardHeader className="flex flex-row items-center justify-between px-8 pt-8">
              <CardTitle className="font-headline text-xl dark:text-white">Recent Materials</CardTitle>
              <Link href="/dashboard/materials">
                <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80 font-bold">View All</Button>
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              {recentMaterials.length > 0 ? (
                <div className="divide-y dark:divide-slate-800">
                  {recentMaterials.map((material, i) => (
                    <div key={i} className="flex items-center justify-between p-4 px-8 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded-xl">
                          <BookOpen className="h-5 w-5 text-slate-500" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-slate-100">{material.title}</p>
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
                  <Inbox className="h-10 w-10 text-slate-200 dark:text-slate-700 mb-4" />
                  <p className="text-slate-500 dark:text-slate-400 text-sm font-bold">No materials added yet.</p>
                  <p className="text-slate-400 dark:text-slate-500 text-xs mt-1">Upload your notes to see them here.</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm rounded-[28px] bg-white dark:bg-slate-900/50">
            <CardHeader className="px-8 pt-8">
              <CardTitle className="font-headline text-xl dark:text-white">Weekly Progress</CardTitle>
              <CardDescription className="dark:text-slate-400">Your learning activity over the last 7 days</CardDescription>
            </CardHeader>
            <CardContent className="h-[200px] flex flex-col items-center justify-center text-muted-foreground px-8">
              {loading ? (
                <Loader2 className="h-10 w-10 text-primary animate-spin" />
              ) : stats.assessmentsDone > 0 ? (
                <div className="text-center space-y-4">
                  <div className="flex items-baseline justify-center gap-2">
                    <span className="text-5xl font-black text-primary">{stats.assessmentsDone}</span>
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">Sessions</span>
                  </div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Great job! You are maintaining a steady pace.</p>
                </div>
              ) : (
                <>
                  <TrendingUp className="h-10 w-10 text-slate-100 dark:text-slate-800 mb-3" />
                  <p className="text-xs font-bold uppercase tracking-widest dark:text-slate-500">No activity data yet</p>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <footer className="pt-8 text-center">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 flex items-center justify-center gap-2">
          <Sparkles className="h-3 w-3" /> Powered by Mentur AI Engine — Fastest Generation
        </p>
      </footer>
    </div>
  )
}
