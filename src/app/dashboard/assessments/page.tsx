
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Loader2, 
  Sparkles, 
  ListChecks,
  RotateCw,
  ClipboardList,
  Check,
  SendHorizontal,
  Coins,
  FileUp,
  ChevronRight,
  ArrowRight,
  ChevronLeft,
  Trophy,
  Activity,
  Zap,
  Globe,
  Target
} from "lucide-react"
import { Slider } from "@/components/ui/slider"
import { generateStudyAssessments, type GenerateStudyAssessmentsOutput } from "@/ai/flows/generate-study-assessments-flow"
import { evaluateEssayFeedback, type EvaluateEssayFeedbackOutput } from "@/ai/flows/evaluate-essay-feedback"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import confetti from 'canvas-confetti'
import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase"
import { incrementUserStats } from "@/firebase/non-blocking-updates"
import { Progress } from "@/components/ui/progress"
import { doc } from "firebase/firestore"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export const maxDuration = 60;

const academicLevels = [
  "Class 8th", "Class 9th", "Class 10th", "Class 11th", "Class 12th",
  "UPSC", "JEE", "NEET", "GATE", "CAT", "CLAT", "SSC", "NDA"
];

const languages = [
  "English", "Hinglish", "Marathish", "Gujaratinglish", "Bengalish", 
  "Punjabish", "Tamilish", "Telugush", "Kannadish", "Malayalish"
];

