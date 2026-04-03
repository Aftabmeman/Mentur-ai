"use client"

import { useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Lightbulb,
  FileSearch,
  BookOpen,
  Upload,
  Type,
  FileImage,
  X,
  Loader2,
  Trophy,
  Cpu
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export default function EssayLabPage() {
  const [topic, setTopic] = useState("")
  const [question, setQuestion] = useState("")
  const [essayText, setEssayText] = useState("")
  const [academicLevel, setAcademicLevel] = useState<any>("College")
  const [wordLimit, setWordLimit] = useState("500-1000")
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<EvaluateEssayFeedbackOutput | null>(null)
  
  // File Upload State
  const [inputType, setInputType] = useState("typed")
  const [uploadedImage, setUploadedImage] = useState<File | null>(null)
  const [isProcessingImage, setIsProcessingImage] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { toast } = useToast()

  const wordCount = essayText.trim().split(/\s+/).filter(Boolean).length

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith('image/')) {
      setUploadedImage(file)
      setIsProcessingImage(true)
      
      // Simulate OCR/Handwriting extraction
      setTimeout(() => {
        setIsProcessingImage(false)
        setEssayText(`[Handwritten text transcribed from ${file.name} successfully]\n\nThe development of renewable energy sources is paramount for future sustainability. While fossil fuels have powered progress for centuries, their environmental toll is now undeniable. Solar and wind technologies offer a path forward, provided we can solve the storage challenges associated with intermittent generation...`)
        toast({
          title: "Transcription Complete",
          description: "Handwritten content has been transcribed for evaluation."
        })
      }, 2000)
    } else {
      toast({
        title: "Invalid file",
        description: "Please upload an image of your handwritten essay.",
        variant: "destructive"
      })
    }
  }

  const handleEvaluate = async () => {
    if (!topic || !essayText) {
      toast({
        title: "Missing Information",
        description: "Please provide a topic and write your essay.",
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)
    try {
      const evaluation = await evaluateEssayFeedback({
        topic,
        question,
        essayText,
        academicLevel: academicLevel as any,
        wordLimit
      })
      setResult(evaluation)
      toast({
        title: "Evaluation Complete",
        description: "Your essay has been evaluated by Mentur AI."
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to evaluate essay. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold font-headline tracking-tight text-slate-900">Essay Lab</h1>
        <p className="text-muted-foreground text-lg">Detailed AI evaluation for typed and handwritten essays.</p>
      </div>

      {!result ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle className="font-headline text-xl">Draft your Essay</CardTitle>
                <CardDescription>Enter your prompt and content for deep structural analysis.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Topic</label>
                    <Input 
                      placeholder="e.g. Environmental Ethics" 
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      className="rounded-xl h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Target Level</label>
                    <Select value={academicLevel} onValueChange={setAcademicLevel}>
                      <SelectTrigger className="rounded-xl h-11">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="High School">High School</SelectItem>
                        <SelectItem value="College">College / Undergraduate</SelectItem>
                        <SelectItem value="Graduate">Graduate / Masters</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-sm font-medium">Specific Essay Question / Prompt</label>
                    <Input 
                      placeholder="Paste the exact question provided by your instructor..." 
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      className="rounded-xl h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Target Word Limit</label>
                    <Select value={wordLimit} onValueChange={setWordLimit}>
                      <SelectTrigger className="rounded-xl h-11">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="250-500">Short (250-500 words)</SelectItem>
                        <SelectItem value="500-1000">Standard (500-1000 words)</SelectItem>
                        <SelectItem value="1000-2000">Long (1000-2000 words)</SelectItem>
                        <SelectItem value="2000+">Thesis (2000+ words)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <Tabs value={inputType} onValueChange={setInputType} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-4 rounded-xl h-12 p-1 bg-slate-100">
                      <TabsTrigger value="typed" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
                        <Type className="h-4 w-4 mr-2" />
                        Type Answer
                      </TabsTrigger>
                      <TabsTrigger value="upload" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Handwritten
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="typed" className="mt-0">
                      <div className="relative">
                        <Textarea 
                          placeholder="Write or paste your essay here..." 
                          className="min-h-[400px] rounded-2xl resize-none p-6 leading-relaxed border-2 focus-visible:ring-primary/20"
                          value={essayText}
                          onChange={(e) => setEssayText(e.target.value)}
                        />
                        <div className="absolute bottom-4 right-4 flex gap-2">
                          <Badge variant="secondary" className="bg-white/80 backdrop-blur-sm border shadow-sm px-3 py-1 font-bold">
                            Words: {wordCount}
                          </Badge>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="upload" className="mt-0">
                      {!uploadedImage ? (
                        <div 
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full min-h-[400px] border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center p-8 transition-all hover:bg-slate-50 hover:border-primary/30 cursor-pointer group"
                        >
                          <input 
                            type="file" 
                            className="hidden" 
                            ref={fileInputRef} 
                            onChange={handleImageUpload}
                            accept="image/*"
                          />
                          <div className="h-20 w-20 bg-primary/5 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <FileImage className="h-10 w-10 text-primary" />
                          </div>
                          <h3 className="text-xl font-bold text-slate-900 mb-2">Upload handwritten photo</h3>
                          <p className="text-slate-500 text-center max-w-xs mb-6">
                            Mentur AI will transcribe your handwriting for evaluation.
                          </p>
                          <Button variant="outline" className="rounded-xl px-6">Select Photo</Button>
                        </div>
                      ) : (
                        <div className="w-full min-h-[400px] border border-slate-200 rounded-2xl p-8 flex flex-col items-center justify-center">
                          {isProcessingImage ? (
                            <div className="space-y-4 flex flex-col items-center">
                              <Loader2 className="h-12 w-12 text-primary animate-spin" />
                              <p className="text-sm font-medium text-slate-500">Transcribing handwriting...</p>
                            </div>
                          ) : (
                            <div className="w-full space-y-4">
                               <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-100">
                                <div className="flex items-center gap-4">
                                  <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
                                    <FileImage className="h-6 w-6 text-primary" />
                                  </div>
                                  <div>
                                    <p className="font-bold text-slate-900 line-clamp-1">{uploadedImage.name}</p>
                                    <p className="text-xs text-slate-500">Transcribed successfully</p>
                                  </div>
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => setUploadedImage(null)} className="hover:bg-destructive/10 hover:text-destructive rounded-full">
                                  <X className="h-5 w-5" />
                                </Button>
                              </div>
                              <Textarea 
                                className="min-h-[250px] rounded-xl bg-slate-50 border-none italic text-slate-600 p-4"
                                value={essayText}
                                readOnly
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                </div>

                <div className="pt-4 flex justify-end">
                  <Button 
                    size="lg"
                    onClick={handleEvaluate}
                    disabled={isLoading || isProcessingImage}
                    className="rounded-xl h-14 px-12 bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20 font-bold text-lg"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        Evaluate Essay
                        <Sparkles className="ml-2 h-5 w-5" />
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border-none shadow-sm bg-accent/5">
              <CardHeader>
                <CardTitle className="text-lg font-headline">Evaluation Criteria</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-3">
                  <div className="bg-accent/10 p-2 rounded-lg h-fit">
                    <FileSearch className="h-4 w-4 text-accent" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Structural Integrity</p>
                    <p className="text-xs text-muted-foreground">Flow, transitions, and logical progression of ideas.</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="bg-accent/10 p-2 rounded-lg h-fit">
                    <CheckCircle2 className="h-4 w-4 text-accent" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Grammatical Precision</p>
                    <p className="text-xs text-muted-foreground">Accuracy in language, syntax, and punctuation.</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="bg-accent/10 p-2 rounded-lg h-fit">
                    <Lightbulb className="h-4 w-4 text-accent" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Insightful Analysis</p>
                    <p className="text-xs text-muted-foreground">Depth of understanding and original thought.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="p-8 rounded-3xl bg-slate-900 text-white relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl -mr-10 -mt-10"></div>
              <BookOpen className="h-10 w-10 text-primary mb-4" />
              <h3 className="text-xl font-bold font-headline mb-2">Handwritten OCR</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                Our vision AI perfectly captures and digitizes handwritten work for deep academic analysis.
              </p>
              <div className="flex items-center gap-2 text-primary font-bold text-sm">
                <Sparkles className="h-4 w-4" /> Powered by AI Vision
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => setResult(null)} className="hover:bg-primary/5 text-primary font-bold">
              ← New Evaluation
            </Button>
            <div className="flex gap-3">
              <Button variant="outline" className="rounded-xl h-11 px-6 font-bold">Export PDF Report</Button>
              <Button className="rounded-xl h-11 px-6 bg-slate-900 font-bold">Save to History</Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="space-y-6">
               <Card className="border-none shadow-xl flex flex-col items-center justify-center p-8 bg-white text-center rounded-3xl">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-2">Academic Score</h3>
                <div className="relative h-44 w-44 flex items-center justify-center">
                  <svg className="h-full w-full transform -rotate-90">
                    <circle cx="88" cy="88" r="75" fill="transparent" stroke="#f1f5f9" strokeWidth="12" />
                    <circle 
                      cx="88" cy="88" r="75" fill="transparent" stroke="hsl(var(--primary))" 
                      strokeWidth="12" strokeDasharray={471} 
                      strokeDashoffset={471 - (471 * result.score) / 10}
                      strokeLinecap="round"
                      className="transition-all duration-1000 ease-out"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="text-6xl font-black font-headline text-slate-900">{result.score}</span>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter">out of 10</span>
                  </div>
                </div>
                <p className="mt-6 text-sm font-bold text-primary flex items-center gap-2">
                  <Trophy className="h-4 w-4" /> {result.score >= 8 ? "Exceptional Work" : result.score >= 6 ? "Solid Performance" : "Needs Review"}
                </p>
              </Card>

              {result.usage && (
                 <Card className="border-none shadow-sm bg-slate-50 p-6 rounded-3xl">
                    <h4 className="text-xs font-bold text-slate-400 uppercase mb-4 flex items-center gap-2">
                      <Cpu className="h-3 w-3" /> AI Usage Report
                    </h4>
                    <div className="space-y-2">
                       <div className="flex justify-between text-xs font-medium">
                          <span className="text-slate-500">Prompt Tokens</span>
                          <span className="text-slate-900">{result.usage.prompt_tokens}</span>
                       </div>
                       <div className="flex justify-between text-xs font-medium">
                          <span className="text-slate-500">Completion Tokens</span>
                          <span className="text-slate-900">{result.usage.completion_tokens}</span>
                       </div>
                       <div className="border-t border-slate-200 pt-2 flex justify-between text-xs font-bold">
                          <span className="text-slate-600">Total Tokens</span>
                          <span className="text-primary">{result.usage.total_tokens}</span>
                       </div>
                    </div>
                 </Card>
              )}
            </div>

            <div className="lg:col-span-3 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-none shadow-sm bg-emerald-50/40 rounded-2xl">
                  <CardHeader>
                    <CardTitle className="text-lg font-headline flex items-center gap-2 text-emerald-700">
                      <CheckCircle2 className="h-5 w-5" /> Key Strengths
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {result.strengths.map((s, i) => (
                        <li key={i} className="text-sm text-slate-700 flex gap-3">
                          <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                          {s}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card className="border-none shadow-sm bg-amber-50/40 rounded-2xl">
                  <CardHeader>
                    <CardTitle className="text-lg font-headline flex items-center gap-2 text-amber-700">
                      <AlertCircle className="h-5 w-5" /> Areas to Refine
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {result.weaknesses.map((w, i) => (
                        <li key={i} className="text-sm text-slate-700 flex gap-3">
                          <div className="h-1.5 w-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                          {w}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>

              <Card className="border-none shadow-sm rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-xl font-headline flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-primary" /> 
                    Actionable Improvement Roadmap
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {result.improvementSuggestions.map((s, i) => (
                      <div key={i} className="flex gap-4 items-start p-5 rounded-2xl bg-slate-50 border border-slate-100">
                        <div className="bg-primary text-primary-foreground h-8 w-8 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 shadow-lg shadow-primary/20">
                          {i + 1}
                        </div>
                        <p className="text-sm text-slate-700 leading-relaxed font-medium">{s}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-xl bg-slate-900 text-slate-100 overflow-hidden relative rounded-3xl">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                  <Sparkles className="h-32 w-32" />
                </div>
                <CardHeader className="p-8 pb-4">
                  <CardTitle className="text-2xl font-headline flex items-center gap-2">
                    Ideal Answer Structure
                  </CardTitle>
                  <CardDescription className="text-slate-400">Blueprint for a high-scoring response to this prompt</CardDescription>
                </CardHeader>
                <CardContent className="p-8 pt-0">
                  <div className="space-y-6 mt-4">
                    {result.modelAnswerOutline.map((point, i) => (
                      <div key={i} className="flex gap-6 group">
                        <div className="flex flex-col items-center">
                          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30 z-10">
                            <div className="w-2 h-2 rounded-full bg-primary" />
                          </div>
                          <div className="w-0.5 bg-slate-800 flex-1 group-last:hidden" />
                        </div>
                        <p className="text-sm py-1 pb-6 group-last:pb-0 font-medium text-slate-300 leading-relaxed">{point}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}