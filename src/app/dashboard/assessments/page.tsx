
"use client"

import { useState, useEffect, useRef } from "react"
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
  Trophy,
  Zap,
  Globe,
  Target
} from "lucide-react"
import { Slider } from "@/components/ui/slider"
import { generateStudyAssessments, type GenerateStudyAssessmentsOutput } from "@/ai/flows/generate-study-assessments-flow"
import { evaluateEssayFeedback, type EvaluateEssayFeedbackOutput } from "@/ai/flows/evaluate-essay-feedback"
import { parseFileToText } from "@/app/actions/file-parser"
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
  const fileInputRef = useRef<HTMLInputElement>(null)
  
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
  const [isParsing, setIsParsing] = useState(false)
  const [result, setResult] = useState<GenerateStudyAssessmentsOutput | null>(null)
  const [completedModes, setCompletedModes] = useState<string[]>([])
  
  const [activeMode, setActiveMode] = useState<'MCQ' | 'Flashcard' | 'Essay' | null>(null)
  const [currentIdx, setCurrentIdx] = useState(0)
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false)
  
  const [mcqCorrectCount, setMcqCorrectCount] = useState(0)
  const [essayContent, setEssayContent] = useState("")
  const [isAnalyzingEssay, setIsAnalyzingEssay] = useState(false)
  const [essayResult, setEssayResult] = useState<EvaluateEssayFeedbackOutput | null>(null)

  useEffect(() => {
    if (profile?.preferredLanguage) {
      setPreferredLanguage(profile.preferredLanguage);
    }
  }, [profile]);

  useEffect(() => {
    if (questionType === "Essay") {
      if (questionCount > 5) setQuestionCount(5);
    } else {
      if (questionCount < 10) setQuestionCount(10);
    }
  }, [questionType]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsParsing(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await parseFileToText(formData);
      if (response.error) {
        toast({ title: "Parsing Failed", description: response.error, variant: "destructive" });
      } else if (response.text) {
        setMaterial(response.text);
        toast({ title: "Elite Material Loaded", description: "Your resource has been ingested successfully." });
      }
    } catch (e) {
      toast({ title: "Error", description: "Failed to parse document.", variant: "destructive" });
    } finally {
      setIsParsing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

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
        confetti({ particleCount: 200, spread: 80, origin: { y: 0.6 } })
        setResult(assessments)
      }
    } catch (error: any) {
      toast({ title: "Error", description: "Generation failed. Try again.", variant: "destructive" })
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
        topic: "Practice Session",
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
        confetti({ particleCount: 150, spread: 70 });
      }
    } catch (e) {
      toast({ title: "Error", description: "Professor is busy. Try again.", variant: "destructive" })
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
      setEssayContent("")
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
    toast({ title: `${currentMode} Complete!`, description: `Earned ${coinsEarned} Coins.` });
    confetti({ particleCount: 150, spread: 70 });
  }

  return (
    <div className="flex flex-col h-full space-y-12 pb-40 animate-in fade-in duration-700 px-4">
      <div className="px-1 text-center pt-10">
        <h1 className="text-4xl sm:text-6xl font-black font-headline tracking-tighter text-slate-900 dark:text-white uppercase leading-tight text-balance">Academic Practice</h1>
        <p className="text-[11px] font-black text-slate-400 mt-6 tracking-[0.6em] uppercase">Sequential Mastery Wizard</p>
      </div>

      {!result ? (
        <Card className="border-none shadow-3xl rounded-[3rem] bg-white dark:bg-slate-900 overflow-hidden border border-slate-100 dark:border-white/5">
          <CardContent className="p-8 sm:p-16 space-y-12">
            {step === 1 && (
              <div className="space-y-10 animate-in slide-in-from-right-8 duration-500">
                <div className="space-y-6">
                  <div className="space-y-2 px-1">
                    <label className="text-[10px] font-black text-primary uppercase tracking-[0.4em]">Step 1: Content Ingestion</label>
                    <p className="text-xl font-medium text-slate-500 leading-relaxed text-balance">Upload elite resources or paste text below.</p>
                  </div>
                  
                  <div className="flex flex-col gap-8">
                    <input 
                      type="file" 
                      accept=".txt,.pdf,.docx" 
                      ref={fileInputRef} 
                      className="hidden" 
                      onChange={handleFileUpload}
                    />
                    <Button 
                      variant="outline"
                      type="button"
                      disabled={isParsing}
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full h-32 rounded-[2rem] border-2 border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 flex flex-col items-center justify-center gap-4 hover:bg-primary/5 hover:border-primary/40 transition-all group disabled:opacity-50"
                    >
                      {isParsing ? (
                        <Loader2 className="h-10 w-10 animate-spin text-primary" />
                      ) : (
                        <div className="flex flex-col items-center gap-2">
                           <FileUp className="h-10 w-10 text-primary group-hover:scale-110 transition-transform" />
                           <span className="text-[12px] font-black uppercase tracking-[0.4em] text-primary">Upload Document</span>
                           <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">PDF, DOCX, TXT</span>
                        </div>
                      )}
                    </Button>

                    <textarea 
                      className="w-full min-h-[300px] rounded-[2rem] bg-slate-50 dark:bg-slate-950 border-none p-10 text-xl dark:text-white resize-none leading-relaxed transition-all outline-none shadow-inner placeholder:text-slate-200 dark:placeholder:text-slate-800"
                      placeholder="Or paste your study material text here..."
                      value={material}
                      onChange={(e) => setMaterial(e.target.value)}
                    />
                  </div>
                </div>
                
                <Button 
                  onClick={() => setStep(2)} 
                  disabled={material.trim().length < 30 || isParsing} 
                  className="w-full h-20 rounded-[1.8rem] bg-primary text-white font-black text-xl shadow-3xl group active:scale-95"
                >
                  Continue <ChevronRight className="ml-2 h-6 w-6 group-hover:translate-x-2 transition-transform" />
                </Button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-10 animate-in slide-in-from-right-8 duration-500">
                <div className="space-y-2 px-1">
                   <label className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Step 2: Academic Level</label>
                   <p className="text-xl font-medium text-slate-500 leading-relaxed">Target the specific difficulty for your grade.</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {academicLevels.map(l => (
                    <Button key={l} variant={level === l ? "default" : "outline"} onClick={() => setLevel(l)} className={cn("h-16 rounded-[1.5rem] font-black text-lg transition-all border-none", level === l ? "bg-primary text-white shadow-xl" : "bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-800")}>
                      {l}
                    </Button>
                  ))}
                </div>
                <div className="flex gap-4 pt-8">
                  <Button variant="ghost" onClick={() => setStep(1)} className="flex-1 h-18 rounded-[1.2rem] font-bold text-slate-400">Back</Button>
                  <Button onClick={() => setStep(3)} className="flex-[2] h-18 rounded-[1.2rem] bg-primary text-white font-black text-xl shadow-3xl">Next <ChevronRight className="ml-2 h-6 w-6" /></Button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-10 animate-in slide-in-from-right-8 duration-500">
                <div className="space-y-2 px-1">
                  <label className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Step 3: Test Format</label>
                  <p className="text-xl font-medium text-slate-500 leading-relaxed">Select how you want to be challenged.</p>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  {[
                    { id: "Mixed", label: "Mixed Mode", desc: "MCQ, Flashcards, and Essays." },
                    { id: "MCQ", label: "MCQs Only", desc: "Focus on objective accuracy." },
                    { id: "Flashcard", label: "Flashcards", desc: "Master active recall." },
                    { id: "Essay", label: "Writing Lab", desc: "Develop critical thinking." }
                  ].map(t => (
                    <Button key={t.id} variant={questionType === t.id ? "default" : "outline"} onClick={() => setQuestionType(t.id)} className={cn("h-auto py-8 px-10 rounded-[2rem] flex flex-col items-start gap-2 transition-all border-none", questionType === t.id ? "bg-primary text-white shadow-xl" : "bg-slate-50 dark:bg-slate-950 text-left hover:bg-slate-100 dark:hover:bg-slate-800")}>
                      <span className="font-black text-2xl">{t.label}</span>
                      <span className={cn("text-sm font-medium leading-relaxed", questionType === t.id ? "text-white/80" : "text-slate-500")}>{t.desc}</span>
                    </Button>
                  ))}
                </div>
                <div className="flex gap-4 pt-8">
                  <Button variant="ghost" onClick={() => setStep(2)} className="flex-1 h-18 rounded-[1.2rem] font-bold text-slate-400">Back</Button>
                  <Button onClick={() => setStep(4)} className="flex-[2] h-18 rounded-[1.2rem] bg-primary text-white font-black text-xl shadow-3xl">Next <ChevronRight className="ml-2 h-6 w-6" /></Button>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-10 animate-in slide-in-from-right-8 duration-500">
                <div className="space-y-12">
                  <div className="flex items-center justify-between px-1">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Step 4: Intensity</label>
                       <p className="text-xl font-medium text-slate-500 leading-relaxed">Set the scale for this practice.</p>
                    </div>
                    <Badge variant="secondary" className="rounded-[1.5rem] px-8 py-4 font-black text-3xl text-primary bg-primary/10 border-none shadow-sm">{questionCount}</Badge>
                  </div>
                  <div className="px-4 py-8">
                    <Slider 
                      value={[questionCount]} 
                      onValueChange={(v) => setQuestionCount(v[0])} 
                      min={questionType === "Essay" ? 1 : 10} 
                      max={questionType === "Essay" ? 5 : 30} 
                      step={1} 
                      className="py-10" 
                    />
                    <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mt-4 px-1">
                      <span>{questionType === "Essay" ? 1 : 10} Qs</span>
                      <span>{questionType === "Essay" ? 5 : 30} Qs</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-4 pt-8">
                  <Button onClick={handleGenerate} disabled={isLoading} className="w-full h-22 rounded-[2rem] bg-primary hover:bg-primary/90 text-white font-black text-2xl shadow-3xl group">
                    {isLoading ? <Loader2 className="h-8 w-8 animate-spin mr-4" /> : <Sparkles className="h-8 w-8 mr-4 group-hover:scale-125 transition-transform" />}
                    {isLoading ? "Forging Session..." : "Begin Session"}
                  </Button>
                  <Button variant="ghost" onClick={() => setStep(3)} className="h-12 rounded-xl font-black text-[10px] uppercase tracking-[0.6em] text-slate-300">Back to Format</Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ) : showLangConfirm ? (
        <Card className="border-none shadow-3xl rounded-[3rem] bg-white dark:bg-slate-900 p-12 sm:p-20 text-center space-y-10 animate-in zoom-in-95 duration-700">
          <div className="h-24 w-24 bg-primary/10 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 shadow-sm">
            <Globe className="h-12 w-12 text-primary" />
          </div>
          <div className="space-y-4">
            <h2 className="text-4xl font-black font-headline tracking-tighter leading-tight">Evaluation Mix</h2>
            <p className="text-slate-500 text-lg font-medium leading-relaxed max-w-sm mx-auto">Choose your preferred style for the Mentor's feedback.</p>
          </div>
          <div className="space-y-10 max-w-sm mx-auto">
            <Select value={preferredLanguage} onValueChange={setPreferredLanguage}>
              <SelectTrigger className="h-20 rounded-[1.8rem] bg-slate-50 dark:bg-slate-800 border-none font-black text-2xl px-12 shadow-inner">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-[1.8rem] border-none shadow-3xl">
                {languages.map(l => <SelectItem key={l} value={l} className="font-black h-16 text-xl">{l}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button onClick={() => launchMode('Essay')} className="w-full h-22 rounded-[1.8rem] bg-primary text-white font-black text-2xl shadow-3xl active:scale-95 transition-all">
              Enter Writing Lab <ArrowRight className="ml-3 h-8 w-8" />
            </Button>
          </div>
        </Card>
      ) : activeMode ? (
        <div className="flex flex-col h-full max-w-3xl mx-auto space-y-10 animate-in slide-in-from-bottom-12 duration-700">
          <div className="flex items-center justify-between px-4">
            <Button variant="ghost" size="sm" onClick={() => setActiveMode(null)} className="font-black text-[10px] uppercase tracking-[0.5em] text-slate-400 hover:text-slate-600">Exit Session</Button>
            <div className="bg-white dark:bg-slate-800 px-10 py-3 rounded-full shadow-2xl border border-slate-100 dark:border-white/5">
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">{currentIdx + 1} / {(activeMode === 'MCQ' ? result?.mcqs : activeMode === 'Flashcard' ? result?.flashcards : result?.essayPrompts)?.length || 0}</span>
            </div>
          </div>

          {activeMode === 'MCQ' && result?.mcqs && (
            <Card className="border-none shadow-3xl rounded-[3rem] bg-white dark:bg-slate-900 p-10 sm:p-20 flex flex-col space-y-12 min-h-[550px] border border-slate-100 dark:border-white/5 relative overflow-hidden">
              <div className="space-y-10 flex-1">
                <div className="h-2.5 bg-slate-50 dark:bg-slate-800 rounded-full overflow-hidden">
                   <div className="h-full bg-primary transition-all duration-1000 ease-out" style={{ width: `${((currentIdx + 1) / result.mcqs.length) * 100}%` }} />
                </div>
                <h2 className="text-2xl sm:text-3xl font-black font-headline text-slate-900 dark:text-white leading-[1.6] text-balance">{result.mcqs[currentIdx]?.question}</h2>
                <div className="grid grid-cols-1 gap-4">
                  {result.mcqs[currentIdx]?.options?.map((opt, i) => (
                    <Button key={i} variant="outline" onClick={() => { setIsAnswerRevealed(true); if (opt === result.mcqs![currentIdx].correctAnswer) setMcqCorrectCount(prev => prev + 1); }} disabled={isAnswerRevealed} className={cn("h-auto min-h-[80px] justify-start px-10 py-6 rounded-[2rem] border-none text-left font-black w-full transition-all text-xl leading-relaxed", isAnswerRevealed ? (opt === result.mcqs![currentIdx].correctAnswer ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-400 shadow-[0_0_0_4px_rgba(16,185,129,0.3)]" : "opacity-40 bg-slate-50 dark:bg-slate-950") : "bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-800 shadow-inner")}>
                       <span className="shrink-0 w-10 h-10 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center mr-6 text-[10px] font-black border border-slate-100 dark:border-white/10 shadow-sm">{String.fromCharCode(65 + i)}</span>
                       <span className="flex-1">{opt}</span>
                    </Button>
                  ))}
                </div>
              </div>
              {isAnswerRevealed && (
                <div className="pt-10 space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-500">
                  <div className="p-10 bg-emerald-50 dark:bg-emerald-900/10 rounded-[2.5rem] border border-emerald-100 dark:border-emerald-800/50 text-lg text-emerald-800 dark:text-emerald-300 font-medium leading-[1.8] shadow-inner italic">
                    <p className="font-black mb-4 uppercase tracking-[0.5em] text-[9px] text-emerald-600 not-italic">Mentor's Perspective</p>
                    {result.mcqs[currentIdx].explanation}
                  </div>
                  <Button onClick={() => nextItem()} className="w-full h-20 rounded-[2rem] bg-primary text-white font-black text-2xl shadow-3xl active:scale-95 transition-all">
                    Next Challenge <ChevronRight className="ml-4 h-8 w-8" />
                  </Button>
                </div>
              )}
            </Card>
          )}

          {activeMode === 'Flashcard' && result?.flashcards && (
            <div 
              className="perspective-1000 w-full min-h-[500px] cursor-pointer"
              onClick={() => setIsAnswerRevealed(!isAnswerRevealed)}
            >
              <div className={cn("relative w-full h-full min-h-[500px] transition-all duration-1000 preserve-3d shadow-3xl rounded-[3.5rem]", isAnswerRevealed ? "rotate-y-180" : "")}>
                <div className="absolute inset-0 backface-hidden bg-white dark:bg-slate-900 rounded-[3.5rem] p-12 sm:p-24 flex flex-col items-center justify-center text-center border border-slate-100 dark:border-white/5">
                  <Badge className="bg-primary/10 text-primary mb-12 font-black uppercase text-[10px] tracking-[0.5em] px-12 py-4 rounded-full shadow-sm">Recall Prompt</Badge>
                  <h3 className="text-3xl sm:text-4xl font-black font-headline text-slate-900 dark:text-white leading-[1.6] text-balance">{result.flashcards[currentIdx]?.front}</h3>
                </div>
                <div className="absolute inset-0 backface-hidden rotate-y-180 bg-slate-950 rounded-[3.5rem] p-12 sm:p-24 flex flex-col items-center justify-center text-center border border-white/5">
                  <Badge className="bg-emerald-500/10 text-emerald-400 mb-12 font-black uppercase text-[10px] tracking-[0.5em] px-12 py-4 rounded-full shadow-sm">Mastery Point</Badge>
                  <p className="text-2xl sm:text-3xl font-black text-slate-100 leading-loose italic text-balance">"{result.flashcards[currentIdx]?.back}"</p>
                  <Button onClick={(e) => { e.stopPropagation(); nextItem(); }} className="mt-16 h-20 px-16 rounded-[2rem] bg-white text-slate-950 font-black text-2xl shadow-3xl hover:bg-slate-50 active:scale-95 transition-all">Mastered <Check className="ml-4 h-8 w-8" /></Button>
                </div>
              </div>
            </div>
          )}

          {activeMode === 'Essay' && result?.essayPrompts && (
            <div className="flex flex-col space-y-10">
              <Card className="border-none shadow-3xl rounded-[3rem] bg-white dark:bg-slate-900 p-12 border border-slate-100 dark:border-white/5">
                <Badge className="bg-primary/10 text-primary mb-6 font-black uppercase text-[10px] tracking-[0.5em] px-12 py-4 rounded-full shadow-sm">Writing Lab Prompt</Badge>
                <h2 className="text-3xl sm:text-4xl font-black font-headline leading-[1.6] text-slate-900 dark:text-white text-balance">{result.essayPrompts[currentIdx]?.prompt}</h2>
              </Card>
              
              {!essayResult ? (
                <div className="flex flex-col space-y-10">
                  <textarea 
                    className="w-full min-h-[450px] rounded-[3rem] bg-white dark:bg-slate-950 border-none p-12 sm:p-20 text-2xl sm:text-3xl font-medium dark:text-white resize-none leading-loose transition-all outline-none shadow-3xl placeholder:text-slate-100 dark:placeholder:text-slate-800"
                    placeholder="Express your thesis here..."
                    value={essayContent}
                    onChange={(e) => setEssayContent(e.target.value)}
                  />
                  <Button onClick={handleEssayAnalysis} disabled={isAnalyzingEssay} className="w-full h-22 rounded-[2rem] bg-primary text-white font-black text-3xl shadow-3xl group active:scale-95 transition-all">
                    {isAnalyzingEssay ? <Loader2 className="animate-spin h-8 w-8 mr-4" /> : <SendHorizontal className="h-8 w-8 mr-4 group-hover:translate-x-4 transition-transform" />}
                    Submit for Analysis
                  </Button>
                </div>
              ) : (
                <div className="space-y-10 pb-20 animate-in zoom-in-95 duration-1000">
                  {/* SCHOLAR REPORT CARD HEADER */}
                  <div className="text-center space-y-6 mb-8">
                     <Badge className="bg-emerald-500/10 text-emerald-500 border-none font-black uppercase text-[10px] tracking-[0.5em] px-12 py-4 rounded-full shadow-lg">Scholar Report Card</Badge>
                     <div className="relative h-64 w-64 flex items-center justify-center mx-auto">
                        <svg className="h-full w-full rotate-[-90deg]">
                          <circle cx="128" cy="128" r="116" fill="transparent" stroke="currentColor" strokeWidth="20" className="text-slate-50 dark:text-slate-800" />
                          <circle cx="128" cy="128" r="116" fill="transparent" stroke="currentColor" strokeWidth="20" strokeDasharray="728.85" strokeDashoffset={728.85 - (728.85 * essayResult.evaluationData.overallScore) / 100} strokeLinecap="round" className="text-primary transition-all duration-[2.5s] ease-out shadow-[0_0_30px_rgba(147,51,234,0.4)]" />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-6xl font-black text-slate-900 dark:text-white">{essayResult.evaluationData.overallScore}%</span>
                          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mt-3">OVERALL SCORE</span>
                        </div>
                     </div>
                  </div>
                  
                  {/* SCHOLAR REWARD BOX */}
                  <div className="bg-slate-900/60 p-10 rounded-[3rem] border border-amber-500/20 flex items-center justify-between shadow-2xl">
                    <div className="space-y-2">
                      <p className="text-[10px] font-black text-amber-500 uppercase tracking-[0.3em]">SCHOLAR REWARD</p>
                      <h3 className="text-6xl font-black text-amber-400">+{essayResult.evaluationData.coinsEarned}</h3>
                    </div>
                    <div className="h-20 w-20 rounded-[1.8rem] bg-amber-600/20 flex items-center justify-center border border-amber-500/30">
                      <Coins className="h-10 w-10 text-amber-500" />
                    </div>
                  </div>

                  {/* METRIC INSIGHTS */}
                  <div className="grid grid-cols-1 gap-6">
                    {[
                      { label: "GRAMMAR ACCURACY", val: essayResult.evaluationData.grammarScore, icon: Zap },
                      { label: "CONTENT DEPTH", val: essayResult.evaluationData.contentDepthScore, icon: Trophy },
                      { label: "RELEVANCY SCORE", val: essayResult.evaluationData.relevancyScore, icon: Target }
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
                    " {essayResult.professorFeedback} "
                  </div>

                  <div className="space-y-8">
                    <Badge className="bg-slate-900 text-white uppercase font-black text-[10px] tracking-[0.5em] px-10 py-4 rounded-full shadow-2xl">Master Answer Outline</Badge>
                    <div className="p-10 bg-slate-900 rounded-[3rem] text-slate-300 leading-relaxed text-xl sm:text-2xl italic border border-white/5 shadow-3xl whitespace-pre-wrap">
                      {essayResult.suggestedRewrite}
                    </div>
                  </div>

                  <Button onClick={() => nextItem()} className="w-full h-22 rounded-[2rem] bg-primary text-white font-black text-2xl shadow-3xl active:scale-95 transition-all">
                    Next Challenge <ChevronRight className="ml-4 h-8 w-8" />
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <Card className="border-none shadow-3xl rounded-[4rem] bg-white dark:bg-slate-900 p-12 sm:p-24 text-center space-y-14 animate-in zoom-in-95 duration-700">
          <div className="relative inline-block">
            <div className="bg-primary/10 h-32 w-32 rounded-[3rem] flex items-center justify-center mx-auto relative z-10 shadow-lg">
              <Sparkles className="h-16 w-16 text-primary" />
            </div>
          </div>
          <div className="space-y-6">
            <h2 className="text-4xl sm:text-6xl font-black font-headline tracking-tighter text-balance leading-tight">Intelligence Ready</h2>
            <p className="text-slate-500 text-2xl font-medium leading-relaxed max-w-sm mx-auto">Your customized academic practice set is finalized.</p>
          </div>
          <div className="grid grid-cols-1 gap-6 max-w-lg mx-auto">
            {[
              { id: 'MCQ', icon: ListChecks, label: 'Objective MCQs', list: result?.mcqs, color: 'text-blue-500' },
              { id: 'Flashcard', icon: RotateCw, label: 'Active Recall', list: result?.flashcards, color: 'text-amber-500' },
              { id: 'Essay', icon: ClipboardList, label: 'Writing Lab', list: result?.essayPrompts, color: 'text-emerald-500' }
            ].map((m) => m.list?.length ? (
              <Button key={m.id} variant="outline" onClick={() => startMode(m.id as any)} className="h-24 rounded-[2.5rem] justify-start px-10 group relative overflow-hidden border-none bg-slate-50 dark:bg-slate-950 hover:bg-white dark:hover:bg-slate-800 shadow-sm transition-all active:scale-95">
                <div className={cn("p-5 rounded-2xl bg-white dark:bg-slate-900 mr-8 shadow-sm group-hover:scale-110 transition-transform", m.color)}>
                  <m.icon className="h-6 w-6" />
                </div>
                <div className="text-left">
                  <p className="font-black text-2xl">{m.list.length} {m.label}</p>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em] mt-1">Available Session</p>
                </div>
                {completedModes.includes(m.id) && <Check className="ml-auto h-10 w-10 text-emerald-500 animate-in zoom-in-50" />}
              </Button>
            ) : null)}
          </div>
          <Button onClick={() => { setStep(1); setResult(null); }} variant="ghost" className="w-full font-black text-[11px] uppercase tracking-[0.6em] text-slate-300 pt-10 hover:text-slate-500">
            Reset Session Wizard
          </Button>
        </Card>
      )}
    </div>
  )
}
