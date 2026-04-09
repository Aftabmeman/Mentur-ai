
"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { onAuthStateChanged } from "firebase/auth"
import { auth } from "@/lib/firebase"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ChevronRight, Sparkles, BrainCircuit } from "lucide-react"
import { cn } from "@/lib/utils"

export default function Home() {
  const router = useRouter()
  const [showSplash, setShowSplash] = useState(true)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [onboardingStep, setOnboardingStep] = useState(0)
  const [isReturningUser, setIsReturningUser] = useState(false)
  const [imgError, setImgError] = useState(false)

  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem("mentur_onboarding_seen")
    setIsReturningUser(!!hasSeenOnboarding)

    const timer = setTimeout(() => {
      setShowSplash(false)
      if (!hasSeenOnboarding) {
        setShowOnboarding(true)
      } else {
        checkAuthAndRedirect()
      }
    }, 2500)

    return () => clearTimeout(timer)
  }, [])

  const checkAuthAndRedirect = () => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.push("/dashboard")
      } else {
        router.push("/login")
      }
    })
    return () => unsubscribe()
  }

  const handleFinishOnboarding = () => {
    localStorage.setItem("mentur_onboarding_seen", "true")
    checkAuthAndRedirect()
  }

  const onboardingCards = [
    {
      title: "Welcome to Mentur AI",
      desc: "The fastest way to study smarter and ace your exams with AI-powered native focus.",
      image: "https://picsum.photos/seed/mentur-logo/400/400"
    },
    {
      title: "Built by a Student, for Students",
      desc: "Proudly created by Aftab Ghaswala, a 19-year-old 2nd-year student who truly understands your academic struggles.",
      image: "https://picsum.photos/seed/mentur-mission/400/400"
    },
    {
      title: "Instant Assessments",
      desc: "Generate custom MCQs, quizzes, and flashcards in seconds from any topic or study material.",
      image: "https://picsum.photos/seed/mentur-quiz/400/400"
    },
    {
      title: "Boost Your Grades",
      desc: "Get instant mentorship and let Mentur AI guide your educational journey to excellence.",
      image: "https://picsum.photos/seed/mentur-grade/400/400"
    }
  ]

  if (showSplash) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-slate-950 animate-in fade-in duration-700">
        <div className="relative group animate-out zoom-out-95 duration-1000 delay-1000 fill-mode-forwards">
          <div className="h-32 w-32 relative animate-pulse flex items-center justify-center">
            {!imgError ? (
              <Image 
                src="/logo.png" 
                alt="Mentur AI Logo" 
                fill 
                className="object-contain"
                onError={() => setImgError(true)}
                priority
              />
            ) : (
              <div className="h-24 w-24 bg-primary rounded-[32px] flex items-center justify-center shadow-xl">
                <BrainCircuit className="h-12 w-12 text-white" />
              </div>
            )}
          </div>
        </div>
        <div className="mt-8 text-center space-y-2 animate-in slide-in-from-bottom-4 duration-1000 delay-300">
          <h1 className="text-3xl font-black font-headline tracking-tighter text-slate-900 dark:text-white">Mentur AI</h1>
          <p className="text-primary font-bold text-xs uppercase tracking-[0.3em]">
            {isReturningUser ? "Welcome Back!" : "Expert Academic Mentorship"}
          </p>
        </div>
      </div>
    )
  }

  if (showOnboarding) {
    return (
      <div className="min-h-screen flex flex-col bg-white dark:bg-slate-950 p-8">
        <div className="flex-1 flex flex-col items-center justify-center text-center space-y-8 animate-in slide-in-from-right-8 duration-500">
          <div className="h-48 w-48 relative mb-4 rounded-[40px] overflow-hidden shadow-2xl">
            <Image 
              src={onboardingCards[onboardingStep].image} 
              alt="Mentur Step" 
              fill 
              className="object-cover"
              data-ai-hint="academic learning"
            />
          </div>
          <div className="space-y-4 max-w-sm">
            <h2 className="text-3xl font-black font-headline text-slate-900 dark:text-white leading-tight">
              {onboardingCards[onboardingStep].title}
            </h2>
            <p className="text-slate-500 font-medium text-lg leading-relaxed">
              {onboardingCards[onboardingStep].desc}
            </p>
          </div>
        </div>

        <div className="pb-12 space-y-6">
          <div className="flex justify-center gap-2">
            {onboardingCards.map((_, i) => (
              <div 
                key={i} 
                className={cn(
                  "h-1.5 transition-all duration-300 rounded-full",
                  i === onboardingStep ? "w-8 bg-primary" : "w-2 bg-slate-200"
                )} 
              />
            ))}
          </div>
          
          <div className="flex gap-4">
            {onboardingStep < onboardingCards.length - 1 ? (
              <>
                <Button variant="ghost" onClick={handleFinishOnboarding} className="flex-1 h-14 rounded-2xl font-bold text-slate-400">
                  Skip
                </Button>
                <Button onClick={() => setOnboardingStep(s => s + 1)} className="flex-[2] h-14 rounded-2xl bg-primary text-white font-bold text-lg shadow-xl shadow-primary/20">
                  Next
                </Button>
              </>
            ) : (
              <Button onClick={handleFinishOnboarding} className="w-full h-16 rounded-2xl bg-primary text-white font-bold text-xl shadow-xl shadow-primary/20 animate-in zoom-in-95">
                Get Started
                <ChevronRight className="ml-2 h-6 w-6" />
              </Button>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    </div>
  )
}