export default function AssessmentsPage() {
  const { user } = useUser()
  const db = useFirestore()
  const { toast } = useToast()
  
  const profileRef = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return doc(db, "users", user.uid, "profile", "stats");
  }, [db, user?.uid]);
  
  const { data: profile } = useDoc(profileRef);

  const [step, setStep] = useState(1)
  const [material, setMaterial] = useState("")
  const [level, setLevel] = useState<string>("Class 10th")
  const [questionType, setQuestionType] = useState<string>("Mixed")
  const [questionCount, setQuestionCount] = useState<number>(10)
  const [difficulty, setDifficulty] = useState<string>("Medium")
  const [preferredLanguage, setPreferredLanguage] = useState("English")
  const [showLangConfirm, setShowLangConfirm] = useState(false)
  
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<GenerateStudyAssessmentsOutput | null>(null)
  const [completedModes, setCompletedModes] = useState<string[]>([])
  
  const [activeMode, setActiveMode] = useState<'MCQ' | 'Flashcard' | 'Essay' | null>(null)
  const [currentIdx, setCurrentIdx] = useState(0)
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false)
  
  const [mcqCorrectCount, setMcqCorrectCount] = useState(0)
  const [essayContent, setEssayContent] = useState("")
  const [isAnalyzingEssay, setIsAnalyzingEssay] = useState(false)
  const [essayResult, setEssayResult] = useState<EvaluateEssayFeedbackOutput | null>(null)

  // Question count auto-adjustment based on mode
  useEffect(() => {
    if (questionType === "Essay") {
      if (questionCount > 5) setQuestionCount(5);
      if (questionCount < 1) setQuestionCount(1);
    } else {
      if (questionCount < 10) setQuestionCount(10);
    }
  }, [questionType]);

  const handleGenerate = async () => {
    if (material.length < 30) {
      toast({ title: "Content Short", description: "Please add at least 30 characters.", variant: "destructive" });
      return;
    }
    setIsLoading(true)
    try {
      const assessments = await generateStudyAssessments({
        studyMaterial: material,
        assessmentTypes: questionType === "Mixed" ? ["MCQ", "Essay", "Flashcard"] : [questionType as any],
        academicLevel: level,
        difficulty: difficulty as any,
        questionCount: questionCount,
      })
      
      if (assessments.error) {
        toast({ title: "Error", description: assessments.error, variant: "destructive" });
      } else {
        confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } })
        setResult(assessments)
      }
    } catch (error: any) {
      toast({ title: "Error", description: "Generation failed.", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  const handleEssayAnalysis = async () => {
    if (essayContent.trim().length < 30) {
      toast({ title: "Too Short", description: "Please provide a more detailed answer.", variant: "destructive" })
      return
    }

    setIsAnalyzingEssay(true)
    try {
      const evaluation = await evaluateEssayFeedback({
        topic: "Assessment Session",
        question: result?.essayPrompts?.[currentIdx]?.prompt || "General Essay",
        essayText: essayContent,
        academicLevel: level,
        preferredLanguage: preferredLanguage,
      })

      if (evaluation.error) {
        toast({ title: "Analysis Failed", description: evaluation.error, variant: "destructive" })
      } else {
        setEssayResult(evaluation)
        if (db && user?.uid && evaluation.evaluationData.coinsEarned > 0) {
          incrementUserStats(db, user.uid, evaluation.evaluationData.coinsEarned, true);
        }
        confetti({ particleCount: 100, spread: 60 });
      }
    } catch (e) {
      toast({ title: "Error", description: "Professor is busy.", variant: "destructive" })
    } finally {
      setIsAnalyzingEssay(false)
    }
  }

  const startMode = (mode: 'MCQ' | 'Flashcard' | 'Essay') => {
    if (mode === 'Essay') {
      setShowLangConfirm(true)
      return;
    }
    launchMode(mode)
  }

  const launchMode = (mode: 'MCQ' | 'Flashcard' | 'Essay') => {
    setActiveMode(mode)
    setCurrentIdx(0)
    setIsAnswerRevealed(false)
    setEssayResult(null)
    setEssayContent("")
    setMcqCorrectCount(0)
    setShowLangConfirm(false)
  }

  const nextItem = () => {
    const list = activeMode === 'MCQ' ? result?.mcqs : activeMode === 'Flashcard' ? result?.flashcards : result?.essayPrompts
    if (currentIdx < (list?.length || 0) - 1) {
      setCurrentIdx(prev => prev + 1)
      setIsAnswerRevealed(false)
      setEssayResult(null)
    } else {
      handleModeCompletion()
    }
  }

  const handleModeCompletion = () => {
    if (!activeMode) return;
    const currentMode = activeMode;
    setCompletedModes(prev => [...new Set([...prev, currentMode])])
    setActiveMode(null)

    let coinsEarned = 0;
    if (currentMode === 'MCQ') coinsEarned = mcqCorrectCount * 5;
    if (currentMode === 'Flashcard') coinsEarned = (result?.flashcards?.length || 0) * 2;

    if (db && user?.uid && coinsEarned > 0) {
      incrementUserStats(db, user.uid, coinsEarned, true);
    }
    toast({ title: `${currentMode} Done!`, description: `Earned: ${coinsEarned} Coins.` });
    confetti({ particleCount: 150, spread: 70 });
  }

  const isEssayOnly = questionType === "Essay";
  const minQuestions = isEssayOnly ? 1 : 10;
  const maxQuestions = isEssayOnly ? 5 : 30;

  return (
    <div className="flex flex-col h-full space-y-6 pb-28 animate-in fade-in duration-500">
      <div className="px-1 text-center mb-4">
        <h1 className="text-3xl font-black font-headline tracking-tight text-slate-900 dark:text-white">Academic Practice</h1>
        <p className="text-xs font-bold text-muted-foreground mt-1 uppercase tracking-widest">Simple & Fast Mentorship</p>
      </div>

      {!result ? (
        <Card className="border-none shadow-2xl rounded-[40px] bg-white dark:bg-slate-900 overflow-hidden">
          <CardContent className="p-10 space-y-10">
            {step === 1 && (
              <div className="space-y-6 animate-in slide-in-from-right-4">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Step 1: Study Material</label>
                  <Button variant="outline" size="sm" className="h-9 rounded-full text-[10px] font-bold border-dashed border-primary/40 text-primary hover:bg-primary/5">
                    <FileUp className="h-4 w-4 mr-2" /> Upload Resource
                  </Button>
                </div>
                <textarea 
                  className="w-full min-h-[250px] rounded-[32px] bg-slate-50 dark:bg-slate-950 border-2 border-transparent focus:border-primary/20 p-8 text-sm dark:text-white resize-none leading-relaxed transition-all outline-none"
                  placeholder="Paste the material you want to practice here..."
                  value={material}
                  onChange={(e) => setMaterial(e.target.value)}
                />
                <Button onClick={() => setStep(2)} disabled={material.trim().length < 30} className="w-full h-16 rounded-2xl bg-primary text-white font-bold text-lg">
                  Next Step <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6 animate-in slide-in-from-right-4">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Step 2: Which class do you study in?</label>
                <div className="grid grid-cols-2 gap-3">
                  {academicLevels.map(l => (
                    <Button key={l} variant={level === l ? "default" : "outline"} onClick={() => setLevel(l)} className={cn("h-14 rounded-2xl font-bold transition-all", level === l ? "bg-primary text-white shadow-lg" : "bg-slate-50 dark:bg-slate-950 border-none")}>
                      {l}
                    </Button>
                  ))}
                </div>
                <div className="flex gap-3 pt-4">
                  <Button variant="ghost" onClick={() => setStep(1)} className="flex-1 h-16 rounded-2xl font-bold text-slate-400"><ChevronLeft className="mr-2 h-5 w-5" /> Back</Button>
                  <Button onClick={() => setStep(3)} className="flex-[2] h-16 rounded-2xl bg-primary text-white font-bold text-lg">Next Step <ChevronRight className="ml-2 h-5 w-5" /></Button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6 animate-in slide-in-from-right-4">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Step 3: Select Test Type</label>
                <div className="grid grid-cols-1 gap-4">
                  {[
                    { id: "Mixed", label: "Mixed Mode", desc: "MCQ, Flashcards, and Essay practice." },
                    { id: "MCQ", label: "MCQs Only", desc: "Focused objective testing." },
                    { id: "Flashcard", label: "Flashcards", desc: "Active recall for memory." },
                    { id: "Essay", label: "Subjective", desc: "Critical thinking & writing lab." }
                  ].map(t => (
                    <Button key={t.id} variant={questionType === t.id ? "default" : "outline"} onClick={() => setQuestionType(t.id)} className={cn("h-auto py-5 px-8 rounded-[24px] flex flex-col items-start gap-1 transition-all", questionType === t.id ? "bg-primary text-white shadow-xl" : "bg-slate-50 dark:bg-slate-950 border-none text-left")}>
                      <span className="font-black text-lg">{t.label}</span>
                      <span className={cn("text-xs opacity-60 font-medium", questionType === t.id ? "text-white" : "text-slate-500")}>{t.desc}</span>
                    </Button>
                  ))}
                </div>
                <div className="flex gap-3 pt-4">
                  <Button variant="ghost" onClick={() => setStep(2)} className="flex-1 h-16 rounded-2xl font-bold text-slate-400"><ChevronLeft className="mr-2 h-5 w-5" /> Back</Button>
                  <Button onClick={() => setStep(4)} className="flex-[2] h-16 rounded-2xl bg-primary text-white font-bold text-lg">Next Step <ChevronRight className="ml-2 h-5 w-5" /></Button>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-10 animate-in slide-in-from-right-4">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Step 4: Question Count</label>
                    <Badge variant="secondary" className="rounded-full px-5 py-2 font-black text-xl text-primary bg-primary/10 border-none">{questionCount}</Badge>
                  </div>
                  <div className="px-2">
                    <Slider 
                      value={[questionCount]} 
                      onValueChange={(v) => setQuestionCount(v[0])} 
                      min={minQuestions} 
                      max={maxQuestions} 
                      step={1} 
                      className="py-8" 
                    />
                    <div className="flex justify-between text-[10px] font-black text-slate-300 uppercase tracking-widest mt-2">
                      <span>Min: {minQuestions}</span>
                      <span>Max: {maxQuestions}</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-4 pt-4">
                  <Button onClick={handleGenerate} disabled={isLoading} className="w-full h-20 rounded-[32px] bg-primary hover:bg-primary/90 text-white font-black text-2xl shadow-2xl shadow-primary/20 transition-all active:scale-95">
                    {isLoading ? <Loader2 className="h-8 w-8 animate-spin mr-3" /> : <Sparkles className="h-8 w-8 mr-3" />}
                    {isLoading ? "Generating Magic..." : "Begin Assessment"}
                  </Button>
                  <Button variant="ghost" onClick={() => setStep(3)} className="h-14 rounded-2xl font-bold text-slate-400"><ChevronLeft className="mr-2 h-5 w-5" /> Back</Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ) : showLangConfirm ? (
        <Card className="border-none shadow-2xl rounded-[40px] bg-white dark:bg-slate-900 p-12 text-center space-y-8 animate-in zoom-in-95">
          <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Globe className="h-8 w-8 text-primary" />
          </div>
          <div className="space-y-3">
            <h2 className="text-3xl font-black font-headline">Evaluation Language</h2>
            <p className="text-slate-500 font-medium">Do you want the AI to give feedback in your profile language ({preferredLanguage}) or something else?</p>
          </div>
          <div className="space-y-6">
            <Select value={preferredLanguage} onValueChange={setPreferredLanguage}>
              <SelectTrigger className="h-16 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none font-bold text-lg">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-2xl">
                {languages.map(l => <SelectItem key={l} value={l} className="font-medium h-12">{l}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button onClick={() => launchMode('Essay')} className="w-full h-16 rounded-2xl bg-primary text-white font-black text-lg">
              Continue to Writing Lab <ArrowRight className="ml-2 h-6 w-6" />
            </Button>
          </div>
        </Card>
      ) : activeMode ? (
        <div className="flex flex-col h-full max-w-2xl mx-auto space-y-6 animate-in slide-in-from-bottom-8">
          <div className="flex items-center justify-between px-2">
            <Button variant="ghost" size="sm" onClick={() => setActiveMode(null)} className="font-bold text-slate-400 hover:text-primary">Exit Session</Button>
            <div className="bg-slate-100 dark:bg-slate-800 px-5 py-2 rounded-full">
              <span className="text-[10px] font-black uppercase trackingwidest text-slate-500">Item {currentIdx + 1} of {(activeMode === 'MCQ' ? result?.mcqs : activeMode === 'Flashcard' ? result?.flashcards : result?.essayPrompts)?.length || 0}</span>
            </div>
          </div>

          {activeMode === 'MCQ' && result?.mcqs && (
            <Card className="border-none shadow-2xl rounded-[40px] bg-white dark:bg-slate-900 p-8 flex flex-col space-y-8 min-h-[450px]">
              <div className="space-y-6 flex-1">
                <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                   <div className="h-full bg-primary transition-all duration-700 ease-out" style={{ width: `${((currentIdx + 1) / result.mcqs.length) * 100}%` }} />
                </div>
                <h2 className="text-2xl font-black font-headline text-slate-900 dark:text-white leading-tight">{result.mcqs[currentIdx]?.question}</h2>
                <div className="grid grid-cols-1 gap-3">
                  {result.mcqs[currentIdx]?.options?.map((opt, i) => (
                    <Button key={i} variant="outline" onClick={() => { setIsAnswerRevealed(true); if (opt === result.mcqs![currentIdx].correctAnswer) setMcqCorrectCount(prev => prev + 1); }} disabled={isAnswerRevealed} className={cn("h-auto min-h-[72px] justify-start px-8 rounded-[28px] border-2 text-left font-bold w-full transition-all text-sm leading-relaxed", isAnswerRevealed ? (opt === result.mcqs![currentIdx].correctAnswer ? "bg-emerald-50 border-emerald-400 text-emerald-700" : "opacity-40 border-slate-100") : "bg-slate-50 dark:bg-slate-950 border-transparent hover:border-primary/20 hover:bg-white dark:hover:bg-slate-900")}>
                       <span className="shrink-0 w-9 h-9 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center mr-4 text-xs font-black border">{String.fromCharCode(65 + i)}</span>
                       {opt}
                    </Button>
                  ))}
                </div>
              </div>
              {isAnswerRevealed && (
                <div className="pt-4 space-y-4 animate-in fade-in slide-in-from-bottom-2">
                  <div className="p-6 bg-emerald-50 dark:bg-emerald-900/20 rounded-[28px] border border-emerald-100 dark:border-emerald-800 text-xs text-emerald-700 dark:text-emerald-400 font-medium">
                    <p className="font-black mb-1 uppercase tracking-widest text-[10px]">Professor's Explanation</p>
                    {result.mcqs[currentIdx].explanation}
                  </div>
                  <Button onClick={() => nextItem()} className="w-full h-16 rounded-[28px] bg-primary text-white font-black shadow-lg shadow-primary/20">
                    Next Question <ChevronRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              )}
            </Card>
          )}

          {activeMode === 'Flashcard' && result?.flashcards && (
            <div 
              className="perspective-1000 w-full min-h-[400px] cursor-pointer"
              onClick={() => setIsAnswerRevealed(!isAnswerRevealed)}
            >
              <div className={cn("relative w-full h-full min-h-[400px] transition-all duration-700 preserve-3d shadow-2xl rounded-[48px]", isAnswerRevealed ? "rotate-y-180" : "")}>
                <div className="absolute inset-0 backface-hidden bg-white dark:bg-slate-900 rounded-[48px] p-12 flex flex-col items-center justify-center text-center">
                  <Badge className="bg-primary/10 text-primary mb-10 font-black tracking-widest uppercase text-[10px] px-5 py-2 rounded-full">Recall Challenge</Badge>
                  <h3 className="text-3xl font-black font-headline text-slate-900 dark:text-white leading-relaxed">{result.flashcards[currentIdx]?.front}</h3>
                </div>
                <div className="absolute inset-0 backface-hidden rotate-y-180 bg-slate-900 dark:bg-slate-950 rounded-[48px] p-12 flex flex-col items-center justify-center text-center">
                  <Badge className="bg-emerald-500/10 text-emerald-500 mb-10 font-black tracking-widest uppercase text-[10px] px-5 py-2 rounded-full">Verified Fact</Badge>
                  <p className="text-2xl font-bold text-white leading-relaxed italic">"{result.flashcards[currentIdx]?.back}"</p>
                  <Button onClick={(e) => { e.stopPropagation(); nextItem(); }} className="mt-14 h-16 px-12 rounded-3xl bg-white text-slate-900 font-black hover:bg-white/90">Mastered <Check className="ml-2 h-6 w-6" /></Button>
                </div>
              </div>
            </div>
          )}

          {activeMode === 'Essay' && result?.essayPrompts && (
            <div className="flex flex-col space-y-6">
              <Card className="border-none shadow-2xl rounded-[40px] bg-white dark:bg-slate-900 p-10">
                <Badge className="bg-primary/10 text-primary mb-4 font-black tracking-widest uppercase text-[10px] px-5 py-2 rounded-full">Writing Lab Prompt</Badge>
                <h2 className="text-3xl font-black font-headline leading-tight text-slate-900 dark:text-white">{result.essayPrompts[currentIdx]?.prompt}</h2>
              </Card>
              
              {!essayResult ? (
                <div className="flex flex-col space-y-6">
                  <textarea 
                    className="w-full min-h-[400px] rounded-[48px] bg-white dark:bg-slate-950 border-4 border-slate-50 dark:border-slate-800 p-12 text-xl font-medium dark:text-white resize-none leading-relaxed transition-all outline-none shadow-inner"
                    placeholder="Express your answer here..."
                    value={essayContent}
                    onChange={(e) => setEssayContent(e.target.value)}
                  />
                  <Button onClick={handleEssayAnalysis} disabled={isAnalyzingEssay} className="w-full h-20 rounded-[32px] bg-primary text-white font-black text-xl shadow-2xl shadow-primary/20">
                    {isAnalyzingEssay ? <Loader2 className="animate-spin h-7 w-7 mr-3" /> : <SendHorizontal className="h-7 w-7 mr-3" />}
                    Submit Report
                  </Button>
                </div>
              ) : (
                <div className="space-y-6 pb-12 animate-in zoom-in-95 duration-500">
                  <Card className="border-none shadow-2xl rounded-[48px] bg-white dark:bg-slate-900 p-8 sm:p-12 overflow-hidden">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-8 mb-12">
                      <div className="relative h-48 w-48 flex items-center justify-center">
                        <svg className="h-full w-full rotate-[-90deg]">
                          <circle cx="96" cy="96" r="88" fill="transparent" stroke="currentColor" strokeWidth="12" className="text-slate-100 dark:text-slate-800" />
                          <circle cx="96" cy="96" r="88" fill="transparent" stroke="currentColor" strokeWidth="12" strokeDasharray="552.92" strokeDashoffset={552.92 - (552.92 * essayResult.evaluationData.overallScore) / 100} strokeLinecap="round" className="text-primary transition-all duration-1000 ease-out" />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-5xl font-black text-slate-900 dark:text-white">{essayResult.evaluationData.overallScore}%</span>
                          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Overall Score</span>
                        </div>
                      </div>
                      
                      <div className="flex-1 w-full flex flex-col gap-4">
                        <div className="p-8 bg-amber-50 dark:bg-amber-900/10 rounded-[32px] border-2 border-amber-100 dark:border-amber-800 flex items-center justify-between">
                          <div>
                            <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1">Scholar Reward</p>
                            <h3 className="text-4xl font-black text-amber-700 dark:text-amber-400">+{essayResult.evaluationData.coinsEarned}</h3>
                          </div>
                          <div className="h-16 w-16 bg-amber-200 dark:bg-amber-800 rounded-2xl flex items-center justify-center">
                            <Coins className="h-8 w-8 text-amber-600 dark:text-amber-400" />
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest justify-center sm:justify-start">
                          <Activity className="h-4 w-4 text-primary" />
                          Performance Metrics Active
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
                      {[
                        { label: "Grammar Accuracy", val: essayResult.evaluationData.grammarScore, icon: Zap },
                        { label: "Content Depth", val: essayResult.evaluationData.contentDepthScore, icon: Trophy },
                        { label: "Relevancy Score", val: essayResult.evaluationData.relevancyScore, icon: Target }
                      ].map((stat, i) => (
                        <div key={i} className="p-6 bg-slate-50 dark:bg-slate-950 rounded-[28px] border border-slate-100 dark:border-slate-800 space-y-4">
                          <div className="flex items-center justify-between">
                            <stat.icon className="h-5 w-5 text-slate-400" />
                            <span className="text-lg font-black text-slate-900 dark:text-white">{stat.val}%</span>
                          </div>
                          <Progress value={stat.val} className="h-2 rounded-full bg-slate-200 dark:bg-slate-800" />
                          <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">{stat.label}</p>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-4 mb-12">
                      <div className="flex items-center gap-3 px-4">
                        <Badge className="bg-primary/10 text-primary uppercase font-black text-[9px] px-3 py-1 rounded-full">Professor's Remark</Badge>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">In {preferredLanguage} Style</span>
                      </div>
                      <div className="p-10 bg-slate-50 dark:bg-slate-800 rounded-[40px] italic text-xl text-slate-800 dark:text-slate-100 leading-relaxed border-l-8 border-primary shadow-sm">
                        " {essayResult.professorFeedback} "
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="flex items-center gap-3 px-4">
                        <Badge className="bg-slate-900 text-white uppercase font-black text-[9px] px-3 py-1 rounded-full">Masterclass Model Answer</Badge>
                      </div>
                      <div className="p-10 bg-slate-900 dark:bg-black rounded-[40px] text-slate-300 leading-relaxed text-lg italic whitespace-pre-wrap border border-white/5 shadow-2xl">
                        {essayResult.suggestedRewrite}
                      </div>
                    </div>

                    <Button onClick={() => nextItem()} className="w-full h-20 mt-10 rounded-[32px] bg-primary text-white font-black text-xl shadow-xl shadow-primary/20">
                      Continue Practice <ChevronRight className="ml-2 h-7 w-7" />
                    </Button>
                  </Card>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <Card className="border-none shadow-2xl rounded-[48px] bg-white dark:bg-slate-900 p-12 text-center space-y-10 animate-in zoom-in-95">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-150 animate-pulse" />
            <div className="bg-primary/10 h-28 w-28 rounded-[36px] flex items-center justify-center mx-auto relative z-10">
              <Sparkles className="h-14 w-14 text-primary" />
            </div>
          </div>
          <div className="space-y-3">
            <h2 className="text-4xl font-black font-headline">Intelligence Ready</h2>
            <p className="text-slate-500 text-lg font-medium">Your customized modules are prepared.</p>
          </div>
          <div className="grid grid-cols-1 gap-5 max-w-sm mx-auto">
            {[
              { id: 'MCQ', icon: ListChecks, label: 'Objective MCQs', list: result?.mcqs, color: 'text-blue-500' },
              { id: 'Flashcard', icon: RotateCw, label: 'Memory Flashcards', list: result?.flashcards, color: 'text-amber-500' },
              { id: 'Essay', icon: ClipboardList, label: 'Subjective Writing', list: result?.essayPrompts, color: 'text-emerald-500' }
            ].map((m) => m.list?.length ? (
              <Button key={m.id} variant="outline" onClick={() => startMode(m.id as any)} className="h-24 rounded-[32px] justify-start px-10 group relative overflow-hidden border-2 hover:border-primary/20 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
                <div className={cn("p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 mr-5 group-hover:scale-110 transition-transform", m.color)}>
                  <m.icon className="h-7 w-7" />
                </div>
                <div className="text-left">
                  <p className="font-black text-lg">{m.list.length} {m.label}</p>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Available Session</p>
                </div>
                {completedModes.includes(m.id) && <Check className="ml-auto h-8 w-8 text-emerald-500 animate-in zoom-in-50" />}
              </Button>
            ) : null)}
          </div>
          <Button onClick={() => { setStep(1); setResult(null); }} variant="ghost" className="w-full font-black text-[10px] uppercase tracking-[0.4em] text-slate-300 hover:text-primary pt-6">
            Reset Session Data
          </Button>
        </Card>
      )}
    </div>
  )
}
