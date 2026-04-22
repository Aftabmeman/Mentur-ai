
"use client"

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { applyActionCode } from 'firebase/auth';
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
  LifeBuoy
} from 'lucide-react';
import { DiscateLogo } from '@/components/DiscateLogo';

/**
 * Handles Firebase Authentication actions (email verification, password reset, etc.)
 * This page must be set as the 'Action URL' in Firebase Console Templates.
 */
function AuthActionHandler() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  const mode = searchParams.get('mode');
  const oobCode = searchParams.get('oobCode');

  useEffect(() => {
    // If we're verifying an email
    if (mode === 'verifyEmail' && oobCode) {
      handleVerifyEmail(oobCode);
    } else if (mode === 'resetPassword') {
      // Redirect to a dedicated reset page or handle here
      router.push(`/reset-password?oobCode=${oobCode}`);
    } else {
      setStatus('error');
      setErrorMessage('The action link is invalid, broken, or has expired.');
    }
  }, [mode, oobCode, router]);

  const handleVerifyEmail = async (code: string) => {
    try {
      if (!auth) throw new Error("Firebase Auth not initialized");
      await applyActionCode(auth, code);
      setStatus('success');
    } catch (error: any) {
      console.error('Verification error:', error);
      setStatus('error');
      setErrorMessage(error.message || "We couldn't verify your email. The link might be expired.");
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-950 font-body">
      <Card className="w-full max-w-md border-none shadow-[0_20px_50px_rgba(0,0,0,0.1)] rounded-[2.5rem] overflow-hidden bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl relative z-10">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary via-accent to-primary" />
        
        <CardHeader className="text-center pt-12 pb-4">
          <DiscateLogo size="md" className="mx-auto mb-6" />
          <CardTitle className="text-3xl font-headline font-bold tracking-tight text-slate-900 dark:text-white uppercase">
            Discate
          </CardTitle>
          <CardDescription className="text-slate-500 font-medium">
            Academic verification portal
          </CardDescription>
        </CardHeader>

        <CardContent className="p-8 pt-2">
          {status === 'loading' && (
            <div className="flex flex-col items-center py-12 space-y-6">
              <Loader2 className="h-16 w-16 text-primary animate-spin" />
              <div className="text-center space-y-2">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Processing...</h3>
                <p className="text-sm text-slate-500">Connecting to elite academic servers.</p>
              </div>
            </div>
          )}

          {status === 'success' && (
            <div className="flex flex-col items-center py-6 space-y-8 animate-in slide-in-from-bottom-8 duration-700 ease-out">
              <div className="bg-emerald-500 h-20 w-20 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/30">
                <CheckCircle2 className="text-white h-12 w-12" />
              </div>
              
              <div className="text-center space-y-3">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Identity Verified</h3>
                <p className="text-slate-500 text-sm leading-relaxed max-w-[280px] mx-auto">
                  Your academic profile is now activated. Welcome to the elite mentorship.
                </p>
              </div>

              <div className="w-full space-y-4">
                <Button 
                  className="w-full h-14 rounded-2xl font-bold text-lg bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20 group"
                  onClick={() => router.push('/dashboard')}
                >
                  Go to Dashboard
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
                
                <div className="flex items-center justify-center gap-2 text-xs font-bold text-emerald-600 uppercase tracking-widest">
                  <ShieldCheck className="h-4 w-4" />
                  Secure Access Granted
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
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Invalid Link</h3>
                <p className="text-slate-500 text-sm px-4">
                  {errorMessage}
                </p>
              </div>

              <div className="w-full space-y-3">
                <Button 
                  variant="outline"
                  className="w-full h-12 rounded-xl font-bold border-2"
                  onClick={() => router.push('/signup')}
                >
                  <Mail className="mr-2 h-5 w-5" />
                  Try Signup Again
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full h-12 rounded-xl text-slate-500"
                  onClick={() => router.push('/login')}
                >
                  <LifeBuoy className="mr-2 h-5 w-5" />
                  Return to Login
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
