import { redirect } from "next/navigation"
import { createServerSupabaseClient } from "@/lib/supabase-server"

export default async function Home() {
  try {
    const supabase = createServerSupabaseClient()

    // Get the user session
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession()

    if (error) {
      console.error("Error getting session:", error)
      redirect("/login")
      return null
    }

    if (!session) {
      redirect("/login")
      return null
    }

    // Get the user profile to determine role
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", session.user.id)
      .single()

    if (profileError) {
      console.error("Error getting profile:", profileError)
      redirect("/login")
      return null
    }

    // Redirect based on role
    if (profile.role === "delivery_partner") {
      redirect("/delivery-partner/dashboard")
    } else if (profile.role === "wholesaler") {
      redirect("/wholesaler-dashboard")
    } else {
      redirect("/dashboard/main")
    }
  } catch (error) {
    console.error("Unexpected error in Home page:", error)
    redirect("/login")
  }

  return null
}
