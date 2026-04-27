'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, PlayCircle, ShieldAlert, CheckCircle2, ExternalLink, GraduationCap } from 'lucide-react';
import { useUser, useFirestore } from '@/firebase';
import { grantAdReward } from '@/firebase/non-blocking-updates';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface AdLimitModalProps {
  isOpen: boolean;
  onClose: () => void;
  reason?: 'LIMIT_REACHED' | 'NO_COINS';
}

/**
 * Bulletproof Ad Verification Modal for Mobile & Web.
 * Uses Timestamp-based verification to handle background pausing in mobile browsers.
 */
export function AdLimitModal({ isOpen, onClose, reason = 'LIMIT_REACHED' }: AdLimitModalProps) {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  
  const [view, setView] = useState<'prompt' | 'verifying' | 'success'>('prompt');
  const [timeLeft, setTimeLeft] = useState(10);
  const [isGranting, setIsGranting] = useState(false);
  
  // Use refs to track state across backgrounding/pausing
  const startTimeRef = useRef<number | null>(null);
  const targetTime = 10000; // 10 seconds

  // Reset modal state when closed/reopened
  useEffect(() => {
    if (!isOpen) {
      setView('prompt');
      setTimeLeft(10);
      setIsGranting(false);
      startTimeRef.current = null;
    }
  }, [isOpen]);

  // Mandatory Countdown Logic (Timestamp based for background resilience)
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (view === 'verifying') {
      interval = setInterval(() => {
        if (!startTimeRef.current) return;

        const elapsed = Date.now() - startTimeRef.current;
        const remaining = Math.max(0, Math.ceil((targetTime - elapsed) / 1000));
        
        setTimeLeft(remaining);

        if (elapsed >= targetTime && !isGranting) {
          clearInterval(interval);
          handleClaimReward();
        }
      }, 500); // Check frequently to catch transitions
    }

    return () => clearInterval(interval);
  }, [view, isGranting]);

  // Handle visibility change (User coming back from Ad tab)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && view === 'verifying' && startTimeRef.current) {
        // Force immediate check when user returns
        const elapsed = Date.now() - startTimeRef.current;
        if (elapsed >= targetTime && !isGranting) {
          handleClaimReward();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [view, isGranting]);

  const handleStartAd = () => {
    // 1. Record exact start time
    startTimeRef.current = Date.now();
    
    // 2. Open Adsterra Direct Link in a NEW tab
    // We use a small delay or direct window.open
    window.open('https://www.profitablecpmratenetwork.com/j9ay58s17?key=b750504caa4b020b0a5da18b474f98bb', '_blank');
    
    // 3. Immediately switch UI to Verification
    setView('verifying');
    setTimeLeft(10);
  };

  const handleClaimReward = async () => {
    if (!db || !user?.uid || isGranting) return;
    setIsGranting(true);
    
    try {
      // Secure Firestore Update
      const result = await grantAdReward(db, user.uid);
      if (result.success) {
        setView('success');
        toast({
          title: "🎉 Access Restored!",
          description: "Reward authenticated via secure node.",
        });
      } else {
        throw new Error("Sync failed");
      }
    } catch (e) {
      toast({
        variant: "destructive",
        title: "Sync Delay",
        description: "Retrying verification...",
      });
      // Fallback: stay in verifying or revert if error persists
      setIsGranting(false);
    }
  };

  return (
    <Dialog 
      open={isOpen} 
      onOpenChange={(open) => {
        // PREVENT EXIT: Disable closing during verification phase
        if (view === 'verifying') return; 
        if (!open) onClose();
      }}
    >
      <DialogContent 
        onPointerDownOutside={(e) => view === 'verifying' && e.preventDefault()}
        onEscapeKeyDown={(e) => view === 'verifying' && e.preventDefault()}
        className="sm:max-w-md rounded-[2.5rem] border-none shadow-3xl overflow-hidden p-0 bg-white dark:bg-slate-900"
      >
        
        {/* PROMPT VIEW */}
        {view === 'prompt' && (
          <div className="p-8 sm:p-12 text-center space-y-8 animate-in fade-in duration-500">
            <div className="h-20 w-20 bg-amber-100 dark:bg-amber-900/20 rounded-[2rem] flex items-center justify-center mx-auto shadow-sm border border-amber-200/50">
               <ShieldAlert className="h-10 w-10 text-amber-600" />
            </div>
            <DialogHeader className="space-y-3">
              <DialogTitle className="text-2xl sm:text-3xl font-black font-headline tracking-tighter uppercase leading-tight text-slate-900 dark:text-white">
                {reason === 'LIMIT_REACHED' ? "Daily Limit Reached 🛑" : "Insufficient Coins 🪙"}
              </DialogTitle>
              <DialogDescription className="text-slate-500 dark:text-slate-400 text-sm sm:text-base font-medium leading-relaxed px-2">
                You've hit the usage threshold. Visit an ad partner to earn <strong className="text-primary">+1 Bonus Coin</strong> and continue your elite session.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-3 pt-4">
              <Button 
                onClick={handleStartAd}
                className="h-16 rounded-2xl bg-primary text-white font-black text-lg shadow-xl hover:scale-[1.02] active:scale-95 transition-all group shadow-primary/20"
              >
                <PlayCircle className="mr-2 h-6 w-6 group-hover:scale-125 transition-transform" />
                Watch Ad to Continue
              </Button>
              <Button variant="ghost" onClick={onClose} className="h-12 font-black text-slate-400 uppercase tracking-widest text-[10px] hover:text-slate-600 transition-colors">
                I'll Study Later
              </Button>
            </div>
          </div>
        )}

        {/* VERIFYING VIEW: Timestamp-Resilient Countdown */}
        {view === 'verifying' && (
          <div className="relative min-h-[450px] flex flex-col items-center justify-center bg-slate-950 p-8 sm:p-12 text-center overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-accent/20 animate-pulse" />
            
            <div className="relative z-10 space-y-10 w-full">
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-3 text-primary font-black text-[10px] uppercase tracking-[0.5em] animate-pulse">
                   <Loader2 className="h-4 w-4 animate-spin" /> Verifying Academic Action
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-white font-headline uppercase tracking-tighter">Syncing Reward Node</h3>
              </div>
              
              <div className="relative h-40 w-40 flex items-center justify-center mx-auto">
                 <svg className="absolute inset-0 h-full w-full rotate-[-90deg]" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="45" fill="transparent" stroke="rgba(255,255,255,0.05)" strokeWidth="4" />
                    <circle 
                      cx="50" cy="50" r="45" 
                      fill="transparent" 
                      stroke="currentColor" 
                      strokeWidth="6" 
                      strokeDasharray="282.7" 
                      strokeDashoffset={282.7 - (282.7 * (10 - timeLeft)) / 10} 
                      strokeLinecap="round" 
                      className="text-primary transition-all duration-300 ease-linear shadow-[0_0_15px_rgba(147,51,234,0.5)]" 
                    />
                 </svg>
                 <div className="flex flex-col items-center">
                    <span className="text-6xl font-black text-white tabular-nums drop-shadow-2xl">{timeLeft}</span>
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1">Seconds</span>
                 </div>
              </div>

              <div className="p-5 bg-white/5 rounded-2xl border border-white/10 flex items-start gap-4 text-left backdrop-blur-md">
                 <ExternalLink className="h-5 w-5 text-primary shrink-0 mt-1" />
                 <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
                   Verification is active. Please return to this tab after closing the ad to claim your coin.
                 </p>
              </div>
            </div>
          </div>
        )}

        {/* SUCCESS VIEW */}
        {view === 'success' && (
          <div className="p-8 sm:p-14 text-center space-y-10 animate-in fade-in zoom-in-95 duration-700">
            <div className="relative inline-block">
               <div className="absolute inset-0 bg-emerald-500/20 blur-3xl rounded-full scale-150" />
               <div className="h-28 w-28 bg-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-emerald-500/30 relative z-10 border-4 border-white dark:border-slate-800">
                  <CheckCircle2 className="h-16 w-14 text-white" />
               </div>
            </div>
            <div className="space-y-3">
               <h3 className="text-3xl sm:text-4xl font-black font-headline text-slate-900 dark:text-white uppercase tracking-tighter leading-none">Access Restored!</h3>
               <p className="text-slate-500 dark:text-slate-400 font-medium text-base">Your wallet has been synchronized. You can now continue your elite study session.</p>
            </div>
            
            <div className="pt-2">
              <Button 
                onClick={onClose}
                className="w-full h-16 rounded-[1.5rem] bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xl shadow-2xl active:scale-95 transition-all shadow-emerald-600/20"
              >
                Continue Studying <GraduationCap className="ml-2 h-6 w-6" />
              </Button>
            </div>

            <p className="text-[8px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-[0.5em]">
               Discate Neural Gateway Secured
            </p>
          </div>
        )}

      </DialogContent>
    </Dialog>
  );
}
