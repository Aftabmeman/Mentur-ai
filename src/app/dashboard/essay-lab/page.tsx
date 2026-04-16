
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Type, 
  Loader2, 
  ChevronLeft, 
  ChevronRight, 
  GraduationCap, 
  BookOpen, 
  SendHorizontal, 
  Coins,
  Sparkles,
  AlertCircle,
  Activity,
  Trophy,
  Zap,
  Target,
  Globe
} from "lucide-react"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { evaluateEssayFeedback, type EvaluateEssayFeedbackOutput } from "@/ai/flows/evaluate-essay-feedback"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import confetti from 'canvas-confetti'
import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase"
import { incrementUserStats } from "@/firebase/non-blocking-updates"
import { doc } from "firebase/firestore"
import { Progress } from "@/components/ui/progress"

export const maxDuration = 60;

const academicLevels = [
  "Class 8th", "Class 9th", "Class 10th", "Class 11th", "Class 12th",
  "UPSC", "JEE", "NEET", "GATE", "CAT", "CLAT", "SSC", "NDA"
];

const languages = [
  "English", "Hinglish", "Marathish", "Gujaratinglish", "Bengalish", 
  "Punjabish", "Tamilish", "Telugush", "Kannadish", "Malayalish"
];

export default function WritingWizardPage() {
  const { user } = useUser()
  const db = useFirestore()
  const { toast } = useToast()

  const profileRef = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return doc(db, "users", user.uid, "profile", "stats");
  }, [db, user?.uid]);
  
  const { data: profile } = useDoc(profileRef);

  const [step, setStep] = useState(1)
  const [question, setQuestion] = useState("")
  const [academicLevel, setAcademicLevel] = useState<string>("Class 10th")
  const [chapterName, setChapterName] = useState("")
  const [essayText, setEssayText] = useState("")
  const [preferredLanguage, setPreferredLanguage] = useState("English")
  
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<EvaluateEssayFeedbackOutput | null>(null)

  useEffect(() => {
    if (profile?.preferredLanguage) {
      setPreferredLanguage(profile.preferredLanguage);
    }
  }, [profile]);

  const handleEvaluate = async () => {
    if (essayText.trim().length < 30) {
      toast({ title: "Content Missing", description: "Please type a more detailed answer.", variant: "destructive" })
      return
    }

    setIsLoading(true)
    try {
      const evaluation = await evaluateEssayFeedback({
        topic: chapterName || "Self Practice",
        question: question,
        essayText: essayText,
        academicLevel: academicLevel,
        preferredLanguage: preferredLanguage,
      })

      if (evaluation.error) {
        toast({ title: "Analysis Failed", description: evaluation.error, variant: "destructive" })
      } else {
        setResult(evaluation)
        setStep(5)
        if (db && user?.uid && evaluation.evaluationData.coinsEarned > 0) {
          incrementUserStats(db, user.uid, evaluation.evaluationData.coinsEarned, true);
        }
        confetti({ particleCount: 200, spread: 90, origin: { y: 0.7 } })
      }
    } catch (error: any) {
      toast({ title: "Error", description: "Evaluation failed. Try again.", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full space-y-6 pb-28 animate-in fade-in duration-500">
      <div className="px-1 text-center">
        <h1 className="text-3xl font-black font-headline tracking-tight text-slate-900 dark:text-white uppercase">Writing Lab</h1>
        <p className="text-[10px] font-black text-muted-foreground mt-1 tracking-[0.2em] uppercase tracking-widest">Focus & Mastery</p>
      </div>

      <div className="flex-1 space-y-6">
        {step === 1 && (
          <Card className="border-none shadow-2xl rounded-[40px] bg-white dark:bg-slate-900 overflow-hidden animate-in slide-in-from-bottom-4">
            <CardHeader className="p-10 pb-4 text-center">
              <div className="h-16 w-16 rounded-3xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Type className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-xl font-black font-headline">Practice Question</CardTitle>
            </CardHeader>
            <CardContent className="p-10 pt-0 space-y-6 text-center">
              <textarea 
                placeholder="Type the question or prompt you are practicing today..." 
                className="w-full min-h-[180px] rounded-[32px] p-8 text-sm dark:bg-slate-950 border-none bg-slate-50 dark:text-white resize-none leading-relaxed outline-none focus:ring-4 focus:ring-primary/5 transition-all" 
                value={question} 
                onChange={(e) => setQuestion(e.target.value)} 
              />
              <Button onClick={() => setStep(2)} disabled={!question.trim()} className="w-full h-16 rounded-[24px] bg-primary text-white font-bold text-lg">
                Next <ChevronRight className="ml-2 h-6 w-6" />
              </Button>
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <Card className="border-none shadow-2xl rounded-[40px] bg-white dark:bg-slate-900 overflow-hidden animate-in slide-in-from-bottom-4">
            <CardHeader className="p-10 pb-4 text-center">
              <div className="h-16 w-16 rounded-3xl bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center mx-auto mb-4">
                <GraduationCap className="h-8 w-8 text-amber-600" />
              </div>
              <CardTitle className="text-xl font-black font-headline">Study Profile</CardTitle>
            </CardHeader>
            <CardContent className="p-10 pt-0 space-y-8">
              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-2">Academic Level</label>
                  <Select value={academicLevel} onValueChange={setAcademicLevel}>
                    <SelectTrigger className="h-16 rounded-[24px] bg-slate-50 dark:bg-slate-950 border-none font-bold text-slate-700 dark:text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-[24px]">
                      {academicLevels.map(lvl => <SelectItem key={lvl} value={lvl}>{lvl}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-2">Feedback Style Mix</label>
                  <Select value={preferredLanguage} onValueChange={setPreferredLanguage}>
                    <SelectTrigger className="h-16 rounded-[24px] bg-slate-50 dark:bg-slate-950 border-none font-bold text-slate-700 dark:text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-[24px]">
                      {languages.map(lvl => <SelectItem key={lvl} value={lvl}>{lvl}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex gap-4">
                <Button variant="ghost" onClick={() => setStep(1)} className="h-16 w-16 rounded-[24px] bg-slate-50 dark:bg-slate-800 shrink-0"><ChevronLeft className="h-6 w-6" /></Button>
                <Button onClick={() => setStep(3)} className="flex-1 h-16 rounded-[24px] bg-primary text-white font-bold text-lg">Start Writing <ChevronRight className="ml-2 h-6 w-6" /></Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <Card className="border-none shadow-xl rounded-[48px] bg-white dark:bg-slate-900 overflow-hidden">
              <CardHeader className="p-8 pb-4 flex flex-row items-center justify-between border-b border-slate-50 dark:border-slate-800">
                <div className="flex items-center gap-3">
                   <div className="h-10 w-10 rounded-2xl bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center"><BookOpen className="h-5 w-5 text-emerald-600" /></div>
                   <CardTitle className="text-lg font-black font-headline">Scholar Editor</CardTitle>
                </div>
                <Badge variant="outline" className="rounded-full font-black text-[10px] uppercase tracking-widest border-emerald-500/20 text-emerald-600">Active Session</Badge>
              </CardHeader>
              <CardContent className="p-10 pt-10 space-y-6">
                <div className="bg-amber-50 dark:bg-amber-900/10 p-4 rounded-2xl border border-amber-100 dark:border-amber-800 flex items-start gap-3 mb-4">
                  <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                  <p className="text-[10px] font-bold text-amber-700 dark:text-amber-400 leading-relaxed uppercase tracking-widest">
                    Evaluation Style: {preferredLanguage}
                  </p>
                </div>
                <textarea 
                  className="w-full min-h-[500px] rounded-[40px] bg-slate-50 dark:bg-slate-950 border-4 border-transparent focus:border-primary/10 p-12 text-xl font-medium dark:text-white resize-none leading-relaxed transition-all outline-none shadow-inner"
                  placeholder="Express your answer here..."
                  value={essayText}
                  onChange={(e) => setEssayText(e.target.value)}
                />
                <div className="flex gap-4">
                  <Button variant="ghost" onClick={() => setStep(2)} className="h-16 w-16 rounded-[24px] bg-slate-50 dark:bg-slate-800 shrink-0"><ChevronLeft className="h-6 w-6" /></Button>
                  <Button onClick={handleEvaluate} disabled={isLoading} className="flex-1 h-16 rounded-[24px] bg-primary text-white font-bold text-lg">
                    {isLoading ? <Loader2 className="animate-spin h-6 w-6 mr-3" /> : <SendHorizontal className="h-6 w-6 mr-3" />}
                    Analyze Response
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {step === 5 && result && (
          <div className="space-y-6 pb-20 animate-in zoom-in-95 duration-500">
            <Card className="border-none shadow-2xl rounded-[48px] p-8 sm:p-12 bg-white dark:bg-slate-900">
              <div className="text-center mb-12">
                 <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 mb-6 font-black uppercase text-[10px] tracking-widest">Exam Report Card</Badge>
                 <h2 className="text-3xl font-black font-headline">Performance Insights</h2>
              </div>

              {/* Top Score Section */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-10 mb-12">
                <div className="relative h-48 w-48 flex items-center justify-center">
                  <svg className="h-full w-full rotate-[-90deg]">
                    <circle cx="96" cy="96" r="88" fill="transparent" stroke="currentColor" strokeWidth="12" className="text-slate-100 dark:text-slate-800" />
                    <circle cx="96" cy="96" r="88" fill="transparent" stroke="currentColor" strokeWidth="12" strokeDasharray="552.92" strokeDashoffset={552.92 - (552.92 * result.evaluationData.overallScore) / 100} strokeLinecap="round" className="text-primary transition-all duration-1000" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-5xl font-black text-slate-900 dark:text-white">{result.evaluationData.overallScore}%</span>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Mastery</span>
                  </div>
                </div>
                
                <div className="p-8 bg-amber-50 dark:bg-amber-900/10 rounded-[40px] border-2 border-amber-100 dark:border-amber-800 min-w-[240px]">
                  <div className="flex items-center gap-3 mb-2">
                    <Coins className="h-6 w-6 text-amber-500" />
                    <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Coins Earned</p>
                  </div>
                  <h2 className="text-6xl font-black text-amber-700 dark:text-amber-400">+{result.evaluationData.coinsEarned}</h2>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
                {[
                  { label: "Grammar Accuracy", val: result.evaluationData.grammarScore, icon: Zap },
                  { label: "Content Quality", val: result.evaluationData.contentDepthScore, icon: Trophy },
                  { label: "Answer Relevance", val: result.evaluationData.relevancyScore, icon: Target }
                ].map((stat, i) => (
                  <div key={i} className="p-6 bg-slate-50 dark:bg-slate-950 rounded-[32px] border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between mb-4">
                      <stat.icon className="h-5 w-5 text-slate-400" />
                      <span className="text-lg font-black text-slate-900 dark:text-white">{stat.val}%</span>
                    </div>
                    <Progress value={stat.val} className="h-2 rounded-full" />
                    <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 mt-4">{stat.label}</p>
                  </div>
                ))}
              </div>

              {/* Professor Remark */}
              <div className="space-y-4 mb-12">
                <div className="flex items-center gap-2 px-4">
                   <Globe className="h-4 w-4 text-primary" />
                   <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Mentor Remark ({preferredLanguage})</span>
                </div>
                <div className="p-10 bg-slate-50 dark:bg-slate-800 rounded-[40px] italic text-xl text-slate-700 dark:text-slate-200 leading-relaxed border-l-8 border-primary shadow-sm">
                   " {result.professorFeedback} "
                </div>
              </div>
              
              {/* Masterclass Rewrite */}
              <div className="space-y-4 mb-10">
                <Badge className="bg-slate-900 text-white uppercase font-black text-[9px] px-4 py-1.5 rounded-full ml-4">Perfect Answer (Masterclass)</Badge>
                <div className="p-10 bg-slate-900 dark:bg-black rounded-[40px] text-slate-300 leading-relaxed text-lg italic whitespace-pre-wrap border border-white/5">
                   {result.suggestedRewrite}
                </div>
              </div>

              <Button onClick={() => setStep(1)} className="w-full h-20 rounded-[32px] font-black text-xl bg-primary text-white">
                New Practice Session
              </Button>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
