
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  LayoutDashboard, 
  GraduationCap, 
  FileEdit, 
  History, 
  BarChart3, 
  Settings,
  LogOut,
  Sparkles,
  Youtube
} from "lucide-react"
import { cn } from "@/lib/utils"
import { 
  Sidebar, 
  SidebarContent, 
  SidebarFooter, 
  SidebarHeader, 
  SidebarMenu, 
  SidebarMenuButton, 
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent
} from "@/components/ui/sidebar"

const mainNavItems = [
  { icon: LayoutDashboard, label: "Overview", href: "/dashboard" },
  { icon: GraduationCap, label: "Assessments", href: "/dashboard/assessments" },
  { icon: FileEdit, label: "Writing Lab", href: "/dashboard/essay-lab" },
  { icon: Youtube, label: "YouTube Lab", href: "/dashboard/youtube-lab" },
]

const statsNavItems = [
  { icon: BarChart3, label: "Performance", href: "/dashboard/performance" },
  { icon: History, label: "History", href: "/dashboard/history" },
]

export function SidebarNav() {
  const pathname = usePathname()

  return (
    <Sidebar className="border-r-0 bg-sidebar">
      <SidebarHeader className="h-20 flex items-center justify-start px-6">
        <div className="flex items-center gap-2">
          <div className="bg-primary p-2 rounded-xl">
            <Sparkles className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold font-headline text-sidebar-foreground tracking-tight">Discate</span>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/40 px-6 mb-2">Main Menu</SidebarGroupLabel>
          <SidebarGroupContent className="px-3">
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={pathname === item.href}
                    className={cn(
                      "h-11 px-3 text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-all duration-200",
                      pathname === item.href && "bg-sidebar-accent text-primary font-medium"
                    )}
                  >
                    <Link href={item.href}>
                      <item.icon className={cn("h-5 w-5", pathname === item.href ? "text-primary" : "")} />
                      <span className="text-sm">{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-4">
          <SidebarGroupLabel className="text-sidebar-foreground/40 px-6 mb-2">Insights</SidebarGroupLabel>
          <SidebarGroupContent className="px-3">
            <SidebarMenu>
              {statsNavItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={pathname === item.href}
                    className={cn(
                      "h-11 px-3 text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-all duration-200",
                      pathname === item.href && "bg-sidebar-accent text-primary font-medium"
                    )}
                  >
                    <Link href={item.href}>
                      <item.icon className={cn("h-5 w-5", pathname === item.href ? "text-primary" : "")} />
                      <span className="text-sm">{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-6 border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton className="h-10 text-sidebar-foreground/60 hover:text-sidebar-foreground">
              <Settings className="h-5 w-5" />
              <span>Settings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton className="h-10 text-destructive hover:text-destructive/80">
              <LogOut className="h-5 w-5" />
              <span>Log out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
