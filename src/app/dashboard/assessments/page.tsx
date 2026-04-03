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
        description: `Successfully generated items for ${level}.`
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
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold font-headline tracking-tight text-slate-900">Assessment Center</h1>
        <p className="text-muted-foreground text-lg">Generate custom quizzes and flashcards from your study materials.</p>
      </div>

      {!result ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-none shadow-sm overflow-hidden">
              <CardHeader className="pb-0">
                <CardTitle className="font-headline text-xl">Material Input</CardTitle>
                <CardDescription>Provide the source content for your assessment.</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <Tabs value={inputType} onValueChange={setInputType} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-6 rounded-xl h-12 p-1 bg-slate-100">
                    <TabsTrigger value="paste" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
                      <FileText className="h-4 w-4 mr-2" />
                      Paste Text
                    </TabsTrigger>
                    <TabsTrigger value="upload" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload File
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="paste" className="mt-0">
                    <textarea 
                      className="w-full min-h-[350px] rounded-xl border border-input bg-background px-4 py-4 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 transition-all resize-none leading-relaxed"
                      placeholder="Paste your study notes, textbook chapters, or articles here..."
                      value={material}
                      onChange={(e) => setMaterial(e.target.value)}
                    />
                  </TabsContent>

                  <TabsContent value="upload" className="mt-0">
                    {!uploadedFile ? (
                      <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full min-h-[350px] border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center p-8 transition-all hover:bg-slate-50 hover:border-primary/30 cursor-pointer group"
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
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Click or drag to upload</h3>
                        <p className="text-slate-500 text-center max-w-xs mb-6">
                          Supports PDF, PPTX, and high-quality images for text extraction.
                        </p>
                        <div className="flex gap-3">
                          <Badge variant="outline" className="bg-white gap-1 py-1 px-3">
                            <FileIcon className="h-3 w-3" /> PDF
                          </Badge>
                          <Badge variant="outline" className="bg-white gap-1 py-1 px-3">
                            <FileStack className="h-3 w-3" /> PPT
                          </Badge>
                          <Badge variant="outline" className="bg-white gap-1 py-1 px-3">
                            <FileImage className="h-3 w-3" /> Image
                          </Badge>
                        </div>
                      </div>
                    ) : (
                      <div className="w-full min-h-[350px] border border-slate-200 rounded-2xl p-8 flex flex-col">
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
                              <p className="font-bold text-slate-900 line-clamp-1">{uploadedFile.name}</p>
                              <p className="text-xs text-slate-500">{(uploadedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                            </div>
                          </div>
                          <Button variant="ghost" size="icon" onClick={clearFile} className="hover:bg-destructive/10 hover:text-destructive rounded-full">
                            <X className="h-5 w-5" />
                          </Button>
                        </div>

                        {isExtracting ? (
                          <div className="flex-1 flex flex-col items-center justify-center space-y-6">
                            <div className="relative h-24 w-24">
                              <Loader2 className="h-24 w-24 text-primary animate-spin absolute" />
                              <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-xs font-bold text-primary">{extractProgress}%</span>
                              </div>
                            </div>
                            <div className="w-full max-w-md space-y-2">
                              <p className="text-sm font-medium text-slate-600 text-center">AI is extracting text and structure...</p>
                              <Progress value={extractProgress} className="h-2" />
                            </div>
                          </div>
                        ) : (
                          <div className="flex-1 space-y-4">
                            <div className="flex items-center justify-between">
                              <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Extracted Preview</h4>
                              <Badge className="bg-emerald-100 text-emerald-700 border-none">Ready</Badge>
                            </div>
                            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 min-h-[150px] text-sm text-slate-600 leading-relaxed italic">
                              {material}
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
              <Card className="border-none shadow-sm">
                <CardHeader>
                  <CardTitle className="font-headline text-lg flex items-center gap-2">
                    <Settings2 className="h-5 w-5 text-primary" />
                    Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <label className="text-sm font-medium">Academic Level</label>
                      <Select value={level} onValueChange={setLevel}>
                        <SelectTrigger className="h-11 rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="School Class 8-10">School Class 8-10</SelectItem>
                          <SelectItem value="School Class 11-12">School Class 11-12</SelectItem>
                          <SelectItem value="Undergraduate Year 1">Undergraduate Year 1</SelectItem>
                          <SelectItem value="Undergraduate Year 2">Undergraduate Year 2</SelectItem>
                          <SelectItem value="Undergraduate Year 3">Undergraduate Year 3</SelectItem>
                          <SelectItem value="Competitive Exams (UPSC)">Competitive Exams (UPSC)</SelectItem>
                          <SelectItem value="Competitive Exams (JEE/NEET)">Competitive Exams (JEE/NEET)</SelectItem>
                          <SelectItem value="Competitive Exams (CAT/CLAT/SSC/NDA)">Competitive Exams (CAT/CLAT/SSC/NDA)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-3">
                      <label className="text-sm font-medium">Difficulty Level</label>
                      <Select value={difficulty} onValueChange={setDifficulty}>
                        <SelectTrigger className="h-11 rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Easy">Easy (Low)</SelectItem>
                          <SelectItem value="Medium">Medium</SelectItem>
                          <SelectItem value="Hard">Hard (High)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-sm font-medium">Question Type</label>
                    <Tabs value={questionType} onValueChange={setQuestionType} className="w-full">
                      <TabsList className="grid w-full grid-cols-4 rounded-xl h-11 bg-slate-100 p-1">
                        <TabsTrigger value="MCQ" className="rounded-lg">MCQ</TabsTrigger>
                        <TabsTrigger value="Flashcard" className="rounded-lg">Flashcard</TabsTrigger>
                        <TabsTrigger value="Essay" className="rounded-lg">Essay</TabsTrigger>
                        <TabsTrigger value="Mixed" className="rounded-lg">Mixed</TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>

                  {questionType === "Essay" && (
                    <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                      <label className="text-sm font-medium flex items-center gap-2">
                        <Type className="h-4 w-4" /> Essay Word Limit
                      </label>
                      <Input 
                        type="number" 
                        value={essayWordLimit}
                        onChange={(e) => setEssayWordLimit(e.target.value)}
                        placeholder="e.g. 300"
                        className="h-11 rounded-xl"
                      />
                    </div>
                  )}

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <label className="text-sm font-medium">Question Count</label>
                        <p className="text-xs text-muted-foreground">Range adjusted for {difficulty} difficulty</p>
                      </div>
                      <span className="text-primary font-bold text-lg">{count}</span>
                    </div>
                    <Slider 
                      value={[count]} 
                      min={minCount} 
                      max={maxCount} 
                      step={1} 
                      onValueChange={(val) => setCount(val[0])}
                      className="py-4"
                    />
                  </div>

                  <Button 
                    className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-md shadow-xl shadow-primary/20"
                    onClick={handleGenerate}
                    disabled={isLoading || isExtracting}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        Generate Assessments
                        <Zap className="ml-2 h-5 w-5 fill-current" />
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="space-y-6">
             <div className="p-8 rounded-3xl bg-slate-900 text-white relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl -mr-10 -mt-10"></div>
                <BrainCircuit className="h-10 w-10 text-primary mb-4" />
                <h3 className="text-xl font-bold font-headline mb-2">Master Your Topics</h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-6">
                  Mentur AI identifies core concepts to build optimized testing sets for your academic level.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-xs text-slate-300">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" /> Professional Grade OCR
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-300">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" /> Difficulty Adaptation
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-300">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" /> Specific Exam Targeting
                  </div>
                </div>
              </div>
          </div>
        </div>
      ) : isQuizMode ? (
        <div className="max-w-3xl mx-auto space-y-8 animate-in slide-in-from-right-4 duration-500">
          <div className="flex items-center justify-between">
             <div className="flex items-center gap-4">
                <Button variant="ghost" onClick={() => { setIsQuizMode(false); setMixedStep(null); }} className="text-slate-500 hover:text-slate-900">
                  Exit Journey
                </Button>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-400">Question {currentQuestionIndex + 1} of {result.mcqs?.length}</span>
                  <Progress value={((currentQuestionIndex + 1) / (result.mcqs?.length || 1)) * 100} className="w-32 h-1.5" />
                </div>
             </div>
             {questionType === "Mixed" && (
                <Badge className="bg-primary/20 text-primary border-none">Mixed Journey: Stage 1</Badge>
             )}
          </div>

          <Card className="border-none shadow-xl rounded-3xl overflow-hidden">
            <CardHeader className="bg-slate-50 border-b p-8">
              <Badge className="mb-4 bg-primary/10 text-primary border-none font-bold">Multiple Choice</Badge>
              <CardTitle className="text-2xl font-headline leading-tight text-slate-900">
                {result.mcqs?.[currentQuestionIndex].question}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="grid grid-cols-1 gap-4">
                {result.mcqs?.[currentQuestionIndex].options.map((option, idx) => {
                  const isCorrect = option === result.mcqs?.[currentQuestionIndex].correctAnswer
                  const isSelected = selectedOption === option
                  
                  let buttonStyle = "bg-white border-slate-200 text-slate-700 hover:border-primary/40 hover:bg-slate-50"
                  if (isAnswerRevealed) {
                    if (isCorrect) {
                      buttonStyle = "bg-emerald-50 border-emerald-400 text-emerald-700 font-bold"
                    } else if (isSelected && !isCorrect) {
                      buttonStyle = "bg-destructive/5 border-destructive/40 text-destructive font-bold"
                    } else {
                      buttonStyle = "bg-slate-50 border-slate-100 text-slate-400 opacity-60"
                    }
                  }

                  return (
                    <Button 
                      key={idx}
                      variant="outline"
                      className={cn("h-16 justify-start px-6 rounded-2xl border-2 transition-all text-base text-left whitespace-normal", buttonStyle)}
                      onClick={() => handleOptionSelect(option)}
                      disabled={isAnswerRevealed}
                    >
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "h-8 w-8 rounded-full border flex items-center justify-center font-bold text-sm shrink-0",
                          isSelected ? "bg-primary text-white border-primary" : "bg-slate-100 text-slate-500 border-slate-200"
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
                <div className="mt-8 p-6 bg-slate-50 rounded-2xl border border-slate-100 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="flex items-start gap-4">
                    <div className="bg-primary/10 p-2 rounded-xl h-fit">
                      <Info className="h-5 w-5 text-primary" />
                    </div>
                    <div className="space-y-2">
                      <p className="font-bold text-slate-900">AI Explanation</p>
                      <p className="text-sm text-slate-600 leading-relaxed">
                        {result.mcqs?.[currentQuestionIndex].explanation || "The correct answer is derived from concepts suitable for your academic level."}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {isAnswerRevealed && (
            <div className="flex justify-center">
              <Button 
                onClick={nextQuestion}
                className="h-14 px-12 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-lg shadow-2xl transition-transform hover:scale-105"
              >
                {currentQuestionIndex < (result.mcqs?.length || 0) - 1 ? "Next Question" : (questionType === "Mixed" ? "Start Essay Stage" : "View Results")}
                <ChevronRight className="ml-2 h-6 w-6" />
              </Button>
            </div>
          )}
        </div>
      ) : mixedStep === 'essay' ? (
        <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-right-4 duration-500">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold font-headline text-slate-900 flex items-center gap-3">
              <MessageSquare className="h-6 w-6 text-primary" />
              Stage 2: Critical Writing
            </h2>
            <Badge className="bg-primary/20 text-primary border-none">Mixed Journey: Stage 2</Badge>
          </div>

          <div className="bg-blue-50 border border-blue-100 p-6 rounded-3xl text-center">
             <h3 className="text-xl font-bold text-blue-900 mb-2">Now let's test your writing skills</h3>
             <p className="text-blue-700 text-sm">Critical thinking is the final pillar of this mentorship journey.</p>
          </div>

          <Card className="border-none shadow-xl rounded-3xl overflow-hidden">
            <CardHeader className="bg-slate-900 text-white p-8">
              <p className="text-primary font-bold text-xs uppercase tracking-widest mb-2">Mentur Prompt</p>
              <CardTitle className="text-2xl font-headline leading-tight">
                {result.essayPrompts?.[0]?.prompt || "Summarize the key findings from the provided material and discuss their implications."}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              
              <div className="flex justify-center mb-6">
                <Tabs value={essayInputMethod} onValueChange={(val) => setEssayInputMethod(val as any)} className="w-full max-w-sm">
                  <TabsList className="grid w-full grid-cols-2 rounded-xl h-11 bg-slate-100">
                    <TabsTrigger value="typed" className="rounded-lg">Type Answer</TabsTrigger>
                    <TabsTrigger value="handwritten" className="rounded-lg">Upload Handwritten</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              {essayInputMethod === 'typed' ? (
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-500 uppercase">Your Analysis</label>
                  <Textarea 
                    placeholder="Start writing your response here..."
                    className="min-h-[400px] rounded-2xl p-6 text-lg border-2 focus-visible:ring-primary/20 resize-none leading-relaxed"
                    value={userEssayContent}
                    onChange={(e) => setUserEssayContent(e.target.value)}
                  />
                  <div className="flex justify-between items-center px-2">
                    <p className="text-xs text-muted-foreground font-medium">
                      Word Count: <span className="text-primary">{userEssayContent.trim().split(/\s+/).filter(Boolean).length}</span>
                    </p>
                    <p className="text-xs text-muted-foreground italic">Take your time. Deep analysis leads to better mentorship.</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                   <div 
                    onClick={() => essayImageInputRef.current?.click()}
                    className="w-full min-h-[400px] border-2 border-dashed border-slate-200 rounded-[2.5rem] flex flex-col items-center justify-center p-8 transition-all hover:bg-slate-50 hover:border-primary/30 cursor-pointer group"
                  >
                    <input 
                      type="file" 
                      className="hidden" 
                      ref={essayImageInputRef} 
                      onChange={handleEssayImageUpload}
                      accept="image/*"
                    />
                    <div className="h-24 w-24 bg-primary/5 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                      <FileImage className="h-12 w-12 text-primary" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">Upload handwritten work</h3>
                    <p className="text-slate-500 text-center max-w-xs mb-8">
                      Mentur AI will transcribe and analyze your handwriting.
                    </p>
                    <Button variant="outline" className="h-12 rounded-xl px-10 border-2 font-bold">Select Image</Button>
                  </div>

                  {isTranscribing && (
                    <div className="flex flex-col items-center gap-4 animate-in fade-in">
                       <Loader2 className="h-8 w-8 text-primary animate-spin" />
                       <p className="text-sm font-bold text-slate-500">Transcribing handwriting...</p>
                    </div>
                  )}

                  {userEssayContent && !isTranscribing && (
                    <div className="space-y-2 animate-in slide-in-from-top-4">
                      <label className="text-sm font-bold text-slate-500 uppercase">Extracted Transcript</label>
                      <Textarea 
                        readOnly
                        className="min-h-[200px] rounded-2xl p-6 bg-slate-50 border-none italic text-slate-600 leading-relaxed"
                        value={userEssayContent}
                      />
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-center pt-4">
                <Button 
                  size="lg"
                  onClick={handleSubmitEssay}
                  disabled={isEvaluating || isTranscribing}
                  className="h-14 px-12 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold text-lg shadow-xl shadow-primary/20"
                >
                  {isEvaluating ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Mentor is reviewing...
                    </>
                  ) : (
                    <>
                      Complete Journey & Get Mentorship
                      <Sparkles className="ml-2 h-5 w-5 fill-current" />
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : mixedStep === 'mentorship' ? (
        <div className="max-w-5xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
           <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold font-headline text-slate-900">Stage 3: Mentur Final Report</h2>
              <Button variant="ghost" onClick={() => { setResult(null); setMixedStep(null); }} className="text-primary font-bold">
                ← New Study Journey
              </Button>
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
             <div className="space-y-6">
                <Card className="border-none shadow-xl rounded-3xl bg-slate-900 text-white overflow-hidden p-8">
                   <h3 className="text-xs font-bold uppercase tracking-widest text-primary mb-6">Foundational Knowledge</h3>
                   <div className="flex flex-col items-center">
                      <div className="relative h-40 w-40 flex items-center justify-center">
                        <svg className="h-full w-full transform -rotate-90">
                          <circle cx="80" cy="80" r="70" fill="transparent" stroke="rgba(255,255,255,0.05)" strokeWidth="12" />
                          <circle 
                            cx="80" cy="80" r="70" fill="transparent" stroke="hsl(var(--primary))" 
                            strokeWidth="12" strokeDasharray={440} 
                            strokeDashoffset={440 - (440 * quizScore) / (result.mcqs?.length || 1)}
                            strokeLinecap="round"
                          />
                        </svg>
                        <div className="absolute flex flex-col items-center">
                          <span className="text-4xl font-black font-headline">{quizScore}/{result.mcqs?.length}</span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase">Quiz Accuracy</span>
                        </div>
                      </div>
                      <p className="mt-8 text-center text-sm text-slate-400 leading-relaxed italic">
                        "Your foundational understanding of this topic is {quizScore / (result.mcqs?.length || 1) > 0.8 ? 'excellent' : 'developing'}. Focus on the AI explanations in areas you missed."
                      </p>
                   </div>
                </Card>

                <Card className="border-none shadow-xl rounded-3xl p-8 bg-white text-center">
                   <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-6">Critical Thinking Score</h3>
                   <div className="relative h-44 w-44 flex items-center justify-center mx-auto">
                    <svg className="h-full w-full transform -rotate-90">
                      <circle cx="88" cy="88" r="75" fill="transparent" stroke="#f1f5f9" strokeWidth="12" />
                      <circle 
                        cx="88" cy="88" r="75" fill="transparent" stroke="hsl(var(--primary))" 
                        strokeWidth="12" strokeDasharray={471} 
                        strokeDashoffset={471 - (471 * (mentorshipReport?.score || 0)) / 10}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center">
                      <span className="text-6xl font-black font-headline text-slate-900">{mentorshipReport?.score || 0}</span>
                      <span className="text-xs font-bold text-slate-400 uppercase">out of 10</span>
                    </div>
                  </div>
                  <Badge variant="secondary" className="mt-8 bg-emerald-50 text-emerald-600 border-none font-bold uppercase py-1 px-4">
                     Writing Performance
                  </Badge>
                </Card>

                {mentorshipReport?.usage && (
                   <Card className="border-none shadow-sm bg-slate-50 p-6 rounded-3xl">
                      <h4 className="text-xs font-bold text-slate-400 uppercase mb-4 flex items-center gap-2">
                        <Cpu className="h-3 w-3" /> AI Usage Report
                      </h4>
                      <div className="space-y-2">
                         <div className="flex justify-between text-xs font-medium">
                            <span className="text-slate-500">Prompt Tokens</span>
                            <span className="text-slate-900">{mentorshipReport.usage.prompt_tokens}</span>
                         </div>
                         <div className="flex justify-between text-xs font-medium">
                            <span className="text-slate-500">Completion Tokens</span>
                            <span className="text-slate-900">{mentorshipReport.usage.completion_tokens}</span>
                         </div>
                         <div className="border-t border-slate-200 pt-2 flex justify-between text-xs font-bold">
                            <span className="text-slate-600">Total Tokens</span>
                            <span className="text-primary">{mentorshipReport.usage.total_tokens}</span>
                         </div>
                      </div>
                   </Card>
                )}
             </div>

             <div className="lg:col-span-2 space-y-6">
                <Card className="border-none shadow-xl rounded-3xl p-8 bg-white">
                   <CardTitle className="font-headline flex items-center gap-2 mb-6">
                      <Sparkles className="h-5 w-5 text-primary" />
                      Mentor's Deep Analysis
                   </CardTitle>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                         <h4 className="text-sm font-bold text-emerald-600 flex items-center gap-2">
                           <ClipboardCheck className="h-4 w-4" /> Structural Strengths
                         </h4>
                         <ul className="space-y-3">
                            {mentorshipReport?.strengths.map((s, i) => (
                              <li key={i} className="text-sm text-slate-700 flex gap-3">
                                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                                {s}
                              </li>
                            ))}
                         </ul>
                      </div>
                      <div className="space-y-4">
                         <h4 className="text-sm font-bold text-amber-600 flex items-center gap-2">
                           <AlertCircle className="h-4 w-4" /> Technical & Grammatical Refinement
                         </h4>
                         <ul className="space-y-3">
                            {mentorshipReport?.weaknesses.map((w, i) => (
                              <li key={i} className="text-sm text-slate-700 flex gap-3">
                                <div className="h-1.5 w-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                                {w}
                              </li>
                            ))}
                         </ul>
                      </div>
                   </div>
                </Card>

                <Card className="border-none shadow-xl rounded-3xl p-8 bg-white">
                   <CardTitle className="font-headline flex items-center gap-2 mb-6">
                      <TrendingUp className="h-5 w-5 text-primary" />
                      Mentor's Improvement Roadmap
                   </CardTitle>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {mentorshipReport?.improvementSuggestions.map((s, i) => (
                        <div key={i} className="flex gap-4 items-start p-5 rounded-2xl bg-slate-50 border border-slate-100">
                          <div className="bg-primary text-primary-foreground h-8 w-8 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 shadow-lg shadow-primary/20">
                            {i + 1}
                          </div>
                          <p className="text-sm text-slate-700 leading-relaxed font-medium">{s}</p>
                        </div>
                      ))}
                    </div>
                </Card>

                <Card className="border-none shadow-2xl rounded-3xl overflow-hidden bg-slate-900 text-slate-100">
                   <CardHeader className="p-8 pb-4">
                      <CardTitle className="text-xl font-headline flex items-center gap-2">
                        Professional Answer Blueprint
                      </CardTitle>
                      <CardDescription className="text-slate-400">Compare your response against this high-scoring structural guide.</CardDescription>
                   </CardHeader>
                   <CardContent className="p-8 pt-0">
                      <div className="space-y-4 mt-4">
                        {mentorshipReport?.modelAnswerOutline.map((point, i) => (
                          <div key={i} className="flex gap-4 group">
                             <div className="h-8 w-8 rounded-full bg-white/5 flex items-center justify-center text-xs font-bold text-primary border border-white/10 shrink-0">
                               {i + 1}
                             </div>
                             <p className="text-sm py-1.5 font-medium text-slate-300 leading-relaxed">{point}</p>
                          </div>
                        ))}
                      </div>
                   </CardContent>
                </Card>
             </div>
           </div>
        </div>
      ) : isFlashcardMode ? (
        <div className="max-w-3xl mx-auto space-y-8 animate-in slide-in-from-right-4 duration-500">
           <div className="flex items-center justify-between">
             <div className="flex items-center gap-4">
                <Button variant="ghost" onClick={() => setIsFlashcardMode(false)} className="text-slate-500 hover:text-slate-900">
                  Exit Study
                </Button>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-400">Card {currentFlashIndex + 1} of {result.flashcards?.length}</span>
                  <Progress value={((currentFlashIndex + 1) / (result.flashcards?.length || 1)) * 100} className="w-32 h-1.5" />
                </div>
             </div>
             <div className="flex gap-4">
                <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 border-none font-bold">Mastered: {masteredCount}</Badge>
                <Badge variant="secondary" className="bg-amber-100 text-amber-700 border-none font-bold">Learning: {learningCount}</Badge>
             </div>
          </div>

          <div 
            className="relative h-[450px] w-full [perspective:1000px] cursor-pointer group"
            onClick={() => setIsFlipped(!isFlipped)}
          >
            <div className={cn(
              "relative h-full w-full transition-all duration-700 [transform-style:preserve-3d]",
              isFlipped && "[transform:rotateY(180deg)]"
            )}>
              {/* Front Side */}
              <div className="absolute inset-0 [backface-visibility:hidden]">
                <Card className="h-full w-full border-none shadow-xl rounded-[2rem] flex flex-col items-center justify-center p-12 text-center bg-white border-2 border-slate-50">
                   <Badge className="mb-6 bg-primary/10 text-primary border-none px-4 py-1.5 rounded-full font-bold uppercase tracking-wider text-xs">Question</Badge>
                   <h2 className="text-3xl font-headline font-bold text-slate-900 leading-tight mb-8">
                     {result.flashcards?.[currentFlashIndex].front}
                   </h2>
                   <div className="flex items-center gap-2 text-slate-400 animate-bounce mt-4">
                      <RotateCw className="h-5 w-5" />
                      <span className="text-sm font-medium">Tap to reveal answer</span>
                   </div>
                </Card>
              </div>

              {/* Back Side */}
              <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)]">
                <Card className="h-full w-full border-none shadow-xl rounded-[2rem] flex flex-col items-center justify-center p-12 text-center bg-slate-50 border-2 border-primary/20">
                   <Badge className="mb-6 bg-emerald-100 text-emerald-700 border-none px-4 py-1.5 rounded-full font-bold uppercase tracking-wider text-xs">Answer</Badge>
                   <p className="text-2xl font-medium text-slate-800 leading-relaxed italic">
                     "{result.flashcards?.[currentFlashIndex].back}"
                   </p>
                </Card>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center gap-8">
            {isFlipped && (
              <div className="flex gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
                <Button 
                  onClick={(e) => { e.stopPropagation(); handleCardFeedback('learning'); }}
                  disabled={!!cardStatus[currentFlashIndex]}
                  className={cn(
                    "h-14 px-8 rounded-2xl font-bold transition-all",
                    cardStatus[currentFlashIndex] === 'learning' ? "bg-amber-500 text-white" : "bg-white border-2 border-amber-200 text-amber-600 hover:bg-amber-50"
                  )}
                >
                  Still learning ✗
                </Button>
                <Button 
                  onClick={(e) => { e.stopPropagation(); handleCardFeedback('known'); }}
                  disabled={!!cardStatus[currentFlashIndex]}
                  className={cn(
                    "h-14 px-8 rounded-2xl font-bold transition-all",
                    cardStatus[currentFlashIndex] === 'known' ? "bg-emerald-500 text-white" : "bg-white border-2 border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                  )}
                >
                  I knew it ✓
                </Button>
              </div>
            )}

            <div className="flex items-center gap-6">
              <Button 
                variant="outline" 
                onClick={prevFlashcard} 
                disabled={currentFlashIndex === 0}
                className="h-12 w-12 rounded-full border-slate-200"
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              <Button 
                onClick={nextFlashcard}
                className="h-14 px-12 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-lg shadow-2xl transition-transform hover:scale-105"
              >
                {currentFlashIndex < (result.flashcards?.length || 0) - 1 ? "Next Card" : "Finish Session"}
                <ChevronRight className="ml-2 h-6 w-6" />
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-8 animate-in zoom-in-95 duration-500">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => setResult(null)} className="text-primary font-semibold">
              ← Create New Set
            </Button>
            <div className="flex gap-3">
              {questionType === "Mixed" ? (
                 <Button 
                  onClick={startQuiz}
                  className="rounded-xl px-12 h-12 bg-slate-900 hover:bg-slate-800 text-white font-bold shadow-2xl shadow-slate-900/20"
                >
                  <Sparkles className="mr-2 h-4 w-4 text-primary fill-current" />
                  Start Mentur Journey
                </Button>
              ) : (
                <>
                  <Button 
                    onClick={startFlashcards}
                    className="rounded-xl px-8 h-12 bg-amber-500 hover:bg-amber-600 text-white font-bold shadow-xl shadow-amber-500/20"
                  >
                    <BookOpen className="mr-2 h-4 w-4" />
                    Flashcard Study
                  </Button>
                  <Button 
                    onClick={startQuiz}
                    className="rounded-xl px-8 h-12 bg-primary hover:bg-primary/90 text-white font-bold shadow-xl shadow-primary/20"
                  >
                    <Zap className="mr-2 h-4 w-4 fill-current" />
                    Take Quiz Mode
                  </Button>
                </>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="lg:col-span-2 p-6 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-white p-3 rounded-xl border border-slate-200">
                  <BrainCircuit className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">Generated for {level}</h3>
                  <p className="text-sm text-slate-500">Review your customized academic items below (Answers are hidden until you start).</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Badge variant="secondary" className="bg-white px-3 py-1">{result.mcqs?.length || 0} MCQs</Badge>
                <Badge variant="secondary" className="bg-white px-3 py-1">{result.flashcards?.length || 0} Flashcards</Badge>
                <Badge variant="secondary" className="bg-white px-3 py-1">{result.essayPrompts?.length || 0} Essays</Badge>
              </div>
            </div>

            {result.usage && (
               <Card className="lg:col-span-2 border-none shadow-sm bg-slate-900 text-white rounded-2xl overflow-hidden p-6">
                  <div className="flex items-center justify-between">
                     <div className="flex items-center gap-3">
                        <Cpu className="h-5 w-5 text-primary" />
                        <h4 className="font-bold font-headline">AI Generation usage Report</h4>
                     </div>
                     <Badge className="bg-primary/20 text-primary border-none">Analysis Complete</Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-8 mt-6">
                     <div className="space-y-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Prompt Tokens</p>
                        <p className="text-xl font-black">{result.usage.prompt_tokens}</p>
                     </div>
                     <div className="space-y-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Completion Tokens</p>
                        <p className="text-xl font-black">{result.usage.completion_tokens}</p>
                     </div>
                     <div className="space-y-1">
                        <p className="text-[10px] font-bold text-primary uppercase tracking-widest">Total Tokens</p>
                        <p className="text-xl font-black text-primary">{result.usage.total_tokens}</p>
                     </div>
                  </div>
               </Card>
            )}

            {result.mcqs?.map((mcq, i) => (
              <Card key={i} className="border-none shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center gap-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <HelpCircle className="h-5 w-5 text-blue-600" />
                  </div>
                  <CardTitle className="text-lg">Multiple Choice</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="font-semibold text-slate-900">{mcq.question}</p>
                  <div className="grid grid-cols-1 gap-2">
                    {mcq.options.map((opt, j) => (
                      <div 
                        key={j} 
                        className="p-3 rounded-xl border text-sm bg-slate-50 border-slate-100"
                      >
                        {opt}
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2 italic">
                    <EyeOff className="h-3 w-3" /> Start Quiz to see correct answer
                  </div>
                </CardContent>
              </Card>
            ))}

            {result.flashcards?.map((card, i) => (
              <Card key={i} className="border-none shadow-sm hover:shadow-md transition-shadow bg-amber-50/30">
                <CardHeader className="flex flex-row items-center gap-3">
                  <div className="bg-amber-100 p-2 rounded-lg">
                    <Zap className="h-5 w-5 text-amber-600" />
                  </div>
                  <CardTitle className="text-lg">Flashcard</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-amber-600 uppercase tracking-widest">FRONT</p>
                    <p className="text-lg font-bold text-slate-900">{card.front}</p>
                  </div>
                  <div className="pt-4 border-t border-amber-200/50 space-y-1 opacity-50">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">BACK</p>
                    <div className="flex items-center gap-2 text-sm text-slate-400 italic">
                      <EyeOff className="h-3 w-3" /> Start Flashcard study to reveal answer
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {result.essayPrompts?.map((essay, i) => (
              <Card key={i} className="lg:col-span-2 border-none shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center gap-3">
                  <div className="bg-primary/10 p-2 rounded-lg">
                    <BrainCircuit className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-lg">Essay Prompt</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <p className="text-xl font-bold text-slate-900 leading-tight">{essay.prompt}</p>
                  <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                    <h4 className="text-sm font-bold text-slate-500 mb-4 uppercase tracking-wider">Model Answer Roadmap</h4>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {essay.modelAnswerOutline.map((point, j) => (
                        <li key={j} className="flex gap-3 text-sm text-slate-700">
                          <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}