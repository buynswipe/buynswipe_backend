import type React from "react"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Use createServerComponentClient with cookies from next/headers
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
      <DashboardLayoutClient>{children}</DashboardLayoutClient>
    </>
  )
}

// Create a client component for the layout UI
import { DashboardLayoutClient } from "./dashboard-layout-client"
