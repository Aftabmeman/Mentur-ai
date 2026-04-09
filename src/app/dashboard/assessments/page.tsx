
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

export default function AssessmentsPage() {
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

  // Essay Journey Input Type (Typed vs Handwritten)
  const [essayInputMethod, setEssayInputMethod] = useState<'typed' | 'handwritten'>('typed')
  const [isTranscribing, setIsTranscribing] = useState(false)

  // Quiz Mode States
  const [isQuizMode, setIsQuizMode] = useState(false)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false)

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

  const maxCount = difficulty === "Easy" ? 10 : difficulty === "Medium" ? 15 : 25
  const minCount = 1

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      processFile(file)
    }
  }

  const processFile = (file: File) => {
    const validTypes = ['application/pdf', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation', 'image/jpeg', 'image/png']
    if (!validTypes.includes(file.type) && !file.name.endsWith('.ppt') && !file.name.endsWith('.pptx')) {
      toast({
        title: "Unsupported file",
        description: "Please upload a PDF, PPT, or Image file.",
        variant: "destructive"
      })
      return
    }

    setUploadedFile(file)
    simulateExtraction(file)
  }

  const simulateExtraction = (file: File) => {
    setIsExtracting(true)
    setExtractProgress(0)
    
    const interval = setInterval(() => {
      setExtractProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        return prev + 10
      })
    }, 200)

    setTimeout(() => {
      setIsExtracting(false)
      const mockText = `Study material processing complete for ${file.name}. Content has been ingested for assessment generation.`
      setMaterial(mockText)
      toast({
        title: "Extraction Complete",
        description: `Successfully extracted text from ${file.name}.`
      })
    }, 2500)
  }

  const handleEssayImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith('image/')) {
      setIsTranscribing(true)
      // Simulate Handwriting OCR
      setTimeout(() => {
        setUserEssayContent(`[TRANSCRIPT FROM HANDWRITTEN PHOTO: ${file.name}]\n\nThe core concepts discussed in the material highlights the importance of adaptive systems in modern pedagogy. By leveraging AI, we can bridge the gap between theoretical knowledge and practical application...`)
        setIsTranscribing(false)
        toast({
          title: "Transcription Success",
          description: "Your handwritten work has been digitized for evaluation."
        })
      }, 2000)
    }
  }

  const clearFile = () => {
    setUploadedFile(null)
    setMaterial("")
    setExtractProgress(0)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

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

  const nextQuestion = () => {
    const mcqs = result?.mcqs || []
    if (currentQuestionIndex < mcqs.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
      setSelectedOption(null)
      setIsAnswerRevealed(false)
    } else {
      if (questionType === "Mixed") {
        setMixedStep('essay')
        setIsQuizMode(false)
        toast({
          title: "Quiz Stage Complete",
          description: "Moving to Essay stage of your mentorship journey."
        })
      } else {
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
      toast({
        title: "No MCQs",
        description: "This set doesn't contain multiple choice questions.",
        variant: "destructive"
      })
      return
    }
    setIsQuizMode(true)
    setIsFlashcardMode(false)
    setMixedStep('quiz')
    setCurrentQuestionIndex(0)
    setSelectedOption(null)
    setIsAnswerRevealed(false)
    setQuizScore(0)
  }

  const handleSubmitEssay = async () => {
    if (!userEssayContent.trim()) {
      toast({
        title: "Empty Essay",
        description: "Please write or upload your response before submitting.",
        variant: "destructive"
      })
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
      toast({
        title: "Mentorship Report Ready",
        description: "Your comprehensive academic feedback has been generated."
      })
    } catch (error) {
      toast({
        title: "Evaluation Error",
        description: "Mentur AI could not evaluate the essay. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsEvaluating(false)
    }
  }

  const startFlashcards = () => {
    if (!result?.flashcards?.length) {
      toast({
        title: "No Flashcards",
        description: "This set doesn't contain flashcards.",
        variant: "destructive"
      })
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
  }

  const handleCardFeedback = (status: 'known' | 'learning') => {
    if (cardStatus[currentFlashIndex]) return 

    setCardStatus(prev => ({ ...prev, [currentFlashIndex]: status }))
    if (status === 'known') {
      setMasteredCount(prev => prev + 1)
    } else {
      setLearningCount(prev => prev + 1)
    }
  }

  const nextFlashcard = () => {
    if (currentFlashIndex < (result?.flashcards?.length || 0) - 1) {
      setCurrentFlashIndex(prev => prev + 1)
      setIsFlipped(false)
    } else {
      toast({
        title: "Study Session Complete",
        description: `You mastered ${masteredCount} out of ${result?.flashcards?.length} cards.`
      })
    }
  }

  const prevFlashcard = () => {
    if (currentFlashIndex > 0) {
      setCurrentFlashIndex(prev => prev - 1)
      setIsFlipped(false)
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold font-headline tracking-tight text-slate-900">Assessment Center</h1>
        <p className="text-muted-foreground text-lg">Generate native study experiences from your material.</p>
      </div>

      {!result ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-none shadow-sm rounded-[28px] overflow-hidden">
              <CardHeader className="px-8 pt-8 pb-0">
                <CardTitle className="font-headline text-xl">Material Input</CardTitle>
                <CardDescription>Source content for your study journey.</CardDescription>
              </CardHeader>
              <CardContent className="p-8 pt-6">
                <Tabs value={inputType} onValueChange={setInputType} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-6 rounded-2xl h-12 p-1 bg-slate-100">
                    <TabsTrigger value="paste" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm">
                      <FileText className="h-4 w-4 mr-2" />
                      Paste Text
                    </TabsTrigger>
                    <TabsTrigger value="upload" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload File
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="paste" className="mt-0">
                    <textarea 
                      className="w-full min-h-[300px] rounded-[20px] border border-input bg-background px-4 py-4 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 transition-all resize-none leading-relaxed"
                      placeholder="Paste your study notes, textbook chapters, or articles here..."
                      value={material}
                      onChange={(e) => setMaterial(e.target.value)}
                    />
                  </TabsContent>

                  <TabsContent value="upload" className="mt-0">
                    {!uploadedFile ? (
                      <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full min-h-[300px] border-2 border-dashed border-slate-200 rounded-[24px] flex flex-col items-center justify-center p-8 transition-all hover:bg-slate-50 hover:border-primary/30 cursor-pointer group"
                      >
                        <input 
                          type="file" 
                          className="hidden" 
                          ref={fileInputRef} 
                          onChange={handleFileChange}
                          accept=".pdf,.ppt,.pptx,image/*"
                        />
                        <div className="h-20 w-20 bg-primary/5 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                          <Upload className="h-10 w-10 text-primary" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2 text-center">Click or drag to upload</h3>
                        <p className="text-slate-500 text-center text-xs max-w-xs mb-6">
                          Supports PDF, PPTX, and high-quality images.
                        </p>
                      </div>
                    ) : (
                      <div className="w-full min-h-[300px] border border-slate-200 rounded-[24px] p-6 flex flex-col">
                        <div className="flex items-center justify-between mb-8 bg-slate-50 p-4 rounded-xl border border-slate-100">
                          <div className="flex items-center gap-4">
                            <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
                              {uploadedFile.type.includes('image') ? (
                                <FileImage className="h-6 w-6 text-primary" />
                              ) : uploadedFile.name.endsWith('.pdf') ? (
                                <FileText className="h-6 w-6 text-primary" />
                              ) : (
                                <FileStack className="h-6 w-6 text-primary" />
                              )}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 line-clamp-1 text-sm">{uploadedFile.name}</p>
                              <p className="text-[10px] text-slate-500">{(uploadedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                            </div>
                          </div>
                          <Button variant="ghost" size="icon" onClick={clearFile} className="hover:bg-destructive/10 hover:text-destructive rounded-full">
                            <X className="h-5 w-5" />
                          </Button>
                        </div>

                        {isExtracting ? (
                          <div className="flex-1 flex flex-col items-center justify-center space-y-6">
                            <Loader2 className="h-12 w-12 text-primary animate-spin" />
                            <div className="w-full max-w-xs space-y-2">
                              <p className="text-xs font-bold text-slate-500 text-center uppercase tracking-widest">Digitizing material...</p>
                              <Progress value={extractProgress} className="h-1.5" />
                            </div>
                          </div>
                        ) : (
                          <div className="flex-1 space-y-4">
                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 min-h-[120px] text-sm text-slate-600 leading-relaxed italic overflow-hidden">
                              {material.substring(0, 300)}...
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card className="border-none shadow-sm rounded-[28px]">
                <CardHeader className="px-8 pt-8">
                  <CardTitle className="font-headline text-lg flex items-center gap-2">
                    <Settings2 className="h-5 w-5 text-primary" />
                    Custom Journey
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-8 pb-8 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Academic Level</label>
                      <Select value={level} onValueChange={setLevel}>
                        <SelectTrigger className="h-12 rounded-2xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="School Class 8-10">School Class 8-10</SelectItem>
                          <SelectItem value="School Class 11-12">School Class 11-12</SelectItem>
                          <SelectItem value="Undergraduate Year 1">Undergraduate Year 1</SelectItem>
                          <SelectItem value="Competitive Exams (UPSC)">Competitive Exams (UPSC)</SelectItem>
                          <SelectItem value="Competitive Exams (JEE/NEET)">Competitive Exams (JEE/NEET)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Difficulty</label>
                      <Select value={difficulty} onValueChange={setDifficulty}>
                        <SelectTrigger className="h-12 rounded-2xl">
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

                  <div className="space-y-3">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Experience Type</label>
                    <Tabs value={questionType} onValueChange={setQuestionType} className="w-full">
                      <TabsList className="grid w-full grid-cols-4 rounded-2xl h-12 bg-slate-100 p-1">
                        <TabsTrigger value="MCQ" className="rounded-xl text-xs">Quiz</TabsTrigger>
                        <TabsTrigger value="Flashcard" className="rounded-xl text-xs">Flash</TabsTrigger>
                        <TabsTrigger value="Essay" className="rounded-xl text-xs">Write</TabsTrigger>
                        <TabsTrigger value="Mixed" className="rounded-xl text-xs font-bold">Journey</TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>

                  <Button 
                    className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold text-lg shadow-xl shadow-primary/20 transition-transform active:scale-95"
                    onClick={handleGenerate}
                    disabled={isLoading || isExtracting}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Building...
                      </>
                    ) : (
                      <>
                        Build Study Experience
                        <Zap className="ml-2 h-5 w-5 fill-current" />
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="space-y-6">
             <div className="p-8 rounded-[32px] bg-slate-900 text-white relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl -mr-10 -mt-10"></div>
                <BrainCircuit className="h-10 w-10 text-primary mb-4" />
                <h3 className="text-xl font-bold font-headline mb-2">Native Mastery</h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-6">
                  Mentur AI creates focused, distraction-free study cards optimized for your speed.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-xs text-slate-300 font-bold uppercase tracking-widest">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" /> Vision OCR
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-300 font-bold uppercase tracking-widest">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" /> Smart Adaptive
                  </div>
                </div>
              </div>
          </div>
        </div>
      ) : isQuizMode ? (
        <div className="max-w-xl mx-auto space-y-8 animate-in slide-in-from-bottom-8 duration-500 pb-20">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <Button variant="ghost" onClick={() => { setIsQuizMode(false); setMixedStep(null); }} className="text-slate-500 font-bold h-10 px-0">
                Exit Experience
              </Button>
              <Badge className="bg-primary/10 text-primary border-none font-bold uppercase tracking-tighter">
                {questionType === "Mixed" ? "Journey Stage 1" : "Knowledge Check"}
              </Badge>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-slate-400">
                <span>Question {currentQuestionIndex + 1} of {result.mcqs?.length}</span>
                <span>{Math.round(((currentQuestionIndex + 1) / (result.mcqs?.length || 1)) * 100)}% Complete</span>
              </div>
              <Progress value={((currentQuestionIndex + 1) / (result.mcqs?.length || 1)) * 100} className="h-1.5" />
            </div>
          </div>

          <Card className="border-none shadow-2xl rounded-[32px] overflow-hidden bg-white">
            <div className="p-8 pb-4">
               <h2 className="text-2xl font-bold font-headline leading-tight text-slate-900">
                {result.mcqs?.[currentQuestionIndex].question}
              </h2>
            </div>
            <CardContent className="p-8 pt-4 space-y-4">
              <div className="grid grid-cols-1 gap-3">
                {result.mcqs?.[currentQuestionIndex].options.map((option, idx) => {
                  const isCorrect = option === result.mcqs?.[currentQuestionIndex].correctAnswer
                  const isSelected = selectedOption === option
                  
                  let buttonStyle = "bg-slate-50 border-slate-100 text-slate-700 hover:bg-slate-100"
                  if (isAnswerRevealed) {
                    if (isCorrect) {
                      buttonStyle = "bg-emerald-50 border-emerald-400 text-emerald-700 font-bold shadow-lg shadow-emerald-500/10"
                    } else if (isSelected && !isCorrect) {
                      buttonStyle = "bg-destructive/5 border-destructive/40 text-destructive font-bold"
                    } else {
                      buttonStyle = "bg-slate-50 border-slate-50 text-slate-300 opacity-60"
                    }
                  }

                  return (
                    <Button 
                      key={idx}
                      variant="outline"
                      className={cn("h-16 justify-start px-6 rounded-[20px] border-2 transition-all text-base text-left whitespace-normal", buttonStyle)}
                      onClick={() => handleOptionSelect(option)}
                      disabled={isAnswerRevealed}
                    >
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "h-8 w-8 rounded-full border flex items-center justify-center font-bold text-xs shrink-0",
                          isSelected ? "bg-primary text-white border-primary" : "bg-white text-slate-400 border-slate-200"
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
                <div className="mt-6 p-6 bg-primary/5 rounded-[24px] border border-primary/10 animate-in fade-in slide-in-from-top-4 duration-500">
                  <div className="flex items-start gap-4">
                    <Sparkles className="h-5 w-5 text-primary mt-1 shrink-0" />
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-primary">Mentur Context</p>
                      <p className="text-sm text-slate-600 leading-relaxed font-medium">
                        {result.mcqs?.[currentQuestionIndex].explanation}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {isAnswerRevealed && (
            <div className="flex justify-center pt-4">
              <Button 
                onClick={nextQuestion}
                className="h-16 px-12 rounded-[24px] bg-slate-900 hover:bg-slate-800 text-white font-bold text-lg shadow-2xl transition-transform hover:scale-105 active:scale-95"
              >
                {currentQuestionIndex < (result.mcqs?.length || 0) - 1 ? "Next Question" : (questionType === "Mixed" ? "Start Writing Stage" : "Review Results")}
                <ChevronRight className="ml-2 h-6 w-6" />
              </Button>
            </div>
          )}
        </div>
      ) : mixedStep === 'essay' ? (
        <div className="max-w-xl mx-auto space-y-8 animate-in slide-in-from-bottom-8 duration-500 pb-20">
          <div className="flex flex-col gap-4 text-center">
            <h2 className="text-3xl font-bold font-headline text-slate-900">Critical Writing</h2>
            <p className="text-slate-500 font-medium">Test your analysis of the core concepts.</p>
          </div>

          <Card className="border-none shadow-2xl rounded-[32px] overflow-hidden bg-white">
            <div className="bg-slate-900 text-white p-8">
              <Badge className="mb-4 bg-primary/20 text-primary border-none uppercase font-bold text-[10px] tracking-widest">Essay Prompt</Badge>
              <h3 className="text-xl font-bold font-headline leading-tight">
                {result.essayPrompts?.[0]?.prompt || "Discuss the most significant implication of the material studied."}
              </h3>
            </div>
            <CardContent className="p-8 space-y-6">
              <div className="flex justify-center mb-4">
                <Tabs value={essayInputMethod} onValueChange={(val) => setEssayInputMethod(val as any)} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 rounded-2xl h-11 bg-slate-100 p-1">
                    <TabsTrigger value="typed" className="rounded-xl text-xs font-bold">Typed Response</TabsTrigger>
                    <TabsTrigger value="handwritten" className="rounded-xl text-xs font-bold">Upload Handwriting</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              {essayInputMethod === 'typed' ? (
                <Textarea 
                  placeholder="Start your deep analysis here..."
                  className="min-h-[350px] rounded-[24px] p-6 text-lg border-2 focus-visible:ring-primary/20 resize-none leading-relaxed"
                  value={userEssayContent}
                  onChange={(e) => setUserEssayContent(e.target.value)}
                />
              ) : (
                <div 
                    onClick={() => essayImageInputRef.current?.click()}
                    className="w-full min-h-[350px] border-2 border-dashed border-slate-200 rounded-[32px] flex flex-col items-center justify-center p-8 transition-all hover:bg-slate-50 hover:border-primary/30 cursor-pointer"
                  >
                    <input type="file" className="hidden" ref={essayImageInputRef} onChange={handleEssayImageUpload} accept="image/*" />
                    <FileImage className="h-12 w-12 text-primary mb-4" />
                    <h3 className="text-xl font-bold text-slate-900">Upload handwritten work</h3>
                    <p className="text-slate-400 text-center text-xs mt-2">Mentur AI will transcribe and evaluate.</p>
                </div>
              )}

              {isTranscribing && (
                <div className="flex items-center justify-center gap-3">
                   <Loader2 className="h-5 w-5 text-primary animate-spin" />
                   <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Transcribing...</p>
                </div>
              )}

              <Button 
                size="lg"
                onClick={handleSubmitEssay}
                disabled={isEvaluating || isTranscribing}
                className="w-full h-16 rounded-[24px] bg-primary hover:bg-primary/90 text-white font-bold text-lg shadow-xl shadow-primary/20 transition-all active:scale-95"
              >
                {isEvaluating ? <Loader2 className="animate-spin h-6 w-6" /> : "Complete Journey"}
              </Button>
            </CardContent>
          </Card>
        </div>
      ) : mentorshipReport ? (
        <div className="max-w-2xl mx-auto space-y-8 animate-in slide-in-from-bottom-8 duration-500 pb-20">
           <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold font-headline text-slate-900">Mentur Final Report</h2>
              <p className="text-slate-500 font-medium">Your academic growth summarized.</p>
           </div>

           <div className="grid grid-cols-2 gap-4">
              <Card className="border-none shadow-xl rounded-[32px] bg-slate-900 text-white p-6 text-center">
                 <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-4">Quiz Score</p>
                 <h3 className="text-4xl font-black font-headline">{quizScore}/{result.mcqs?.length}</h3>
              </Card>
              <Card className="border-none shadow-xl rounded-[32px] bg-white p-6 text-center">
                 <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4">Critical Writing</p>
                 <h3 className="text-4xl font-black font-headline text-primary">{mentorshipReport.score}/10</h3>
              </Card>
           </div>

           <Card className="border-none shadow-xl rounded-[32px] p-8 bg-white">
              <CardTitle className="font-headline text-xl flex items-center gap-2 mb-6">
                 <Sparkles className="h-5 w-5 text-primary" />
                 Deep Analysis
              </CardTitle>
              <div className="space-y-6">
                 <div className="space-y-3">
                    <h4 className="text-xs font-bold text-emerald-600 uppercase tracking-widest">Key Strengths</h4>
                    <ul className="space-y-2">
                       {mentorshipReport.strengths.slice(0, 3).map((s, i) => (
                         <li key={i} className="text-sm text-slate-600 flex gap-3 font-medium">
                           <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                           {s}
                         </li>
                       ))}
                    </ul>
                 </div>
                 <div className="space-y-3">
                    <h4 className="text-xs font-bold text-amber-600 uppercase tracking-widest">Areas for growth</h4>
                    <ul className="space-y-2">
                       {mentorshipReport.weaknesses.slice(0, 3).map((w, i) => (
                         <li key={i} className="text-sm text-slate-600 flex gap-3 font-medium">
                           <div className="h-1.5 w-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                           {w}
                         </li>
                       ))}
                    </ul>
                 </div>
              </div>
           </Card>

           <Button 
            className="w-full h-16 rounded-[24px] bg-slate-900 text-white font-bold text-lg"
            onClick={() => { setResult(null); setMentorshipReport(null); setMixedStep(null); }}
           >
             Finish Session
           </Button>
        </div>
      ) : isFlashcardMode ? (
        <div className="max-w-xl mx-auto space-y-8 animate-in slide-in-from-bottom-8 duration-500 pb-20">
           <div className="flex items-center justify-between">
              <Button variant="ghost" onClick={() => setIsFlashcardMode(false)} className="text-slate-500 font-bold h-10 px-0">
                Exit Practice
              </Button>
              <div className="flex gap-3">
                 <Badge className="bg-emerald-50 text-emerald-600 border-none font-bold">Known: {masteredCount}</Badge>
                 <Badge className="bg-amber-50 text-amber-600 border-none font-bold">New: {learningCount}</Badge>
              </div>
           </div>

          <div 
            className="relative h-[420px] w-full [perspective:1500px] cursor-pointer"
            onClick={() => setIsFlipped(!isFlipped)}
          >
            <div className={cn(
              "relative h-full w-full transition-all duration-700 [transform-style:preserve-3d]",
              isFlipped && "[transform:rotateY(180deg)]"
            )}>
              {/* Front Side */}
              <div className="absolute inset-0 [backface-visibility:hidden]">
                <Card className="h-full w-full border-none shadow-2xl rounded-[40px] flex flex-col items-center justify-center p-10 text-center bg-white">
                   <Badge className="mb-8 bg-primary/10 text-primary border-none font-bold uppercase tracking-widest text-[10px] py-1.5 px-4 rounded-full">Question</Badge>
                   <h2 className="text-3xl font-headline font-bold text-slate-900 leading-tight">
                     {result.flashcards?.[currentFlashIndex].front}
                   </h2>
                   <div className="mt-12 flex items-center gap-2 text-slate-300 font-bold uppercase tracking-widest text-[10px]">
                      <RotateCw className="h-4 w-4" /> Tap to flip
                   </div>
                </Card>
              </div>

              {/* Back Side */}
              <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)]">
                <Card className="h-full w-full border-none shadow-2xl rounded-[40px] flex flex-col items-center justify-center p-10 text-center bg-slate-900 text-white">
                   <Badge className="mb-8 bg-emerald-500/20 text-emerald-400 border-none font-bold uppercase tracking-widest text-[10px] py-1.5 px-4 rounded-full">Mentur Insight</Badge>
                   <p className="text-2xl font-medium leading-relaxed italic text-slate-200">
                     "{result.flashcards?.[currentFlashIndex].back}"
                   </p>
                </Card>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center gap-6">
            {isFlipped ? (
              <div className="flex gap-4 w-full animate-in fade-in slide-in-from-top-4">
                <Button 
                  onClick={(e) => { e.stopPropagation(); handleCardFeedback('learning'); }}
                  disabled={!!cardStatus[currentFlashIndex]}
                  className={cn(
                    "flex-1 h-16 rounded-[24px] font-bold text-base transition-all",
                    cardStatus[currentFlashIndex] === 'learning' ? "bg-amber-500 text-white" : "bg-white border-2 border-slate-100 text-amber-600 hover:bg-amber-50"
                  )}
                >
                  Learning ✗
                </Button>
                <Button 
                  onClick={(e) => { e.stopPropagation(); handleCardFeedback('known'); }}
                  disabled={!!cardStatus[currentFlashIndex]}
                  className={cn(
                    "flex-1 h-16 rounded-[24px] font-bold text-base transition-all",
                    cardStatus[currentFlashIndex] === 'known' ? "bg-emerald-500 text-white" : "bg-white border-2 border-slate-100 text-emerald-600 hover:bg-emerald-50"
                  )}
                >
                  Got it ✓
                </Button>
              </div>
            ) : (
               <div className="flex items-center gap-6">
                <Button 
                  variant="outline" 
                  onClick={prevFlashcard} 
                  disabled={currentFlashIndex === 0}
                  className="h-14 w-14 rounded-full border-slate-100"
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>
                <Button 
                  onClick={nextFlashcard}
                  className="h-16 px-12 rounded-[24px] bg-slate-900 text-white font-bold text-lg"
                >
                  {currentFlashIndex < (result.flashcards?.length || 0) - 1 ? "Next Card" : "Finish Practice"}
                  <ChevronRight className="ml-2 h-6 w-6" />
                </Button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="max-w-xl mx-auto space-y-8 animate-in zoom-in-95 duration-500 text-center">
          <Card className="border-none shadow-2xl rounded-[40px] overflow-hidden bg-white p-10 space-y-8">
            <div className="bg-primary/10 h-20 w-20 rounded-3xl flex items-center justify-center mx-auto">
              <Sparkles className="h-10 w-10 text-primary" />
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-bold font-headline text-slate-900">Your Study Experience is Ready</h2>
              <p className="text-slate-500 font-medium">Mentur AI has analyzed your material and built a focused journey for {level}.</p>
            </div>
            
            <div className="flex flex-col gap-4">
               {questionType === "Mixed" || result.mcqs?.length ? (
                <Button 
                  onClick={startQuiz}
                  className="h-16 rounded-[24px] bg-primary hover:bg-primary/90 text-white font-bold text-lg shadow-xl shadow-primary/20"
                >
                  Start Assessment
                  <ChevronRight className="ml-2 h-6 w-6" />
                </Button>
               ) : null}

               {result.flashcards?.length ? (
                <Button 
                  onClick={startFlashcards}
                  className="h-16 rounded-[24px] bg-slate-900 hover:bg-slate-800 text-white font-bold text-lg shadow-xl"
                >
                  Practice Flashcards
                  <ChevronRight className="ml-2 h-6 w-6" />
                </Button>
               ) : null}

               <Button variant="ghost" onClick={() => setResult(null)} className="text-slate-400 font-bold mt-2">
                 Generate Different Content
               </Button>
            </div>
          </Card>

          <footer className="pt-4 text-center">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
              Powered by Mentur AI Engine — Native Focus Mode
            </p>
          </footer>
        </div>
      )}
    </div>
  )
}
