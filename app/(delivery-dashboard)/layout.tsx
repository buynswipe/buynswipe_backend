import type React from "react"
import { redirect } from "next/navigation"
import { createServerSupabaseClient } from "@/lib/supabase-server"

export default async function DeliveryDashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createServerSupabaseClient()

  try {
    // Get user session
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      redirect("/login")
    }

    // Check user role and approval status
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("role, is_approved")
      .eq("id", session.user.id)
      .single()

    if (error) {
      console.error("Profile error:", error)
      throw new Error("Failed to fetch user profile")
    }

    // Redirect if not approved
    if (!profile.is_approved) {
      redirect("/pending-approval")
    }

    // Only delivery partners should access this layout
    if (profile.role !== "delivery_partner") {
      redirect("/dashboard")
    }

    return <div className="flex min-h-screen flex-col">{children}</div>
  } catch (error) {
    console.error("Delivery dashboard layout error:", error)
    throw error
  }
}
