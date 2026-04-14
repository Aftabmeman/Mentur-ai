"use client"

import { useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { 
  Sparkles, 
  CheckCircle2, 
  Lightbulb,
  FileSearch,
  Upload,
  Type,
  X,
  Loader2,
  Trophy,
  PlusCircle,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  BookOpen,
  SendHorizontal,
  Eye,
  FileText
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
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export const maxDuration = 30;

export default function WritingWizardPage() {
  const [step, setStep] = useState(1)
  const [question, setQuestion] = useState("")
  const [academicLevel, setAcademicLevel] = useState<any>("UG Year 1")
  const [chapterName, setChapterName] = useState("")
  const [essayText, setEssayText] = useState("")
  const [uploadedImages, setUploadedImages] = useState<File[]>([])
  
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<EvaluateEssayFeedbackOutput | null>(null)
  const [showModelAnswer, setShowModelAnswer] = useState(false)
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const imageFiles = files.filter(file => file.type.startsWith('image/'))
    
    if (uploadedImages.length + imageFiles.length > 5) {
      toast({ title: "Limit Exceeded", description: "Strict limit of 5 photos.", variant: "destructive" })
      return
    }
    setUploadedImages(prev => [...prev, ...imageFiles])
  }

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index))
  }

  const handleEvaluate = async () => {
    setIsLoading(true)
    try {
      const evaluation = await evaluateEssayFeedback({
        topic: chapterName || "General Practice",
        question: question,
        essayText: essayText || "[Handwritten Answer Uploaded]",
        academicLevel: academicLevel as any,
      })
      if (evaluation.error) {
        toast({ title: "Analysis Failed", description: evaluation.error, variant: "destructive" });
      } else {
        setResult(evaluation)
        setStep(5)
        toast({ title: "Analysis Complete", description: "Your response has been evaluated by AI." })
      }
    } catch (error: any) {
      toast({ title: "Error", description: "Something went wrong during evaluation.", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  const levels = [
    'Class 8th', 'Class 9th', 'Class 10th', 'Class 11th', 'Class 12th',
    'Undergraduate Year 1', 'Undergraduate Year 2', 'Undergraduate Year 3',
    'Competitive Exams (UPSC)', 'Competitive Exams (JEE/NEET)', 'Competitive Exams (CAT/CLAT/SSC/NDA)'
  ]

  return (
    <div className="flex flex-col h-full space-y-6 pb-28 animate-in fade-in duration-500">
      <div className="px-1 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-headline tracking-tight text-slate-900 dark:text-white">Self-Practice</h1>
          <p className="text-sm text-muted-foreground mt-1">Writing wizard for structured mastery.</p>
        </div>
        {step < 5 && (
          <div className="flex gap-1">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className={cn("h-1.5 w-4 rounded-full transition-all", step >= s ? "bg-primary" : "bg-slate-200")} />
            ))}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar space-y-6">
        {step === 1 && (
          <Card className="border-none shadow-xl rounded-[32px] bg-white dark:bg-slate-900 animate-in slide-in-from-right-4">
            <CardHeader className="p-8">
              <CardTitle className="text-xl font-headline flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Type className="h-5 w-5 text-primary" />
                </div>
                Step 1: Your Question
              </CardTitle>
              <CardDescription>What question are you practicing today?</CardDescription>
            </CardHeader>
            <CardContent className="p-8 pt-0 space-y-6">
              <Textarea 
                placeholder="Write or paste your practice question here..."
                className="min-h-[200px] rounded-2xl p-5 text-sm dark:bg-slate-950 border-none bg-slate-50 resize-none leading-relaxed"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
              />
              <Button 
                onClick={() => setStep(2)} 
                disabled={!question.trim()}
                className="w-full h-14 rounded-2xl bg-primary text-white font-bold text-lg shadow-xl shadow-primary/20"
              >
                Continue <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <Card className="border-none shadow-xl rounded-[32px] bg-white dark:bg-slate-900 animate-in slide-in-from-right-4">
            <CardHeader className="p-8">
              <CardTitle className="text-xl font-headline flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-amber-100 flex items-center justify-center">
                  <GraduationCap className="h-5 w-5 text-amber-600" />
                </div>
                Step 2: Profile Context
              </CardTitle>
              <CardDescription>Help us understand your academic target.</CardDescription>
            </CardHeader>
            <CardContent className="p-8 pt-0 space-y-8">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Which class/level are you in?</label>
                  <Select value={academicLevel} onValueChange={setAcademicLevel}>
                    <SelectTrigger className="h-14 rounded-2xl bg-slate-50 dark:bg-slate-950 border-none font-bold">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {levels.map(lvl => (
                        <SelectItem key={lvl} value={lvl} className="font-bold">{lvl}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Chapter Name / Topic</label>
                  <Input 
                    placeholder="e.g. Quantum Mechanics" 
                    className="h-14 rounded-2xl bg-slate-50 dark:bg-slate-950 border-none font-bold"
                    value={chapterName}
                    onChange={(e) => setChapterName(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <Button variant="ghost" onClick={() => setStep(1)} className="h-14 w-14 rounded-2xl bg-slate-50 dark:bg-slate-800">
                  <ChevronLeft className="h-6 w-6" />
                </Button>
                <Button onClick={() => setStep(3)} className="flex-1 h-14 rounded-2xl bg-primary text-white font-bold">
                  Next Step <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 3 && (
          <Card className="border-none shadow-xl rounded-[32px] bg-white dark:bg-slate-900 animate-in slide-in-from-right-4">
            <CardHeader className="p-8">
              <CardTitle className="text-xl font-headline flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-emerald-100 flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-emerald-600" />
                </div>
                Step 3: Submit Answer
              </CardTitle>
              <CardDescription>Upload handwritten photos (Limit 5) or type your response.</CardDescription>
            </CardHeader>
            <CardContent className="p-8 pt-0 space-y-6">
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="h-40 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col items-center justify-center p-6 cursor-pointer hover:bg-slate-50 transition-colors bg-slate-50/50"
              >
                <input type="file" className="hidden" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" multiple />
                <PlusCircle className="h-8 w-8 text-primary mb-2" />
                <p className="text-xs font-bold text-slate-500">Add Handwritten Pages</p>
              </div>

              {uploadedImages.length > 0 && (
                <div className="grid grid-cols-5 gap-2">
                  {uploadedImages.map((file, idx) => (
                    <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border">
                      <img src={URL.createObjectURL(file)} className="w-full h-full object-cover" />
                      <button onClick={() => removeImage(idx)} className="absolute top-1 right-1 bg-destructive h-5 w-5 rounded-full flex items-center justify-center">
                        <X className="h-3 w-3 text-white" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">OR Type Response</label>
                <Textarea 
                  placeholder="Start typing your answer here..."
                  className="min-h-[150px] rounded-2xl p-5 text-sm dark:bg-slate-950 border-none bg-slate-50 resize-none"
                  value={essayText}
                  onChange={(e) => setEssayText(e.target.value)}
                />
              </div>

              <div className="flex gap-3">
                <Button variant="ghost" onClick={() => setStep(2)} className="h-14 w-14 rounded-2xl bg-slate-50 dark:bg-slate-800">
                  <ChevronLeft className="h-6 w-6" />
                </Button>
                <Button 
                  onClick={() => setStep(4)} 
                  disabled={!essayText.trim() && uploadedImages.length === 0}
                  className="flex-1 h-14 rounded-2xl bg-primary text-white font-bold"
                >
                  Final Review <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 4 && (
          <Card className="border-none shadow-xl rounded-[32px] bg-white dark:bg-slate-900 animate-in zoom-in-95">
            <CardHeader className="p-8 text-center">
              <div className="bg-primary/10 h-20 w-20 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <Sparkles className="h-10 w-10 text-primary" />
              </div>
              <CardTitle className="text-2xl font-headline">Ready for Analysis?</CardTitle>
              <CardDescription>Mentur AI Professor will now evaluate structure, grammar, and content.</CardDescription>
            </CardHeader>
            <CardContent className="p-8 pt-0 space-y-6">
              <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-3xl space-y-3">
                 <div className="flex justify-between items-center">
                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Question</span>
                   <Badge className="bg-primary/10 text-primary border-none text-[9px]">{academicLevel}</Badge>
                 </div>
                 <p className="text-sm font-bold line-clamp-2">{question}</p>
                 <div className="pt-2 flex gap-4">
                   <div className="text-center">
                     <p className="text-[9px] text-slate-400 font-black uppercase">Photos</p>
                     <p className="text-lg font-black">{uploadedImages.length}</p>
                   </div>
                   <div className="text-center">
                     <p className="text-[9px] text-slate-400 font-black uppercase">Words</p>
                     <p className="text-lg font-black">{essayText.split(/\s+/).filter(Boolean).length}</p>
                   </div>
                 </div>
              </div>
              
              <Button 
                onClick={handleEvaluate} 
                disabled={isLoading}
                className="w-full h-16 rounded-3xl bg-slate-900 dark:bg-primary text-white font-black text-lg shadow-2xl shadow-primary/30"
              >
                {isLoading ? <Loader2 className="h-6 w-6 animate-spin mr-3" /> : <SendHorizontal className="h-6 w-6 mr-3" />}
                {isLoading ? "Analyzing..." : "Analyze Now"}
              </Button>
            </CardContent>
          </Card>
        )}

        {step === 5 && result && (
          <div className="animate-in slide-in-from-bottom-8 duration-700 space-y-6 pb-20">
            <Card className="border-none shadow-2xl rounded-[40px] p-10 text-center bg-white dark:bg-slate-900 space-y-8">
              <div className="space-y-1">
                 <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Mastery Score</p>
                 <h2 className="text-7xl font-black font-headline text-slate-900 dark:text-white">{result.score}<span className="text-2xl text-slate-300">/10</span></h2>
                 <Badge className="bg-emerald-500 text-white border-none px-4 py-1 mt-2">+5 Coins Earned</Badge>
              </div>

              <div className="grid grid-cols-1 gap-4 text-left">
                {[
                  { title: "Introduction", content: result.feedbackBySection.introduction, color: "text-blue-500", bg: "bg-blue-50" },
                  { title: "Main Body", content: result.feedbackBySection.mainBody, color: "text-primary", bg: "bg-primary/5" },
                  { title: "Conclusion", content: result.feedbackBySection.conclusion, color: "text-emerald-500", bg: "bg-emerald-50" },
                  { title: "Grammar & Vocab", content: result.feedbackBySection.grammarAndVocabulary, color: "text-amber-500", bg: "bg-amber-50" }
                ].map((sec, i) => (
                  <div key={i} className={cn("p-6 rounded-3xl border border-slate-100 dark:border-slate-800", sec.bg)}>
                    <h4 className={cn("text-[10px] font-black uppercase tracking-widest mb-2", sec.color)}>{sec.title}</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">{sec.content}</p>
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => {setResult(null); setStep(1)}} className="flex-1 h-14 rounded-2xl font-bold">New Practice</Button>
                <Button 
                  onClick={() => setShowModelAnswer(!showModelAnswer)} 
                  className="flex-1 h-14 rounded-2xl bg-slate-900 dark:bg-primary font-bold gap-2"
                >
                  <Eye className="h-5 w-5" />
                  {showModelAnswer ? "Hide Model Answer" : "See Model Answer"}
                </Button>
              </div>
            </Card>

            {showModelAnswer && (
              <Card className="border-none shadow-2xl rounded-[32px] p-10 space-y-8 bg-slate-900 text-white animate-in zoom-in-95 duration-500">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center">
                    <Sparkles className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">Professor's Rewrite</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">A perfectly formatted version of your answer</p>
                  </div>
                </div>
                
                <div className="prose prose-invert prose-sm max-w-none">
                  <p className="text-sm leading-relaxed text-slate-300 whitespace-pre-wrap italic">
                    {result.suggestedRewrite}
                  </p>
                </div>
                
                <div className="pt-6 border-t border-white/10 space-y-4">
                  <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Critical Structural Points:</h4>
                  <ul className="grid grid-cols-1 gap-3">
                    {result.modelAnswerOutline.map((point, i) => (
                      <li key={i} className="flex gap-3 items-start text-xs font-medium">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  )
}