
'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { applyActionCode } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import Image from 'next/image';
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
import { cn } from '@/lib/utils';

function AuthActionHandler() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  const mode = searchParams.get('mode');
  const oobCode = searchParams.get('oobCode');

  useEffect(() => {
    if (mode === 'verifyEmail' && oobCode) {
      handleVerifyEmail(oobCode);
    } else {
      setStatus('error');
      setErrorMessage('The action link is invalid or has expired.');
    }
  }, [mode, oobCode]);

  const handleVerifyEmail = async (code: string) => {
    try {
      await applyActionCode(auth, code);
      setStatus('success');
    } catch (error: any) {
      console.error('Verification error:', error);
      setStatus('error');
      setErrorMessage(error.message || "We couldn't verify your email at this time.");
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-950 selection:bg-primary/20 font-body">
      {/* Abstract Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/5 rounded-full blur-[120px]" />
      </div>

      <Card className="w-full max-w-md border-none shadow-[0_20px_50px_rgba(0,0,0,0.1)] rounded-[2.5rem] overflow-hidden bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl relative z-10">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary via-accent to-primary animate-gradient-x" />
        
        <CardHeader className="text-center pt-10 pb-4">
          <div className="flex justify-center mb-6">
            <div className="relative h-16 w-16 rotate-3 hover:rotate-0 transition-transform duration-300">
              <Image 
                src="/logo.png" 
                alt="Mentur Logo" 
                fill 
                className="object-contain"
              />
            </div>
          </div>
          <CardTitle className="text-3xl font-headline font-bold tracking-tight text-slate-900 dark:text-white">
            Mentur AI
          </CardTitle>
          <CardDescription className="text-slate-500 font-medium">
            Securing your academic journey
          </CardDescription>
        </CardHeader>

        <CardContent className="p-8 pt-2">
          {status === 'loading' && (
            <div className="flex flex-col items-center py-12 space-y-6 animate-in fade-in zoom-in-95 duration-500">
              <div className="relative">
                <Loader2 className="h-16 w-16 text-primary animate-spin" />
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Verifying account...</h3>
                <p className="text-sm text-slate-500">Please wait while we confirm your credentials.</p>
              </div>
            </div>
          )}

          {status === 'success' && (
            <div className="flex flex-col items-center py-6 space-y-8 animate-in slide-in-from-bottom-8 duration-700 ease-out">
              <div className="relative h-24 w-24 flex items-center justify-center">
                <div className="absolute inset-0 bg-emerald-500/10 rounded-full animate-ping duration-1000" />
                <div className="bg-emerald-500 h-20 w-20 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/30">
                  <CheckCircle2 className="text-white h-12 w-12" />
                </div>
              </div>
              
              <div className="text-center space-y-3">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Verified Successfully!</h3>
                <p className="text-slate-500 text-sm leading-relaxed max-w-[280px] mx-auto">
                  Welcome to the future of learning. Your account is now fully activated.
                </p>
              </div>

              <div className="w-full space-y-4">
                <Button 
                  className="w-full h-14 rounded-2xl font-bold text-lg bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20 group"
                  onClick={() => router.push('/dashboard')}
                >
                  Enter Dashboard
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
                
                <div className="flex items-center justify-center gap-2 text-xs font-bold text-emerald-600 uppercase tracking-widest">
                  <ShieldCheck className="h-4 w-4" />
                  Account Secured
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
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Verification Failed</h3>
                <p className="text-slate-500 text-sm px-4">
                  {errorMessage || "This link may have already been used or has timed out."}
                </p>
              </div>

              <div className="w-full space-y-3">
                <Button 
                  variant="outline"
                  className="w-full h-12 rounded-xl font-bold border-2"
                  onClick={() => router.push('/signup')}
                >
                  <Mail className="mr-2 h-5 w-5" />
                  Request New Link
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full h-12 rounded-xl text-slate-500"
                  onClick={() => window.open('mailto:support@menturai.com')}
                >
                  <LifeBuoy className="mr-2 h-5 w-5" />
                  Contact Support
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <footer className="fixed bottom-8 text-center w-full px-6">
        <p className="text-slate-400 text-xs font-medium tracking-tight">
          &copy; {new Date().getFullYear()} Mentur AI. Built for the modern scholar.
        </p>
      </footer>
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
