
"use client"

import { useEffect, useState } from "react"
import { auth } from "@/lib/firebase"
import { sendEmailVerification, reload } from "firebase/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Mail, RefreshCw, Loader2, LogOut, Info, ShieldAlert } from "lucide-react"
import { useRouter } from "next/navigation"

/**
 * Enhanced Email Verification Page for Discate.
 * Includes explicit spam folder instructions and reassuring server messaging.
 */
export default function VerifyEmailPage() {
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const checkVerification = async () => {
    setChecking(true)
    try {
      if (!auth.currentUser) throw new Error("No active session found.");
      
      await reload(auth.currentUser)
      if (auth.currentUser?.emailVerified) {
        toast({ 
          title: "Identity Authenticated", 
          description: "Your academic profile is now active. Welcome to Discate." 
        })
        router.push("/dashboard")
      } else {
        toast({ 
          variant: "destructive",
          title: "Verification Pending", 
          description: "Our high-security servers haven't detected the activation yet. Please ensure you clicked the link in your email.", 
        })
      }
    } catch (error: any) {
      toast({ 
        variant: "destructive", 
        title: "Synchronization Delay", 
        description: "Intense server traffic detected. Please wait a moment and try again." 
      })
    } finally {
      setChecking(false)
    }
  }

  const resendEmail = async () => {
    setLoading(true)
    try {
      if (!auth.currentUser) throw new Error("Session expired.");
      
      await sendEmailVerification(auth.currentUser)
      toast({ 
        title: "New Link Dispatched", 
        description: "An encrypted verification link is on its way. Please check your Inbox and Spam folder carefully." 
      })
    } catch (error: any) {
      toast({ 
        variant: "destructive", 
        title: "Dispatch Frequency Limit", 
        description: "To maintain elite security, we limit link requests. Please wait before requesting another.", 
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <Card className="w-full max-w-md border-none shadow-[0_25px_60px_rgba(0,0,0,0.1)] rounded-[2.5rem] bg-white dark:bg-slate-900 overflow-hidden text-center relative">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary via-accent to-primary" />
        
        <CardHeader className="pt-12 pb-6">
          <div className="bg-primary/10 h-20 w-20 rounded-[1.5rem] flex items-center justify-center mx-auto mb-6 shadow-sm border border-primary/5">
            <Mail className="text-primary h-10 w-10" />
          </div>
          <CardTitle className="text-3xl font-black font-headline tracking-tighter text-slate-900 dark:text-white uppercase">Activate Profile</CardTitle>
          <CardDescription className="px-4 text-slate-500 font-medium leading-relaxed mt-4">
            An activation link has been dispatched to:<br />
            <span className="font-black text-slate-900 dark:text-white mt-2 block break-all">{auth.currentUser?.email}</span>
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6 p-8 pt-2">
          {/* Important Spam Folder Notice */}
          <div className="bg-amber-50 dark:bg-amber-900/10 p-5 rounded-2xl border border-amber-100 dark:border-amber-900/20 flex gap-4 text-left">
            <ShieldAlert className="h-6 w-6 text-amber-600 shrink-0 mt-1" />
            <div className="space-y-1">
              <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Scholar Notice</p>
              <p className="text-xs text-amber-800 dark:text-amber-400 font-medium leading-relaxed">
                If the email is not in your <strong>Inbox</strong>, please check your <strong>Spam</strong> or <strong>Junk</strong> folder. Elite academic filters sometimes misroute activation links.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <Button 
              className="w-full h-14 rounded-2xl font-black text-lg bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20 group" 
              onClick={checkVerification} 
              disabled={checking}
            >
              {checking ? <Loader2 className="animate-spin h-6 w-6" /> : <RefreshCw className="h-5 w-5 mr-2 group-hover:rotate-180 transition-transform duration-500" />}
              I've Activated My Email
            </Button>
            
            <div className="grid grid-cols-1 gap-2">
              <Button 
                variant="outline" 
                className="w-full h-12 rounded-xl font-bold border-2 hover:bg-slate-50 dark:hover:bg-slate-800" 
                onClick={resendEmail} 
                disabled={loading}
              >
                {loading ? "Re-dispatching..." : "Resend Activation Link"}
              </Button>
              
              <Button 
                variant="ghost" 
                className="w-full h-10 text-slate-400 font-bold text-xs uppercase tracking-widest" 
                onClick={() => auth.signOut()}
              >
                <LogOut className="h-4 w-4 mr-2" /> Change Account
              </Button>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-center gap-2 text-[8px] font-black text-slate-300 uppercase tracking-[0.4em]">
            <Info className="h-3 w-3" /> Secure Academic Gateway
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
