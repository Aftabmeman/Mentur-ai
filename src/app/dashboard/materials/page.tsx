
"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import Link from "next/link"
import { 
  Upload, 
  FileText, 
  Plus, 
  Globe, 
  Trash2, 
  FileCheck,
  Languages,
  Clock,
  Inbox
} from "lucide-react"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

export default function MaterialsPage() {
  const [title, setTitle] = useState("")
  const [text, setText] = useState("")
  const [language, setLanguage] = useState("english")
  const { toast } = useToast()

  const materials: any[] = []

  const handleUpload = () => {
    if (!title || !text) {
      toast({
        title: "Missing fields",
        description: "Please provide a title and study content.",
        variant: "destructive"
      })
      return
    }
    
    toast({
      title: "Material Saved",
      description: "Your study material has been added successfully."
    })
    
    setTitle("")
    setText("")
  }

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold font-headline tracking-tight text-slate-900 dark:text-white">Study Materials</h1>
        <p className="text-muted-foreground text-lg dark:text-slate-400">Ingest content to generate assessments and track progress.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-none shadow-sm rounded-[28px] dark:bg-slate-900/50">
            <CardHeader className="p-8 pb-0">
              <CardTitle className="text-xl font-headline flex items-center gap-2 text-slate-900 dark:text-white">
                <FileText className="h-5 w-5 text-primary" />
                Add New Material
              </CardTitle>
              <CardDescription className="dark:text-slate-400">Upload documents or paste text content directly.</CardDescription>
            </CardHeader>
            <CardContent className="p-8 pt-6 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-1">Document Title</label>
                <Input 
                  placeholder="e.g. Bio-Chemistry Midterm Prep" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="rounded-2xl h-12 dark:bg-slate-950 dark:border-slate-800 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-1">Subject Category</label>
                  <Select>
                    <SelectTrigger className="rounded-2xl h-12 dark:bg-slate-950 dark:border-slate-800 dark:text-white">
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="science">Science</SelectItem>
                      <SelectItem value="math">Mathematics</SelectItem>
                      <SelectItem value="history">History</SelectItem>
                      <SelectItem value="literature">Literature</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-1">Primary Language</label>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger className="rounded-2xl h-12 dark:bg-slate-950 dark:border-slate-800 dark:text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="english">
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4" /> English
                        </div>
                      </SelectItem>
                      <SelectItem value="hindi">
                        <div className="flex items-center gap-2">
                          <Languages className="h-4 w-4" /> Hindi (हिन्दी)
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-1">Paste Content</label>
                <Textarea 
                  placeholder="Paste study material text here..." 
                  className="min-h-[250px] rounded-2xl resize-none p-4 dark:bg-slate-950 dark:border-slate-800 dark:text-white"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                />
              </div>

              <div className="pt-4 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                  <Upload className="h-4 w-4" />
                  <span>Cloud Ready</span>
                </div>
                <Button 
                  onClick={handleUpload}
                  className="rounded-2xl h-14 px-10 bg-primary hover:bg-primary/90 font-bold shadow-lg shadow-primary/20"
                >
                  Save Material
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-none shadow-sm rounded-[28px] overflow-hidden dark:bg-slate-900/50">
            <CardHeader className="bg-slate-50/50 border-b dark:bg-slate-800/50 dark:border-slate-800 p-6">
              <CardTitle className="text-lg font-headline flex items-center gap-2 text-slate-900 dark:text-white">
                <FileCheck className="h-5 w-5 text-accent" />
                Library
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="p-12 text-center flex flex-col items-center justify-center">
                <Inbox className="h-8 w-8 text-slate-300 dark:text-slate-700 mb-2" />
                <p className="text-sm text-slate-500 font-medium dark:text-slate-400">Library is empty.</p>
              </div>
            </CardContent>
          </Card>
          
          <div className="p-8 rounded-[32px] bg-slate-900 text-white space-y-4 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl -mr-16 -mt-16" />
            <Plus className="h-10 w-10 text-primary" />
            <h3 className="text-2xl font-bold font-headline leading-tight">Ready to learn?</h3>
            <p className="text-slate-400 text-sm">Once your material is ingested, head over to Assessments to test your knowledge.</p>
            <Button variant="secondary" className="w-full h-14 rounded-2xl text-slate-900 font-bold bg-white hover:bg-white/90 relative z-10" asChild>
              <Link href="/dashboard/assessments">Go to Assessments</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
