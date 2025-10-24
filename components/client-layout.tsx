"use client"

import type React from "react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { AIBandhuFloatingButton } from "@/components/ai-bandhu/floating-button"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

export function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const pathname = usePathname()
  const [userRole, setUserRole] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClientComponentClient()

  // Check if we should show AI Bandhu on this page
  const shouldShowAIBandhu =
    pathname.startsWith("/(dashboard)") ||
    pathname.startsWith("/(delivery-partner)") ||
    pathname.includes("/dashboard") ||
    pathname.includes("/delivery-partner")

  useEffect(() => {
    const getUserRole = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()
        if (session) {
          const { data: profile } = await supabase.from("profiles").select("role").eq("id", session.user.id).single()
          setUserRole(profile?.role || "user")
        }
      } catch (error) {
        console.error("Error fetching user role:", error)
      } finally {
        setLoading(false)
      }
    }

    getUserRole()
  }, [supabase])

  return (
    <div className="relative flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      {shouldShowAIBandhu && !loading && userRole && <AIBandhuFloatingButton role={userRole} />}
      <SiteFooter />
    </div>
  )
}
