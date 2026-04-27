'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { PlayCircle, Loader2, Sparkles, Coins } from 'lucide-react';
import { useUser, useFirestore } from '@/firebase';
import { grantAdReward } from '@/firebase/non-blocking-updates';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface RewardedAdButtonProps {
  className?: string;
  variant?: 'default' | 'outline' | 'ghost' | 'secondary';
  showIcon?: boolean;
  label?: string;
}

/**
 * Google Rewarded Ads Button for Discate.
 * Uses GPT (Google Publisher Tag) standard for web-based rewarded ads.
 */
export function RewardedAdButton({ 
  className, 
  variant = "outline",
  showIcon = true,
  label = "Watch Ad (+1 Coin)"
}: RewardedAdButtonProps) {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [adLoaded, setAdLoaded] = useState(false);

  // Initialize Ad slot on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const googletag = (window as any).googletag || { cmd: [] };
    
    googletag.cmd.push(() => {
      // Rewarded ads are out-of-page slots. 
      // Test Unit Path for Web Rewarded: '/217479429/example/rewarded'
      const rewardedSlot = googletag.defineOutOfPageSlot(
        '/217479429/example/rewarded',
        googletag.enums.OutOfPageFormat.REWARDED
      );

      if (rewardedSlot) {
        rewardedSlot.addService(googletag.pubads());
        
        googletag.pubads().addEventListener('rewardedSlotReady', (event: any) => {
          setAdLoaded(true);
          // Auto-display if requested via state or just keep ready
        });

        googletag.pubads().addEventListener('rewardedSlotGranted', async (event: any) => {
          // USER WATCHED FULL AD - GRANT COIN
          if (db && user?.uid) {
            const result = await grantAdReward(db, user.uid);
            if (result.success) {
              toast({
                title: "🎉 Reward Granted!",
                description: "1 Coin has been added to your academic wallet.",
                variant: "default",
              });
            }
          }
        });

        googletag.pubads().addEventListener('rewardedSlotClosed', (event: any) => {
          googletag.destroySlots([rewardedSlot]);
          // Refresh slot for next time
          googletag.cmd.push(() => {
            googletag.defineOutOfPageSlot('/217479429/example/rewarded', googletag.enums.OutOfPageFormat.REWARDED).addService(googletag.pubads());
          });
          setAdLoaded(false);
          setIsLoading(false);
        });

        googletag.enableServices();
      }
    });
  }, [db, user?.uid, toast]);

  const handleWatchAd = () => {
    if (typeof window === 'undefined') return;
    setIsLoading(true);

    const googletag = (window as any).googletag;
    
    googletag.cmd.push(() => {
      // Explicitly trigger display
      googletag.display('/217479429/example/rewarded');
      
      // If it doesn't load within 5 seconds, fallback
      setTimeout(() => {
        if (isLoading) {
          setIsLoading(false);
          toast({
            title: "Ad Unavailable",
            description: "No ads ready at this moment. Please try again later.",
            variant: "destructive"
          });
        }
      }, 5000);
    });
  };

  return (
    <Button 
      onClick={handleWatchAd} 
      disabled={isLoading}
      variant={variant}
      className={cn(
        "h-12 rounded-2xl font-black text-[10px] uppercase tracking-widest border-2 transition-all active:scale-95 group",
        className
      )}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
      ) : showIcon ? (
        <PlayCircle className="h-4 w-4 mr-2 group-hover:scale-125 transition-transform text-primary" />
      ) : null}
      {isLoading ? "Fetching Ad..." : label}
    </Button>
  );
}
