
"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Youtube, 
  Loader2, 
  Sparkles, 
  FileText, 
  ClipboardList, 
  ArrowRight,
  Zap,
  Info,
  ExternalLink,
  Target
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { processYoutubeToNotes } from "@/app/actions/youtube-processor"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import confetti from 'canvas-confetti'

export default function YoutubeLabPage() {
  const [url, setUrl] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const { toast } = useToast()

  const handleGenerate = async () => {
    if (!url.includes("youtube.com") && !url.includes("youtu.be")) {
      toast({ title: "Invalid Link", description: "Please provide a valid YouTube URL.", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const data = await processYoutubeToNotes(url);
      if (data.error) {
        toast({ title: "Generation Failed", description: data.error, variant: "destructive" });
      } else {
        setResult(data);
        confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
        toast({ title: "Intelligence Forged", description: `Notes generated using ${data.method} extraction.` });
      }
    } catch (e) {
      toast({ title: "System Error", description: "Something went wrong with the neural link.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full space-y-8 pb-40 animate-in fade-in duration-700 px-4 max-w-2xl mx-auto">
      <div className="px-1 text-center pt-6">
        <h1 className="text-3xl sm:text-5xl font-black font-headline tracking-tighter text-slate-900 dark:text-white uppercase leading-tight">YouTube Lab</h1>
        <p className="text-[9px] font-black text-slate-400 mt-2 tracking-[0.4em] uppercase">Video to Academic Intelligence</p>
      </div>

      <Card className="border-none shadow-3xl rounded-[2.5rem] bg-white dark:bg-slate-900 overflow-hidden relative border border-slate-100 dark:border-white/5">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-red-500 via-primary to-red-500" />
        <CardHeader className="p-8 pb-4 text-center">
          <div className="h-16 w-16 bg-red-100 dark:bg-red-900/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
             <Youtube className="h-8 w-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl font-black font-headline tracking-tight">Audio-Visual Node</CardTitle>
          <CardDescription className="font-medium text-slate-500">Paste any educational video link to extract core logic.</CardDescription>
        </CardHeader>
        <CardContent className="p-8 pt-0 space-y-6">
          <div className="space-y-4">
            <div className="relative">
              <Input 
                placeholder="https://www.youtube.com/watch?v=..." 
                className="h-16 rounded-2xl bg-slate-50 dark:bg-slate-950 border-none px-6 text-base font-medium shadow-inner outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300">
                <ExternalLink className="h-5 w-5" />
              </div>
            </div>

            <Button 
              onClick={handleGenerate} 
              disabled={isLoading || !url} 
              className="w-full h-16 rounded-2xl bg-primary text-white font-black text-lg shadow-xl hover:bg-primary/90 transition-all active:scale-95 group"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                  Extracting Intelligence...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-5 w-5 group-hover:scale-125 transition-transform" />
                  Generate Elite Notes
                </>
              )}
            </Button>
          </div>

          <div className="flex items-center justify-center gap-2 text-[8px] font-black text-slate-300 uppercase tracking-[0.4em]">
             <Zap className="h-3 w-3" /> Powered by Whisper &amp; Llama 3.1
          </div>
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-8 animate-in slide-in-from-bottom-8 duration-700">
          <Card className="border-none shadow-2xl rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 overflow-hidden">
            <CardHeader className="bg-slate-50/50 dark:bg-slate-800/50 border-b dark:border-white/5 p-8 flex flex-row items-center justify-between">
               <div className="flex items-center gap-3">
                  <div className="p-3 bg-primary/10 rounded-xl">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl font-black font-headline tracking-tight">Scholar's Manuscript</CardTitle>
               </div>
               <Badge className="bg-emerald-500/10 text-emerald-500 font-black uppercase text-[8px] tracking-[0.2em] px-4 py-1.5 rounded-full">Success</Badge>
            </CardHeader>
            <CardContent className="p-8 sm:p-10">
              <div className="prose prose-slate dark:prose-invert max-w-none prose-headings:font-headline prose-headings:font-black prose-p:font-medium prose-p:text-slate-600 dark:prose-p:text-slate-300 prose-p:leading-relaxed whitespace-pre-wrap">
                {result.content}
              </div>

              <div className="mt-12 pt-8 border-t border-slate-100 dark:border-white/5 space-y-4">
                <div className="flex items-center gap-2 text-primary">
                   <Target className="h-4 w-4" />
                   <h4 className="text-[10px] font-black uppercase tracking-[0.3em]">Groq Neural Usage (Llama 3.1 8b)</h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                   <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-white/5">
                      <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest mb-1">Input Tokens</p>
                      <p className="text-lg font-black text-slate-900 dark:text-white">{result.tokenUsage.input}</p>
                   </div>
                   <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-white/5">
                      <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest mb-1">Output Tokens</p>
                      <p className="text-lg font-black text-slate-900 dark:text-white">{result.tokenUsage.output}</p>
                   </div>
                   <div className="bg-primary/5 dark:bg-primary/10 p-4 rounded-xl border border-primary/20">
                      <p className="text-[7px] font-black text-primary uppercase tracking-widest mb-1">Total Tokens</p>
                      <p className="text-lg font-black text-primary">{result.tokenUsage.total}</p>
                   </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col items-center gap-4 py-10 opacity-30">
             <div className="h-1 w-20 bg-slate-200 dark:bg-slate-800 rounded-full" />
             <p className="text-[8px] font-black uppercase tracking-[0.5em] text-slate-400 flex items-center gap-2">
                <Info className="h-3 w-3" /> Discate Neural Extraction Sequence End
             </p>
          </div>
        </div>
      )}
    </div>
  )
}
