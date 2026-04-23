
"use client"

import Link from "next/link"
import { ChevronLeft, Scale, Info, AlertTriangle, Mail } from "lucide-react"

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#fafafa] text-slate-900 font-body py-12 px-6 sm:py-20">
      <div className="max-w-3xl mx-auto space-y-12">
        {/* Navigation */}
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-indigo-600 font-bold text-sm uppercase tracking-widest hover:text-indigo-700 transition-colors group"
        >
          <ChevronLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </Link>

        {/* Header */}
        <div className="space-y-4 border-b border-slate-200 pb-8">
          <h1 className="text-4xl sm:text-5xl font-black font-headline tracking-tighter uppercase">Terms of Service</h1>
          <p className="text-slate-500 font-medium">Last Updated: April 23, 2026</p>
        </div>

        {/* Content */}
        <div className="space-y-10">
          <section className="space-y-4">
            <div className="flex items-center gap-3 text-indigo-600">
              <Info className="h-6 w-6" />
              <h2 className="text-xl font-black font-headline uppercase tracking-tight">Acceptance of Terms</h2>
            </div>
            <p className="text-slate-600 leading-relaxed">
              By accessing or using <strong>DISCATE AI</strong>, you agree to comply with and be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
            </p>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-3 text-indigo-600">
              <Scale className="h-6 w-6" />
              <h2 className="text-xl font-black font-headline uppercase tracking-tight">Service Description</h2>
            </div>
            <p className="text-slate-600 leading-relaxed">
              <strong>DISCATE AI</strong> is defined as an advanced educational mentorship tool. We leverage generative intelligence to provide assessments, flashcards, and writing feedback to enhance your academic performance.
            </p>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-3 text-indigo-600">
              <AlertTriangle className="h-6 w-6" />
              <h2 className="text-xl font-black font-headline uppercase tracking-tight">AI Guidance & Responsibility</h2>
            </div>
            <div className="space-y-4 text-slate-600 leading-relaxed">
              <p>
                All feedback, scores, and evaluations provided by <strong>DISCATE AI</strong> are intended for <strong>guidance only</strong>. While our algorithms are advanced, they are not a substitute for human academic judgment.
              </p>
              <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-xl">
                <p className="text-sm font-bold text-amber-900 uppercase tracking-widest mb-1">Scholar Notice</p>
                <p className="text-sm text-amber-800">
                  Users should use their own judgment for final academic submissions. DISCATE AI is not responsible for academic outcomes or grades based on its suggestions.
                </p>
              </div>
              <p>
                Users are solely responsible for the content they upload. You must ensure you have the right to process the materials you submit for evaluation.
              </p>
            </div>
          </section>

          <section className="space-y-4 pt-8 border-t border-slate-200">
            <div className="flex items-center gap-3 text-indigo-600">
              <Mail className="h-6 w-6" />
              <h2 className="text-xl font-black font-headline uppercase tracking-tight">Support & Inquiries</h2>
            </div>
            <p className="text-slate-600 leading-relaxed">
              For support or legal inquiries regarding these terms, please contact:
            </p>
            <Link 
              href="mailto:aftabghaswalaofficial@gmail.com" 
              className="text-indigo-600 font-black hover:underline text-lg"
            >
              aftabghaswalaofficial@gmail.com
            </Link>
          </section>
        </div>

        {/* Footer */}
        <footer className="pt-12 text-center opacity-30">
          <p className="text-[10px] font-black uppercase tracking-[0.4em]">DISCATE AI | Elite Terms</p>
        </footer>
      </div>
    </div>
  )
}
