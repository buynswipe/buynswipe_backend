import type React from "react"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export default async function AIBandhuLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createServerComponentClient({ cookies })

  // Get user session
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login")
  }

  // Get user profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, is_approved")
    .eq("id", session.user.id)
    .single()

  if (!profile) {
    redirect("/login")
  }

  // Check if user is approved
  if (!profile.is_approved) {
    redirect("/pending-approval")
  }

  // Verify user has access to AI Bandhu
  const allowedRoles = ["admin", "retailer", "wholesaler", "delivery_partner"]
  if (!allowedRoles.includes(profile.role)) {
    redirect("/dashboard")
  }

  return <>{children}</>
}
