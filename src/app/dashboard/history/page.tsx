
"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { 
  History, 
  Inbox, 
  Search,
  Filter,
  Calendar,
  ChevronRight,
  BookOpen,
  FileEdit,
  GraduationCap
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function HistoryPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline tracking-tight text-slate-900">Study History</h1>
          <p className="text-muted-foreground text-lg">Review your past assessments, essays, and study sessions.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="rounded-xl h-10">
            <Calendar className="mr-2 h-4 w-4" />
            Full Calendar
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search sessions, topics or keywords..." 
            className="pl-10 h-11 rounded-xl bg-white border-slate-200"
          />
        </div>
        <Button variant="outline" className="h-11 rounded-xl px-6 border-slate-200">
          <Filter className="mr-2 h-4 w-4" />
          Filter
        </Button>
      </div>

      <Card className="border-none shadow-sm overflow-hidden min-h-[400px]">
        <CardHeader className="border-b bg-slate-50/50">
          <CardTitle className="text-lg font-headline flex items-center gap-2">
            <History className="h-5 w-5 text-primary" />
            Recent Activity
          </CardTitle>
          <CardDescription>Your academic timeline.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {/* Empty State */}
          <div className="flex flex-col items-center justify-center py-24 text-center px-6">
            <div className="bg-slate-100 p-6 rounded-full mb-4">
              <Inbox className="h-12 w-12 text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Your history is clear</h3>
            <p className="text-slate-500 max-w-sm mt-2">
              You haven't completed any assessments or evaluations yet. Your journey begins with your first study material.
            </p>
            <div className="flex gap-4 mt-8">
              <Button variant="outline" className="rounded-xl px-8 h-11">Upload Material</Button>
              <Button className="rounded-xl px-8 h-11 bg-primary">Start Learning</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-blue-50 p-3 rounded-xl group-hover:bg-blue-100 transition-colors">
                <GraduationCap className="h-6 w-6 text-blue-600" />
              </div>
              <div className="text-left">
                <p className="text-sm font-bold text-slate-900">Assessments</p>
                <p className="text-xs text-muted-foreground">0 completed</p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-primary transition-colors" />
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-purple-50 p-3 rounded-xl group-hover:bg-purple-100 transition-colors">
                <FileEdit className="h-6 w-6 text-purple-600" />
              </div>
              <div className="text-left">
                <p className="text-sm font-bold text-slate-900">Essay Lab</p>
                <p className="text-xs text-muted-foreground">0 evaluated</p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-primary transition-colors" />
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-amber-50 p-3 rounded-xl group-hover:bg-amber-100 transition-colors">
                <BookOpen className="h-6 w-6 text-amber-600" />
              </div>
              <div className="text-left">
                <p className="text-sm font-bold text-slate-900">Materials</p>
                <p className="text-xs text-muted-foreground">0 ingested</p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-primary transition-colors" />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
