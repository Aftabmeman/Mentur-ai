
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { DiscateLogo } from '@/components/DiscateLogo';
import { 
  Sparkles, 
  BrainCircuit, 
  Trophy, 
  ArrowRight, 
  ChevronRight,
  ChevronLeft 
} from 'lucide-react';
import { cn } from '@/lib/utils';

const slides = [
  {
    icon: Sparkles,
    title: "The Neural Genesis",
    description: "Welcome to a new era of intelligence. DISCATE AI is not just a tool; it's a cognitive partner designed to evolve with your academic journey. We dissolve the limits of traditional learning.",
    color: "text-purple-600",
    bg: "bg-purple-50 dark:bg-purple-900/20"
  },
  {
    icon: BrainCircuit,
    title: "Academic Mastery",
    description: "Experience deep-metric evaluations that analyze your work for grammar, depth, and relevancy. Our Scholar Professor provides feedback that was once reserved only for the elite.",
    color: "text-indigo-600",
    bg: "bg-indigo-50 dark:bg-indigo-900/20"
  },
  {
    icon: Trophy,
    title: "Elite Potential",
    description: "Forge your path to excellence. Whether it's adaptive MCQs or complex essay analysis, DISCATE AI ensures you are always at the peak of your performance. Ready to begin?",
    color: "text-emerald-600",
    bg: "bg-emerald-50 dark:bg-emerald-900/20"
  }
];

export default function OnboardingPage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const router = useRouter();

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(prev => prev + 1);
    } else {
      router.push('/dashboard');
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(prev => prev - 1);
    }
  };

  const Icon = slides[currentSlide].icon;

  return (
    <div className="min-h-screen bg-[#FAFAFD] dark:bg-slate-950 flex flex-col items-center justify-center p-6 sm:p-10 font-body overflow-hidden">
      <div className="max-w-2xl w-full flex flex-col items-center space-y-12 sm:space-y-16">
        
        <div className="animate-in fade-in slide-in-from-top-4 duration-700">
           <DiscateLogo size="md" />
        </div>

        <div key={currentSlide} className="flex flex-col items-center text-center space-y-8 animate-in fade-in slide-in-from-right-8 duration-700 ease-out">
          <div className={cn("h-24 w-24 sm:h-32 sm:w-32 rounded-[2.5rem] flex items-center justify-center shadow-xl relative", slides[currentSlide].bg)}>
            <div className="absolute inset-0 bg-current blur-2xl opacity-10 rounded-full" />
            <Icon className={cn("h-12 w-12 sm:h-16 sm:w-16 relative z-10", slides[currentSlide].color)} />
          </div>

          <div className="space-y-4">
            <h1 className="text-3xl sm:text-5xl font-black font-headline tracking-tighter text-slate-900 dark:text-white uppercase">
              {slides[currentSlide].title}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-base sm:text-xl font-medium leading-relaxed max-w-lg mx-auto">
              {slides[currentSlide].description}
            </p>
          </div>
        </div>

        <div className="w-full max-w-sm space-y-8">
          <div className="flex justify-center gap-3">
            {slides.map((_, i) => (
              <div 
                key={i} 
                className={cn(
                  "h-1.5 rounded-full transition-all duration-500",
                  currentSlide === i ? "w-10 bg-primary shadow-[0_0_10px_rgba(107,78,255,0.4)]" : "w-2 bg-slate-200 dark:bg-slate-800"
                )} 
              />
            ))}
          </div>

          <div className="flex gap-4">
            {currentSlide > 0 && (
              <Button 
                variant="ghost" 
                onClick={prevSlide}
                className="flex-1 h-14 sm:h-16 rounded-2xl font-black text-slate-400 hover:text-slate-900"
              >
                <ChevronLeft className="mr-2 h-5 w-5" /> Back
              </Button>
            )}
            <Button 
              onClick={nextSlide}
              className="flex-[2] h-14 sm:h-16 rounded-2xl bg-primary text-white font-black text-lg sm:text-xl shadow-2xl shadow-primary/30 group hover:scale-105 active:scale-95 transition-all"
            >
              {currentSlide === slides.length - 1 ? "Start Journey" : "Continue"}
              <ChevronRight className="ml-2 h-6 w-6 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>

        <p className="text-[10px] font-black text-slate-300 dark:text-slate-700 uppercase tracking-[0.5em] animate-pulse">
           Elite Onboarding Sequence
        </p>
      </div>
    </div>
  );
}
