"use client"

import type React from "react"
import { Sidebar } from "@/components/dashboard/sidebar"
import { DashboardHeader } from "@/components/dashboard/header"
import { MobileNavigation } from "@/components/mobile-navigation"

export function DashboardLayoutClient({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <style jsx global>{`
        header.site-header, footer.site-footer {
          display: none !important;
        }
      `}</style>

      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
        <Sidebar className="hidden lg:block" />
        <div className="flex-1 flex flex-col">
          <DashboardHeader />
          <main className="flex-1 p-6 pb-20 lg:pb-6 overflow-auto">
            <div className="animate-fade-in">{children}</div>
          </main>
          <MobileNavigation />
        </div>
      </div>
    </>
  )
}
