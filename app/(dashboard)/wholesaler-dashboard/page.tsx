import { createServerSupabaseClient } from "@/lib/supabase-server"
import { redirect } from "next/navigation"
import WholesalerDashboardClient from "./client-page"

export default async function WholesalerDashboardPage() {
  const supabase = createServerSupabaseClient()

  // Get user session
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login")
  }

  // Get user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()

  if (!profile) {
    redirect("/login")
  }

  // Only redirect delivery partners, allow other roles to view this page
  if (profile.role === "delivery_partner") {
    redirect("/delivery-partner/dashboard")
  }

  // For wholesalers and other roles, render the client component
  return <WholesalerDashboardClient />
}
