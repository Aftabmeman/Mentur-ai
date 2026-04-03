
"use client"

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { SidebarNav } from "@/components/dashboard/SidebarNav"
import { Sparkles, Bell, Search, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-background overflow-hidden">
        <SidebarNav />
        <SidebarInset className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className="h-20 border-b flex items-center justify-between px-8 bg-white/50 backdrop-blur-md sticky top-0 z-10">
            <div className="flex items-center gap-4 flex-1">
              <div className="relative w-full max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search materials, assessments..." 
                  className="pl-10 h-10 bg-slate-100/50 border-none rounded-full focus-visible:ring-primary/20"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-primary">
                <Bell className="h-5 w-5" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border-2 border-white"></span>
              </Button>
              <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center border-2 border-primary/10 overflow-hidden">
                <User className="h-5 w-5 text-slate-500" />
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-y-auto p-8 scroll-smooth">
            <div className="max-w-7xl mx-auto space-y-8 pb-12">
              {children}
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
