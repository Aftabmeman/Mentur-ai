
"use client"

import { useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  CheckCircle2, 
  X, 
  Loader2, 
  FileIcon, 
  ChevronRight, 
  Sparkles, 
  ListChecks,
  RotateCw,
  FileUp,
  BrainCircuit,
  GraduationCap,
  ClipboardList,
  BookOpen,
  PartyPopper,
  Info,
  Award,
  BookMarked,
  PlusCircle,
  Check,
  SendHorizontal
} from "lucide-react"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Textarea } from "@/components/ui/textarea"
import { generateStudyAssessments, type GenerateStudyAssessmentsOutput } from "@/ai/flows/generate-study-assessments-flow"
import { evaluateEssayFeedback, type EvaluateEssayFeedbackOutput } from "@/ai/flows/evaluate-essay-feedback"
import { extractTextFromPDF } from "@/app/actions/pdf-parser"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import confetti from 'canvas-confetti'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export const maxDuration = 60;

const academicLevels = [
  "Class 8th", "Class 9th", "Class 10th", "Class 11th", "Class 12th",
  "Undergraduate Year 1", "Undergraduate Year 2", "Undergraduate Year 3",
  "UPSC", "JEE", "NEET", "GATE", "CAT", "CLAT", "SSC", "NDA"
];

