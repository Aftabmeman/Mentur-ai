
'use client';

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { onAuthStateChanged } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { ChevronRight, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import { DiscateLogo } from "@/components/DiscateLogo"

export default function Home() {
  const router = useRouter()
  const [showSplash, setShowSplash] = useState(true)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [onboardingStep, setOnboardingStep] = useState(0)
  const [isReturningUser, setIsReturningUser] = useState(false)

  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem("discate_onboarding_seen")
    setIsReturningUser(!!hasSeenOnboarding)

    const timer = setTimeout(() => {
      setShowSplash(false)
      if (!hasSeenOnboarding) {
        setShowOnboarding(true)
      } else {
        checkAuthAndRedirect()
      }
    }, 3000)

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
    localStorage.setItem("discate_onboarding_seen", "true")
    checkAuthAndRedirect()
  }

  const onboardingCards = [
    {
      title: "Meet Your Discate AI",
      desc: "Experience academic intelligence like never before with Discate's deep-learning engine.",
      icon: "robot"
    },
    {
      title: "Built for Your Future",
      desc: "Discate is created to help you bridge the gap between hard work and smart success.",
      icon: "heart"
    },
    {
      title: "Instant Mastery",
      desc: "Transform static notes into dynamic, adaptive assessments with one single tap.",
      icon: "zap"
    },
    {
      title: "Elevate Your Potential",
      desc: "Join thousands of scholars using Discate to unlock their peak academic performance.",
      icon: "award"
    }
  ]

  if (showSplash) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-slate-950 overflow-hidden">
        <div className="relative flex flex-col items-center animate-in zoom-in-95 duration-1000">
          <DiscateLogo size="xl" />
          <div className="mt-8 text-center space-y-2">
            <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.4em] animate-pulse">
              {isReturningUser ? "Welcome Back" : "Human-AI Intelligence"}
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (showOnboarding) {
    return (
      <div className="min-h-screen flex flex-col bg-white dark:bg-slate-950 p-8">
        <div className="flex-1 flex flex-col items-center justify-center text-center space-y-12 animate-in slide-in-from-right-8 duration-500">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/10 blur-3xl rounded-full scale-150" />
            <DiscateLogo size="lg" />
          </div>
          <div className="space-y-4 max-w-sm relative z-10">
            <h2 className="text-4xl font-black font-headline text-slate-900 dark:text-white leading-tight tracking-tight">
              {onboardingCards[onboardingStep].title}
            </h2>
            <p className="text-slate-500 font-medium text-lg leading-relaxed">
              {onboardingCards[onboardingStep].desc}
            </p>
          </div>
        </div>

        <div className="pb-12 space-y-8">
          <div className="flex justify-center gap-3">
            {onboardingCards.map((_, i) => (
              <div 
                key={i} 
                className={cn(
                  "h-1.5 transition-all duration-500 rounded-full",
                  i === onboardingStep ? "w-10 bg-primary" : "w-3 bg-slate-200"
                )} 
              />
            ))}
          </div>
          
          <div className="flex gap-4">
            {onboardingStep < onboardingCards.length - 1 ? (
              <>
                <Button variant="ghost" onClick={handleFinishOnboarding} className="flex-1 h-16 rounded-[24px] font-bold text-slate-400">
                  Skip
                </Button>
                <Button onClick={() => setOnboardingStep(s => s + 1)} className="flex-[2] h-16 rounded-[24px] bg-primary text-white font-bold text-lg shadow-2xl shadow-primary/30">
                  Next Step
                </Button>
              </>
            ) : (
              <Button onClick={handleFinishOnboarding} className="w-full h-18 rounded-[28px] bg-gradient-to-r from-primary to-accent text-white font-bold text-xl shadow-2xl shadow-primary/40 animate-in zoom-in-95 duration-500">
                Begin Journey
                <ChevronRight className="ml-2 h-7 w-7" />
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
