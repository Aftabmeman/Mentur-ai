
"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/providers/AuthProvider"
import { useTheme } from "@/components/providers/ThemeProvider"
import { auth, firestore } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { 
  LogOut, 
  ShieldCheck, 
  Moon, 
  Sun, 
  ChevronRight, 
  Award, 
  BookMarked, 
  Loader2, 
  Coins, 
  Globe, 
  Info,
  Rocket,
  Target,
  Heart
} from "lucide-react"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { MenturLogo } from "@/components/MenturLogo"
import { useToast } from "@/hooks/use-toast"
import { useDoc, useMemoFirebase } from "@/firebase"
import { doc, updateDoc } from "firebase/firestore"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const languages = [
  "English", "Hinglish", "Marathish", "Gujaratinglish", "Bengalish", 
  "Punjabish", "Tamilish", "Telugush", "Kannadish", "Malayalish"
];

const aboutTranslations: Record<string, any> = {
  "English": {
    title: "About Mentur AI",
    vision: {
      head: "Our Vision",
      body: "We envision a world where the cognitive limitations of traditional education are dissolved through seamless human-AI symbiosis. Mentur AI aims to be the global standard for personalized intelligence, transforming how knowledge is perceived, ingested, and mastered. We strive to create an ecosystem where every student has access to an elite, personal professor that never tires and always inspires."
    },
    mission: {
      head: "Our Mission",
      body: "Our mission is to democratize high-tier academic mentorship by leveraging state-of-the-art Generative AI. We are dedicated to providing students with deep-metric evaluations—covering grammar, depth, and relevancy—that were previously reserved for elite private tutoring. By making these tools accessible to everyone, we bridge the gap between effort and academic mastery."
    },
    motive: {
      head: "Our Motive",
      body: "At our core, we are driven by the belief that potential is universal but opportunity is not. Our motive is to empower the modern scholar with the confidence to tackle any subject, regardless of their background or regional language. We exist to ignite the spark of intellectual curiosity and provide the technological ladder required to reach the peak of academic performance."
    }
  },
  "Hinglish": {
    title: "About Mentur AI",
    vision: {
      head: "Hamara Vision",
      body: "Hum ek aisa world dekhte hain jahan traditional education ki limitations human-AI symbiosis se khatam ho jayein. Mentur AI ka goal hai personalized intelligence ka global standard banna, taaki knowledge lene aur use master karne ka tareeka hamesha ke liye badal jaye. Hum ek aisa ecosystem bana rahe hain jahan har student ke paas ek elite, personal professor ho jo kabhi thakta nahi."
    },
    mission: {
      head: "Hamara Mission",
      body: "Hamara mission hai high-tier academic mentorship ko sabke liye aasaan banana. Hum dedicated hain students ko deep-metric evaluations dene ke liye—jo grammar, depth aur relevancy cover karein—jo pehle sirf mehengi private tutoring mein milti thi. In tools ko sabke liye accessible banakar hum effort aur mastery ke beech ka gap khatam kar rahe hain."
    },
    motive: {
      head: "Hamara Motive",
      body: "Hamara core belief hai ki potential har jagah hai par opportunity nahi. Hamara motive hai modern scholars ko wo confidence dena jisse wo kisi bhi subject ko master kar sakein, chahe unka background ya regional language kuch bhi ho. Hum intellectual curiosity ki chingaari ko jalane aur academic performance ke peak tak pahunchne ke liye technological ladder provide karte hain."
    }
  },
  "Marathish": {
    title: "Mentur AI बद्दल",
    vision: {
      head: "आमचे व्हिजन",
      body: "आम्ही अशा जगाची कल्पना करतो जिथे पारंपारिक शिक्षणाच्या मर्यादा मानवी-AI सहजीवनाद्वारे नाहीशा होतील. Mentur AI चे उद्दिष्ट वैयक्तिकृत बुद्धिमत्तेसाठी जागतिक मानक बनणे आहे, ज्यामुळे ज्ञानाकडे पाहण्याचा आणि ते आत्मसात करण्याचा दृष्टिकोन बदलेल. आम्ही अशी परिसंस्था निर्माण करण्याचा प्रयत्न करतो जिथे प्रत्येक विद्यार्थ्याला एका उच्चभ्रू, वैयक्तिक प्राध्यापकाचा प्रवेश मिळेल जो कधीही थकत नाही."
    },
    mission: {
      head: "आमचे मिशन",
      body: "अत्याधुनिक जनरेटिव्ह एआयचा वापर करून उच्च-स्तरीय शैक्षणिक मार्गदर्शन सर्वांसाठी उपलब्ध करून देणे हे आमचे ध्येय आहे. आम्ही विद्यार्थ्यांना व्याकरण, खोली आणि सुसंगतता समाविष्ट असलेली सखोल-मेट्रिक मूल्यमापन प्रदान करण्यासाठी समर्पित आहोत—जे पूर्वी फक्त महागड्या खाजगी शिकवणीसाठी राखीव होते. ही साधने सर्वांसाठी उपलब्ध करून देऊन, आम्ही प्रयत्न आणि शैक्षणिक प्रभुत्व यातील दरी कमी करतो."
    },
    motive: {
      head: "आमचा हेतू",
      body: "आमचा ठाम विश्वास आहे की क्षमता सार्वत्रिक आहे परंतु संधी नाही. आमचा हेतू आधुनिक विद्वानांना कोणत्याही विषयाचा सामना करण्याचा आत्मविश्वास देणे हा आहे, मग त्यांची पार्श्वभूमी किंवा प्रादेशिक भाषा कोणतीही असो. आम्ही बौद्धिक कुतूहलाची ठिणगी पेटवण्यासाठी आणि शैक्षणिक कामगिरीच्या शिखरावर पोहोचण्यासाठी आवश्यक शिडी प्रदान करण्यासाठी अस्तित्वात आहोत."
    }
  },
  "Hindi": {
    title: "Mentur AI के बारे में",
    vision: {
      head: "हमारा विजन",
      body: "हम एक ऐसी दुनिया की कल्पना करते हैं जहां पारंपरिक शिक्षा की संज्ञानात्मक सीमाएं मानव-एआई सहजीवन के माध्यम से समाप्त हो जाएं। Mentur AI का लक्ष्य व्यक्तिगत बुद्धिमत्ता के लिए वैश्विक मानक बनना है, जिससे ज्ञान को समझने और उसमें महारत हासिल करने का तरीका बदल जाए। हम एक पारिस्थितिकी तंत्र बनाने का प्रयास करते हैं जहां हर छात्र के पास एक विशिष्ट, व्यक्तिगत प्रोफेसर तक पहुंच हो जो कभी थकता नहीं है।"
    },
    mission: {
      head: "हमारा मिशन",
      body: "हमारा मिशन अत्याधुनिक जेनरेटिव एआई का लाभ उठाकर उच्च-स्तरीय शैक्षणिक परामर्श को सुलभ बनाना है। हम छात्रों को व्याकरण, गहराई और प्रासंगिकता को कवर करने वाले गहन-मीट्रिक मूल्यांकन प्रदान करने के लिए समर्पित हैं—जो पहले केवल विशिष्ट निजी ट्यूशन के लिए आरक्षित थे। इन उपकरणों को सभी के लिए सुलभ बनाकर, हम प्रयास और शैक्षणिक महारत के बीच की खाई को पाटते हैं।"
    },
    motive: {
      head: "हमारा उद्देश्य",
      body: "हमारा मानना है कि क्षमता सार्वभौमिक है लेकिन अवसर नहीं। हमारा उद्देश्य आधुनिक विद्वानों को किसी भी विषय को हल करने के आत्मविश्वास के साथ सशक्त बनाना है, चाहे उनकी पृष्ठभूमि या क्षेत्रीय भाषा कुछ भी हो। हम बौद्धिक जिज्ञासा की चिंगारी को जगाने और शैक्षणिक प्रदर्शन के शिखर तक पहुँचने के लिए आवश्यक तकनीकी सीढ़ी प्रदान करने के लिए मौजूद हैं।"
    }
  }
};

