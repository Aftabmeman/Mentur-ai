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
  Languages
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
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold font-headline tracking-tight text-slate-900">Study Materials</h1>
        <p className="text-muted-foreground text-lg">Ingest content to generate assessments and track progress.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl font-headline flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Add New Material
              </CardTitle>
              <CardDescription>Upload documents or paste text content directly.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Document Title</label>
                <Input 
                  placeholder="e.g. Bio-Chemistry Midterm Prep" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="rounded-xl h-11"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Subject Category</label>
                  <Select>
                    <SelectTrigger className="rounded-xl h-11">
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
                  <label className="text-sm font-medium">Primary Language</label>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger className="rounded-xl h-11">
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
                <label className="text-sm font-medium">Paste Content</label>
                <Textarea 
                  placeholder="Paste study material text here..." 
                  className="min-h-[250px] rounded-xl resize-none p-4"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                />
              </div>

              <div className="pt-4 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Upload className="h-4 w-4" />
                  <span>Or upload PDF, PPT, Images</span>
                </div>
                <Button 
                  onClick={handleUpload}
                  className="rounded-xl h-11 px-8 bg-primary hover:bg-primary/90 font-semibold shadow-lg shadow-primary/20"
                >
                  Save Material
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-none shadow-sm bg-accent/5 overflow-hidden">
            <CardHeader className="bg-accent/10 border-b border-accent/20">
              <CardTitle className="text-lg font-headline flex items-center gap-2">
                <FileCheck className="h-5 w-5 text-accent" />
                Recent Library
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-accent/10">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="p-5 group hover:bg-white/50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <h4 className="font-semibold text-slate-900 line-clamp-1">Material ID #{i * 1024}</h4>
                        <p className="text-xs text-muted-foreground flex items-center gap-2">
                          <Clock className="h-3 w-3" /> May {i + 12}, 2024
                        </p>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4 bg-accent/5 text-center">
                <Button variant="link" className="text-accent font-semibold text-sm">
                  Browse Full Library
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <div className="p-6 rounded-2xl bg-primary text-primary-foreground space-y-4 shadow-xl shadow-primary/20">
            <Plus className="h-8 w-8" />
            <h3 className="text-xl font-bold font-headline">Ready to learn?</h3>
            <p className="text-primary-foreground/80 text-sm">Once your material is ingested, head over to Assessments to test your knowledge.</p>
            <Button variant="secondary" className="w-full h-11 rounded-xl text-primary font-bold hover:bg-white" asChild>
              <Link href="/dashboard/assessments">Go to Assessments</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

function Clock({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
  )
}
