"use client"

import type React from "react"
import { Sidebar } from "@/components/dashboard/sidebar"
import { DashboardHeader } from "@/components/dashboard/header"
import { MobileNavigation } from "@/components/mobile-navigation"
import { redirect } from "next/navigation"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Use createServerComponentClient instead of createServerSupabaseClient
  const supabase = createServerComponentClient({ cookies })

  // Get user session
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login")
  }

  // Get user profile
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", session.user.id).single()

  // Redirect delivery partners to their dashboard
  if (profile?.role === "delivery_partner") {
    redirect("/delivery-partner/dashboard")
  }

  return (
    <>
      {/* Hide site header and footer on dashboard pages */}
      <style jsx global>{`
        header.site-header, footer.site-footer {
          display: none !important;
        }
      `}</style>

      <div className="grid min-h-screen w-full md:grid-cols-[240px_1fr] lg:grid-cols-[280px_1fr]">
        <Sidebar className="hidden border-r md:block" />
        <div className="flex flex-col">
          <DashboardHeader />
          <main className="flex-1 p-4 md:p-6 pb-20 md:pb-6">{children}</main>
          <MobileNavigation />
        </div>
      </div>
    </>
  )
}
