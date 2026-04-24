
"use client"

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { applyActionCode, isSignInWithEmailLink, signInWithEmailLink } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  ArrowRight, 
  Mail, 
  ShieldCheck, 
  LifeBuoy,
  Wand2
} from 'lucide-react';
import { DiscateLogo } from '@/components/DiscateLogo';
import { useToast } from '@/hooks/use-toast';

function AuthActionHandler() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  const mode = searchParams.get('mode');
  const oobCode = searchParams.get('oobCode');

  useEffect(() => {
    const handleAuthAction = async () => {
      if (!auth) return;

      // 1. Handle Magic Link (Passwordless)
      if (isSignInWithEmailLink(auth, window.location.href)) {
        let email = window.localStorage.getItem('emailForSignIn');
        
        if (!email) {
          // If the link was opened on a different device/browser
          email = window.prompt('Please provide your email for verification');
        }

        try {
          await signInWithEmailLink(auth, email || '', window.location.href);
          window.localStorage.removeItem('emailForSignIn');
          setStatus('success');
          toast({ title: "Magic Authenticated", description: "Welcome to the elite scholarship." });
        } catch (error: any) {
          setStatus('error');
          setErrorMessage(error.message || "Failed to sign in with this link.");
        }
        return;
      }

      // 2. Handle standard verification modes
      if (mode === 'verifyEmail' && oobCode) {
        try {
          await applyActionCode(auth, oobCode);
          setStatus('success');
        } catch (error: any) {
          setStatus('error');
          setErrorMessage(error.message || "Email verification failed.");
        }
      } else if (mode === 'resetPassword') {
        router.push(`/reset-password?oobCode=${oobCode}`);
      } else {
        setStatus('error');
        setErrorMessage('The action link is invalid or expired.');
      }
    };

    handleAuthAction();
  }, [mode, oobCode, router, toast]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-950 font-body">
      <Card className="w-full max-w-md border-none shadow-[0_20px_50px_rgba(0,0,0,0.1)] rounded-[2.5rem] overflow-hidden bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl relative z-10">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary via-accent to-primary" />
        
        <CardHeader className="text-center pt-12 pb-4">
          <DiscateLogo size="md" className="mx-auto mb-6" />
          <CardDescription className="text-slate-500 font-medium uppercase tracking-[0.2em] text-[10px]">
            Academic authentication portal
          </CardDescription>
        </CardHeader>

        <CardContent className="p-8 pt-2">
          {status === 'loading' && (
            <div className="flex flex-col items-center py-12 space-y-6">
              <Loader2 className="h-16 w-16 text-primary animate-spin" />
              <div className="text-center space-y-2">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Authenticating...</h3>
                <p className="text-sm text-slate-500">Synchronizing with academic node.</p>
              </div>
            </div>
          )}

          {status === 'success' && (
            <div className="flex flex-col items-center py-6 space-y-8 animate-in slide-in-from-bottom-8 duration-700 ease-out">
              <div className="bg-emerald-500 h-20 w-20 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/30">
                <CheckCircle2 className="text-white h-12 w-12" />
              </div>
              
              <div className="text-center space-y-3">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Access Granted</h3>
                <p className="text-slate-500 text-sm leading-relaxed max-w-[280px] mx-auto">
                  Your identity has been verified. Welcome to elite mentorship.
                </p>
              </div>

              <div className="w-full space-y-4">
                <Button 
                  className="w-full h-14 rounded-2xl font-bold text-lg bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20 group"
                  onClick={() => router.push('/onboarding')}
                >
                  Enter Dashboard
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
                
                <div className="flex items-center justify-center gap-2 text-xs font-bold text-emerald-600 uppercase tracking-widest">
                  <ShieldCheck className="h-4 w-4" />
                  Secure Token Validated
                </div>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="flex flex-col items-center py-6 space-y-8 animate-in fade-in scale-95 duration-500">
              <div className="bg-destructive/10 h-20 w-20 rounded-full flex items-center justify-center">
                <XCircle className="text-destructive h-12 w-12" />
              </div>

              <div className="text-center space-y-3">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Link Invalid</h3>
                <p className="text-slate-500 text-sm px-4">
                  {errorMessage}
                </p>
              </div>

              <div className="w-full space-y-3">
                <Button 
                  variant="outline"
                  className="w-full h-12 rounded-xl font-bold border-2"
                  onClick={() => router.push('/login')}
                >
                  <Wand2 className="mr-2 h-5 w-5" />
                  Try New Link
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full h-12 rounded-xl text-slate-500"
                  onClick={() => router.push('/login')}
                >
                  <LifeBuoy className="mr-2 h-5 w-5" />
                  Back to Gateway
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function ActionPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
      </div>
    }>
      <AuthActionHandler />
    </Suspense>
  );
}
