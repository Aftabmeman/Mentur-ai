
"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  BrainCircuit, 
  Settings2, 
  Zap, 
  CheckCircle2, 
  HelpCircle
} from "lucide-react"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { generateStudyAssessments, type GenerateStudyAssessmentsOutput } from "@/ai/flows/generate-study-assessments-flow"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"

export default function AssessmentsPage() {
  const [material, setMaterial] = useState("")
  const [level, setLevel] = useState("Undergraduate")
  const [difficulty, setDifficulty] = useState<any>("Medium")
  const [count, setCount] = useState(5)
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<GenerateStudyAssessmentsOutput | null>(null)
  const { toast } = useToast()

  const handleGenerate = async () => {
    if (!material) {
      toast({
        title: "Content missing",
        description: "Please provide study material text.",
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)
    try {
      const assessments = await generateStudyAssessments({
        studyMaterial: material,
        assessmentTypes: ["Mixed"],
        academicLevel: level,
        difficulty: difficulty as any,
        questionCount: count
      })
      setResult(assessments)
      toast({
        title: "Assessments Ready",
        description: `Successfully generated ${count} items.`
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

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold font-headline tracking-tight text-slate-900">Assessment Center</h1>
        <p className="text-muted-foreground text-lg">Generate custom quizzes and flashcards from your study materials.</p>
      </div>

      {!result ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle className="font-headline text-xl">Material Input</CardTitle>
                <CardDescription>Paste the text you want to be tested on.</CardDescription>
              </CardHeader>
              <CardContent>
                <textarea 
                  className="w-full min-h-[350px] rounded-xl border border-input bg-background px-4 py-4 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 transition-all resize-none leading-relaxed"
                  placeholder="Paste your study notes, textbook chapters, or articles here..."
                  value={material}
                  onChange={(e) => setMaterial(e.target.value)}
                />
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle className="font-headline text-lg flex items-center gap-2">
                  <Settings2 className="h-5 w-5 text-primary" />
                  Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <label className="text-sm font-medium">Academic Level</label>
                  <Select value={level} onValueChange={setLevel}>
                    <SelectTrigger className="h-11 rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="High School">High School</SelectItem>
                      <SelectItem value="Undergraduate">Undergraduate</SelectItem>
                      <SelectItem value="Postgraduate">Postgraduate</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium">Difficulty Level: <span className="text-primary font-bold">{difficulty}</span></label>
                  <Select value={difficulty} onValueChange={setDifficulty}>
                    <SelectTrigger className="h-11 rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Easy">Easy</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="Hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Question Count</label>
                    <span className="text-primary font-bold text-lg">{count}</span>
                  </div>
                  <Slider 
                    value={[count]} 
                    min={1} 
                    max={20} 
                    step={1} 
                    onValueChange={(val) => setCount(val[0])}
                    className="py-4"
                  />
                </div>

                <div className="pt-4">
                  <Button 
                    className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-md shadow-xl shadow-primary/20"
                    onClick={handleGenerate}
                    disabled={isLoading}
                  >
                    {isLoading ? "Generating..." : "Generate Assessments"}
                    <Zap className="ml-2 h-5 w-5 fill-current" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100 space-y-4">
              <div className="flex gap-2">
                <Badge variant="outline" className="bg-white">MCQ</Badge>
                <Badge variant="outline" className="bg-white">Flashcards</Badge>
                <Badge variant="outline" className="bg-white">Essay Prompts</Badge>
              </div>
              <h4 className="font-bold font-headline text-slate-800">Custom Mixed Mode</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Generates a balanced variety of questions to ensure comprehensive topic mastery across different testing formats.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-8 animate-in zoom-in-95 duration-500">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => setResult(null)} className="text-primary font-semibold">
              ← Create New Set
            </Button>
            <div className="flex gap-2">
              <Button className="rounded-xl px-6 bg-accent hover:bg-accent/90">Take Quiz Mode</Button>
              <Button className="rounded-xl px-6 bg-primary hover:bg-primary/90">Save Set</Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                        className={`p-3 rounded-xl border text-sm transition-colors ${
                          opt === mcq.correctAnswer ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-slate-50 border-slate-100'
                        }`}
                      >
                        {opt}
                      </div>
                    ))}
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
                  <div className="pt-4 border-t border-amber-200/50 space-y-1">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">BACK</p>
                    <p className="text-slate-700 leading-relaxed">{card.back}</p>
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
