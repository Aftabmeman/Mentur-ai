
"use client"

import { useState } from "react"
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
  BookOpen
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

export default function EssayLabPage() {
  const [topic, setTopic] = useState("")
  const [essayText, setEssayText] = useState("")
  const [academicLevel, setAcademicLevel] = useState<any>("Undergraduate")
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<EvaluateEssayFeedbackOutput | null>(null)
  const { toast } = useToast()

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
        essayText,
        academicLevel: academicLevel as any
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
                <CardDescription>Enter your content below for deep structural analysis.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Topic / Prompt</label>
                    <Input 
                      placeholder="e.g. Impact of AI on Modern Education" 
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
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Essay Content</label>
                  <Textarea 
                    placeholder="Write or paste your essay here..." 
                    className="min-h-[400px] rounded-xl resize-none p-6 leading-relaxed"
                    value={essayText}
                    onChange={(e) => setEssayText(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground text-right">Words: {essayText.trim().split(/\s+/).filter(Boolean).length}</p>
                </div>

                <div className="pt-4 flex justify-end">
                  <Button 
                    size="lg"
                    onClick={handleEvaluate}
                    disabled={isLoading}
                    className="rounded-xl h-12 px-10 bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20 font-bold"
                  >
                    {isLoading ? "Analyzing..." : "Evaluate Essay"}
                    <Sparkles className="ml-2 h-5 w-5" />
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
              <h3 className="text-xl font-bold font-headline mb-2">Did you know?</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                Students who review AI feedback on their essays see an average improvement of 15% in their next assignment.
              </p>
              <Button variant="outline" className="w-full border-slate-700 hover:bg-slate-800 rounded-xl h-11 font-semibold transition-all">
                View Sample Essays
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => setResult(null)} className="hover:bg-primary/5 text-primary">
              ← New Evaluation
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" className="rounded-xl h-10 px-6">Export PDF</Button>
              <Button className="rounded-xl h-10 px-6 bg-primary">Save to History</Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <Card className="border-none shadow-sm flex flex-col items-center justify-center p-8 bg-white text-center">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Overall Score</h3>
              <div className="relative h-40 w-40 flex items-center justify-center">
                <svg className="h-full w-full transform -rotate-90">
                  <circle cx="80" cy="80" r="70" fill="transparent" stroke="#f1f5f9" strokeWidth="12" />
                  <circle 
                    cx="80" cy="80" r="70" fill="transparent" stroke="hsl(var(--primary))" 
                    strokeWidth="12" strokeDasharray={440} 
                    strokeDashoffset={440 - (440 * result.score) / 100}
                    strokeLinecap="round"
                  />
                </svg>
                <span className="absolute text-5xl font-black font-headline text-slate-900">{result.score}</span>
              </div>
              <p className="mt-4 text-sm font-medium text-slate-500 italic">"Excellent command of subject material."</p>
            </Card>

            <div className="lg:col-span-3 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-none shadow-sm bg-emerald-50/50">
                  <CardHeader>
                    <CardTitle className="text-lg font-headline flex items-center gap-2 text-emerald-700">
                      <CheckCircle2 className="h-5 w-5" /> Strengths
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {result.strengths.map((s, i) => (
                        <li key={i} className="text-sm text-slate-700 flex gap-2">
                          <span className="text-emerald-500 font-bold">•</span> {s}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card className="border-none shadow-sm bg-amber-50/50">
                  <CardHeader>
                    <CardTitle className="text-lg font-headline flex items-center gap-2 text-amber-700">
                      <AlertCircle className="h-5 w-5" /> Areas to Improve
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {result.weaknesses.map((w, i) => (
                        <li key={i} className="text-sm text-slate-700 flex gap-2">
                          <span className="text-amber-500 font-bold">•</span> {w}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>

              <Card className="border-none shadow-sm">
                <CardHeader>
                  <CardTitle className="text-xl font-headline flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-primary" /> 
                    Actionable Improvement Roadmap
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {result.improvementSuggestions.map((s, i) => (
                      <div key={i} className="flex gap-4 items-start p-4 rounded-xl bg-slate-50 border-l-4 border-primary/40">
                        <div className="bg-primary text-primary-foreground h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0">
                          {i + 1}
                        </div>
                        <p className="text-sm text-slate-700 leading-relaxed">{s}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm bg-slate-900 text-slate-100 overflow-hidden relative">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <Sparkles className="h-20 w-20" />
                </div>
                <CardHeader>
                  <CardTitle className="text-xl font-headline flex items-center gap-2">
                    Model Answer Outline
                  </CardTitle>
                  <CardDescription className="text-slate-400">Structural guide for a perfect response</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {result.modelAnswerOutline.map((point, i) => (
                      <div key={i} className="flex gap-4 group">
                        <div className="w-px bg-slate-700 relative h-auto">
                          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-primary ring-4 ring-slate-900"></div>
                        </div>
                        <p className="text-sm py-1 pb-4 group-last:pb-0">{point}</p>
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
