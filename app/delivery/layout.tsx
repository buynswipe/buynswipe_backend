import type React from "react"
import { redirect } from "next/navigation"
import { createServerSupabaseClient } from "@/lib/supabase-server"
import { DeliveryPartnerHeader } from "@/components/delivery-partner/header"
import { DeliveryPartnerSidebar } from "@/components/delivery-partner/sidebar"

export default async function DeliveryLayout({ children }: { children: React.ReactNode }) {
  const supabase = createServerSupabaseClient()

  try {
    // Get user session
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      redirect("/login")
    }

    // Check user role
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("role, is_approved")
      .eq("id", session.user.id)
      .single()

    if (error) {
      console.error("Profile error:", error)
      redirect("/login")
    }

    // Redirect if not approved
    if (!profile.is_approved) {
      redirect("/pending-approval")
    }

    // Only delivery partners should access this layout
    if (profile.role !== "delivery_partner") {
      redirect("/dashboard")
    }

    return (
      <div className="flex min-h-screen flex-col">
        <DeliveryPartnerHeader />
        <div className="flex flex-1">
          <DeliveryPartnerSidebar className="w-64" />
          <main className="flex-1 p-6">{children}</main>
        </div>
      </div>
    )
  } catch (error) {
    console.error("Delivery layout error:", error)
    redirect("/login")
  }
}
