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

export const runtime = 'edge';

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
    <div className="flex flex-col h-full space-y-6 sm:space-y-8 pb-40 animate-in fade-in duration-700 px-4 max-w-2xl mx-auto">
      <div className="px-1 text-center pt-6 sm:pt-8">
        <h1 className="text-2xl sm:text-4xl font-black font-headline tracking-tighter text-slate-900 dark:text-white uppercase leading-tight">Writing Lab</h1>
        <p className="text-[9px] font-black text-slate-400 mt-2 tracking-[0.4em] uppercase">Focus & Mastery</p>
      </div>

      <div className="flex-1">
        {step === 1 && (
          <Card className="border-none shadow-3xl rounded-[2rem] sm:rounded-[2.5rem] bg-white dark:bg-slate-900 overflow-hidden animate-in slide-in-from-bottom-8 duration-700">
            <CardHeader className="p-6 sm:p-12 pb-4 sm:pb-6 text-center">
              <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-[1.2rem] sm:rounded-[1.5rem] bg-primary/10 flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-sm">
                <Type className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
              </div>
              <CardTitle className="text-xl sm:text-2xl font-black font-headline tracking-tight">Practice Question</CardTitle>
            </CardHeader>
            <CardContent className="p-6 sm:p-12 pt-0 space-y-6 sm:space-y-8 text-center">
              <textarea 
                placeholder="Type the question or prompt you are practicing today..." 
                className="w-full min-h-[180px] sm:min-h-[250px] rounded-[1.5rem] sm:rounded-[1.8rem] p-5 sm:p-8 text-base sm:text-lg dark:bg-slate-950 border-none bg-slate-50 dark:text-white resize-none leading-relaxed outline-none shadow-inner placeholder:text-slate-200" 
                value={question} 
                onChange={(e) => setQuestion(e.target.value)} 
              />
              <Button onClick={() => setStep(2)} disabled={!question.trim()} className="w-full h-14 sm:h-16 rounded-[1.2rem] sm:rounded-[1.5rem] bg-primary text-white font-black text-lg sm:text-xl shadow-3xl active:scale-95 transition-all">
                Continue <ChevronRight className="ml-2 h-5 w-5 sm:h-6 sm:w-6" />
              </Button>
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <Card className="border-none shadow-3xl rounded-[2rem] sm:rounded-[2.5rem] bg-white dark:bg-slate-900 overflow-hidden animate-in slide-in-from-bottom-8 duration-700">
            <CardHeader className="p-6 sm:p-12 pb-4 sm:pb-6 text-center">
              <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-[1.2rem] sm:rounded-[1.5rem] bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <GraduationCap className="h-6 w-6 sm:h-8 sm:w-8 text-amber-600" />
              </div>
              <CardTitle className="text-xl sm:text-2xl font-black font-headline tracking-tight">Study Profile</CardTitle>
            </CardHeader>
            <CardContent className="p-6 sm:p-12 pt-0 space-y-6 sm:space-y-8">
              <div className="space-y-5 sm:space-y-6">
                <div className="space-y-1.5 sm:space-y-2">
                  <label className="text-[8px] sm:text-[9px] font-black uppercase tracking-[0.4em] text-slate-400 px-4">Academic Level</label>
                  <Select value={academicLevel} onValueChange={setAcademicLevel}>
                    <SelectTrigger className="h-13 sm:h-16 rounded-[1rem] sm:rounded-[1.5rem] bg-slate-50 dark:bg-slate-950 border-none font-black text-sm sm:text-lg px-6 sm:px-8 shadow-inner">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-[1.5rem] border-none shadow-3xl">
                      {academicLevels.map(lvl => <SelectItem key={lvl} value={lvl} className="h-10 sm:h-12 font-black text-xs sm:text-base">{lvl}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5 sm:space-y-2">
                  <label className="text-[8px] sm:text-[9px] font-black uppercase tracking-[0.4em] text-slate-400 px-4">Feedback Style Mix</label>
                  <Select value={preferredLanguage} onValueChange={setPreferredLanguage}>
                    <SelectTrigger className="h-13 sm:h-16 rounded-[1rem] sm:rounded-[1.5rem] bg-slate-50 dark:bg-slate-950 border-none font-black text-sm sm:text-lg px-6 sm:px-8 shadow-inner">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-[1.5rem] border-none shadow-3xl">
                      {languages.map(lvl => <SelectItem key={lvl} value={lvl} className="h-10 sm:h-12 font-black text-xs sm:text-base">{lvl}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex gap-2 sm:gap-3 pt-4 sm:pt-6">
                <Button variant="ghost" onClick={() => setStep(1)} className="h-13 sm:h-16 w-13 sm:w-16 rounded-[1rem] sm:rounded-[1.5rem] bg-slate-50 dark:bg-slate-800 shrink-0 shadow-sm"><ChevronLeft className="h-6 w-6 sm:h-8 sm:w-8" /></Button>
                <Button onClick={() => setStep(3)} className="flex-1 h-13 sm:h-16 rounded-[1rem] sm:rounded-[1.5rem] bg-primary text-white font-black text-sm sm:text-xl shadow-3xl active:scale-95 transition-all">Enter Lab <ChevronRight className="ml-2 h-5 w-5 sm:h-6 sm:w-6" /></Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-1000">
            <Card className="border-none shadow-3xl rounded-[2rem] sm:rounded-[2.5rem] bg-white dark:bg-slate-900 overflow-hidden border border-slate-100 dark:border-white/5">
              <CardHeader className="p-6 sm:p-10 pb-4 sm:pb-6 flex flex-row items-center justify-between border-b border-slate-50 dark:border-white/5">
                <div className="flex items-center gap-3 sm:gap-4">
                   <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-[0.8rem] sm:rounded-[1.2rem] bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center shadow-sm"><BookOpen className="h-4 w-4 sm:h-6 sm:w-6 text-emerald-600" /></div>
                   <CardTitle className="text-base sm:text-xl font-black font-headline tracking-tight">Scholar Editor</CardTitle>
                </div>
                <Badge variant="outline" className="rounded-full font-black text-[6px] sm:text-[7px] uppercase tracking-[0.4em] border-emerald-500/40 text-emerald-600 px-4 sm:px-6 py-1.5 sm:py-2 bg-emerald-50/50">Active Session</Badge>
              </CardHeader>
              <CardContent className="p-6 sm:p-10 pt-6 sm:pt-8 space-y-6 sm:space-y-8">
                <div className="bg-amber-50 dark:bg-amber-900/10 p-4 sm:p-6 rounded-[1rem] sm:rounded-[1.5rem] border-none flex items-start gap-3 sm:gap-4 shadow-inner">
                  <AlertCircle className="h-4 w-4 sm:h-6 sm:w-6 text-amber-600 mt-0.5 sm:mt-1" />
                  <p className="text-[7px] sm:text-[9px] font-black text-amber-700 dark:text-amber-400 leading-relaxed uppercase tracking-[0.3em] sm:tracking-[0.4em]">
                    Evaluation Mix Style: {preferredLanguage}
                  </p>
                </div>
                <textarea 
                  className="w-full min-h-[300px] sm:min-h-[400px] rounded-[1.8rem] sm:rounded-[2.5rem] bg-slate-50 dark:bg-slate-950 border-none p-6 sm:p-10 text-base sm:text-xl font-medium dark:text-white resize-none leading-relaxed transition-all outline-none shadow-inner placeholder:text-slate-100"
                  placeholder="Express your thesis here..."
                  value={essayText}
                  onChange={(e) => setEssayText(e.target.value)}
                />
                <div className="flex gap-2 sm:gap-3 pt-4 sm:pt-6">
                  <Button variant="ghost" onClick={() => setStep(2)} className="h-13 sm:h-16 w-13 sm:w-16 rounded-[1rem] sm:rounded-[1.5rem] bg-slate-50 dark:bg-slate-800 shrink-0 shadow-sm"><ChevronLeft className="h-6 w-6 sm:h-8 sm:w-8" /></Button>
                  <Button onClick={handleEvaluate} disabled={isLoading} className="flex-1 h-13 sm:h-16 rounded-[1rem] sm:rounded-[1.5rem] bg-primary text-white font-black text-sm sm:text-xl shadow-3xl group active:scale-95 transition-all">
                    {isLoading ? <Loader2 className="animate-spin h-5 w-5 sm:h-6 sm:w-6 mr-2 sm:mr-3" /> : <SendHorizontal className="h-5 w-5 sm:h-6 sm:w-6 mr-2 sm:mr-3 group-hover:translate-x-2 transition-transform" />}
                    Analyze Response
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {step === 5 && result && (
          <div className="space-y-8 pb-20 animate-in zoom-in-95 duration-1000">
            <div className="text-center space-y-4 mb-8">
               <Badge className="bg-emerald-500/10 text-emerald-500 border-none font-black uppercase text-[8px] tracking-[0.5em] px-6 sm:px-8 py-2 rounded-full shadow-lg">Scholar Report Card</Badge>
               <div className="relative h-40 w-40 sm:h-56 sm:w-56 flex items-center justify-center mx-auto">
                  <svg className="h-full w-full rotate-[-90deg]" viewBox="0 0 192 192">
                    <circle cx="96" cy="96" r="86" fill="transparent" stroke="currentColor" strokeWidth="16" className="text-slate-50 dark:text-slate-800" />
                    <circle cx="96" cy="96" r="86" fill="transparent" stroke="currentColor" strokeWidth="16" strokeDasharray="540.35" strokeDashoffset={540.35 - (540.35 * (result?.evaluationData?.overallScore || 0)) / 100} strokeLinecap="round" style={{ transition: 'stroke-dashoffset 2.5s ease-out' }} className="text-primary shadow-[0_0_20px_rgba(147,51,234,0.3)]" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white">{result?.evaluationData?.overallScore || 0}%</span>
                    <span className="text-[7px] sm:text-[8px] font-black uppercase tracking-[0.3em] sm:tracking-[0.4em] text-slate-400 mt-1 sm:mt-2">OVERALL SCORE</span>
                  </div>
               </div>
            </div>

            <div className="bg-slate-900 p-6 sm:p-8 rounded-[1.8rem] sm:rounded-[2.5rem] border border-amber-500/20 flex items-center justify-between shadow-2xl relative overflow-hidden group text-left">
              <div className="space-y-1 relative z-10">
                <p className="text-[8px] sm:text-[9px] font-black text-amber-500 uppercase tracking-[0.3em] sm:tracking-[0.4em]">Scholar Reward</p>
                <h3 className="text-2xl sm:text-6xl font-black text-amber-400">+{result.evaluationData.coinsEarned}</h3>
              </div>
              <div className="h-12 w-12 sm:h-24 sm:w-24 rounded-[1rem] sm:rounded-[1.5rem] bg-amber-500/10 flex items-center justify-center border border-amber-500/20 relative z-10 shadow-inner">
                <Coins className="h-6 w-6 sm:h-12 sm:w-12 text-amber-500" />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:gap-4 text-left">
              {[
                { label: "Grammar Accuracy", val: result.evaluationData.grammarScore, icon: Zap },
                { label: "Content Depth", val: result.evaluationData.contentDepthScore, icon: Trophy },
                { label: "Relevancy Score", val: result.evaluationData.relevancyScore, icon: Target }
              ].map((stat, i) => (
                <div key={i} className="bg-white dark:bg-slate-900/60 p-6 sm:p-8 rounded-[1.2rem] sm:rounded-[1.8rem] border border-slate-100 dark:border-white/5 space-y-3 sm:space-y-4 shadow-sm">
                  <div className="flex justify-between items-center">
                     <div className="flex items-center gap-2 sm:gap-3">
                        <stat.icon className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                        <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] text-slate-400">{stat.label}</span>
                     </div>
                     <span className="text-base sm:text-2xl font-black text-slate-900 dark:text-white">{stat.val}%</span>
                  </div>
                  <Progress value={stat.val} className="h-1.5 sm:h-3 rounded-full bg-slate-100 dark:bg-slate-800" />
                </div>
              ))}
            </div>

            <div className="p-6 sm:p-8 bg-primary/5 dark:bg-primary/10 rounded-[1.8rem] sm:rounded-[2.5rem] italic text-base sm:text-2xl text-slate-700 dark:text-slate-100 leading-relaxed border-l-4 sm:border-l-[12px] border-primary shadow-inner text-balance">
               " {result.professorFeedback} "
            </div>
            
            <div className="space-y-4 sm:space-y-6">
              <Badge className="bg-slate-900 text-white uppercase font-black text-[7px] sm:text-[8px] tracking-[0.4em] sm:tracking-[0.5em] px-6 sm:px-10 py-2 sm:py-4 rounded-full shadow-2xl">The Masterclass Answer</Badge>
              <div className="p-6 sm:p-8 bg-slate-900 dark:bg-black rounded-[1.8rem] sm:rounded-[2.5rem] text-slate-300 leading-relaxed text-sm sm:text-xl italic whitespace-pre-wrap border border-white/5 shadow-xl text-left">
                 {result.suggestedRewrite}
              </div>
            </div>

            <Button onClick={() => setStep(1)} className="w-full h-16 sm:h-20 rounded-[1.8rem] sm:rounded-[2.5rem] font-black text-lg sm:text-2xl bg-primary text-white shadow-3xl hover:bg-primary/90 transition-all active:scale-95 shadow-primary/30">
              New Practice Session
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}