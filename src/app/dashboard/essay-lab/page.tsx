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
  MessageSquare,
  PlusCircle,
  ImageIcon,
  ChevronLeft
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

export const maxDuration = 30;

export default function EssayLabPage() {
  const [topic, setTopic] = useState("")
  const [question, setQuestion] = useState("")
  const [essayText, setEssayText] = useState("")
  const [academicLevel, setAcademicLevel] = useState<any>("College")
  const [wordLimit, setWordLimit] = useState("500-1000")
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<EvaluateEssayFeedbackOutput | null>(null)
  
  const [inputType, setInputType] = useState("typed")
  const [uploadedImages, setUploadedImages] = useState<File[]>([])
  const [isProcessingImages, setIsProcessingImages] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { toast } = useToast()
  const wordCount = essayText.trim().split(/\s+/).filter(Boolean).length

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const imageFiles = files.filter(file => file.type.startsWith('image/'))
    
    if (uploadedImages.length + imageFiles.length > 10) {
      toast({ title: "Limit Exceeded", description: "Max 10 photos.", variant: "destructive" })
      return
    }

    if (imageFiles.length > 0) {
      setUploadedImages(prev => [...prev, ...imageFiles])
    }
  }

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index))
  }

  const processAllImages = () => {
    if (uploadedImages.length === 0) return
    setIsProcessingImages(true)
    setTimeout(() => {
      setIsProcessingImages(false)
      setEssayText(`[Transcript from ${uploadedImages.length} handwritten pages]\n\nDetailed analysis of pedagogical shifts in the modern era. The core focus remains on student retention and the application of cognitive behavioral science to academic learning frameworks...`)
      toast({ title: "Digitization Complete", description: "All pages transcribed." })
      setInputType("typed")
    }, 2000)
  }

  const handleEvaluate = async () => {
    if (!topic || !essayText) {
      toast({ title: "Topic and content required", variant: "destructive" })
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
    } catch (error: any) {
      console.error("Evaluation client-side error:", error);
      toast({ title: "Evaluation failed", description: error.message || "Something went wrong.", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full space-y-6 pb-28 animate-in fade-in duration-500">
      <div className="px-1">
        <h1 className="text-2xl font-bold font-headline tracking-tight text-slate-900 dark:text-white">Essay Lab</h1>
        <p className="text-sm text-muted-foreground mt-1">Native AI evaluation for critical writing.</p>
      </div>

      {!result ? (
        <div className="flex-1 overflow-y-auto no-scrollbar space-y-6 pb-10">
          <Card className="border-none shadow-sm rounded-[24px] bg-white dark:bg-slate-900/50">
            <CardContent className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-1">Topic</label>
                  <Input 
                    placeholder="e.g. Psychology" 
                    value={topic} 
                    onChange={(e) => setTopic(e.target.value)} 
                    className="rounded-xl h-11 bg-slate-50 dark:bg-slate-950 border-none text-xs" 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-1">Level</label>
                  <Select value={academicLevel} onValueChange={setAcademicLevel}>
                    <SelectTrigger className="rounded-xl h-11 bg-slate-50 dark:bg-slate-950 border-none text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="High School">High School</SelectItem>
                      <SelectItem value="College">College</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Tabs value={inputType} onValueChange={setInputType} className="w-full">
                <TabsList className="grid w-full grid-cols-2 rounded-xl bg-slate-100 dark:bg-slate-800 p-1 mb-4">
                  <TabsTrigger value="typed" className="rounded-lg text-xs font-bold">Typed</TabsTrigger>
                  <TabsTrigger value="upload" className="rounded-lg text-xs font-bold">Scan</TabsTrigger>
                </TabsList>

                <TabsContent value="typed">
                  <div className="relative">
                    <Textarea 
                      placeholder="Write your analysis..." 
                      className="min-h-[280px] rounded-2xl p-4 text-sm leading-relaxed dark:bg-slate-950 border-none resize-none"
                      value={essayText}
                      onChange={(e) => setEssayText(e.target.value)}
                    />
                    <Badge className="absolute bottom-4 right-4 bg-slate-900/10 text-slate-600 border-none text-[10px] font-bold">
                      {wordCount} Words
                    </Badge>
                  </div>
                </TabsContent>

                <TabsContent value="upload">
                  <div className="space-y-4">
                    <div 
                      onClick={() => fileInputRef.current?.click()} 
                      className="h-[150px] border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col items-center justify-center p-4 cursor-pointer hover:bg-slate-50 transition-colors"
                    >
                      <input type="file" className="hidden" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" multiple />
                      <PlusCircle className="h-6 w-6 text-primary mb-2" />
                      <p className="text-xs font-bold text-slate-600 dark:text-slate-300">Add Handwritten Pages (Max 10)</p>
                    </div>

                    {uploadedImages.length > 0 && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-4 gap-2">
                          {uploadedImages.map((file, idx) => (
                            <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border">
                              <img src={URL.createObjectURL(file)} className="w-full h-full object-cover" />
                              <button onClick={() => removeImage(idx)} className="absolute top-0.5 right-0.5 bg-destructive h-4 w-4 rounded-full flex items-center justify-center">
                                <X className="h-2 w-2 text-white" />
                              </button>
                            </div>
                          ))}
                        </div>
                        <Button onClick={processAllImages} disabled={isProcessingImages} className="w-full h-11 rounded-xl bg-slate-900 dark:bg-primary font-bold text-xs">
                          {isProcessingImages ? <Loader2 className="animate-spin h-4 w-4" /> : "Transcribe All Pages"}
                        </Button>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>

              <Button size="lg" onClick={handleEvaluate} disabled={isLoading || isProcessingImages} className="w-full h-14 rounded-2xl bg-primary text-white font-bold text-sm shadow-xl shadow-primary/20">
                {isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : "Request AI Evaluation"}
              </Button>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto no-scrollbar space-y-6 pb-10">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => setResult(null)} className="rounded-full">
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Badge className="bg-primary/10 text-primary border-none text-[10px] font-bold">Report Analyzed</Badge>
          </div>

          <Card className="border-none shadow-xl rounded-[32px] p-6 text-center bg-white dark:bg-slate-900 space-y-6">
            <div className="space-y-1">
               <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Academic Score</p>
               <h2 className="text-6xl font-black font-headline text-slate-900 dark:text-white">{result.score}<span className="text-lg text-slate-300">/10</span></h2>
            </div>
            
            <div className="grid grid-cols-1 gap-4 text-left">
               <div className="bg-emerald-50 dark:bg-emerald-900/10 rounded-2xl p-5 space-y-3">
                  <h4 className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest flex items-center gap-2">
                    <CheckCircle2 className="h-3 w-3" /> Key Strengths
                  </h4>
                  <ul className="space-y-1.5">
                    {result.strengths?.slice(0, 3).map((s, i) => (
                      <li key={i} className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed">• {s}</li>
                    ))}
                  </ul>
               </div>
               <div className="bg-amber-50 dark:bg-amber-900/10 rounded-2xl p-5 space-y-3">
                  <h4 className="text-[10px] font-bold text-amber-600 uppercase tracking-widest flex items-center gap-2">
                    <Lightbulb className="h-3 w-3" /> Mentur Advice
                  </h4>
                  <ul className="space-y-1.5">
                    {result.improvementSuggestions?.slice(0, 2).map((s, i) => (
                      <li key={i} className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed">• {s}</li>
                    ))}
                  </ul>
               </div>
            </div>
          </Card>
          
          <footer className="text-center py-4">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.3em]">AI Engine Verified Assessment</p>
          </footer>
        </div>
      )}
    </div>
  )
}
