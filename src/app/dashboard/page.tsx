
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
  Coins
} from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useUser, useFirestore } from "@/firebase"
import { collection, query, getDocs, orderBy, limit } from "firebase/firestore"
import { Skeleton } from "@/components/ui/skeleton"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

const chartConfig = {
  score: {
    label: "Score",
    color: "hsl(var(--primary))",
  },
}

export default function DashboardPage() {
  const { user } = useUser()
  const db = useFirestore()
  const [isMounted, setIsMounted] = useState(false)
  const [performanceData, setPerformanceData] = useState<any[]>([])
  const [loadingChart, setLoadingChart] = useState(true)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (!isMounted || !user || !db) return

    async function fetchPerformanceTrend() {
      try {
        const attemptsRef = collection(db!, "users", user!.uid, "assessment_attempts")
        const q = query(attemptsRef, orderBy("attemptDate", "desc"), limit(10))
        const querySnapshot = await getDocs(q)
        
        const chartData: any[] = []
        querySnapshot.forEach((doc) => {
          const data = doc.data()
          if (data && data.attemptDate) {
            chartData.unshift({
              date: new Date(data.attemptDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
              score: data.overallScore || 0
            })
          }
        })

        if (chartData.length === 0) {
          for(let i=1; i<=5; i++) chartData.push({ date: `Day ${i}`, score: 0 })
        }
        setPerformanceData(chartData)
      } catch (error) {
        console.error("Error fetching performance trend:", error)
        setPerformanceData([{ date: "N/A", score: 0 }])
      } finally {
        setLoadingChart(false)
      }
    }

    fetchPerformanceTrend()
  }, [isMounted, user, db])

  if (!isMounted) return null

  const statsConfig = [
    { label: "Overall", value: `--%`, icon: Target, color: "text-primary", bg: "bg-primary/10" },
    { label: "Total Coins", value: `0`, icon: Coins, color: "text-amber-500", bg: "bg-amber-100" },
    { label: "Done", value: `0`, icon: Trophy, color: "text-blue-500", bg: "bg-blue-50" },
    { label: "Level", value: `Lvl 1`, icon: Zap, color: "text-emerald-500", bg: "bg-emerald-50" },
  ]

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col gap-1.5 px-1">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-headline">Welcome, {user?.displayName?.split(' ')[0] || 'Scholar'}</h1>
        <p className="text-muted-foreground text-sm font-medium">Your academic journey is looking bright today.</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {statsConfig.map((stat) => (
          <Card key={stat.label} className="border-none shadow-sm rounded-3xl hover:shadow-md transition-shadow group dark:bg-slate-900/50 bg-white">
            <CardContent className="p-4">
              <div className="flex flex-col gap-3">
                <div className={(stat.bg || "bg-slate-100") + " p-2.5 rounded-2xl w-fit group-hover:scale-110 transition-transform"}>
                  <stat.icon className={"h-5 w-5 " + (stat.color || "text-slate-500")} />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground dark:text-slate-400 mb-0.5">{stat.label}</p>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-none">{stat.value}</h3>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card className="border-none shadow-xl rounded-[32px] overflow-hidden bg-slate-950 text-white relative">
          <CardContent className="p-8 flex flex-col justify-between min-h-[240px] relative z-10">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[100px] -mr-32 -mt-32"></div>
            
            <div className="space-y-4">
              <div className="h-12 w-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/10">
                <BrainCircuit className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-2xl font-black font-headline leading-tight">Start Building Knowledge</h3>
                <p className="text-slate-400 text-sm mt-2 max-w-[280px]">Practice writing or generate custom assessments instantly.</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <Button className="flex-1 h-12 px-6 bg-primary hover:bg-primary/90 text-white font-bold rounded-2xl shadow-lg shadow-primary/20" asChild>
                <Link href="/dashboard/assessments">Create Journey</Link>
              </Button>
              <Button variant="ghost" className="flex-1 h-12 px-6 border border-white/20 text-white hover:bg-white/10 rounded-2xl font-bold bg-transparent" asChild>
                <Link href="/dashboard/essay-lab">Writing Lab</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm rounded-[32px] bg-white dark:bg-slate-900/50 p-6 sm:p-8">
          <div className="flex items-center justify-between mb-8 px-1">
            <div>
              <h3 className="font-headline font-bold text-lg dark:text-white">Performance Trend</h3>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Last 10 Activities</p>
            </div>
            <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1.5 rounded-full border border-emerald-100 dark:border-emerald-800">
               <TrendingUp className="h-3 w-3 text-emerald-600" />
               <span className="text-[10px] font-black text-emerald-600 uppercase tracking-tighter">Improving</span>
            </div>
          </div>
          
          <div className="h-[220px] w-full mt-2">
            {loadingChart ? (
              <Skeleton className="h-full w-full rounded-2xl" />
            ) : (
              <ChartContainer config={chartConfig} className="h-full w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={performanceData && performanceData.length > 0 ? performanceData : [{ date: "", score: 0 }]}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" opacity={0.5} />
                    <XAxis 
                      dataKey="date" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 9, fontWeight: 700 }}
                      dy={10}
                    />
                    <YAxis hide domain={[0, 100]} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line 
                      type="monotone" 
                      dataKey="score" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={4} 
                      dot={{ r: 4, fill: 'hsl(var(--primary))', strokeWidth: 2, stroke: '#fff' }}
                      activeDot={{ r: 6, strokeWidth: 0 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            )}
          </div>
        </Card>
      </div>

      <footer className="pt-4 pb-8 text-center">
        <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-slate-300 dark:text-slate-600 flex items-center justify-center gap-2">
          <Sparkles className="h-3 w-3" /> Mentur AI Engine — High Performance
        </p>
      </footer>
    </div>
  )
}