export default function AssessmentsPage() {
  const { toast } = useToast()
  
  const [wizardStep, setWizardStep] = useState(1)
  const [isCelebration, setIsCelebration] = useState(false)
  const [showHonestyModal, setShowHonestyModal] = useState(false)

  const [material, setMaterial] = useState("")
  const [level, setLevel] = useState<string>("Class 10th")
  const [difficulty, setDifficulty] = useState<string>("Medium")
  const [questionType, setQuestionType] = useState<string>("Mixed")
  
  const [mcqCount, setMcqCount] = useState(5)
  const [essayCount, setEssayCount] = useState(2)
  const [flashcardCount, setFlashcardCount] = useState(5)

  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<GenerateStudyAssessmentsOutput | null>(null)
  const [completedModes, setCompletedModes] = useState<string[]>([])
  
  const [activeMode, setActiveMode] = useState<'MCQ' | 'Flashcard' | 'Essay' | null>(null)
  const [currentIdx, setCurrentIdx] = useState(0)
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false)
  const [isCardFlipped, setIsCardFlipped] = useState(false)
  
  const [masteredCount, setMasteredCount] = useState(0)
  const [reviewCount, setReviewCount] = useState(0)

  const [essayText, setEssayText] = useState("")
  const [uploadedImages, setUploadedImages] = useState<File[]>([])
  const [isAnalyzingEssay, setIsAnalyzingEssay] = useState(false)
  const [essayResult, setEssayResult] = useState<EvaluateEssayFeedbackOutput | null>(null)

  const [inputType, setInputType] = useState<string>("paste")
  const [isExtracting, setIsExtracting] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const essayImageInputRef = useRef<HTMLInputElement>(null)

  const playSuccessSound = () => {
    try {
      const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3");
      audio.volume = 0.5;
      audio.play();
    } catch (e) {
      console.log("Audio play failed", e);
    }
  }

  const handleModeCompletion = () => {
    if (!activeMode) return;
    const currentMode = activeMode;
    
    setCompletedModes(prev => [...new Set([...prev, currentMode])])
    setActiveMode(null)

    if (currentMode === 'MCQ' && result?.flashcards?.length) {
      toast({ title: "MCQs Finished!", description: "Next: Mastery Flashcards" })
      setTimeout(() => startMode('Flashcard'), 800)
    } else if ((currentMode === 'MCQ' || currentMode === 'Flashcard') && result?.essayPrompts?.length) {
      toast({ title: "Almost There!", description: "Next: Writing Challenge" })
      setTimeout(() => startMode('Essay'), 800)
    } else {
      toast({ title: "Journey Complete!", description: "You've finished all sections!" })
      playSuccessSound()
      confetti({ particleCount: 200, spread: 100, origin: { y: 0.5 } })
    }
  }

  const handleExtractText = async () => {
    if (!uploadedFile) return
    setIsExtracting(true)
    try {
      const formData = new FormData()
      formData.append('file', uploadedFile)
      const response = await extractTextFromPDF(formData)
      if (response.error) {
        toast({ title: "Scan Failed", description: response.error, variant: "destructive" })
      } else if (response.text) {
        setMaterial(response.text)
        toast({ title: "Resource Ingested", description: `Successfully extracted content.` })
        setWizardStep(2)
      }
    } catch (e) {
      toast({ title: "Error", description: "Something went wrong scanning the PDF.", variant: "destructive" })
    } finally {
      setIsExtracting(false)
    }
  }

  const handleGenerate = async () => {
    setIsLoading(true)
    try {
      const assessments = await generateStudyAssessments({
        studyMaterial: material,
        assessmentTypes: questionType === "Mixed" ? ["MCQ", "Essay", "Flashcard"] : [questionType as any],
        academicLevel: level,
        difficulty: difficulty as any,
        mcqCount: (questionType === "MCQ" || questionType === "Mixed") ? mcqCount : 0,
        essayCount: (questionType === "Essay" || questionType === "Mixed") ? essayCount : 0,
        flashcardCount: (questionType === "Flashcard" || questionType === "Mixed") ? flashcardCount : 0,
      })
      
      if (assessments.error) {
        toast({ title: "Journey Failed", description: assessments.error, variant: "destructive" });
      } else {
        setIsCelebration(true)
        confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: ['#9333ea', '#4f46e5', '#3b82f6'] })
        setTimeout(() => {
          setResult(assessments)
          setIsCelebration(false)
        }, 1500)
      }
    } catch (error: any) {
      toast({ title: "System Error", description: "Generation failed.", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  const handleEssayAnalysis = async () => {
    if (!essayText.trim() && uploadedImages.length === 0) {
      toast({ title: "Content Missing", description: "Please type or upload your work.", variant: "destructive" })
      return
    }

    setIsAnalyzingEssay(true)
    try {
      if (uploadedImages.length > 0) await new Promise(r => setTimeout(r, 1500));

      const evaluation = await evaluateEssayFeedback({
        topic: "Journey Practice Session",
        question: result?.essayPrompts?.[currentIdx]?.prompt || "General Essay",
        essayText: essayText || "[Handwritten content scanned from images]",
        academicLevel: level,
      })

      if (evaluation.error) {
        toast({ title: "Analysis Failed", description: evaluation.error, variant: "destructive" })
      } else {
        setEssayResult(evaluation)
        playSuccessSound()
        confetti({ particleCount: 100, spread: 60, origin: { y: 0.8 } })
      }
    } catch (e) {
      toast({ title: "Error", description: "Professor is busy. Try again.", variant: "destructive" })
    } finally {
      setIsAnalyzingEssay(false)
    }
  }

  const startJourney = () => {
    if (result?.mcqs?.length) startMode('MCQ')
    else if (result?.flashcards?.length) startMode('Flashcard')
    else if (result?.essayPrompts?.length) startMode('Essay')
  }

  const startMode = (mode: 'MCQ' | 'Flashcard' | 'Essay') => {
    if (mode === 'Flashcard' && !completedModes.includes('Flashcard')) {
      setShowHonestyModal(true)
    } else {
      setActiveMode(mode)
      resetSessionStates()
    }
  }

  const confirmFlashcards = () => {
    setShowHonestyModal(false)
    setActiveMode('Flashcard')
    resetSessionStates()
    setMasteredCount(0)
    setReviewCount(0)
  }

  const resetSessionStates = () => {
    setCurrentIdx(0)
    setSelectedOption(null)
    setIsAnswerRevealed(false)
    setIsCardFlipped(false)
    setEssayResult(null)
    setEssayText("")
    setUploadedImages([])
  }

  const nextItem = (feedback?: 'mastered' | 'review') => {
    if (feedback === 'mastered') setMasteredCount(prev => prev + 1)
    if (feedback === 'review') setReviewCount(prev => prev + 1)

    const list = activeMode === 'MCQ' ? result?.mcqs : activeMode === 'Flashcard' ? result?.flashcards : result?.essayPrompts
    if (currentIdx < (list?.length || 0) - 1) {
      setCurrentIdx(prev => prev + 1)
      setSelectedOption(null)
      setIsAnswerRevealed(false)
      setIsCardFlipped(false)
      setEssayResult(null)
    } else {
      handleModeCompletion()
    }
  }

  if (isCelebration) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center space-y-8 animate-in zoom-in-95 duration-700">
        <div className="bg-primary/10 p-8 rounded-full">
           <PartyPopper className="h-20 w-20 text-primary animate-bounce" />
        </div>
        <div className="text-center space-y-2">
           <h2 className="text-3xl font-black font-headline text-slate-900 dark:text-white">Journey Created!</h2>
           <p className="text-slate-500 dark:text-slate-400 font-medium">Your AI-powered study session is ready.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full space-y-6 pb-28 animate-in fade-in duration-500">
      <AlertDialog open={showHonestyModal} onOpenChange={setShowHonestyModal}>
        <AlertDialogContent className="rounded-[32px] border-none shadow-2xl p-10 bg-white dark:bg-slate-900">
          <AlertDialogHeader className="text-center space-y-4">
            <div className="h-20 w-20 bg-amber-100 dark:bg-amber-900/20 rounded-[28px] flex items-center justify-center mx-auto">
              <Info className="h-10 w-10 text-amber-600" />
            </div>
            <AlertDialogTitle className="text-2xl font-black font-headline text-slate-900 dark:text-white">Dekho, sach bolna!</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-600 dark:text-slate-400 font-medium text-lg leading-relaxed">
              Jhoot bologe toh tumhara hi nuksan hoga. Main kisi ko batane wala nahi hoon, par khud se honesty rakhoge toh hi seekh paoge. Ready?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-8">
            <AlertDialogAction 
              onClick={confirmFlashcards}
              className="w-full h-16 rounded-2xl bg-primary text-white font-bold text-lg hover:bg-primary/90"
            >
              Haan, I'm Ready!
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="px-1 flex items-center justify-between">
        <div className="max-w-[70%]">
          <h1 className="text-2xl font-bold font-headline tracking-tight text-slate-900 dark:text-white truncate">Learning Journey</h1>
          <p className="text-xs text-muted-foreground mt-1">Refining academic growth with AI.</p>
        </div>
        {!result && !activeMode && (
          <div className="flex items-center gap-1">
            {[1, 2, 3].map((s) => (
              <div key={s} className={cn("h-1.5 w-4 rounded-full transition-all", wizardStep >= s ? "bg-primary" : "bg-slate-200")} />
            ))}
          </div>
        )}
      </div>

      {!result ? (
        <div className="space-y-6 overflow-y-auto no-scrollbar pb-10">
          {wizardStep === 1 && (
            <Card className="border-none shadow-xl rounded-[32px] bg-white dark:bg-slate-900 animate-in slide-in-from-right-4">
              <CardHeader className="p-8 pb-4">
                <CardTitle className="text-xl font-headline flex items-center gap-3">
                  <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0"><BookOpen className="h-5 w-5 text-primary" /></div>
                  Step 1: Ingest Content
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 pt-0 space-y-6">
                <Tabs value={inputType} onValueChange={setInputType}>
                  <TabsList className="grid w-full grid-cols-2 rounded-2xl bg-slate-100 dark:bg-slate-800 p-1 mb-6">
                    <TabsTrigger value="paste" className="rounded-xl text-xs font-bold">Paste Notes</TabsTrigger>
                    <TabsTrigger value="upload" className="rounded-xl text-xs font-bold">Upload PDF</TabsTrigger>
                  </TabsList>
                  <TabsContent value="paste">
                    <Textarea 
                      className="min-h-[220px] rounded-2xl bg-slate-50 dark:bg-slate-950 border-none p-5 text-sm dark:text-white"
                      placeholder="Paste your study materials here (min 30 chars)..."
                      value={material}
                      onChange={(e) => setMaterial(e.target.value)}
                    />
                  </TabsContent>
                  <TabsContent value="upload">
                    {!uploadedFile ? (
                      <div onClick={() => fileInputRef.current?.click()} className="h-[220px] border-2 border-dashed rounded-2xl flex flex-col items-center justify-center p-6 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <input type="file" className="hidden" ref={fileInputRef} onChange={(e) => { const file = e.target.files?.[0]; if (file) setUploadedFile(file); }} accept=".pdf" />
                        <FileUp className="h-7 w-7 text-primary mb-2" />
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest text-center">Select PDF Document</p>
                      </div>
                    ) : (
                      <div className="h-[220px] bg-slate-50 dark:bg-slate-950 rounded-2xl p-8 flex flex-col items-center justify-center space-y-4">
                        <div className="flex items-center gap-3 bg-white dark:bg-slate-900 p-4 rounded-xl w-full border overflow-hidden">
                          <FileIcon className="h-5 w-5 text-primary shrink-0" />
                          <span className="text-xs font-bold truncate dark:text-white">{uploadedFile.name}</span>
                        </div>
                        <Button onClick={handleExtractText} disabled={isExtracting} className="w-full rounded-2xl h-14 bg-slate-900 dark:bg-primary font-bold">
                          {isExtracting ? <Loader2 className="animate-spin h-5 w-5 mr-2" /> : <Sparkles className="h-5 w-5 mr-2 text-white" />}
                          {isExtracting ? "Extracting..." : "Scan PDF for Step 2"}
                        </Button>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
                {inputType === "paste" && (
                  <Button onClick={() => setWizardStep(2)} disabled={material.length < 30} className="w-full h-16 rounded-3xl bg-primary text-white font-bold shadow-xl">
                    Continue to Step 2 <ChevronRight className="ml-2 h-6 w-6" />
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {wizardStep === 2 && (
             <Card className="border-none shadow-xl rounded-[32px] bg-white dark:bg-slate-900 animate-in slide-in-from-right-4">
               <CardHeader className="p-8 pb-4"><CardTitle className="text-xl font-headline flex items-center gap-3"><div className="h-10 w-10 rounded-2xl bg-amber-100 flex items-center justify-center shrink-0"><GraduationCap className="h-5 w-5 text-amber-600" /></div>Step 2: Profile</CardTitle></CardHeader>
               <CardContent className="p-8 pt-0 space-y-6">
                 <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Select Your Level</label>
                   <Select value={level} onValueChange={setLevel}>
                     <SelectTrigger className="h-14 rounded-2xl bg-slate-50 dark:bg-slate-950 border-none font-bold dark:text-white"><SelectValue /></SelectTrigger>
                     <SelectContent className="rounded-2xl">{academicLevels.map(l => <SelectItem key={l} value={l} className="font-bold">{l}</SelectItem>)}</SelectContent>
                   </Select>
                 </div>
                 <Button onClick={() => setWizardStep(3)} className="w-full h-14 rounded-2xl bg-primary font-bold text-white shadow-lg">Continue <ChevronRight className="ml-2 h-5 w-5" /></Button>
               </CardContent>
             </Card>
          )}

          {wizardStep === 3 && (
            <Card className="border-none shadow-xl rounded-[32px] bg-white dark:bg-slate-900 animate-in slide-in-from-right-4">
               <CardHeader className="p-8 pb-4"><CardTitle className="text-xl font-headline flex items-center gap-3"><div className="h-10 w-10 rounded-2xl bg-emerald-100 flex items-center justify-center shrink-0"><BrainCircuit className="h-5 w-5 text-emerald-600" /></div>Step 3: Format</CardTitle></CardHeader>
               <CardContent className="p-8 pt-0 space-y-6">
                 <div className="grid grid-cols-1 gap-3">
                   {[{id:"Mixed", label:"Mixed Journey", icon:Sparkles}, {id:"MCQ", label:"Knowledge Checks", icon:ListChecks}, {id:"Flashcard", label:"Active Recall", icon:RotateCw}, {id:"Essay", label:"Writing Skills", icon:ClipboardList}].map(item => (
                     <div key={item.id} onClick={() => setQuestionType(item.id)} className={cn("p-5 rounded-2xl border-2 cursor-pointer flex items-center gap-4 transition-all", questionType === item.id ? "border-primary bg-primary/5" : "border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800")}>
                       <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center shrink-0", questionType === item.id ? "bg-primary text-white" : "bg-slate-100 dark:bg-slate-800")}><item.icon className={cn("h-5 w-5", questionType === item.id ? "text-white" : "text-slate-500")} /></div>
                       <span className={cn("font-bold text-sm", questionType === item.id ? "text-primary" : "text-slate-600 dark:text-slate-300")}>{item.label}</span>
                     </div>
                   ))}
                 </div>
                 <Button onClick={handleGenerate} disabled={isLoading} className="w-full h-16 rounded-3xl bg-slate-900 dark:bg-primary text-white font-black text-lg shadow-xl">
                   {isLoading ? <Loader2 className="h-6 w-6 animate-spin mr-3" /> : <Sparkles className="h-6 w-6 mr-3 text-white" />}
                   Start Journey
                 </Button>
               </CardContent>
            </Card>
          )}
        </div>
      ) : activeMode ? (
        <div className="flex flex-col h-full max-w-lg mx-auto space-y-6 relative">
          <div className="flex items-center justify-between px-2">
            <Button variant="ghost" size="sm" onClick={() => setActiveMode(null)} className="font-bold text-slate-400 hover:text-primary">Exit Session</Button>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Item {currentIdx + 1} of {(activeMode === 'MCQ' ? result?.mcqs : activeMode === 'Flashcard' ? result?.flashcards : result?.essayPrompts)?.length || 0}</span>
          </div>

          <div className="flex-1 flex flex-col px-1 overflow-hidden">
            {activeMode === 'MCQ' && result?.mcqs && (
              <Card className="border-none shadow-2xl rounded-[40px] bg-white dark:bg-slate-900 p-8 flex flex-col space-y-6 animate-in slide-in-from-bottom-4 h-full">
                <div className="overflow-y-auto pr-2 no-scrollbar flex-1 space-y-6">
                  <h2 className="text-xl font-black font-headline text-slate-900 dark:text-white leading-tight">{result.mcqs[currentIdx]?.question}</h2>
                  <div className="space-y-3">
                    {result.mcqs[currentIdx]?.options?.map((opt, i) => (
                      <Button key={i} variant="outline" onClick={() => {
                        if (isAnswerRevealed) return;
                        setSelectedOption(opt);
                        setIsAnswerRevealed(true);
                      }} disabled={isAnswerRevealed} className={cn("h-auto min-h-[56px] justify-start px-5 rounded-2xl border-2 text-left font-medium w-full transition-all whitespace-normal", isAnswerRevealed ? (opt === result.mcqs![currentIdx].correctAnswer ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-400 text-emerald-700 dark:text-emerald-400" : "opacity-40") : "bg-slate-50 dark:bg-slate-950 border-slate-100 dark:border-slate-800 dark:text-white hover:border-primary")}>
                         {opt}
                      </Button>
                    ))}
                  </div>
                  {isAnswerRevealed && (
                    <div className="pt-4 animate-in slide-in-from-top-4">
                      <div className="p-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-xl mb-4 text-xs text-emerald-700 dark:text-emerald-400 font-medium leading-relaxed">{result.mcqs[currentIdx]?.explanation}</div>
                    </div>
                  )}
                </div>
                {isAnswerRevealed && (
                   <Button onClick={() => nextItem()} className="w-full h-14 rounded-2xl bg-slate-900 dark:bg-primary text-white font-bold shrink-0">Next Insight</Button>
                )}
              </Card>
            )}

            {activeMode === 'Flashcard' && result?.flashcards && (
              <div className="flex-1 flex flex-col space-y-6 overflow-hidden">
                <div className="grid grid-cols-2 gap-3 px-4 shrink-0">
                  <div className="bg-emerald-50 dark:bg-emerald-900/10 p-3 rounded-2xl border border-emerald-100 dark:border-emerald-800 flex items-center gap-3">
                    <Award className="h-5 w-5 text-emerald-600 shrink-0" />
                    <div><p className="text-[7px] font-black uppercase text-emerald-600 tracking-widest">Mastered</p><p className="text-lg font-black text-emerald-700 dark:text-emerald-400">{masteredCount}</p></div>
                  </div>
                  <div className="bg-amber-50 dark:bg-amber-900/10 p-3 rounded-2xl border border-amber-100 dark:border-amber-800 flex items-center gap-3">
                    <BookMarked className="h-5 w-5 text-amber-600 shrink-0" />
                    <div><p className="text-[7px] font-black uppercase text-amber-600 tracking-widest">To Review</p><p className="text-lg font-black text-amber-700 dark:text-amber-400">{reviewCount}</p></div>
                  </div>
                </div>

                <div className="flex-1 perspective-1000 relative">
                  <div 
                    onClick={() => setIsCardFlipped(!isCardFlipped)}
                    className={cn(
                      "relative w-full h-[400px] cursor-pointer preserve-3d transition-transform duration-700 ease-in-out",
                      isCardFlipped ? "rotate-y-180" : ""
                    )}
                  >
                    <Card className="absolute inset-0 backface-hidden rounded-[40px] bg-white dark:bg-slate-900 border-none shadow-2xl flex flex-col items-center justify-center p-8 text-center overflow-hidden">
                      <Badge className="bg-primary/10 text-primary border-none mb-4 shrink-0">QUESTION</Badge>
                      <div className="flex-1 flex items-center justify-center overflow-y-auto w-full no-scrollbar">
                        <h3 className="text-xl font-black font-headline text-slate-900 dark:text-white leading-snug px-2">{result.flashcards[currentIdx]?.front}</h3>
                      </div>
                      <div className="mt-4 animate-bounce shrink-0"><RotateCw className="h-5 w-5 text-slate-300" /></div>
                      <p className="text-[8px] font-black uppercase tracking-widest text-slate-300 mt-2">Tap to see answer</p>
                    </Card>
                    <Card className="absolute inset-0 backface-hidden rotate-y-180 rounded-[40px] bg-primary text-white border-none shadow-2xl flex flex-col items-center justify-center p-8 text-center overflow-hidden">
                      <Badge className="bg-white/20 text-white border-none mb-4 shrink-0">ANSWER</Badge>
                      <div className="flex-1 flex items-center justify-center overflow-y-auto w-full no-scrollbar text-sm font-bold leading-relaxed px-2">
                        {result.flashcards[currentIdx]?.back}
                      </div>
                      <p className="text-[8px] font-black uppercase tracking-widest text-white/40 mt-4">Tap to flip back</p>
                    </Card>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pb-6 shrink-0">
                  <Button onClick={(e) => { e.stopPropagation(); nextItem('review'); }} variant="outline" className="h-14 rounded-2xl border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/10 text-amber-700 dark:text-amber-400 font-black text-[10px]">STILL LEARNING</Button>
                  <Button onClick={(e) => { e.stopPropagation(); nextItem('mastered'); }} className="h-14 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-[10px]">I KNOW IT</Button>
                </div>
              </div>
            )}

            {activeMode === 'Essay' && result?.essayPrompts && (
              <div className="flex-1 flex flex-col space-y-6 overflow-hidden">
                <Card className="border-none shadow-2xl rounded-[40px] bg-white dark:bg-slate-900 p-8 flex flex-col space-y-6 animate-in slide-in-from-bottom-4 flex-1 overflow-hidden">
                  <div className="flex-1 overflow-y-auto no-scrollbar space-y-6 pr-1">
                    <Badge className="bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 border-none w-fit font-black text-[10px]">PROFESSOR'S CHALLENGE</Badge>
                    <h2 className="text-xl font-black font-headline text-slate-900 dark:text-white leading-tight">{result.essayPrompts[currentIdx]?.prompt}</h2>
                    
                    {!essayResult ? (
                      <div className="space-y-6">
                        <div onClick={() => essayImageInputRef.current?.click()} className="h-28 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center p-4 cursor-pointer hover:bg-slate-50 dark:bg-slate-950 transition-colors">
                          <input type="file" className="hidden" ref={essayImageInputRef} onChange={(e) => { const files = Array.from(e.target.files || []); setUploadedImages(prev => [...prev, ...files].slice(0, 5)); }} accept="image/*" multiple />
                          <PlusCircle className="h-6 w-6 text-primary mb-2" />
                          <p className="text-[10px] font-bold text-slate-500 uppercase">Upload Handwritten Photos (Max 5)</p>
                        </div>
                        {uploadedImages.length > 0 && (
                          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                            {uploadedImages.map((file, idx) => (
                              <div key={idx} className="relative aspect-square w-12 h-12 rounded-xl overflow-hidden border shrink-0">
                                <img src={URL.createObjectURL(file)} className="w-full h-full object-cover" />
                                <button onClick={() => setUploadedImages(prev => prev.filter((_, i) => i !== idx))} className="absolute top-0.5 right-0.5 bg-destructive h-4 w-4 rounded-full flex items-center justify-center text-white"><X className="h-2 w-2" /></button>
                              </div>
                            ))}
                          </div>
                        )}
                        <Textarea placeholder="OR type your answer here..." className="min-h-[120px] rounded-2xl p-4 bg-slate-50 dark:bg-slate-950 border-none dark:text-white text-xs" value={essayText} onChange={(e) => setEssayText(e.target.value)} />
                        <Button onClick={handleEssayAnalysis} disabled={isAnalyzingEssay} className="w-full h-14 rounded-2xl bg-slate-900 dark:bg-primary font-bold">
                          {isAnalyzingEssay ? <Loader2 className="animate-spin h-5 w-5 mr-2" /> : <SendHorizontal className="h-5 w-5 mr-2" />}
                          {isAnalyzingEssay ? "Analyzing Handwriting..." : "Submit to Professor"}
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                        <div className="text-center p-6 bg-slate-50 dark:bg-slate-950 rounded-[32px] border">
                           <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Grade</p>
                           <h3 className="text-5xl font-black text-slate-900 dark:text-white">{essayResult.score}<span className="text-lg text-slate-400">/10</span></h3>
                        </div>
                        <Accordion type="single" collapsible className="w-full space-y-3">
                          <AccordionItem value="feedback" className="border-none">
                            <AccordionTrigger className="h-12 bg-slate-50 dark:bg-slate-950 px-5 rounded-2xl hover:no-underline font-bold text-xs">Professor's Feedback</AccordionTrigger>
                            <AccordionContent className="pt-4 space-y-4">
                               {[{t:"Intro", c:essayResult.feedbackBySection?.introduction, cl:"text-blue-500"}, {t:"Body", c:essayResult.feedbackBySection?.mainBody, cl:"text-primary"}, {t:"Grammar", c:essayResult.feedbackBySection?.grammarAndVocabulary, cl:"text-amber-500"}].map((s,i) => (
                                 <div key={i} className="p-4 bg-white dark:bg-slate-900 border rounded-2xl">
                                   <p className={cn("text-[8px] font-black uppercase mb-1", s.cl)}>{s.t}</p>
                                   <p className="text-[10px] font-medium text-slate-600 dark:text-slate-300 leading-relaxed">{s.c}</p>
                                 </div>
                               ))}
                            </AccordionContent>
                          </AccordionItem>
                          <AccordionItem value="rewrite" className="border-none">
                            <AccordionTrigger className="h-12 bg-slate-900 text-white px-5 rounded-2xl hover:no-underline font-bold text-xs">The Mentor's Masterclass</AccordionTrigger>
                            <AccordionContent className="pt-4">
                              <div className="bg-slate-900 text-white p-5 rounded-3xl space-y-3">
                                <p className="text-[9px] font-bold text-primary uppercase">Elite Rewrite:</p>
                                <div className="max-h-[200px] overflow-y-auto pr-1 no-scrollbar text-[10px] italic leading-relaxed text-slate-200">
                                  {essayResult.suggestedRewrite}
                                </div>
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                        <Button onClick={() => nextItem()} className="w-full h-14 rounded-2xl bg-primary text-white font-bold">Finish Practice</Button>
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto no-scrollbar space-y-6 px-1">
          <Card className="border-none shadow-xl rounded-[40px] bg-white dark:bg-slate-900 p-8 text-center space-y-6 animate-in zoom-in-95">
            <div className="bg-primary/10 h-16 w-16 rounded-2xl flex items-center justify-center mx-auto"><Sparkles className="h-8 w-8 text-primary" /></div>
            <div>
              <h2 className="text-2xl font-black font-headline text-slate-900 dark:text-white">Journey Ready</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Profile: {level}</p>
            </div>
            
            <div className="grid grid-cols-1 gap-3">
              {[
                { id: 'MCQ', icon: ListChecks, label: 'Knowledge Checks', list: result?.mcqs },
                { id: 'Flashcard', icon: RotateCw, label: 'Mastery Cards', list: result?.flashcards, color: 'text-amber-500' },
                { id: 'Essay', icon: ClipboardList, label: 'Writing Prompts', list: result?.essayPrompts, color: 'text-emerald-500' }
              ].map((m) => m.list?.length ? (
                <div key={m.id} className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border dark:border-slate-800">
                  <m.icon className={cn("h-5 w-5 shrink-0", m.color || "text-primary")} />
                  <div className="flex-1 text-left">
                    <p className="text-xs font-black dark:text-white">{m.list.length} {m.label}</p>
                  </div>
                  {completedModes.includes(m.id) ? (
                    <div className="flex items-center gap-1.5 bg-emerald-100 dark:bg-emerald-900/20 px-3 py-1.5 rounded-xl">
                      <Check className="h-3 w-3 text-emerald-600" />
                      <span className="text-[10px] font-black text-emerald-600">DONE</span>
                    </div>
                  ) : null}
                </div>
              ) : null)}
            </div>

            <Button onClick={startJourney} className="w-full h-18 rounded-3xl bg-slate-900 dark:bg-primary text-white font-black text-lg shadow-xl">
              {completedModes.length > 0 ? "Continue Journey" : "Start Your Journey"}
              <ChevronRight className="ml-2 h-6 w-6" />
            </Button>
            
            <Button variant="ghost" onClick={() => { setResult(null); setCompletedModes([]); }} className="text-[10px] font-black uppercase tracking-widest text-slate-400">Build New Journey</Button>
          </Card>
        </div>
      )}
    </div>
  )
}
