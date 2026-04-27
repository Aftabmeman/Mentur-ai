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
  Target,
  Brain,
  Lightbulb,
  FileText
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
import { validateAndDeductCoins } from "@/firebase/non-blocking-updates"
import { Progress } from "@/components/ui/progress"
import { doc } from "firebase/firestore"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export const runtime = 'nodejs';

const academicLevels = [
  "Class 8th", "Class 9th", "Class 10th", "Class 11th", "Class 12th",
  "UPSC", "JEE", "NEET", "GATE", "CAT", "CLAT", "SSC", "NDA"
];

const languages = [
  "English", "Hinglish", "Marathish", "Gujaratinglish", "Bengalish", 
  "Punjabish", "Tamilish", "Telugush", "Kannadish", "Malayalish"
];

const honestyTranslations: Record<string, { title: string, desc: string, btn: string }> = {
  "English": {
    title: "Honesty is Mastery",
    desc: "Flashcards are designed for active recall. If you flip a card and realize you didn't truly know the answer, be honest with yourself—click 'I Learned It'. Ready to be a true scholar?",
    btn: "Begin Honestly"
  },
  "Hinglish": {
    title: "Sachai hi Jeet hai",
    desc: "Flashcards active recall ke liye bane hain. Agar card flip karne ke baad lage ki aapko answer sahi se nahi pata tha, toh 'I Learned It' choose karein. Khud se jhoot na bole. Shuru karein?",
    btn: "Sachai se Shuru Karein"
  }
};

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

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
  
  const [mcqCount, setMcqCount] = useState<number>(10)
  const [flashcardCount, setFlashcardCount] = useState<number>(10)
  const [essayCount, setEssayCount] = useState<number>(1)

  const [difficulty, setDifficulty] = useState<string>("Medium")
  const [preferredLanguage, setPreferredLanguage] = useState("English")
  const [showLangConfirm, setShowLangConfirm] = useState(false)
  const [showFlashcardHonesty, setShowFlashcardHonesty] = useState(false)
  
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
  const [showMasterclass, setShowMasterclass] = useState(false)

  useEffect(() => {
    const transferredContent = window.sessionStorage.getItem('youtube_notes_transfer');
    if (transferredContent) {
      setMaterial(transferredContent);
      window.sessionStorage.removeItem('youtube_notes_transfer');
      toast({ title: "YouTube Notes Imported", description: "Your forged manuscript is ready for mastery." });
    }
  }, [toast]);

  useEffect(() => {
    if (profile?.preferredLanguage) {
      setPreferredLanguage(profile.preferredLanguage);
    }
  }, [profile]);

  const hTranslate = honestyTranslations[profile?.preferredLanguage || "English"] || honestyTranslations["English"];

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      toast({ title: "File Too Large", description: "Max size is 5MB.", variant: "destructive" });
      event.target.value = '';
      return;
    }

    setIsParsing(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await parseFileToText(formData);
      if (response.error) {
        toast({ title: "Parsing Failed", description: response.error, variant: "destructive" });
      } else if (response.text) {
        setMaterial(response.text);
      }
    } catch (e) {
      toast({ title: "Error", description: "Failed to parse document.", variant: "destructive" });
    } finally {
      setIsParsing(false);
      event.target.value = '';
    }
  };

  const handleGenerate = async () => {
    if (material.length < 30) {
      toast({ title: "Content Short", description: "Please add at least 30 characters.", variant: "destructive" });
      return;
    }

    // Wallet System: Text/PDF Assessment cost is 1 Coin
    const walletCheck = await validateAndDeductCoins(db!, user!.uid, 1);
    if (!walletCheck.success) {
      toast({ title: "Access Denied", description: walletCheck.error, variant: "destructive" });
      return;
    }

    setIsLoading(true)
    try {
      const assessments = await generateStudyAssessments({
        studyMaterial: material,
        assessmentTypes: questionType === "Mixed" ? ["MCQ", "Essay", "Flashcard", "Mixed"] : [questionType as any],
        academicLevel: level,
        difficulty: difficulty as any,
        questionCount: questionCount,
        mcqCount: questionType === "Mixed" ? mcqCount : (questionType === "MCQ" ? questionCount : 0),
        flashcardCount: questionType === "Mixed" ? flashcardCount : (questionType === "Flashcard" ? questionCount : 0),
        essayCount: questionType === "Mixed" ? essayCount : (questionType === "Essay" ? questionCount : 0),
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
    setShowMasterclass(false)
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
        confetti({ particleCount: 150, spread: 70 });
      }
    } catch (e) {
      toast({ title: "Error", description: "AI Professor is busy. Try again.", variant: "destructive" })
    } finally {
      setIsAnalyzingEssay(false)
    }
  }

  const startMode = (mode: 'MCQ' | 'Flashcard' | 'Essay') => {
    if (mode === 'Essay') {
      setShowLangConfirm(true)
      return;
    }
    if (mode === 'Flashcard') {
      setShowFlashcardHonesty(true)
      return;
    }
    launchMode(mode)
  }

  const launchMode = (mode: 'MCQ' | 'Flashcard' | 'Essay') => {
    setActiveMode(mode)
    setCurrentIdx(0)
    setIsAnswerRevealed(false)
    setEssayResult(null)
    setShowMasterclass(false)
    setEssayContent("")
    setMcqCorrectCount(0)
    setShowLangConfirm(false)
    setShowFlashcardHonesty(false)
  }

  const nextItem = () => {
    const list = activeMode === 'MCQ' ? result?.mcqs : activeMode === 'Flashcard' ? result?.flashcards : result?.essayPrompts
    if (currentIdx < (list?.length || 0) - 1) {
      setCurrentIdx(prev => prev + 1)
      setIsAnswerRevealed(false)
      setEssayResult(null)
      setShowMasterclass(false)
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
    toast({ title: `${currentMode} Complete!`, description: `Session mastered via Discate AI.` });
    confetti({ particleCount: 150, spread: 70 });
  }

  return (
    <div className="flex flex-col h-full space-y-6 sm:space-y-10 pb-40 animate-in fade-in duration-700 px-4 max-w-2xl mx-auto">
      <AlertDialog open={showFlashcardHonesty} onOpenChange={setShowFlashcardHonesty}>
        <AlertDialogContent className="rounded-[2rem] border-none shadow-3xl bg-white dark:bg-slate-900 p-8">
          <AlertDialogHeader className="space-y-4">
            <div className="h-16 w-16 bg-amber-100 dark:bg-amber-900/20 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
              <Lightbulb className="h-8 w-8 text-amber-600" />
            </div>
            <AlertDialogTitle className="text-2xl font-black font-headline text-center tracking-tight">{hTranslate.title}</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-500 dark:text-slate-400 text-center text-base leading-relaxed">
              {hTranslate.desc}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6">
            <AlertDialogAction 
              onClick={() => launchMode('Flashcard')}
              className="w-full h-14 rounded-xl bg-primary text-white font-black text-lg shadow-xl hover:bg-primary/90 transition-all"
            >
              {hTranslate.btn}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="px-1 text-center pt-6 sm:pt-10">
        <h1 className="text-2xl sm:text-5xl font-black font-headline tracking-tighter text-slate-900 dark:text-white uppercase leading-tight text-balance text-center">Discate Practice</h1>
        <p className="text-[9px] font-black text-slate-400 mt-2 tracking-[0.4em] uppercase">Sequential Mastery Wizard</p>
      </div>

      {!result ? (
        <Card className="border-none shadow-2xl rounded-[2rem] sm:rounded-[2.5rem] bg-white dark:bg-slate-900 overflow-hidden border border-slate-100 dark:border-white/5">
          <CardContent className="p-6 sm:p-10 space-y-8">
            {step === 1 && (
              <div className="space-y-6 animate-in slide-in-from-right-8 duration-500">
                <div className="space-y-4">
                  <div className="space-y-1 text-center sm:text-left">
                    <label className="text-[9px] font-black text-primary uppercase tracking-[0.3em]">Step 1: Content Ingestion</label>
                    <p className="text-base sm:text-xl font-medium text-slate-500 leading-relaxed">Upload elite resources or paste text.</p>
                  </div>
                  
                  <div className="flex flex-col gap-4">
                    <input 
                      type="file" 
                      id="mobile-file-picker"
                      accept=".txt,.pdf,.docx" 
                      className="hidden" 
                      onChange={handleFileUpload} 
                    />
                    <label 
                      htmlFor="mobile-file-picker"
                      className="w-full h-20 sm:h-28 rounded-[1.5rem] sm:rounded-[2rem] border-2 border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 flex flex-col items-center justify-center gap-2 hover:bg-primary/5 transition-all group cursor-pointer disabled:opacity-50"
                    >
                      {isParsing ? (
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      ) : (
                        <div className="flex flex-col items-center gap-1">
                           <FileUp className="h-5 w-5 sm:h-8 sm:w-8 text-primary group-hover:scale-110 transition-transform" />
                           <span className="text-[8px] font-black uppercase tracking-[0.2em] text-primary">Upload Document</span>
                           <span className="text-[7px] font-bold text-slate-400 uppercase tracking-widest">PDF, DOCX, TXT</span>
                           <span className="text-[8px] font-black text-emerald-500 uppercase tracking-[0.2em] mt-1">Cost: 1 Credit</span>
                        </div>
                      )}
                    </label>

                    <textarea 
                      className="w-full min-h-[180px] sm:min-h-[250px] rounded-[1.5rem] sm:rounded-[1.8rem] bg-slate-50 dark:bg-slate-950 border-none p-5 sm:p-6 text-sm sm:text-lg dark:text-white resize-none leading-relaxed transition-all outline-none shadow-inner placeholder:text-slate-200"
                      placeholder="Or paste your study material text here..."
                      value={material}
                      onChange={(e) => setMaterial(e.target.value)}
                    />
                  </div>
                </div>
                
                <Button onClick={() => setStep(2)} disabled={material.trim().length < 30 || isParsing} className="w-full h-14 sm:h-18 rounded-[1.2rem] sm:rounded-[1.5rem] bg-primary text-white font-black text-base sm:text-lg shadow-xl group active:scale-95 transition-all">
                  Continue <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-2 transition-transform" />
                </Button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6 animate-in slide-in-from-right-8 duration-500">
                <div className="space-y-1 text-center sm:text-left">
                   <label className="text-[9px] font-black uppercase tracking-[0.3em] text-primary">Step 2: Academic Level</label>
                   <p className="text-base sm:text-xl font-medium text-slate-500 leading-relaxed">Target the specific difficulty.</p>
                </div>
                <div className="grid grid-cols-2 gap-2 sm:gap-4">
                  {academicLevels.map(l => (
                    <Button key={l} variant={level === l ? "default" : "outline"} onClick={() => setLevel(l)} className={cn("h-11 sm:h-16 rounded-[1rem] sm:rounded-[1.2rem] font-black text-[10px] sm:text-base transition-all border-none", level === l ? "bg-primary text-white shadow-xl" : "bg-slate-50 dark:bg-slate-950")}>
                      {l}
                    </Button>
                  ))}
                </div>
                <div className="flex gap-3 pt-4">
                  <Button variant="ghost" onClick={() => setStep(1)} className="flex-1 h-12 rounded-[1rem] font-bold text-slate-400">Back</Button>
                  <Button onClick={() => setStep(3)} className="flex-[2] h-12 rounded-[1rem] bg-primary text-white font-black text-base sm:text-lg shadow-xl">Next <ChevronRight className="ml-2 h-5 w-5" /></Button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6 animate-in slide-in-from-right-8 duration-500">
                <div className="space-y-1 text-center sm:text-left">
                  <label className="text-[9px] font-black uppercase tracking-[0.3em] text-primary">Step 3: Test Format</label>
                  <p className="text-base sm:text-xl font-medium text-slate-500 leading-relaxed">Choose your challenge.</p>
                </div>
                <div className="grid grid-cols-1 gap-2 sm:gap-4">
                  {[
                    { id: "Mixed", label: "Mixed Mode", desc: "MCQ, Flashcards, and Essays." },
                    { id: "MCQ", label: "MCQs Only", desc: "Focus on objective accuracy." },
                    { id: "Flashcard", label: "Flashcards", desc: "Master active recall." },
                    { id: "Essay", label: "Writing Lab", desc: "Develop critical thinking." }
                  ].map(t => (
                    <Button key={t.id} variant={questionType === t.id ? "default" : "outline"} onClick={() => setQuestionType(t.id)} className={cn("h-auto py-4 sm:py-6 px-5 sm:px-6 rounded-[1.2rem] sm:rounded-[1.5rem] flex flex-col items-start gap-0.5 transition-all border-none", questionType === t.id ? "bg-primary text-white shadow-xl" : "bg-slate-50 dark:bg-slate-950 text-left")}>
                      <span className="font-black text-sm sm:text-xl">{t.label}</span>
                      <span className={cn("text-[10px] sm:text-xs font-medium leading-relaxed", questionType === t.id ? "text-white/80" : "text-slate-500")}>{t.desc}</span>
                    </Button>
                  ))}
                </div>
                <div className="flex gap-3 pt-4">
                  <Button variant="ghost" onClick={() => setStep(2)} className="flex-1 h-12 rounded-[1rem] font-bold text-slate-400">Back</Button>
                  <Button onClick={() => setStep(4)} className="flex-[2] h-12 rounded-[1rem] bg-primary text-white font-black text-base sm:text-lg shadow-xl">Next <ChevronRight className="ml-2 h-5 w-5" /></Button>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-6 animate-in slide-in-from-right-8 duration-500">
                <div className="space-y-6">
                  <div className="space-y-1">
                     <label className="text-[9px] font-black uppercase tracking-[0.3em] text-primary">Step 4: Intensity</label>
                     <p className="text-base sm:text-xl font-medium text-slate-500 leading-relaxed">Configure your set counts.</p>
                  </div>
                  
                  {questionType === "Mixed" ? (
                    <div className="space-y-8">
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-black uppercase text-slate-400">MCQs</span>
                          <Badge variant="secondary" className="rounded-lg">{mcqCount}</Badge>
                        </div>
                        <Slider value={[mcqCount]} onValueChange={(v) => setMcqCount(v[0])} min={10} max={25} step={1} />
                      </div>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-black uppercase text-slate-400">Flashcards</span>
                          <Badge variant="secondary" className="rounded-lg">{flashcardCount}</Badge>
                        </div>
                        <Slider value={[flashcardCount]} onValueChange={(v) => setFlashcardCount(v[0])} min={10} max={25} step={1} />
                      </div>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-black uppercase text-slate-400">Essays</span>
                          <Badge variant="secondary" className="rounded-lg">{essayCount}</Badge>
                        </div>
                        <Slider value={[essayCount]} onValueChange={(v) => setEssayCount(v[0])} min={1} max={5} step={1} />
                      </div>
                    </div>
                  ) : (
                    <div className="px-2 py-4">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-[10px] font-black uppercase text-slate-400">{questionType} Count</span>
                        <Badge variant="secondary" className="rounded-[1rem] px-4 py-2 font-black text-lg sm:text-2xl text-primary bg-primary/10 border-none shadow-sm">{questionCount}</Badge>
                      </div>
                      <Slider 
                        value={[questionCount]} 
                        onValueChange={(v) => setQuestionCount(v[0])} 
                        min={questionType === "Essay" ? 1 : 10} 
                        max={questionType === "Essay" ? 10 : 50} 
                        step={1} 
                        className="py-4" 
                      />
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-2 pt-4">
                  <Button onClick={handleGenerate} disabled={isLoading} className="w-full h-14 sm:h-18 rounded-[1.2rem] sm:rounded-[1.5rem] bg-primary hover:bg-primary/90 text-white font-black text-base sm:text-lg shadow-xl group">
                    {isLoading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Sparkles className="h-5 w-5 mr-2 group-hover:scale-125 transition-transform" />}
                    {isLoading ? "Forging Session..." : "Begin Session (1 Credit)"}
                  </Button>
                  <Button variant="ghost" onClick={() => setStep(3)} className="h-10 rounded-xl font-black text-[8px] uppercase tracking-[0.4em] text-slate-300">Back to Format</Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ) : showLangConfirm ? (
        <Card className="border-none shadow-2xl rounded-[2rem] sm:rounded-[2.5rem] bg-white dark:bg-slate-900 p-8 sm:p-14 text-center space-y-6 animate-in zoom-in-95 duration-700">
          <div className="h-14 w-14 sm:h-20 sm:w-20 bg-primary/10 rounded-[1.2rem] sm:rounded-[1.5rem] flex items-center justify-center mx-auto mb-4 shadow-sm">
            <Globe className="h-6 w-6 sm:h-10 sm:w-10 text-primary" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl sm:text-3xl font-black font-headline tracking-tighter leading-tight">Evaluation Mix</h2>
            <p className="text-slate-500 text-xs sm:text-base font-medium leading-relaxed max-w-xs mx-auto text-balance">Choose your preferred style for the AI Mentor's feedback.</p>
          </div>
          <div className="space-y-4 max-w-xs mx-auto">
            <Select value={preferredLanguage} onValueChange={setPreferredLanguage}>
              <SelectTrigger className="h-13 sm:h-14 rounded-[1rem] sm:rounded-[1.2rem] bg-slate-50 dark:bg-slate-800 border-none font-black text-sm sm:text-base px-6 shadow-inner">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-[1.2rem] border-none shadow-2xl">
                {languages.map(l => <SelectItem key={l} value={l} className="font-black h-10 text-xs sm:text-base">{l}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button onClick={() => launchMode('Essay')} className="w-full h-13 sm:h-14 rounded-[1rem] sm:rounded-[1.2rem] bg-primary text-white font-black text-sm sm:text-xl shadow-xl active:scale-95 transition-all">
              Enter Writing Lab <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </div>
        </Card>
      ) : activeMode ? (
        <div className="flex flex-col h-full max-w-3xl mx-auto space-y-6 animate-in slide-in-from-bottom-8 duration-700">
          <div className="flex items-center justify-between px-2">
            <Button variant="ghost" size="sm" onClick={() => setActiveMode(null)} className="font-black text-[8px] uppercase tracking-[0.4em] text-slate-400 hover:text-slate-600">Exit Session</Button>
            <div className="bg-white dark:bg-slate-800 px-4 py-1.5 rounded-full shadow-lg border border-slate-100 dark:border-white/5">
              <span className="text-[9px] font-black uppercase tracking-[0.3em] text-primary">{currentIdx + 1} / {(activeMode === 'MCQ' ? result?.mcqs : activeMode === 'Flashcard' ? result?.flashcards : result?.essayPrompts)?.length || 0}</span>
            </div>
          </div>

          {activeMode === 'MCQ' && result?.mcqs && result.mcqs.length > 0 && (
            <Card className="border-none shadow-2xl rounded-[1.8rem] sm:rounded-[2rem] bg-white dark:bg-slate-900 p-5 sm:p-8 flex flex-col space-y-6 min-h-[380px] sm:min-h-[400px] relative overflow-hidden">
              <div className="space-y-6 flex-1">
                <div className="h-1 bg-slate-50 dark:bg-slate-800 rounded-full overflow-hidden">
                   <div className="h-full bg-primary transition-all duration-1000 ease-out" style={{ width: `${((currentIdx + 1) / result.mcqs.length) * 100}%` }} />
                </div>
                <h2 className="text-base sm:text-2xl font-black font-headline text-slate-900 dark:text-white leading-relaxed text-balance text-center">{result.mcqs[currentIdx]?.question}</h2>
                <div className="grid grid-cols-1 gap-3">
                  {result.mcqs[currentIdx]?.options?.map((opt, i) => (
                    <Button 
                      key={i} 
                      variant="outline" 
                      onClick={() => { setIsAnswerRevealed(true); if (opt === result.mcqs![currentIdx].correctAnswer) setMcqCorrectCount(prev => prev + 1); }} 
                      disabled={isAnswerRevealed} 
                      className={cn(
                        "flex h-auto min-h-[52px] sm:min-h-[64px] items-start justify-start rounded-[1.2rem] border-none px-4 py-3.5 text-left font-bold transition-all sm:px-6 sm:py-4 w-full !whitespace-normal leading-snug", 
                        isAnswerRevealed ? (opt === result.mcqs![currentIdx].correctAnswer ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-400 shadow-[0_0_0_2px_rgba(16,185,129,0.3)]" : "opacity-40 bg-slate-50 dark:bg-slate-950") : "bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-800 shadow-inner"
                      )}
                    >
                       <span className="shrink-0 w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-white dark:bg-slate-800 flex items-center justify-center mr-3 text-[10px] sm:text-xs font-black border border-slate-100 dark:border-white/10">{String.fromCharCode(65 + i)}</span>
                       <span className="flex-1 pr-2 pt-0.5 text-sm sm:text-base">{opt}</span>
                    </Button>
                  ))}
                </div>
              </div>
              {isAnswerRevealed && (
                <div className="pt-4 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="p-4 sm:p-5 bg-emerald-50 dark:bg-emerald-900/10 rounded-[1.2rem] border border-emerald-100 dark:border-emerald-800/50 text-[11px] sm:text-base text-emerald-800 dark:text-emerald-300 font-medium leading-relaxed shadow-inner italic text-balance text-center">
                    <p className="font-black mb-1 uppercase tracking-[0.4em] text-[7px] text-emerald-600 not-italic">Scholar's Perspective</p>
                    {result.mcqs[currentIdx].explanation}
                  </div>
                  <Button onClick={() => nextItem()} className="w-full h-12 sm:h-14 rounded-[1rem] sm:rounded-[1.2rem] bg-primary text-white font-black text-sm sm:text-base shadow-xl active:scale-95 transition-all">
                    Next Challenge <ChevronRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                  </Button>
                </div>
              )}
            </Card>
          )}

          {activeMode === 'Flashcard' && result?.flashcards && result.flashcards.length > 0 && (
            <div className="flex flex-col items-center space-y-8 w-full max-w-md mx-auto">
              <div className="perspective-1000 w-full min-h-[350px] sm:min-h-[400px] cursor-pointer" onClick={() => setIsAnswerRevealed(!isAnswerRevealed)}>
                <div className={cn("relative w-full h-full min-h-[350px] sm:min-h-[400px] transition-all duration-700 preserve-3d shadow-3xl rounded-[2.5rem]", isAnswerRevealed ? "rotate-y-180" : "")}>
                  <div className="absolute inset-0 backface-hidden bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 sm:p-10 flex flex-col items-center justify-center text-center border border-slate-100 dark:border-white/5 overflow-y-auto no-scrollbar">
                    <Badge className="bg-primary/10 text-primary mb-4 font-black uppercase text-[8px] tracking-[0.4em] px-6 py-2 rounded-full shrink-0">Recall Prompt</Badge>
                    <div className="flex-1 flex items-center justify-center w-full">
                       <h3 className="text-lg sm:text-2xl font-black font-headline text-slate-900 dark:text-white leading-tight text-wrap break-words">{result.flashcards[currentIdx]?.front}</h3>
                    </div>
                  </div>
                  <div className="absolute inset-0 backface-hidden rotate-y-180 bg-slate-950 rounded-[2.5rem] p-6 sm:p-10 flex flex-col items-center justify-center text-center border border-white/5 overflow-y-auto no-scrollbar">
                    <Badge className="bg-emerald-500/10 text-emerald-400 mb-4 font-black uppercase text-[8px] tracking-[0.4em] px-6 py-2 rounded-full shrink-0">Mastery Point</Badge>
                    <div className="flex-1 flex items-center justify-center w-full">
                       <p className="text-sm sm:text-lg font-black text-slate-100 leading-relaxed italic text-wrap break-words">"{result.flashcards[currentIdx]?.back}"</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {isAnswerRevealed && (
                <div className="w-full flex gap-3 animate-in fade-in zoom-in-95 duration-500 px-4">
                  <Button 
                    onClick={() => { nextItem(); }} 
                    variant="outline"
                    className="flex-1 h-14 sm:h-16 rounded-[1.2rem] bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-white/10 font-black text-sm sm:text-lg shadow-xl hover:bg-slate-50 transition-all flex flex-col gap-0.5"
                  >
                    <Lightbulb className="h-4 w-4 text-amber-500" />
                    <span>I Learned It</span>
                  </Button>
                  <Button 
                    onClick={() => { nextItem(); }} 
                    className="flex-1 h-14 sm:h-16 rounded-[1.2rem] bg-primary text-white font-black text-sm sm:text-lg shadow-3xl hover:bg-primary/90 transition-all flex flex-col gap-0.5"
                  >
                    <Brain className="h-4 w-4 text-white" />
                    <span>I Know It</span>
                  </Button>
                </div>
              )}
              
              {!isAnswerRevealed && (
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.4em] animate-pulse">Tap Card to reveal</p>
              )}
            </div>
          )}

          {activeMode === 'Essay' && result?.essayPrompts && result.essayPrompts.length > 0 && (
            <div className="flex flex-col space-y-6">
              <Card className="border-none shadow-xl rounded-[1.2rem] sm:rounded-[1.5rem] bg-white dark:bg-slate-900 p-5 sm:p-8 border border-slate-100 dark:border-white/5">
                <Badge className="bg-primary/10 text-primary mb-3 font-black uppercase text-[7px] tracking-[0.4em] px-5 sm:px-6 py-1.5 sm:py-2 rounded-full">Writing Lab Prompt</Badge>
                <h2 className="text-base sm:text-2xl font-black font-headline leading-relaxed text-slate-900 dark:text-white text-balance text-center">{result.essayPrompts[currentIdx]?.prompt}</h2>
              </Card>
              
              {!essayResult ? (
                <div className="flex flex-col space-y-6">
                  <textarea 
                    className="w-full min-h-[250px] sm:min-h-[300px] rounded-[1.5rem] sm:rounded-[1.8rem] bg-white dark:bg-slate-950 border-none p-5 sm:p-6 text-sm sm:text-lg font-medium dark:text-white resize-none leading-relaxed transition-all outline-none shadow-xl placeholder:text-slate-100"
                    placeholder="Express your thesis here..."
                    value={essayContent}
                    onChange={(e) => setEssayContent(e.target.value)}
                  />
                  <Button onClick={handleEssayAnalysis} disabled={isAnalyzingEssay} className="w-full h-13 sm:h-18 rounded-[1.2rem] sm:rounded-[1.5rem] bg-primary text-white font-black text-base sm:text-lg shadow-xl group active:scale-95 transition-all">
                    {isAnalyzingEssay ? <Loader2 className="animate-spin h-5 w-5 mr-2" /> : <SendHorizontal className="h-5 w-5 mr-2 group-hover:translate-x-2 transition-transform" />}
                    Submit for Analysis
                  </Button>
                </div>
              ) : (
                <div className="space-y-8 pb-20 animate-in zoom-in-95 duration-1000">
                  <div className="text-center space-y-4 mb-4">
                     <Badge className="bg-emerald-500/10 text-emerald-500 border-none font-black uppercase text-[8px] tracking-[0.4em] px-6 py-2 rounded-full shadow-lg">Scholar Report Card</Badge>
                     <div className="relative h-44 w-44 sm:h-56 sm:w-56 flex items-center justify-center mx-auto">
                        <svg className="h-full w-full rotate-[-90deg]" viewBox="0 0 192 192">
                          <circle cx="96" cy="96" r="86" fill="transparent" stroke="currentColor" strokeWidth="16" className="text-slate-50 dark:text-slate-800" />
                          <circle cx="96" cy="96" r="86" fill="transparent" stroke="currentColor" strokeWidth="16" strokeDasharray="540.35" strokeDashoffset={540.35 - (540.35 * (essayResult?.evaluationData?.overallScore || 0)) / 100} strokeLinecap="round" className="text-primary transition-all duration-1000 ease-out" />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white">{essayResult?.evaluationData?.overallScore || 0}%</span>
                          <span className="text-[7px] sm:text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 mt-1">OVERALL SCORE</span>
                        </div>
                     </div>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-3 text-left">
                    {[
                      { label: "Grammar Accuracy", val: essayResult.evaluationData.grammarScore, icon: Zap },
                      { label: "Content Depth", val: essayResult.evaluationData.contentDepthScore, icon: Trophy },
                      { label: "Relevancy Score", val: essayResult.evaluationData.relevancyScore, icon: Target }
                    ].map((stat, i) => (
                      <div key={i} className="bg-white dark:bg-slate-900/60 p-5 sm:p-6 rounded-[1rem] sm:rounded-[1.2rem] border border-slate-100 dark:border-white/5 space-y-3 shadow-sm">
                        <div className="flex justify-between items-center">
                           <div className="flex items-center gap-2">
                              <stat.icon className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-primary" />
                              <span className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-400">{stat.label}</span>
                           </div>
                           <span className="text-sm text-slate-900 dark:text-white">{stat.val}%</span>
                        </div>
                        <Progress value={stat.val} className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-800" />
                      </div>
                    ))}
                  </div>

                  <div className="p-5 sm:p-6 bg-primary/5 rounded-[1.2rem] sm:rounded-[1.5rem] italic text-sm sm:text-lg text-slate-700 dark:text-slate-100 leading-relaxed border-l-4 border-primary shadow-inner text-balance text-center relative">
                    " {essayResult.professorFeedback} "
                  </div>

                  <div className="space-y-4">
                    <Button 
                      onClick={() => setShowMasterclass(!showMasterclass)} 
                      variant="outline" 
                      className="w-full h-14 rounded-2xl border-2 font-black text-[10px] uppercase tracking-[0.3em] flex items-center justify-center gap-3"
                    >
                      <FileText className="h-4 w-4" />
                      {showMasterclass ? "Hide Masterclass Answer" : "See the Ideal Scholar Answer"}
                    </Button>

                    {showMasterclass && (
                      <div className="animate-in slide-in-from-top-4 duration-500 space-y-4">
                         <Badge className="bg-slate-900 text-white uppercase font-black text-[7px] tracking-[0.4em] px-8 py-2 rounded-full shadow-2xl">The Masterclass Answer</Badge>
                         <div className="p-6 sm:p-8 bg-slate-900 dark:bg-black rounded-[1.8rem] text-slate-300 leading-relaxed text-sm sm:text-lg italic whitespace-pre-wrap border border-white/5 shadow-xl text-left">
                            {essayResult.suggestedRewrite}
                         </div>
                      </div>
                    )}
                  </div>

                  <Button onClick={() => nextItem()} className="w-full h-12 sm:h-14 rounded-[1rem] sm:rounded-[1.2rem] bg-primary text-white font-black text-sm sm:text-base shadow-xl active:scale-95 transition-all">
                    Next Challenge <ChevronRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <Card className="border-none shadow-2xl rounded-[2rem] sm:rounded-[2.5rem] bg-white dark:bg-slate-900 p-8 sm:p-14 text-center space-y-8 animate-in zoom-in-95 duration-700">
          <div className="relative inline-block">
            <div className="bg-primary/10 h-14 w-14 sm:h-20 sm:w-20 rounded-[1.2rem] sm:rounded-[1.5rem] flex items-center justify-center mx-auto relative z-10 shadow-lg">
              <Sparkles className="h-6 w-6 sm:h-10 sm:w-10 text-primary" />
            </div>
          </div>
          <div className="space-y-3">
            <h2 className="text-xl sm:text-4xl font-black font-headline tracking-tighter leading-tight text-balance">Intelligence Ready</h2>
            <p className="text-slate-500 text-xs sm:text-xl font-medium leading-relaxed max-w-xs mx-auto text-balance">Your customized academic practice set is finalized.</p>
          </div>
          <div className="grid grid-cols-1 gap-3 max-w-sm mx-auto">
            {[
              { id: 'MCQ', icon: ListChecks, label: 'Objective MCQs', list: result?.mcqs, color: 'text-blue-500' },
              { id: 'Flashcard', icon: RotateCw, label: 'Active Recall', list: result?.flashcards, color: 'text-amber-500' },
              { id: 'Essay', icon: ClipboardList, label: 'Writing Lab', list: result?.essayPrompts, color: 'text-emerald-500' }
            ].map((m) => {
              const isSelected = questionType === "Mixed" || questionType === m.id;
              if (!isSelected || !m.list || m.list.length === 0) return null;
              
              return (
                <Button key={m.id} variant="outline" onClick={() => startMode(m.id as any)} className="h-14 sm:h-20 rounded-[1.2rem] sm:rounded-[1.8rem] justify-start px-4 sm:px-6 group relative overflow-hidden border-none bg-slate-50 dark:bg-slate-900/40 hover:bg-white transition-all active:scale-95">
                  <div className={cn("p-2 sm:p-3 rounded-lg bg-white dark:bg-slate-900 mr-3 sm:mr-4 shadow-sm group-hover:scale-110 transition-transform", m.color)}>
                    <m.icon className="h-4 w-4 sm:h-5 w-5" />
                  </div>
                  <div className="text-left">
                    <p className="font-black text-xs sm:text-lg">{m.list.length} {m.label}</p>
                    <p className="text-[6px] sm:text-[7px] font-black text-slate-400 uppercase tracking-[0.4em] mt-0.5">Available Session</p>
                  </div>
                  {completedModes.includes(m.id) && <Check className="ml-auto h-5 w-5 sm:h-6 sm:w-6 text-emerald-500 animate-in zoom-in-50" />}
                </Button>
              )
            })}
          </div>
          <Button onClick={() => { setStep(1); setResult(null); }} variant="ghost" className="w-full font-black text-[8px] uppercase tracking-[0.5em] text-slate-300 pt-6 hover:text-slate-500">
            Reset Session Wizard
          </Button>
        </Card>
      )}
    </div>
  )
}
