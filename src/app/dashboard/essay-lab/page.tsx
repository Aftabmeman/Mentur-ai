
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Type, 
  Loader2, 
  ChevronLeft, 
  ChevronRight, 
  GraduationCap, 
  BookOpen, 
  SendHorizontal, 
  Coins,
  AlertCircle,
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
        topic: "Self Practice",
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
    <div className="flex flex-col h-full space-y-12 pb-40 animate-in fade-in duration-700 px-4">
      <div className="px-1 text-center">
        <h1 className="text-3xl sm:text-5xl font-black font-headline tracking-tighter text-slate-900 dark:text-white uppercase leading-tight">Writing Lab</h1>
        <p className="text-[11px] font-black text-slate-400 mt-4 tracking-[0.4em] uppercase">Focus & Mastery</p>
      </div>

      <div className="flex-1">
        {step === 1 && (
          <Card className="border-none shadow-3xl rounded-[3rem] bg-white dark:bg-slate-900 overflow-hidden animate-in slide-in-from-bottom-8 duration-700">
            <CardHeader className="p-10 sm:p-20 pb-8 text-center">
              <div className="h-20 w-20 rounded-[2rem] bg-primary/10 flex items-center justify-center mx-auto mb-8 shadow-sm">
                <Type className="h-10 w-10 text-primary" />
              </div>
              <CardTitle className="text-3xl font-black font-headline tracking-tight">Practice Question</CardTitle>
            </CardHeader>
            <CardContent className="p-10 sm:p-20 pt-0 space-y-10 text-center">
              <textarea 
                placeholder="Type the question or prompt you are practicing today..." 
                className="w-full min-h-[300px] rounded-[2.5rem] p-10 text-xl dark:bg-slate-950 border-none bg-slate-50 dark:text-white resize-none leading-relaxed outline-none shadow-inner placeholder:text-slate-200 dark:placeholder:text-slate-800" 
                value={question} 
                onChange={(e) => setQuestion(e.target.value)} 
              />
              <Button onClick={() => setStep(2)} disabled={!question.trim()} className="w-full h-20 rounded-[1.8rem] bg-primary text-white font-black text-2xl shadow-3xl active:scale-95 transition-all">
                Continue <ChevronRight className="ml-3 h-8 w-8" />
              </Button>
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <Card className="border-none shadow-3xl rounded-[3rem] bg-white dark:bg-slate-900 overflow-hidden animate-in slide-in-from-bottom-8 duration-700">
            <CardHeader className="p-10 sm:p-20 pb-8 text-center">
              <div className="h-20 w-20 rounded-[2rem] bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center mx-auto mb-8">
                <GraduationCap className="h-10 w-10 text-amber-600" />
              </div>
              <CardTitle className="text-3xl font-black font-headline tracking-tight">Study Profile</CardTitle>
            </CardHeader>
            <CardContent className="p-10 sm:p-20 pt-0 space-y-12">
              <div className="space-y-10">
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 px-6">Academic Level</label>
                  <Select value={academicLevel} onValueChange={setAcademicLevel}>
                    <SelectTrigger className="h-20 rounded-[2rem] bg-slate-50 dark:bg-slate-950 border-none font-black text-xl px-12 shadow-inner">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-[2rem] border-none shadow-3xl">
                      {academicLevels.map(lvl => <SelectItem key={lvl} value={lvl} className="h-18 font-black text-lg">{lvl}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 px-6">Feedback Style Mix</label>
                  <Select value={preferredLanguage} onValueChange={setPreferredLanguage}>
                    <SelectTrigger className="h-20 rounded-[2rem] bg-slate-50 dark:bg-slate-950 border-none font-black text-xl px-12 shadow-inner">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-[2rem] border-none shadow-3xl">
                      {languages.map(lvl => <SelectItem key={lvl} value={lvl} className="h-18 font-black text-lg">{lvl}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex gap-4 pt-10">
                <Button variant="ghost" onClick={() => setStep(1)} className="h-20 w-20 rounded-[2rem] bg-slate-50 dark:bg-slate-800 shrink-0 shadow-sm"><ChevronLeft className="h-10 w-10" /></Button>
                <Button onClick={() => setStep(3)} className="flex-1 h-20 rounded-[2rem] bg-primary text-white font-black text-2xl shadow-3xl active:scale-95 transition-all">Enter Lab <ChevronRight className="ml-3 h-8 w-8" /></Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 3 && (
          <div className="space-y-10 animate-in fade-in slide-in-from-right-12 duration-1000">
            <Card className="border-none shadow-3xl rounded-[3rem] bg-white dark:bg-slate-900 overflow-hidden border border-slate-100 dark:border-white/5">
              <CardHeader className="p-10 sm:p-16 pb-8 flex flex-row items-center justify-between border-b border-slate-50 dark:border-white/5">
                <div className="flex items-center gap-6">
                   <div className="h-14 w-14 rounded-[1.8rem] bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center shadow-sm"><BookOpen className="h-8 w-8 text-emerald-600" /></div>
                   <CardTitle className="text-2xl font-black font-headline tracking-tight">Scholar Editor</CardTitle>
                </div>
                <Badge variant="outline" className="rounded-full font-black text-[9px] uppercase tracking-[0.4em] border-emerald-500/40 text-emerald-600 px-8 py-3 bg-emerald-50/50">Active Session</Badge>
              </CardHeader>
              <CardContent className="p-10 sm:p-20 pt-12 space-y-12">
                <div className="bg-amber-50 dark:bg-amber-900/10 p-8 rounded-[2rem] border-none flex items-start gap-6 shadow-inner">
                  <AlertCircle className="h-8 w-8 text-amber-600 mt-1" />
                  <p className="text-[10px] font-black text-amber-700 dark:text-amber-400 leading-relaxed uppercase tracking-[0.4em]">
                    Evaluation Mix Style: {preferredLanguage}
                  </p>
                </div>
                <textarea 
                  className="w-full min-h-[500px] rounded-[3.5rem] bg-slate-50 dark:bg-slate-950 border-none p-12 sm:p-24 text-xl sm:text-2xl font-medium dark:text-white resize-none leading-loose transition-all outline-none shadow-inner placeholder:text-slate-100 dark:placeholder:text-slate-800"
                  placeholder="Express your thesis here..."
                  value={essayText}
                  onChange={(e) => setEssayText(e.target.value)}
                />
                <div className="flex gap-4 pt-10">
                  <Button variant="ghost" onClick={() => setStep(2)} className="h-20 w-20 rounded-[2rem] bg-slate-50 dark:bg-slate-800 shrink-0 shadow-sm"><ChevronLeft className="h-10 w-10" /></Button>
                  <Button onClick={handleEvaluate} disabled={isLoading} className="flex-1 h-20 rounded-[2rem] bg-primary text-white font-black text-2xl shadow-3xl group active:scale-95 transition-all">
                    {isLoading ? <Loader2 className="animate-spin h-8 w-8 mr-4" /> : <SendHorizontal className="h-8 w-8 mr-4 group-hover:translate-x-3 transition-transform" />}
                    Analyze Response
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {step === 5 && result && (
          <div className="space-y-10 pb-20 animate-in zoom-in-95 duration-1000">
            {/* SCHOLAR REPORT CARD HEADER */}
            <div className="text-center space-y-6 mb-8">
               <Badge className="bg-emerald-500/10 text-emerald-500 border-none font-black uppercase text-[10px] tracking-[0.5em] px-12 py-4 rounded-full shadow-lg">Scholar Report Card</Badge>
               <div className="relative h-64 w-64 flex items-center justify-center mx-auto">
                  <svg className="h-full w-full rotate-[-90deg]">
                    <circle cx="128" cy="128" r="116" fill="transparent" stroke="currentColor" strokeWidth="20" className="text-slate-50 dark:text-slate-800" />
                    <circle cx="128" cy="128" r="116" fill="transparent" stroke="currentColor" strokeWidth="20" strokeDasharray="728.85" strokeDashoffset={728.85 - (728.85 * result.evaluationData.overallScore) / 100} strokeLinecap="round" className="text-primary transition-all duration-[2.5s] ease-out shadow-[0_0_30px_rgba(147,51,234,0.4)]" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-6xl font-black text-slate-900 dark:text-white">{result.evaluationData.overallScore}%</span>
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mt-3">OVERALL SCORE</span>
                  </div>
               </div>
            </div>

            {/* SCHOLAR REWARD BOX */}
            <div className="bg-slate-900/60 p-10 rounded-[3rem] border border-amber-500/20 flex items-center justify-between shadow-2xl">
              <div className="space-y-2">
                <p className="text-[10px] font-black text-amber-500 uppercase tracking-[0.3em]">SCHOLAR REWARD</p>
                <h3 className="text-6xl font-black text-amber-400">+{result.evaluationData.coinsEarned}</h3>
              </div>
              <div className="h-20 w-20 rounded-[1.8rem] bg-amber-600/20 flex items-center justify-center border border-amber-500/30">
                <Coins className="h-10 w-10 text-amber-500" />
              </div>
            </div>

            {/* METRIC INSIGHTS */}
            <div className="grid grid-cols-1 gap-6">
              {[
                { label: "GRAMMAR ACCURACY", val: result.evaluationData.grammarScore, icon: Zap },
                { label: "CONTENT DEPTH", val: result.evaluationData.contentDepthScore, icon: Trophy },
                { label: "RELEVANCY SCORE", val: result.evaluationData.relevancyScore, icon: Target }
              ].map((stat, i) => (
                <div key={i} className="bg-slate-900/40 p-10 rounded-[2.5rem] border border-white/5 space-y-6 shadow-sm">
                  <div className="flex justify-between items-center">
                     <stat.icon className="h-6 w-6 text-slate-400" />
                     <span className="text-3xl font-black text-white">{stat.val}%</span>
                  </div>
                  <Progress value={stat.val} className="h-3 rounded-full bg-slate-800" />
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* PROFESSOR REMARK */}
            <div className="p-10 bg-slate-50 dark:bg-slate-800/50 rounded-[3rem] italic text-2xl sm:text-3xl text-slate-700 dark:text-slate-100 leading-[1.8] border-l-[16px] border-primary shadow-inner">
               " {result.professorFeedback} "
            </div>
            
            <div className="space-y-8">
              <Badge className="bg-slate-900 text-white uppercase font-black text-[10px] tracking-[0.6em] px-12 py-5 rounded-full shadow-2xl">The Masterclass Answer</Badge>
              <div className="p-10 bg-slate-900 dark:bg-black rounded-[4rem] text-slate-300 leading-relaxed text-xl sm:text-2xl italic whitespace-pre-wrap border border-white/5 shadow-[0_20px_60px_rgba(0,0,0,0.4)]">
                 {result.suggestedRewrite}
              </div>
            </div>

            <Button onClick={() => setStep(1)} className="w-full h-24 rounded-[3rem] font-black text-3xl bg-primary text-white shadow-3xl hover:bg-primary/90 transition-all active:scale-95 shadow-primary/30">
              New Practice Session
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
