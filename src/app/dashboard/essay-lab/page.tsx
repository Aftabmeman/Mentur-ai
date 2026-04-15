"use client"

import { useState, useRef } from "react"
import { useAuth } from "@/components/providers/AuthProvider"
import { useTheme } from "@/components/providers/ThemeProvider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { 
  Type, 
  Loader2, 
  PlusCircle, 
  ChevronLeft, 
  ChevronRight, 
  GraduationCap, 
  BookOpen, 
  SendHorizontal, 
  Coins,
  Trophy,
  CheckCircle2
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
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import confetti from 'canvas-confetti'

export const maxDuration = 60;

const academicLevels = [
  "Class 8th", "Class 9th", "Class 10th", "Class 11th", "Class 12th",
  "Undergraduate Year 1", "Undergraduate Year 2", "Undergraduate Year 3",
  "UPSC", "JEE", "NEET", "GATE", "CAT", "CLAT", "SSC", "NDA"
];

export default function WritingWizardPage() {
  const { user } = useAuth()
  const { toast } = useToast()

  const [step, setStep] = useState(1)
  const [question, setQuestion] = useState("")
  const [academicLevel, setAcademicLevel] = useState<string>("Class 10th")
  const [chapterName, setChapterName] = useState("")
  const [essayText, setEssayText] = useState("")
  const [uploadedImages, setUploadedImages] = useState<File[]>([])
  
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<EvaluateEssayFeedbackOutput | null>(null)
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleEvaluate = async () => {
    if (!essayText.trim() && uploadedImages.length === 0) {
      toast({ title: "Content Missing", description: "Please type or upload your work.", variant: "destructive" })
      return
    }

    setIsLoading(true)
    try {
      const evaluation = await evaluateEssayFeedback({
        topic: chapterName || "Self Practice Session",
        question: question,
        essayText: essayText || "[Handwritten scanned photos provided]",
        academicLevel: academicLevel,
      })

      if (evaluation.error) {
        toast({ title: "Analysis Failed", description: evaluation.error, variant: "destructive" })
      } else {
        setResult(evaluation)
        setStep(5)
        confetti({ particleCount: 200, spread: 90, origin: { y: 0.7 } })
      }
    } catch (error: any) {
      toast({ title: "Critical Error", description: "Professor is busy. Try again.", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full space-y-6 pb-28 animate-in fade-in duration-500">
      <div className="px-1 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-headline tracking-tight text-slate-900 dark:text-white">Self-Practice Lab</h1>
          <p className="text-xs text-muted-foreground mt-1">Evaluator: Master Professor</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar space-y-6">
        {step === 1 && (
          <Card className="border-none shadow-xl rounded-[32px] bg-white dark:bg-slate-900">
            <CardHeader className="p-8 pb-4"><CardTitle className="text-lg font-headline flex items-center gap-3"><div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center"><Type className="h-5 w-5 text-primary" /></div>1: The Prompt</CardTitle></CardHeader>
            <CardContent className="p-8 pt-0 space-y-6">
              <Textarea placeholder="Paste the question you are practicing..." className="min-h-[200px] rounded-2xl p-5 text-sm dark:bg-slate-950 border-none bg-slate-50 dark:text-white resize-none leading-relaxed" value={question} onChange={(e) => setQuestion(e.target.value)} />
              <Button onClick={() => setStep(2)} disabled={!question.trim()} className="w-full h-14 rounded-2xl bg-primary text-white font-bold text-lg">Set Context <ChevronRight className="ml-2 h-5 w-5" /></Button>
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <Card className="border-none shadow-xl rounded-[32px] bg-white dark:bg-slate-900">
            <CardHeader className="p-8 pb-4"><CardTitle className="text-lg font-headline flex items-center gap-3"><div className="h-10 w-10 rounded-2xl bg-amber-100 flex items-center justify-center"><GraduationCap className="h-5 w-5 text-amber-600" /></div>2: Profile</CardTitle></CardHeader>
            <CardContent className="p-8 pt-0 space-y-8">
              <div className="space-y-4">
                <div className="space-y-2"><label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Class / Level</label>
                  <Select value={academicLevel} onValueChange={setAcademicLevel}>
                    <SelectTrigger className="h-14 rounded-2xl bg-slate-50 dark:bg-slate-950 border-none font-bold dark:text-white"><SelectValue /></SelectTrigger>
                    <SelectContent className="rounded-2xl">{academicLevels.map(lvl => <SelectItem key={lvl} value={lvl}>{lvl}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2"><label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Chapter</label>
                  <Input placeholder="e.g. Political Science" className="h-14 rounded-2xl bg-slate-50 dark:bg-slate-950 border-none font-bold dark:text-white" value={chapterName} onChange={(e) => setChapterName(e.target.value)} />
                </div>
              </div>
              <div className="flex gap-3">
                <Button variant="ghost" onClick={() => setStep(1)} className="h-14 w-14 rounded-2xl bg-slate-50 dark:bg-slate-800 shrink-0"><ChevronLeft className="h-6 w-6 dark:text-white" /></Button>
                <Button onClick={() => setStep(3)} className="flex-1 h-14 rounded-2xl bg-primary text-white font-bold">Next <ChevronRight className="ml-2 h-5 w-5" /></Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 3 && (
          <Card className="border-none shadow-xl rounded-[32px] bg-white dark:bg-slate-900">
            <CardHeader className="p-8 pb-4"><CardTitle className="text-lg font-headline flex items-center gap-3"><div className="h-10 w-10 rounded-2xl bg-emerald-100 flex items-center justify-center"><BookOpen className="h-5 w-5 text-emerald-600" /></div>3: Submit</CardTitle></CardHeader>
            <CardContent className="p-8 pt-0 space-y-6">
              <div onClick={() => fileInputRef.current?.click()} className="h-32 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col items-center justify-center p-4 cursor-pointer hover:bg-slate-50 dark:bg-slate-950">
                <input type="file" className="hidden" ref={fileInputRef} onChange={(e) => { const files = Array.from(e.target.files || []); setUploadedImages(prev => [...prev, ...files].slice(0, 5)); }} accept="image/*" multiple />
                <PlusCircle className="h-6 w-6 text-primary mb-2" /><p className="text-[10px] font-bold text-slate-500 uppercase">Upload Photos</p>
                {uploadedImages.length > 0 && <p className="text-[9px] font-bold text-emerald-500 mt-1">{uploadedImages.length} images ready</p>}
              </div>
              <Textarea placeholder="OR type your answer here..." className="min-h-[150px] rounded-2xl p-5 bg-slate-50 dark:bg-slate-950 border-none dark:text-white text-sm" value={essayText} onChange={(e) => setEssayText(e.target.value)} />
              <Button onClick={handleEvaluate} disabled={isLoading} className="w-full h-14 rounded-2xl bg-primary text-white font-bold">
                {isLoading ? <Loader2 className="animate-spin h-5 w-5 mr-2" /> : <SendHorizontal className="h-5 w-5 mr-2" />}
                Evaluate Result
              </Button>
            </CardContent>
          </Card>
        )}

        {step === 5 && result && (
          <div className="space-y-6 pb-20 animate-in slide-in-from-bottom-8">
            <Card className="border-none shadow-2xl rounded-[40px] p-8 text-center bg-white dark:bg-slate-900 space-y-6">
              <Badge variant="outline" className="border-primary/20 text-primary uppercase font-black text-[9px] tracking-widest px-3 py-1 mx-auto">EVALUATION_DATA</Badge>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border">
                   <p className="text-[10px] font-bold text-slate-400 uppercase">Essay Score</p>
                   <h2 className="text-4xl font-black text-slate-900 dark:text-white">{result.evaluationData.essayScoreRaw}%</h2>
                </div>
                <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-2xl border border-amber-100 dark:border-amber-800">
                   <div className="flex items-center justify-center gap-1.5 mb-1"><Coins className="h-4 w-4 text-amber-500" /><p className="text-[10px] font-bold text-amber-600 uppercase">Coins Earned</p></div>
                   <h2 className="text-4xl font-black text-amber-700 dark:text-amber-400">{result.evaluationData.coinsEarned}</h2>
                </div>
              </div>
              <div className={cn("p-4 rounded-2xl border", result.evaluationData.status === 'Mastered' ? "bg-emerald-50 border-emerald-100 text-emerald-700" : "bg-primary/5 border-primary/10 text-primary")}>
                 <p className="text-[10px] font-bold uppercase">Status</p>
                 <h2 className="text-xl font-black">{result.evaluationData.status}</h2>
              </div>
              
              <Accordion type="single" collapsible className="w-full space-y-3">
                <AccordionItem value="feedback" className="border-none">
                   <AccordionTrigger className="h-14 bg-slate-50 dark:bg-slate-950 px-6 rounded-2xl hover:no-underline font-bold text-sm">PROFESSOR_FEEDBACK</AccordionTrigger>
                   <AccordionContent className="pt-4 text-left italic text-xs text-slate-600 dark:text-slate-300 leading-relaxed px-4 max-h-[400px] overflow-y-auto no-scrollbar">
                      "{result.professorFeedback}"
                   </AccordionContent>
                </AccordionItem>
                <AccordionItem value="masterclass" className="border-none">
                   <AccordionTrigger className="h-14 bg-slate-900 text-white px-6 rounded-2xl hover:no-underline font-bold text-sm">Masterclass Rewrite</AccordionTrigger>
                   <AccordionContent className="pt-4 text-left">
                      <div className="bg-slate-900 text-white p-6 rounded-3xl text-xs leading-relaxed italic border border-white/10 whitespace-pre-wrap max-h-[500px] overflow-y-auto no-scrollbar">
                        {result.suggestedRewrite}
                      </div>
                   </AccordionContent>
                </AccordionItem>
              </Accordion>

              <Button variant="outline" onClick={() => setStep(1)} className="w-full h-14 rounded-2xl font-bold dark:border-slate-800">New Practice</Button>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
