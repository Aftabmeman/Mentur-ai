
'use client';

import { cn } from "@/lib/utils";

interface DiscateLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

export function DiscateLogo({ 
  className, 
  size = "md"
}: DiscateLogoProps) {
  const textClasses = {
    sm: "text-2xl",
    md: "text-4xl",
    lg: "text-6xl",
    xl: "text-8xl",
  };

  return (
    <div className={cn("flex items-center justify-center", className)}>
      <span className={cn(
        "font-black font-headline tracking-tighter bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent uppercase transition-all duration-500 hover:brightness-110",
        textClasses[size]
      )}>
        Discate
      </span>
    </div>
  );
}
