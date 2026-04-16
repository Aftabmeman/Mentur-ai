
"use client"

import { useState } from "react"
import { createUserWithEmailAndPassword, sendEmailVerification, updateProfile } from "firebase/auth"
import { auth, firestore } from "@/lib/firebase"
import { doc, setDoc } from "firebase/firestore"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import { Loader2, ChevronRight, Globe } from "lucide-react"
import { MenturLogo } from "@/components/MenturLogo"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const languages = [
  "English", "Hinglish", "Marathish", "Gujaratinglish", "Bengalish", 
  "Punjabish", "Tamilish", "Telugush", "Kannadish", "Malayalish"
];

export default function SignupPage() {
  const [step, setStep] = useState(1)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [language, setLanguage] = useState("English")
  const [loading, setLoading] = useState(false)
  
  const router = useRouter()
  const { toast } = useToast()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      await updateProfile(userCredential.user, { displayName: name })
      
      // Store initial profile stats with language preference
      await setDoc(doc(firestore, "users", userCredential.user.uid, "profile", "stats"), {
        id: userCredential.user.uid,
        email,
        fullName: name,
        preferredLanguage: language,
        totalCoins: 0,
        assessmentsDone: 0,
        level: "Lvl 1",
        createdAt: new Date().toISOString()
      });

      await sendEmailVerification(userCredential.user)
      toast({
        title: "Account Created",
        description: "A verification email has been sent to your inbox.",
      })
      router.push("/dashboard/verify-email")
    } catch (error: any) {
      toast({
        title: "Signup Failed",
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
        <CardHeader className="text-center pt-8">
          <MenturLogo size="md" className="mx-auto mb-4" />
          <CardTitle className="text-2xl font-headline font-bold">Create Account</CardTitle>
          <CardDescription>Join Mentur AI for elite academic mentorship</CardDescription>
        </CardHeader>
        <CardContent className="p-8">
          {step === 1 ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Full Name</label>
                <Input 
                  placeholder="John Doe" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Email Address</label>
                <Input 
                  type="email" 
                  placeholder="name@example.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                  className="h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none"
                />
              </div>
              <Button onClick={() => setStep(2)} disabled={!email || !password || !name} className="w-full h-14 rounded-2xl font-bold text-lg">
                Next Step <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSignup} className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-primary">
                  <Globe className="h-5 w-5" />
                  <label className="text-xs font-black uppercase tracking-widest">Select Study Language Style</label>
                </div>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger className="h-16 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none font-bold text-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl">
                    {languages.map(l => <SelectItem key={l} value={l} className="font-medium h-12">{l}</SelectItem>)}
                  </SelectContent>
                </Select>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest text-center">AI will give feedback in this mix style</p>
              </div>
              <div className="flex gap-3">
                <Button variant="ghost" type="button" onClick={() => setStep(1)} className="flex-1 h-14 rounded-2xl font-bold">Back</Button>
                <Button type="submit" className="flex-[2] h-14 rounded-2xl font-bold text-lg" disabled={loading}>
                  {loading ? <Loader2 className="animate-spin h-6 w-6" /> : "Complete Signup"}
                </Button>
              </div>
            </form>
          )}
          <div className="mt-8 text-center text-sm font-medium">
            <span className="text-slate-400">Already a scholar? </span>
            <Link href="/login" className="text-primary font-bold hover:underline">Log In</Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
