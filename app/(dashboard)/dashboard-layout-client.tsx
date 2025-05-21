"use client"

import { type ReactNode, useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { DashboardHeader } from "@/components/dashboard/header"
import { Sidebar } from "@/components/dashboard/sidebar"
import { MobileNavigation } from "@/components/mobile-navigation"
import { Toaster } from "@/components/ui/toaster"
import { useMediaQuery } from "@/hooks/use-media-query"
import { ScrollArea } from "@/components/ui/scroll-area"

interface DashboardLayoutClientProps {
  children: ReactNode
}

export function DashboardLayoutClient({ children }: DashboardLayoutClientProps) {
  const pathname = usePathname()
  const isDesktop = useMediaQuery("(min-width: 1024px)")
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  const handleScroll = (event: any) => {
    setIsScrolled(event.target.scrollTop > 10)
  }

  // Close sidebar when route changes on mobile
  useEffect(() => {
    if (!isDesktop) {
      setIsSidebarOpen(false)
    }
  }, [pathname, isDesktop])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {isDesktop ? (
        <div className="dashboard-layout">
          <div className={cn("dashboard-sidebar fixed h-full z-30", isSidebarOpen ? "" : "hidden lg:block")}>
            <ScrollArea className="h-full bg-white dark:bg-gray-950 border-r">
              <Sidebar className="p-4 w-full py-6" />
            </ScrollArea>
          </div>
          <div className={cn("dashboard-header sticky top-0 z-40", isScrolled ? "shadow-sm" : "")}>
            <DashboardHeader onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
          </div>
          <main className="dashboard-main p-0" onScroll={handleScroll}>
            <div className="container py-6 max-w-7xl animate-fade-in">{children}</div>
          </main>
        </div>
      ) : (
        // Mobile layout
        <div className="flex flex-col min-h-screen">
          <DashboardHeader onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
          <main className="flex-1 p-4 pb-24">
            <div className="dashboard-content animate-fade-in">{children}</div>
          </main>
          <MobileNavigation />
        </div>
      )}

      {/* Mobile sidebar */}
      {!isDesktop && (
        <div
          className={cn(
            "fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity",
            isSidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none",
          )}
          onClick={() => setIsSidebarOpen(false)}
        >
          <div
            className={cn(
              "fixed top-0 left-0 h-full w-3/4 max-w-xs z-50 bg-white dark:bg-gray-950 shadow-xl transition-transform p-4",
              isSidebarOpen ? "translate-x-0" : "-translate-x-full",
            )}
            onClick={(e) => e.stopPropagation()}
          >
            <ScrollArea className="h-full">
              <Sidebar className="py-6" />
            </ScrollArea>
          </div>
        </div>
      )}

      <Toaster />
    </div>
  )
}
