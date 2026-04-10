'use client';

import { cn } from "@/lib/utils";

interface MenturLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  textColor?: string;
}

export function MenturLogo({ 
  className, 
  size = "md", 
  showText = false,
  textColor = "text-slate-900 dark:text-white"
}: MenturLogoProps) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-24 h-24",
    xl: "w-40 h-40",
  };

  const textClasses = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-4xl",
    xl: "text-5xl",
  };

  return (
    <div className={cn("flex items-center gap-3", className)}>
      {/* The Native SVG Logo */}
      <div className={cn("shrink-0", sizeClasses[size])}>
        <svg viewBox="0 0 100 100" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="50" fill="#9333ea" />
          <path d="M50 25L30 45H70L50 25ZM35 50L50 65L65 50H35ZM30 55L50 75L70 55H30Z" fill="white" />
        </svg>
      </div>
      
      {showText && (
        <span className={cn(
          "font-black font-headline tracking-tighter",
          textColor,
          textClasses[size]
        )}>
          Mentur AI
        </span>
      )}
    </div>
  );
}
