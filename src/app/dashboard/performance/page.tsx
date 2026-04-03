
"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { 
  BarChart3, 
  TrendingUp, 
  Target, 
  Zap,
  BrainCircuit,
  PieChart
} from "lucide-react"
import { Progress } from "@/components/ui/progress"

export default function PerformancePage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold font-headline tracking-tight text-slate-900">Performance Insights</h1>
        <p className="text-muted-foreground text-lg">Detailed analysis of your learning progress and mastery levels.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-sm bg-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-primary uppercase tracking-wider flex items-center gap-2">
              <Target className="h-4 w-4" /> Average Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">0%</div>
            <p className="text-xs text-muted-foreground mt-1">Based on recent assessments</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-emerald-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-emerald-600 uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="h-4 w-4" /> Growth Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">+0%</div>
            <p className="text-xs text-muted-foreground mt-1">Improvement since last week</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-amber-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-amber-600 uppercase tracking-wider flex items-center gap-2">
              <Zap className="h-4 w-4" /> Study Velocity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">0h</div>
            <p className="text-xs text-muted-foreground mt-1">Total focused study hours</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="border-none shadow-sm overflow-hidden">
          <CardHeader>
            <CardTitle className="font-headline text-xl flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Subject Mastery
            </CardTitle>
            <CardDescription>Your performance breakdown across different topics.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] flex flex-col items-center justify-center text-center p-12 bg-slate-50/50">
            <div className="bg-white p-4 rounded-full shadow-sm mb-4">
              <BrainCircuit className="h-10 w-10 text-slate-200" />
            </div>
            <p className="text-slate-500 font-medium">No mastery data yet.</p>
            <p className="text-sm text-slate-400 max-w-xs mt-1">Complete assessments to see your subject performance here.</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="font-headline text-xl flex items-center gap-2">
              <PieChart className="h-5 w-5 text-primary" />
              Learning Distribution
            </CardTitle>
            <CardDescription>Time spent on MCQs vs Writing vs Flashcards.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-medium">
                <span>Quiz Practice</span>
                <span>0%</span>
              </div>
              <Progress value={0} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-medium">
                <span>Essay Lab</span>
                <span>0%</span>
              </div>
              <Progress value={0} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-medium">
                <span>Active Recall (Flashcards)</span>
                <span>0%</span>
              </div>
              <Progress value={0} className="h-2" />
            </div>
            <div className="pt-4 text-center">
              <p className="text-xs text-muted-foreground italic">Start your first study session to see analytics.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
