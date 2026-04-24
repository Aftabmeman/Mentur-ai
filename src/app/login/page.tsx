
"use client"

import { useState, useEffect } from "react"
import { 
  signInWithPopup, 
  signInWithRedirect,
  getRedirectResult, 
  GoogleAuthProvider, 
  signInWithEmailAndPassword, 
  onAuthStateChanged,
  sendSignInLinkToEmail
} from "firebase/auth"
import { auth, firestore } from "@/lib/firebase"
import { doc, getDoc } from "firebase/firestore"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import { Loader2, Wand2, KeyRound } from "lucide-react"
import { DiscateLogo } from "@/components/DiscateLogo"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(true)
  const [useMagicLink, setUseMagicLink] = useState(false)
  
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    if (!auth || !firestore) return;

    getRedirectResult(auth).then(async (result) => {
      if (result) {
        const user = result.user;
        const profileRef = doc(firestore!, "users", user.uid, "profile", "stats");
        const profileSnap = await getDoc(profileRef);
        if (profileSnap.exists()) {
          router.push("/onboarding");
        } else {
          router.push("/signup");
        }
      }
    }).catch(console.error);

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const profileRef = doc(firestore!, "users", user.uid, "profile", "stats");
        const profileSnap = await getDoc(profileRef);
        if (profileSnap.exists()) {
          router.push("/onboarding");
        } else {
          setGoogleLoading(false);
        }
      } else {
        setGoogleLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleGoogleSignIn = async () => {
    if (!auth) return;
    setGoogleLoading(true);
    const provider = new GoogleAuthProvider();
    
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const profileRef = doc(firestore!, "users", user.uid, "profile", "stats");
      const profileSnap = await getDoc(profileRef);

      if (profileSnap.exists()) {
        router.push("/onboarding");
      } else {
        router.push("/signup");
      }
    } catch (error: any) {
      if (error.code === 'auth/popup-blocked') {
        signInWithRedirect(auth, provider);
      } else {
        toast({ variant: "destructive", title: "Error", description: error.message });
        setGoogleLoading(false);
      }
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (!auth) throw new Error("Auth not initialized");

      if (useMagicLink) {
        const actionCodeSettings = {
          url: window.location.origin + '/auth/action',
          handleCodeInApp: true,
        };
        await sendSignInLinkToEmail(auth, email, actionCodeSettings);
        window.localStorage.setItem('emailForSignIn', email);
        toast({
          title: "Magic Link Dispatched",
          description: "Check your email for an elite login link.",
        });
        setLoading(false);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        router.push("/onboarding");
      }
    } catch (error: any) {
      toast({
        title: "Authentication Failed",
        description: error.message,
        variant: "destructive",
      })
      setLoading(false)
    }
  };

  if (googleLoading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.4em] animate-pulse">Authenticating Scholar...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-950 font-body transition-colors duration-500">
      <Card className="w-full max-w-md border-none shadow-[0_25px_70px_rgba(0,0,0,0.1)] rounded-[3rem] overflow-hidden bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl relative">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary via-accent to-primary" />
        
        <CardHeader className="text-center pt-12">
          <DiscateLogo size="md" className="mx-auto mb-2" />
          <CardTitle className="text-2xl font-headline font-bold text-slate-900 dark:text-white">Welcome Back</CardTitle>
          <CardDescription className="text-slate-500">Enter your credentials to access your academic lab</CardDescription>
        </CardHeader>
        
        <CardContent className="p-8">
          <div className="space-y-6">
            <Button 
              variant="outline" 
              className="w-full h-14 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 border-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm dark:text-white"
              onClick={handleGoogleSignIn}
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continue with Google
            </Button>

            <div className="flex items-center gap-4 py-2">
              <Separator className="flex-1 opacity-50" />
              <span className="text-[9px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-[0.3em]">or use email</span>
              <Separator className="flex-1 opacity-50" />
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  {useMagicLink ? <Wand2 className="h-4 w-4 text-primary" /> : <KeyRound className="h-4 w-4 text-slate-400" />}
                  <Label htmlFor="magic-link-toggle" className="text-[10px] font-black uppercase tracking-widest text-slate-400">Magic Link Mode</Label>
                </div>
                <Switch 
                  id="magic-link-toggle"
                  checked={useMagicLink}
                  onCheckedChange={setUseMagicLink}
                />
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 px-1">Email Address</label>
                  <Input 
                    type="email" 
                    placeholder="scholar@discate.com" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none px-6 focus-visible:ring-primary/20 shadow-inner"
                  />
                </div>
                
                {!useMagicLink && (
                  <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 px-1">Password</label>
                    <Input 
                      type="password" 
                      placeholder="••••••••" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required={!useMagicLink}
                      className="h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none px-6 focus-visible:ring-primary/20 shadow-inner"
                    />
                  </div>
                )}
                
                <Button type="submit" className="w-full h-14 rounded-2xl font-black text-lg shadow-xl shadow-primary/20 bg-primary hover:bg-primary/90 transition-all active:scale-[0.98]" disabled={loading}>
                  {loading ? <Loader2 className="animate-spin h-6 w-6" /> : (useMagicLink ? "Send Magic Link" : "Sign In")}
                </Button>
              </div>
            </form>
          </div>
          
          <div className="mt-8 text-center text-sm">
            <span className="text-slate-400 font-medium">Don't have an account? </span>
            <Link href="/signup" className="text-primary font-black hover:underline underline-offset-4 decoration-2">Sign Up</Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
