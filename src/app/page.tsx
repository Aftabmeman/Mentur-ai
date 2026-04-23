
'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { 
  ChevronRight, 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  GraduationCap, 
  FileEdit, 
  BrainCircuit,
  ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DiscateLogo } from "@/components/DiscateLogo";
import Link from "next/link";

export default function Home() {
  const router = useRouter();
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (showSplash) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-slate-950 overflow-hidden">
        <div className="relative flex flex-col items-center animate-in zoom-in-95 duration-1000">
          <DiscateLogo size="xl" />
          <div className="mt-8 text-center space-y-2">
            <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.4em] animate-pulse">
              Academic Intelligence
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFD] dark:bg-slate-950 font-body transition-colors duration-500">
      {/* Navigation */}
      <nav className="h-20 border-b bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl sticky top-0 z-50 flex items-center justify-between px-6 md:px-12">
        <DiscateLogo size="sm" />
        <div className="flex items-center gap-4">
          <Button variant="ghost" className="font-bold text-slate-600 dark:text-slate-300" asChild>
            <Link href="/login">Login</Link>
          </Button>
          <Button className="bg-primary hover:bg-primary/90 rounded-xl font-bold px-6" asChild>
            <Link href="/signup">Sign Up</Link>
          </Button>
        </div>
      </nav>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-20 md:py-32 px-6 overflow-hidden">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] -mr-40 -mt-40 opacity-70"></div>
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent/10 rounded-full blur-[120px] -ml-40 -mb-40 opacity-50"></div>
          
          <div className="max-w-4xl mx-auto text-center space-y-8 relative z-10">
            <div className="inline-flex items-center gap-2 bg-white/80 dark:bg-slate-900/80 px-4 py-2 rounded-full border border-slate-100 dark:border-white/5 shadow-sm mb-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-[10px] font-black uppercase tracking-widest text-primary">Elite Academic Mentorship</span>
            </div>
            
            <h1 className="text-5xl md:text-8xl font-black font-headline tracking-tighter text-slate-900 dark:text-white leading-[0.9] text-balance">
              Welcome to <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">DISCATE AI</span>
              <br />
              <span className="text-4xl md:text-6xl">Your Academic Mentor</span>
            </h1>
            
            <p className="text-slate-500 dark:text-slate-400 text-lg md:text-2xl font-medium max-w-2xl mx-auto leading-relaxed">
              Transform your study routine with deep-metric evaluations, adaptive assessments, and AI-powered writing feedback.
            </p>
            
            <div className="pt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button className="h-16 md:h-20 px-10 md:px-14 rounded-2xl bg-primary text-white font-black text-xl md:text-2xl shadow-2xl shadow-primary/30 hover:bg-primary/90 hover:scale-105 active:scale-95 transition-all group" asChild>
                <Link href="/signup">
                  Get Started
                  <ChevronRight className="ml-2 h-6 w-6 group-hover:translate-x-2 transition-transform" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 px-6 bg-white dark:bg-slate-900/50">
          <div className="max-w-6xl mx-auto space-y-16">
            <div className="text-center space-y-4">
              <h2 className="text-3xl md:text-5xl font-black font-headline tracking-tighter uppercase">Academic Powerhouse</h2>
              <p className="text-slate-500 font-medium text-lg">Tools designed for peak academic performance.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: GraduationCap,
                  title: "Adaptive Assessments",
                  desc: "Generate MCQs, Flashcards, and Essays directly from your study materials in seconds.",
                  color: "text-blue-500",
                  bg: "bg-blue-50 dark:bg-blue-900/20"
                },
                {
                  icon: FileEdit,
                  title: "Writing Lab",
                  desc: "Get deep-metric feedback on your essays covering grammar, depth, and relevancy scores.",
                  color: "text-primary",
                  bg: "bg-primary/10"
                },
                {
                  icon: BrainCircuit,
                  title: "Cognitive Synergy",
                  desc: "Our AI works as a personal professor that adapts to your learning style and language mix.",
                  color: "text-amber-500",
                  bg: "bg-amber-50 dark:bg-amber-900/20"
                }
              ].map((f, i) => (
                <div key={i} className="p-10 rounded-[2.5rem] bg-[#FAFAFD] dark:bg-slate-900 border border-slate-100 dark:border-white/5 space-y-6 hover:shadow-2xl transition-all duration-500 group">
                  <div className={cn("h-16 w-16 rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform", f.bg)}>
                    <f.icon className={cn("h-8 w-8", f.color)} />
                  </div>
                  <h3 className="text-2xl font-black font-headline tracking-tight">{f.title}</h3>
                  <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 px-6">
          <div className="max-w-4xl mx-auto bg-slate-900 dark:bg-primary rounded-[3rem] p-12 md:p-20 text-center space-y-8 shadow-3xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
            <h2 className="text-3xl md:text-5xl font-black font-headline text-white tracking-tight leading-tight">Ready to Elevate Your Potential?</h2>
            <p className="text-slate-300 dark:text-white/80 text-lg font-medium max-w-xl mx-auto leading-relaxed">
              Join the elite circle of scholars using DISCATE AI to master their subjects with precision.
            </p>
            <Button className="h-16 px-12 rounded-2xl bg-white text-slate-900 hover:bg-slate-50 font-black text-xl shadow-xl hover:scale-105 active:scale-95 transition-all" asChild>
              <Link href="/signup">Begin Your Journey</Link>
            </Button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-12 border-t bg-white dark:bg-slate-950 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex flex-col items-center md:items-start gap-2">
            <DiscateLogo size="sm" />
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.4em]">Elite Academic Mentorship</p>
          </div>
          
          <div className="flex items-center gap-8">
            <Link href="/privacy" className="text-slate-500 hover:text-primary font-bold text-sm transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="text-slate-500 hover:text-primary font-bold text-sm transition-colors">Terms of Service</Link>
          </div>
          
          <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            <span>© {new Date().getFullYear()} DISCATE AI. All rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
