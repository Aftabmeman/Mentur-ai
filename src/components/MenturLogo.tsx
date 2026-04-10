'use client';

import { cn } from "@/lib/utils";

interface MenturLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
}

export function MenturLogo({ 
  className, 
  size = "md", 
  showText = false
}: MenturLogoProps) {
  const sizeClasses = {
    sm: "w-10 h-10",
    md: "w-16 h-16",
    lg: "w-32 h-32",
    xl: "w-48 h-48",
  };

  const textClasses = {
    sm: "text-xl",
    md: "text-3xl",
    lg: "text-5xl",
    xl: "text-6xl",
  };

  return (
    <div className={cn("flex flex-col items-center gap-4", className)}>
      {/* Brain-Processor Fusion Gradient SVG */}
      <div className={cn("shrink-0 relative group", sizeClasses[size])}>
        <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl group-hover:bg-primary/30 transition-all duration-500" />
        <svg viewBox="0 0 100 100" className="w-full h-full relative z-10" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="neural-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#9333ea" />
              <stop offset="100%" stopColor="#4f46e5" />
            </linearGradient>
            <filter id="inner-glow">
              <feGaussianBlur stdDeviation="1.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>
          
          {/* Base Circle Background */}
          <circle cx="50" cy="50" r="45" fill="url(#neural-gradient)" />
          
          {/* Left Brain Side (Organic) */}
          <path 
            d="M50 25C43.3726 25 38 30.3726 38 37C38 38.411 38.2435 39.765 38.6888 41.0189C34.1804 42.6393 31 46.9458 31 52C31 57.0542 34.1804 61.3607 38.6888 62.9811C38.2435 64.235 38 65.589 38 67C38 73.6274 43.3726 79 50 79V25Z" 
            fill="white" 
            fillOpacity="0.95"
          />
          
          {/* Right Processor Side (Digital) */}
          <path 
            d="M50 25V35H62M50 45V55H69M50 65V75H62" 
            stroke="white" 
            strokeWidth="3.5" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
          
          {/* Digital Nodes */}
          <circle cx="62" cy="35" r="3" fill="white" />
          <circle cx="69" cy="55" r="3" fill="white" />
          <circle cx="62" cy="75" r="3" fill="white" />
          
          {/* Brain Folds / Details */}
          <path 
            d="M44 35C44 35 41 38 41 41M44 65C44 65 41 62 41 59" 
            stroke="url(#neural-gradient)" 
            strokeWidth="1.5" 
            strokeLinecap="round" 
            strokeOpacity="0.3"
          />
        </svg>
      </div>
      
      {showText && (
        <span className={cn(
          "font-black font-headline tracking-tighter bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent animate-gradient-x",
          textClasses[size]
        )}>
          Mentur AI
        </span>
      )}
    </div>
  );
}
