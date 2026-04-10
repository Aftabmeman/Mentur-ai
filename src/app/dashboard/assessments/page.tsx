
"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  BrainCircuit, 
  Settings2, 
  Zap, 
  CheckCircle2, 
  HelpCircle,
  Upload,
  FileText,
  FileImage,
  FileStack,
  X,
  Loader2,
  FileIcon,
  ChevronRight,
  ChevronLeft,
  Info,
  Type,
  RotateCw,
  Trophy,
  BookOpen,
  EyeOff,
  Sparkles,
  MessageSquare,
  ClipboardCheck,
  TrendingUp,
  AlertCircle,
  Cpu
} from "lucide-react"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { generateStudyAssessments, type GenerateStudyAssessmentsOutput } from "@/ai/flows/generate-study-assessments-flow"
import { evaluateEssayFeedback, type EvaluateEssayFeedbackOutput } from "@/ai/flows/evaluate-essay-feedback"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { useUser, useFirestore } from "@/firebase"
import { collection, addDoc, doc, setDoc } from "firebase/firestore"

export default function AssessmentsPage() {
  const { user } = useUser()
  const db = useFirestore()
  const [material, setMaterial] = useState("")
  const [level, setLevel] = useState("Undergraduate Year 1")
  const [difficulty, setDifficulty] = useState<string>("Medium")
  const [questionType, setQuestionType] = useState<string>("Mixed")
  const [count, setCount] = useState(15)
  const [essayWordLimit, setEssayWordLimit] = useState("300")
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<GenerateStudyAssessmentsOutput | null>(null)
  
  // Mixed Mode & Journey States
  const [mixedStep, setMixedStep] = useState<'quiz' | 'essay' | 'mentorship' | null>(null)
  const [userEssayContent, setUserEssayContent] = useState("")
  const [isEvaluating, setIsEvaluating] = useState(false)
  const [mentorshipReport, setMentorshipReport] = useState<EvaluateEssayFeedbackOutput | null>(null)
  const [quizScore, setQuizScore] = useState(0)

  // Quiz Mode States
  const [isQuizMode, setIsQuizMode] = useState(false)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false)
  const [startTime, setStartTime] = useState<number>(0)

  // Flashcard Mode States
  const [isFlashcardMode, setIsFlashcardMode] = useState(false)
  const [currentFlashIndex, setCurrentFlashIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [masteredCount, setMasteredCount] = useState(0)
  const [learningCount, setLearningCount] = useState(0)
  const [cardStatus, setCardStatus] = useState<Record<number, 'known' | 'learning'>>({})

  // File Upload States
  const [inputType, setInputType] = useState<string>("paste")
  const [isExtracting, setIsExtracting] = useState(false)
  const [extractProgress, setExtractProgress] = useState(0)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const essayImageInputRef = useRef<HTMLInputElement>(null)
  
  const { toast } = useToast()

  useEffect(() => {
    if (difficulty === "Easy") {
      if (count > 10) setCount(10)
    } else if (difficulty === "Medium") {
      if (count > 15) setCount(15)
    } else if (difficulty === "Hard") {
      if (count > 25) setCount(25)
    }
  }, [difficulty])

  const handleGenerate = async () => {
    if (!material) {
      toast({
        title: "Content missing",
        description: "Please provide study material text or upload a file.",
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)
    try {
      const typesMapping: any = questionType === "Mixed" ? ["MCQ", "Flashcard", "Essay"] : [questionType]
      const assessments = await generateStudyAssessments({
        studyMaterial: material,
        assessmentTypes: typesMapping,
        academicLevel: level,
        difficulty: difficulty as any,
        questionCount: count
      })
      setResult(assessments)
      toast({
        title: "Assessments Ready",
        description: "Your personalized study journey is ready to begin."
      })
    } catch (error) {
      toast({
        title: "Generation Error",
        description: "Something went wrong. Please check your material and try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleOptionSelect = (option: string) => {
    if (isAnswerRevealed) return
    setSelectedOption(option)
    setIsAnswerRevealed(true)
    
    const isCorrect = option === result?.mcqs?.[currentQuestionIndex].correctAnswer
    if (isCorrect) setQuizScore(prev => prev + 1)
  }

  const saveAttempt = async (finalScore: number) => {
    if (!user || !db) return
    const duration = Math.round((Date.now() - startTime) / 1000)
    
    try {
      const attemptsRef = collection(db, "users", user.uid, "assessment_attempts")
      await addDoc(attemptsRef, {
        userId: user.uid,
        assessmentId: "gen-" + Date.now(),
        attemptDate: new Date().toISOString(),
        overallScore: finalScore,
        status: "completed",
        durationSeconds: duration
      })
    } catch (e) {
      console.error("Error saving attempt:", e)
    }
  }

  const nextQuestion = () => {
    const mcqs = result?.mcqs || []
    if (currentQuestionIndex < mcqs.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
      setSelectedOption(null)
      setIsAnswerRevealed(false)
    } else {
      const finalScorePct = Math.round((quizScore / mcqs.length) * 100)
      if (questionType === "Mixed") {
        setMixedStep('essay')
        setIsQuizMode(false)
      } else {
        saveAttempt(finalScorePct)
        setIsQuizMode(false)
        toast({
          title: "Quiz Finished!",
          description: `You scored ${quizScore} out of ${mcqs.length}.`
        })
      }
    }
  }

  const startQuiz = () => {
    if (!result?.mcqs?.length) {
      toast({ title: "No MCQs", variant: "destructive" })
      return
    }
    setIsQuizMode(true)
    setIsFlashcardMode(false)
    setMixedStep('quiz')
    setCurrentQuestionIndex(0)
    setSelectedOption(null)
    setIsAnswerRevealed(false)
    setQuizScore(0)
    setStartTime(Date.now())
  }

  const handleSubmitEssay = async () => {
    if (!userEssayContent.trim()) {
      toast({ title: "Empty Essay", variant: "destructive" })
      return
    }

    setIsEvaluating(true)
    try {
      const evaluation = await evaluateEssayFeedback({
        essayText: userEssayContent,
        topic: "Mentorship Journey Response",
        academicLevel: level as any,
        question: result?.essayPrompts?.[0]?.prompt,
        wordLimit: essayWordLimit
      })
      setMentorshipReport(evaluation)
      setMixedStep('mentorship')
      
      const combinedScore = Math.round(((quizScore / (result?.mcqs?.length || 1)) * 50) + (evaluation.score * 5))
      saveAttempt(combinedScore)

    } catch (error) {
      toast({ title: "Evaluation Error", variant: "destructive" })
    } finally {
      setIsEvaluating(false)
    }
  }

  const startFlashcards = () => {
    if (!result?.flashcards?.length) {
      toast({ title: "No Flashcards", variant: "destructive" })
      return
    }
    setIsFlashcardMode(true)
    setIsQuizMode(false)
    setMixedStep(null)
    setCurrentFlashIndex(0)
    setIsFlipped(false)
    setMasteredCount(0)
    setLearningCount(0)
    setCardStatus({})
    setStartTime(Date.now())
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold font-headline tracking-tight text-slate-900 dark:text-white">Assessment Center</h1>
        <p className="text-muted-foreground text-lg">Generate native study experiences from your material.</p>
      </div>

      {!result ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-none shadow-sm rounded-[28px] overflow-hidden dark:bg-slate-900/50">
              <CardHeader className="px-8 pt-8 pb-0">
                <CardTitle className="font-headline text-xl dark:text-white">Material Input</CardTitle>
                <CardDescription className="dark:text-slate-400">Source content for your study journey.</CardDescription>
              </CardHeader>
              <CardContent className="p-8 pt-6">
                <Tabs value={inputType} onValueChange={setInputType} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-6 rounded-2xl h-12 p-1 bg-slate-100 dark:bg-slate-800">
                    <TabsTrigger value="paste" className="rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950">
                      <FileText className="h-4 w-4 mr-2" />
                      Paste Text
                    </TabsTrigger>
                    <TabsTrigger value="upload" className="rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload File
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="paste">
                    <textarea 
                      className="w-full min-h-[300px] rounded-[20px] border border-input bg-background dark:bg-slate-950 px-4 py-4 text-sm focus-visible:ring-2 focus-visible:ring-primary/20 transition-all resize-none dark:text-white"
                      placeholder="Paste your study notes here..."
                      value={material}
                      onChange={(e) => setMaterial(e.target.value)}
                    />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm rounded-[28px] dark:bg-slate-900/50">
              <CardHeader className="px-8 pt-8">
                <CardTitle className="font-headline text-lg flex items-center gap-2 dark:text-white">
                  <Settings2 className="h-5 w-5 text-primary" />
                  Custom Journey
                </CardTitle>
              </CardHeader>
              <CardContent className="px-8 pb-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Academic Level</label>
                    <Select value={level} onValueChange={setLevel}>
                      <SelectTrigger className="h-12 rounded-2xl dark:bg-slate-950 dark:border-slate-800 dark:text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Undergraduate Year 1">Undergraduate Year 1</SelectItem>
                        <SelectItem value="Competitive Exams (UPSC)">Competitive Exams (UPSC)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Difficulty</label>
                    <Select value={difficulty} onValueChange={setDifficulty}>
                      <SelectTrigger className="h-12 rounded-2xl dark:bg-slate-950 dark:border-slate-800 dark:text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Easy">Beginner</SelectItem>
                        <SelectItem value="Medium">Standard</SelectItem>
                        <SelectItem value="Hard">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button 
                  className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold"
                  onClick={handleGenerate}
                  disabled={isLoading}
                >
                  {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Build Study Experience"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : isQuizMode ? (
        <div className="max-w-xl mx-auto space-y-8 animate-in slide-in-from-bottom-8 pb-20">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <Button variant="ghost" onClick={() => setIsQuizMode(false)} className="text-slate-500 font-bold dark:text-slate-400">Exit Experience</Button>
              <Badge className="bg-primary/10 text-primary border-none">Knowledge Check</Badge>
            </div>
            <Progress value={((currentQuestionIndex + 1) / (result.mcqs?.length || 1)) * 100} className="h-1.5" />
          </div>

          <Card className="border-none shadow-2xl rounded-[32px] overflow-hidden bg-white dark:bg-slate-900">
            <div className="p-8 pb-4">
               <h2 className="text-2xl font-bold font-headline leading-tight text-slate-900 dark:text-white">
                {result.mcqs?.[currentQuestionIndex].question}
              </h2>
            </div>
            <CardContent className="p-8 pt-4 space-y-4">
              <div className="grid grid-cols-1 gap-3">
                {result.mcqs?.[currentQuestionIndex].options.map((option, idx) => {
                  const isCorrect = option === result.mcqs?.[currentQuestionIndex].correctAnswer
                  const isSelected = selectedOption === option
                  
                  let buttonStyle = "bg-slate-50 border-slate-100 text-slate-700 hover:bg-slate-100 dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:hover:bg-slate-700"
                  if (isAnswerRevealed) {
                    if (isCorrect) {
                      buttonStyle = "bg-emerald-50 border-emerald-400 text-emerald-700 dark:bg-emerald-900/30 dark:border-emerald-500 dark:text-emerald-400"
                    } else if (isSelected) {
                      buttonStyle = "bg-destructive/5 border-destructive/40 text-destructive"
                    } else {
                      buttonStyle = "opacity-40"
                    }
                  }

                  return (
                    <Button 
                      key={idx}
                      variant="outline"
                      className={cn("h-16 justify-start px-6 rounded-[20px] border-2 transition-all text-base text-left", buttonStyle)}
                      onClick={() => handleOptionSelect(option)}
                      disabled={isAnswerRevealed}
                    >
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "h-8 w-8 rounded-full border flex items-center justify-center font-bold text-xs shrink-0",
                          isSelected ? "bg-primary text-white border-primary" : "bg-white text-slate-400 border-slate-200 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-500"
                        )}>
                          {String.fromCharCode(65 + idx)}
                        </div>
                        {option}
                      </div>
                    </Button>
                  )
                })}
              </div>
              {isAnswerRevealed && (
                <div className="mt-6 p-6 bg-primary/5 rounded-[24px] border border-primary/10 animate-in fade-in">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-2">Mentur Context</p>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {result.mcqs?.[currentQuestionIndex].explanation}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
          {isAnswerRevealed && (
            <div className="flex justify-center pt-4">
              <Button onClick={nextQuestion} className="h-16 px-12 rounded-[24px] bg-slate-900 dark:bg-primary text-white font-bold text-lg">
                Next Question
                <ChevronRight className="ml-2 h-6 w-6" />
              </Button>
            </div>
          )}
        </div>
      ) : isFlashcardMode ? (
        <div className="max-w-xl mx-auto space-y-8 animate-in slide-in-from-bottom-8 pb-20">
           <div className="flex items-center justify-between">
              <Button variant="ghost" onClick={() => setIsFlashcardMode(false)} className="text-slate-500 font-bold dark:text-slate-400">Exit Practice</Button>
              <div className="flex gap-3">
                 <Badge className="bg-emerald-50 text-emerald-600 border-none dark:bg-emerald-900/30 dark:text-emerald-400">Known: {masteredCount}</Badge>
              </div>
           </div>
          <div className="relative h-[420px] w-full [perspective:1500px] cursor-pointer" onClick={() => setIsFlipped(!isFlipped)}>
            <div className={cn("relative h-full w-full transition-all duration-700 [transform-style:preserve-3d]", isFlipped && "[transform:rotateY(180deg)]")}>
              <div className="absolute inset-0 [backface-visibility:hidden]">
                <Card className="h-full w-full border-none shadow-2xl rounded-[40px] flex flex-col items-center justify-center p-10 text-center dark:bg-slate-900">
                   <h2 className="text-3xl font-headline font-bold text-slate-900 dark:text-white">{result.flashcards?.[currentFlashIndex].front}</h2>
                </Card>
              </div>
              <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)]">
                <Card className="h-full w-full border-none shadow-2xl rounded-[40px] flex flex-col items-center justify-center p-10 text-center bg-slate-900 text-white dark:bg-primary">
                   <p className="text-2xl font-medium leading-relaxed italic">{result.flashcards?.[currentFlashIndex].back}</p>
                </Card>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-xl mx-auto space-y-8 text-center">
          <Card className="border-none shadow-2xl rounded-[40px] overflow-hidden bg-white dark:bg-slate-900 p-10 space-y-8">
            <div className="bg-primary/10 h-20 w-20 rounded-3xl flex items-center justify-center mx-auto">
              <Sparkles className="h-10 w-10 text-primary" />
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-bold font-headline text-slate-900 dark:text-white">Your Study Experience is Ready</h2>
              <p className="text-slate-500 dark:text-slate-400">Mentur AI has built a focused journey for {level}.</p>
            </div>
            <div className="flex flex-col gap-4">
               <Button onClick={startQuiz} className="h-16 rounded-[24px] bg-primary hover:bg-primary/90 text-white font-bold text-lg">
                  Start Assessment
               </Button>
               {result.flashcards?.length ? (
                <Button onClick={startFlashcards} className="h-16 rounded-[24px] bg-slate-900 dark:bg-slate-800 text-white font-bold text-lg">
                  Practice Flashcards
                </Button>
               ) : null}
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
