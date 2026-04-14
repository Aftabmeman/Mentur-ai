
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
  ChevronLeft,
  BookOpen,
  ArrowRight,
  PartyPopper
} from "lucide-react"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { generateStudyAssessments, type GenerateStudyAssessmentsOutput } from "@/ai/flows/generate-study-assessments-flow"
import { extractTextFromPDF } from "@/app/actions/pdf-parser"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import confetti from 'canvas-confetti'

/**
 * Configure max duration for the AI generation flow in the page segment
 */
export const maxDuration = 30;

export default function AssessmentsPage() {
  const [wizardStep, setWizardStep] = useState(1)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isCelebration, setIsCelebration] = useState(false)

  const [material, setMaterial] = useState("")
  const [level, setLevel] = useState<any>("UG Year 1")
  const [difficulty, setDifficulty] = useState<string>("Medium")
  const [questionType, setQuestionType] = useState<string>("Mixed")
  
  // Quantities
  const [mcqCount, setMcqCount] = useState(5)
  const [essayCount, setEssayCount] = useState(2)
  const [flashcardCount, setFlashcardCount] = useState(5)

  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<GenerateStudyAssessmentsOutput | null>(null)
  
  const [isQuizMode, setIsQuizMode] = useState(false)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false)
  const [quizScore, setQuizScore] = useState(0)

  const [inputType, setInputType] = useState<string>("paste")
  const [isExtracting, setIsExtracting] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) setUploadedFile(file)
  }

  const handleExtractText = async () => {
    if (!uploadedFile) return
    setIsExtracting(true)
    
    try {
      const formData = new FormData()
      formData.append('file', uploadedFile)
      
      const response = await extractTextFromPDF(formData)
      
      if (response.error) {
        toast({ title: "Extraction Failed", description: response.error, variant: "destructive" })
      } else if (response.text) {
        setMaterial(response.text)
        toast({ title: "Resource Ingested", description: `Successfully extracted ${response.text.length} characters.` })
        setWizardStep(2)
      }
    } catch (e) {
      toast({ title: "Error", description: "Failed to process PDF.", variant: "destructive" })
    } finally {
      setIsExtracting(false)
    }
  }

  const handleNextToStep2 = () => {
    if (!material.trim() && !uploadedFile) {
      toast({ title: "Step 1 Required", description: "Please upload or paste your study material.", variant: "destructive" })
      return
    }
    if (material.trim().length > 0 && material.trim().length < 500) {
      toast({ title: "Content Too Short", description: "Please provide more study material (min 500 characters) for accurate generation.", variant: "destructive" })
      return
    }
    setIsAnalyzing(true)
    setTimeout(() => {
      setIsAnalyzing(false)
      setWizardStep(2)
    }, 1200)
  }

  const handleGenerate = async () => {
    setIsLoading(true)
    try {
      const assessments = await generateStudyAssessments({
        studyMaterial: material,
        assessmentTypes: questionType === "Mixed" ? ["MCQ", "Essay"] : [questionType as any],
        academicLevel: level,
        difficulty: difficulty as any,
        mcqCount: (questionType === "MCQ" || questionType === "Mixed") ? mcqCount : 0,
        essayCount: (questionType === "Essay" || questionType === "Mixed") ? essayCount : 0,
        flashcardCount: questionType === "Flashcard" ? flashcardCount : 0,
      })
      
      if (assessments.error) {
        toast({ title: "Journey Failed", description: assessments.error, variant: "destructive" });
      } else {
        setIsCelebration(true)
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#9333ea', '#4f46e5', '#3b82f6']
        })
        
        try {
          const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3')
          audio.volume = 0.3
          audio.play()
        } catch (e) {}

        setTimeout(() => {
          setResult(assessments)
          setIsCelebration(false)
        }, 1500)
      }
    } catch (error: any) {
      toast({ title: "System Error", description: "Generation failed. Please try again.", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  const startQuiz = () => {
    if (!result?.mcqs?.length) return
    setIsQuizMode(true)
    setCurrentQuestionIndex(0)
    setSelectedOption(null)
    setIsAnswerRevealed(false)
    setQuizScore(0)
  }

  const handleOptionSelect = (option: string) => {
    if (isAnswerRevealed) return
    setSelectedOption(option)
    setIsAnswerRevealed(true)
    if (option === result?.mcqs?.[currentQuestionIndex].correctAnswer) {
      setQuizScore(prev => prev + 1)
    }
  }

  const nextQuestion = () => {
    if (currentQuestionIndex < (result?.mcqs?.length || 0) - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
      setSelectedOption(null)
      setIsAnswerRevealed(false)
    } else {
      setIsQuizMode(false)
      toast({ title: "Quiz Complete", description: `You scored ${quizScore}/${result?.mcqs?.length}` })
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
           <p className="text-slate-500 font-medium">Your AI-powered study session is ready.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full space-y-6 pb-28 animate-in fade-in duration-500">
      <div className="px-1 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-headline tracking-tight text-slate-900 dark:text-white">Learning Journey</h1>
          <p className="text-sm text-muted-foreground mt-1">Refining academic growth with AI.</p>
        </div>
        {!result && !isQuizMode && (
          <div className="flex items-center gap-1">
            {[1, 2, 3].map((s) => (
              <div key={s} className={cn("h-1.5 w-6 rounded-full transition-all", wizardStep >= s ? "bg-primary" : "bg-slate-200")} />
            ))}
          </div>
        )}
      </div>

      {!result ? (
        <div className="space-y-6 overflow-y-auto no-scrollbar pb-10">
          {/* Step 1: Resource */}
          {wizardStep === 1 && (
            <Card className="border-none shadow-xl rounded-[32px] overflow-hidden bg-white dark:bg-slate-900 animate-in slide-in-from-right-4 duration-500">
              <CardHeader className="p-8 pb-4">
                <CardTitle className="text-xl font-headline flex items-center gap-3">
                  <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <BookOpen className="h-5 w-5 text-primary" />
                  </div>
                  Step 1: Ingest Content
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 pt-0 space-y-6">
                <Tabs value={inputType} onValueChange={setInputType} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 rounded-2xl bg-slate-100 dark:bg-slate-800 p-1 mb-6 h-12">
                    <TabsTrigger value="paste" className="rounded-xl text-xs font-bold data-[state=active]:bg-white">Paste Notes</TabsTrigger>
                    <TabsTrigger value="upload" className="rounded-xl text-xs font-bold data-[state=active]:bg-white">Upload File</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="paste">
                    <Textarea 
                      className="min-h-[220px] rounded-2xl dark:bg-slate-950 dark:border-slate-800 text-sm p-5 resize-none leading-relaxed border-none bg-slate-50"
                      placeholder="Paste your study materials, articles, or notes here for AI to process (min 500 chars)..."
                      value={material}
                      onChange={(e) => setMaterial(e.target.value)}
                    />
                  </TabsContent>

                  <TabsContent value="upload">
                    {!uploadedFile ? (
                      <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="h-[220px] border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col items-center justify-center p-6 text-center cursor-pointer hover:bg-slate-50 transition-colors bg-slate-50/50"
                      >
                        <input type="file" className="hidden" ref={fileInputRef} onChange={handleFileChange} accept=".pdf" />
                        <div className="bg-primary/10 p-5 rounded-full mb-4">
                          <FileUp className="h-7 w-7 text-primary" />
                        </div>
                        <p className="text-[10px] font-black text-slate-400 dark:text-slate-300 uppercase tracking-widest">Select PDF Document</p>
                      </div>
                    ) : (
                      <div className="h-[220px] bg-slate-50 dark:bg-slate-900 rounded-2xl p-8 flex flex-col items-center justify-center space-y-6">
                        <div className="flex items-center gap-4 bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 w-full shadow-sm">
                          <FileIcon className="h-6 w-6 text-primary shrink-0" />
                          <span className="text-xs font-bold truncate flex-1">{uploadedFile.name}</span>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400" onClick={() => setUploadedFile(null)}>
                            <X className="h-5 w-5" />
                          </Button>
                        </div>
                        <Button onClick={handleExtractText} disabled={isExtracting} className="w-full rounded-2xl bg-slate-900 dark:bg-primary font-bold h-14 text-sm shadow-xl shadow-primary/20">
                          {isExtracting ? <Loader2 className="animate-spin h-5 w-5 mr-2" /> : <Sparkles className="h-5 w-5 mr-2" />}
                          {isExtracting ? "Extracting Text..." : "Read PDF for Step 2"}
                        </Button>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>

                {inputType === "paste" && (
                  <Button 
                    onClick={handleNextToStep2} 
                    disabled={isAnalyzing} 
                    className="w-full h-16 rounded-3xl bg-primary text-white font-bold text-lg shadow-2xl shadow-primary/20"
                  >
                    {isAnalyzing ? <Loader2 className="h-6 w-6 animate-spin mr-3" /> : null}
                    {isAnalyzing ? "Analyzing..." : "Continue to Step 2"}
                    {!isAnalyzing && <ChevronRight className="ml-2 h-6 w-6" />}
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {/* Step 2: Academic Profile */}
          {wizardStep === 2 && (
            <Card className="border-none shadow-xl rounded-[32px] bg-white dark:bg-slate-900 animate-in slide-in-from-right-4 duration-500">
              <CardHeader className="p-8 pb-4">
                <CardTitle className="text-xl font-headline flex items-center gap-3">
                  <div className="h-10 w-10 rounded-2xl bg-amber-100 flex items-center justify-center">
                    <GraduationCap className="h-5 w-5 text-amber-600" />
                  </div>
                  Step 2: Educational Context
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 pt-0 space-y-8">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">Current Class / Level</label>
                    <Select value={level} onValueChange={setLevel}>
                      <SelectTrigger className="h-14 rounded-2xl bg-slate-50 dark:bg-slate-950 border-none text-sm font-bold">
                        <SelectValue placeholder="Which class do you study?" />
                      </SelectTrigger>
                      <SelectContent>
                        {['Class 8th', 'Class 9th', 'Class 10th', 'Class 11th', 'Class 12th', 'UG Year 1', 'UG Year 2', 'UG Year 3', 'Competitive (UPSC)', 'Competitive (JEE)', 'Competitive (NEET)', 'Competitive (Others)'].map((lvl) => (
                          <SelectItem key={lvl} value={lvl} className="font-bold">{lvl}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">Research Intensity</label>
                    <Select value={difficulty} onValueChange={setDifficulty}>
                      <SelectTrigger className="h-14 rounded-2xl bg-slate-50 dark:bg-slate-950 border-none text-sm font-bold">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Easy" className="font-bold text-emerald-600">Foundation (Direct)</SelectItem>
                        <SelectItem value="Medium" className="font-bold text-primary">Standard (Balanced)</SelectItem>
                        <SelectItem value="Hard" className="font-bold text-destructive">Advanced (Critical)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button variant="ghost" onClick={() => setWizardStep(1)} className="h-14 w-14 rounded-2xl bg-slate-50 dark:bg-slate-800">
                    <ChevronLeft className="h-6 w-6" />
                  </Button>
                  <Button 
                    onClick={() => setWizardStep(3)} 
                    className="flex-1 h-14 rounded-2xl bg-slate-900 dark:bg-primary text-white font-bold"
                  >
                    Set Intensity & Profile
                    <ChevronRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Format */}
          {wizardStep === 3 && (
            <Card className="border-none shadow-xl rounded-[32px] bg-white dark:bg-slate-900 animate-in slide-in-from-right-4 duration-500">
              <CardHeader className="p-8 pb-4">
                <CardTitle className="text-xl font-headline flex items-center gap-3">
                  <div className="h-10 w-10 rounded-2xl bg-emerald-100 flex items-center justify-center">
                    <BrainCircuit className="h-5 w-5 text-emerald-600" />
                  </div>
                  Step 3: Intelligence Format
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 pt-0 space-y-8">
                <div className="grid grid-cols-1 gap-3">
                  {[
                    { id: "Mixed", label: "Mixed Journey", sub: "MCQs + Essays", icon: Sparkles },
                    { id: "MCQ", label: "Knowledge Checks", sub: "MCQs Only", icon: ListChecks },
                    { id: "Flashcard", label: "Active Recall", sub: "Flashcards", icon: RotateCw },
                    { id: "Essay", label: "Critical Writing", sub: "Essay Prompts", icon: ClipboardList }
                  ].map((item) => (
                    <div 
                      key={item.id} 
                      onClick={() => setQuestionType(item.id)}
                      className={cn(
                        "p-5 rounded-2xl border-2 transition-all cursor-pointer flex items-center gap-4",
                        questionType === item.id ? "border-primary bg-primary/5 shadow-inner" : "border-slate-100 dark:border-slate-800 hover:bg-slate-50"
                      )}
                    >
                      <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center", questionType === item.id ? "bg-primary text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-400")}>
                        <item.icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold dark:text-white">{item.label}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{item.sub}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-3 gap-3 animate-in slide-in-from-top-2">
                  {(questionType === "Mixed" || questionType === "MCQ") && (
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">MCQ Qty</label>
                      <Input type="number" value={mcqCount} onChange={(e) => setMcqCount(Number(e.target.value))} className="h-12 rounded-xl text-center font-bold bg-slate-50 border-none" />
                    </div>
                  )}
                  {(questionType === "Mixed" || questionType === "Essay") && (
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Essay Qty</label>
                      <Input type="number" value={essayCount} onChange={(e) => setEssayCount(Number(e.target.value))} className="h-12 rounded-xl text-center font-bold bg-slate-50 border-none" />
                    </div>
                  )}
                  {(questionType === "Flashcard") && (
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Flash Qty</label>
                      <Input type="number" value={flashcardCount} onChange={(e) => setFlashcardCount(Number(e.target.value))} className="h-12 rounded-xl text-center font-bold bg-slate-50 border-none" />
                    </div>
                  )}
                </div>

                <div className="flex gap-4">
                  <Button variant="ghost" onClick={() => setWizardStep(2)} className="h-14 w-14 rounded-2xl bg-slate-50 dark:bg-slate-800">
                    <ChevronLeft className="h-6 w-6" />
                  </Button>
                  <Button 
                    onClick={handleGenerate} 
                    disabled={isLoading} 
                    className="flex-1 h-16 rounded-3xl bg-primary text-white font-black text-lg shadow-2xl shadow-primary/30"
                  >
                    {isLoading ? <Loader2 className="h-6 w-6 animate-spin mr-3" /> : <Sparkles className="h-6 w-6 mr-3" />}
                    {isLoading ? "Consulting AI..." : "Start Journey"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      ) : isQuizMode ? (
        <div className="flex flex-col h-full max-w-lg mx-auto space-y-6">
          <div className="flex items-center justify-between px-1">
            <Button variant="ghost" size="sm" onClick={() => setIsQuizMode(false)} className="text-slate-500 text-xs font-bold">Exit Mode</Button>
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Question {currentQuestionIndex + 1} of {result.mcqs?.length}</span>
              <div className="w-24 h-1.5 bg-slate-100 rounded-full mt-1 overflow-hidden">
                <div className="h-full bg-primary" style={{ width: `${((currentQuestionIndex + 1) / (result.mcqs?.length || 1)) * 100}%` }} />
              </div>
            </div>
          </div>

          <Card className="border-none shadow-2xl rounded-[40px] overflow-hidden bg-white dark:bg-slate-900 flex-1 flex flex-col">
            <div className="p-10 pb-4 flex-1 overflow-y-auto no-scrollbar">
              <h2 className="text-2xl font-black font-headline leading-tight dark:text-white">
                {result.mcqs?.[currentQuestionIndex].question}
              </h2>
              <div className="mt-10 space-y-4">
                {result.mcqs?.[currentQuestionIndex].options.map((option, idx) => {
                  const isCorrect = option === result.mcqs?.[currentQuestionIndex].correctAnswer
                  const isSelected = selectedOption === option
                  let style = "bg-slate-50 border-slate-100 text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                  if (isAnswerRevealed) {
                    if (isCorrect) style = "bg-emerald-50 border-emerald-400 text-emerald-700 dark:bg-emerald-900/20 dark:border-emerald-500 dark:text-emerald-400"
                    else if (isSelected) style = "bg-destructive/5 border-destructive/40 text-destructive"
                    else style = "opacity-40"
                  }
                  return (
                    <Button 
                      key={idx} 
                      variant="outline" 
                      onClick={() => handleOptionSelect(option)}
                      disabled={isAnswerRevealed}
                      className={cn("h-auto min-h-[72px] justify-start px-6 rounded-[24px] border-2 transition-all text-sm text-left py-4", style)}
                    >
                      <div className="flex items-center gap-5">
                        <span className="h-8 w-8 rounded-full border border-slate-200 flex items-center justify-center text-xs font-black shrink-0 bg-white dark:bg-slate-950">
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span className="leading-snug font-medium">{option}</span>
                      </div>
                    </Button>
                  )
                })}
              </div>
            </div>
            {isAnswerRevealed && (
              <div className="p-8 bg-slate-50 dark:bg-slate-800/50 border-t">
                <div className="mb-6 p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100">
                   <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Explanation</p>
                   <p className="text-xs text-slate-600 leading-relaxed font-medium">{result.mcqs?.[currentQuestionIndex].explanation}</p>
                </div>
                <Button onClick={nextQuestion} className="w-full h-16 rounded-[24px] bg-slate-900 dark:bg-primary text-white font-black text-lg">
                  Next Insight <ChevronRight className="ml-2 h-6 w-6" />
                </Button>
              </div>
            )}
          </Card>
        </div>
      ) : (
        <div className="flex-1 flex flex-col overflow-y-auto no-scrollbar space-y-6">
          <Card className="border-none shadow-xl rounded-[40px] bg-white dark:bg-slate-900 p-10 text-center space-y-8 animate-in zoom-in-95 duration-700">
            <div className="bg-primary/10 h-20 w-20 rounded-[28px] flex items-center justify-center mx-auto rotate-3 group hover:rotate-0 transition-transform">
              <Sparkles className="h-10 w-10 text-primary" />
            </div>
            <div>
              <h2 className="text-3xl font-black font-headline dark:text-white tracking-tight">AI Success Injected</h2>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-2">Customized Assessment for {level}.</p>
            </div>
            
            <div className="grid grid-cols-1 gap-4 text-left">
              {result.mcqs?.length ? (
                <div className="flex items-center gap-4 p-5 bg-slate-50 dark:bg-slate-800 rounded-3xl border border-slate-100">
                  <div className="h-12 w-12 rounded-2xl bg-white shadow-sm flex items-center justify-center shrink-0">
                     <ListChecks className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-black dark:text-white">{result.mcqs.length} Knowledge Checks</p>
                    <p className="text-xs text-slate-400 font-medium">Adaptive MCQs for your level.</p>
                  </div>
                  <Button size="sm" onClick={startQuiz} className="rounded-xl h-10 px-5 bg-slate-900 dark:bg-primary text-xs font-black">START</Button>
                </div>
              ) : null}
              {result.essayPrompts?.length ? (
                <div className="flex items-center gap-4 p-5 bg-slate-50 dark:bg-slate-800 rounded-3xl border border-slate-100">
                  <div className="h-12 w-12 rounded-2xl bg-white shadow-sm flex items-center justify-center shrink-0">
                     <ClipboardList className="h-6 w-6 text-emerald-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-black dark:text-white">{result.essayPrompts.length} Writing Challenges</p>
                    <p className="text-xs text-slate-400 font-medium">Critical analysis prompts.</p>
                  </div>
                </div>
              ) : null}
              {result.flashcards?.length ? (
                <div className="flex items-center gap-4 p-5 bg-slate-50 dark:bg-slate-800 rounded-3xl border border-slate-100">
                  <div className="h-12 w-12 rounded-2xl bg-white shadow-sm flex items-center justify-center shrink-0">
                     <RotateCw className="h-6 w-6 text-amber-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-black dark:text-white">{result.flashcards.length} Mastery Cards</p>
                    <p className="text-xs text-slate-400 font-medium">Active recall practice.</p>
                  </div>
                </div>
              ) : null}
            </div>

            <Button onClick={() => {setResult(null); setWizardStep(1)}} variant="ghost" className="h-14 rounded-2xl text-slate-400 text-xs font-black uppercase tracking-widest hover:text-primary transition-colors">
              Reset & Build New Journey
            </Button>
          </Card>
          
          {result.essayPrompts && result.essayPrompts.length > 0 && (
            <div className="space-y-4 pb-10">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 px-4 flex items-center gap-3">
                <GraduationCap className="h-4 w-4" /> Recommended Practice
              </h3>
              {result.essayPrompts.map((prompt, i) => (
                <Card key={i} className="border-none shadow-sm rounded-[32px] bg-white dark:bg-slate-900 p-8 space-y-6">
                  <Badge className="bg-primary/10 text-primary border-none font-black text-[10px] uppercase tracking-widest px-4 py-1.5">Prompt {i+1}</Badge>
                  <p className="text-lg font-bold leading-tight dark:text-white">{prompt.prompt}</p>
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-3xl space-y-4">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Structural Insights for {level}:</p>
                    <ul className="space-y-3">
                      {prompt.modelAnswerOutline?.map((point, idx) => (
                        <li key={idx} className="flex gap-3 text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                          <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2 shrink-0" />
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
