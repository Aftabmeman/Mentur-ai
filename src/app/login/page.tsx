
"use client"

import { useState } from "react"
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth"
import { auth, firestore } from "@/lib/firebase"
import { doc, getDoc } from "firebase/firestore"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import { Loader2 } from "lucide-react"
import { DiscateLogo } from "@/components/DiscateLogo"
import { Separator } from "@/components/ui/separator"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth!, provider);
      const user = result.user;
      
      // Check if profile exists, otherwise they need to signup
      const profileRef = doc(firestore!, "users", user.uid, "profile", "stats");
      const profileSnap = await getDoc(profileRef);

      if (profileSnap.exists()) {
        toast({ title: "Welcome Back", description: `Signed in as ${user.displayName}` });
        router.push("/dashboard");
      } else {
        // New user through Google login button - redirect to signup step 2
        toast({ title: "Profile Required", description: "Complete your elite profile to continue." });
        router.push("/signup");
      }
    } catch (error: any) {
      toast({
        title: "Google Sign-In Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await signInWithEmailAndPassword(auth!, email, password)
      router.push("/dashboard")
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-950">
      <Card className="w-full max-w-md border-none shadow-xl rounded-[40px] overflow-hidden bg-white dark:bg-slate-900">
        <CardHeader className="text-center pt-12">
          <DiscateLogo size="md" className="mx-auto mb-2" />
          <CardTitle className="text-2xl font-headline font-bold">Welcome Back</CardTitle>
          <CardDescription>Enter your credentials to access your academic lab</CardDescription>
        </CardHeader>
        <CardContent className="p-8">
          <div className="space-y-6">
            <Button 
              variant="outline" 
              className="w-full h-14 rounded-2xl font-bold flex items-center justify-center gap-3 border-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
              onClick={handleGoogleSignIn}
              disabled={googleLoading}
            >
              {googleLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <svg className="h-5 w-5" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  Continue with Google
                </>
              )}
            </Button>

            <div className="flex items-center gap-4 py-2">
              <Separator className="flex-1" />
              <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">or use email</span>
              <Separator className="flex-1" />
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Email Address</label>
                <Input 
                  type="email" 
                  placeholder="name@example.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Password</label>
                <Input 
                  type="password" 
                  placeholder="••••••••" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none"
                />
              </div>
              <Button type="submit" className="w-full h-14 rounded-2xl font-bold shadow-xl shadow-primary/20" disabled={loading}>
                {loading ? <Loader2 className="animate-spin h-5 w-5" /> : "Sign In"}
              </Button>
            </form>
          </div>
          <div className="mt-8 text-center text-sm font-medium">
            <span className="text-slate-400">Don't have an account? </span>
            <Link href="/signup" className="text-primary font-bold hover:underline">Sign Up</Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