export default function ProfilePage() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const { toast } = useToast();

  const [isMounted, setIsMounted] = useState(false);
  const [isUpdatingLang, setIsUpdatingLang] = useState(false);

  const profileRef = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return doc(firestore, "users", user.uid, "profile", "stats");
  }, [user?.uid]);

  const { data: profile } = useDoc(profileRef);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      router.push("/login");
    } catch (e) {
      console.error("Sign out error", e);
    }
  };

  const handleLanguageUpdate = async (newLang: string) => {
    if (!profileRef) return;
    setIsUpdatingLang(true);
    try {
      await updateDoc(profileRef, { preferredLanguage: newLang });
      toast({ title: "Mix Style Updated", description: `Default study mix is now ${newLang}` });
    } catch (error) {
      toast({ title: "Update Failed", variant: "destructive" });
    } finally {
      setIsUpdatingLang(false);
    }
  };

  if (!isMounted) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-10 w-10 animate-spin text-primary/10" />
      </div>
    );
  }

  const currentLang = profile?.preferredLanguage || "English";
  const content = aboutTranslations[currentLang] || aboutTranslations["English"];

  return (
    <div className="space-y-8 sm:space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700 pb-40 px-4 max-w-2xl mx-auto">
      <div className="flex flex-col items-center pt-8 sm:pt-10 pb-4">
        <div className="relative inline-block group">
          <div className="absolute inset-0 bg-primary/20 blur-[80px] rounded-full scale-150 transition-all" />
          <MenturLogo size="md" className="sm:hidden" />
          <MenturLogo size="lg" className="hidden sm:flex" />
          <div className="absolute -top-1 -right-1 z-10 h-8 w-8 sm:h-12 sm:w-12 bg-emerald-500 rounded-xl sm:rounded-[20px] border-2 sm:border-4 border-white dark:border-slate-900 flex items-center justify-center shadow-xl">
             <ShieldCheck className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
          </div>
        </div>
        <div className="mt-6 sm:mt-10 text-center space-y-1 sm:space-y-2">
          <h1 className="text-2xl sm:text-4xl font-black font-headline tracking-tighter text-slate-900 dark:text-white uppercase leading-none">
            {user?.displayName ?? "Scholar"}
          </h1>
          <p className="text-slate-500 text-[10px] sm:text-xs font-black uppercase tracking-[0.3em]">
            Elite Academic Voyager
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 sm:gap-5">
        {[
          { icon: Coins, label: "Coins", val: profile?.totalCoins?.toString() ?? "0", color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-900/10" },
          { icon: Award, label: "Level", val: profile?.level ?? "Lvl 1", color: "text-primary", bg: "bg-primary/10" },
          { icon: BookMarked, label: "Sets", val: profile?.assessmentsDone?.toString() ?? "0", color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-900/10" }
        ].map((stat, i) => (
          <Card key={i} className="p-4 sm:p-6 flex flex-col items-center justify-center text-center rounded-[2rem] sm:rounded-[2.5rem] border-none bg-white dark:bg-slate-900 shadow-xl border border-slate-50 dark:border-white/5 transition-all hover:scale-105">
            <div className={cn("p-2.5 sm:p-4 rounded-xl mb-2 sm:mb-4 shadow-sm", stat.bg)}>
              <stat.icon className={cn("h-4 w-4 sm:h-6 sm:w-6", stat.color)} />
            </div>
            <span className="text-[7px] sm:text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">{stat.label}</span>
            <span className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white leading-none">{stat.val}</span>
          </Card>
        ))}
      </div>

      <div className="space-y-6 sm:space-y-12">
        <div className="space-y-4 sm:space-y-6">
          <h3 className="text-[9px] sm:text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] px-2 flex items-center gap-2">
            <Info className="h-3 w-3 text-primary" /> {content.title}
          </h3>
          <Card className="rounded-[2rem] sm:rounded-[2.5rem] border-none shadow-2xl bg-white dark:bg-slate-900 overflow-hidden border border-slate-50 dark:border-white/5">
            <CardContent className="p-6 sm:p-10 space-y-8">
              <div className="space-y-3 sm:space-y-4 text-left">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center"><Rocket className="h-4 w-4 text-primary" /></div>
                  <h4 className="text-lg sm:text-xl font-black font-headline text-slate-900 dark:text-white tracking-tight">{content.vision.head}</h4>
                </div>
                <p className="text-xs sm:text-base text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                  {content.vision.body}
                </p>
              </div>

              <div className="space-y-3 sm:space-y-4 text-left">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center"><Target className="h-4 w-4 text-emerald-600" /></div>
                  <h4 className="text-lg sm:text-xl font-black font-headline text-slate-900 dark:text-white tracking-tight">{content.mission.head}</h4>
                </div>
                <p className="text-xs sm:text-base text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                  {content.mission.body}
                </p>
              </div>

              <div className="space-y-3 sm:space-y-4 text-left">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center"><Heart className="h-4 w-4 text-amber-600" /></div>
                  <h4 className="text-lg sm:text-xl font-black font-headline text-slate-900 dark:text-white tracking-tight">{content.motive.head}</h4>
                </div>
                <p className="text-xs sm:text-base text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                  {content.motive.body}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-3 sm:space-y-4">
          <h3 className="text-[9px] sm:text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] px-2 flex items-center gap-2">
            <Globe className="h-3 w-3 text-primary" /> Study Preferences
          </h3>
          <Card className="p-6 sm:p-10 rounded-[2rem] sm:rounded-[2.5rem] border-none shadow-xl bg-white dark:bg-slate-900 space-y-4 sm:space-y-6">
             <div className="flex items-center gap-2 sm:gap-3 text-primary">
                <span className="text-[9px] sm:text-[11px] font-black uppercase tracking-[0.2em]">Feedback Mix Style</span>
             </div>
             <Select disabled={isUpdatingLang} value={profile?.preferredLanguage || "English"} onValueChange={handleLanguageUpdate}>
                <SelectTrigger className="h-14 sm:h-20 rounded-[1.2rem] sm:rounded-[1.8rem] bg-slate-50 dark:bg-slate-950 border-none font-black text-sm sm:text-lg px-6 sm:px-10 shadow-inner">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-[1.2rem] border-none shadow-2xl">
                   {languages.map(l => <SelectItem key={l} value={l} className="h-12 font-bold text-sm">{l}</SelectItem>)}
                </SelectContent>
             </Select>
             <p className="text-[8px] sm:text-[10px] text-slate-400 font-bold uppercase tracking-widest text-center px-4 leading-relaxed">AI Mentor will evaluate your essays using this regional mix.</p>
          </Card>
        </div>

        <div className="space-y-3 sm:space-y-4">
          <h3 className="text-[9px] sm:text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] px-2 flex items-center gap-2">
            <Sun className="h-3 w-3 text-primary" /> Appearance
          </h3>
          <Card 
            className="flex items-center justify-between p-6 sm:p-10 rounded-[2rem] sm:rounded-[2.5rem] cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all border-none shadow-xl bg-white dark:bg-slate-900 group"
            onClick={toggleTheme}
          >
            <div className="flex items-center gap-4 sm:gap-6">
              <div className="p-3 sm:p-5 bg-slate-50 dark:bg-slate-800 rounded-xl shadow-sm group-hover:scale-110 transition-transform">
                {theme === "light" ? <Moon className="h-5 w-5 sm:h-7 sm:w-7 text-slate-600" /> : <Sun className="h-5 w-5 sm:h-7 sm:w-7 text-amber-500" />}
              </div>
              <span className="font-black text-lg sm:text-xl text-slate-800 dark:text-slate-100">{theme === "light" ? "Dark Mode" : "Light Mode"}</span>
            </div>
            <ChevronRight className="h-5 w-5 sm:h-7 sm:w-7 text-slate-200 group-hover:translate-x-1 transition-transform" />
          </Card>
        </div>

        <div className="pt-4 sm:pt-6">
          <Card 
            className="flex items-center justify-between p-6 sm:p-10 rounded-[2rem] sm:rounded-[2.5rem] cursor-pointer hover:bg-destructive/5 transition-all border-none shadow-xl bg-white dark:bg-slate-900 group"
            onClick={handleLogout}
          >
            <div className="flex items-center gap-4 sm:gap-6">
              <div className="p-3 sm:p-5 bg-destructive/5 rounded-xl group-hover:scale-110 transition-transform">
                <LogOut className="h-5 w-5 sm:h-7 sm:w-7 text-destructive" />
              </div>
              <span className="font-black text-lg sm:text-xl text-destructive">Sign Out</span>
            </div>
            <ChevronRight className="h-5 w-5 sm:h-7 sm:w-7 text-destructive/20 group-hover:translate-x-1 transition-transform" />
          </Card>
        </div>
      </div>
    </div>
  )
}
