import { redirect } from "next/navigation"
import { createServerSupabaseClient } from "@/lib/supabase-server"
import { headers } from "next/headers"

export default async function Home() {
  try {
    const supabase = createServerSupabaseClient()
    const headersList = headers()
    const redirectUrl = headersList.get("next-url")

    // Check if user is logged in
    const {
      data: { session },
    } = await supabase.auth.getSession()

    // If not logged in, redirect to login
    if (!session) {
      const redirectURL = new URL("/login", redirectUrl).toString()
      return redirect(redirectURL)
    }

    // Get user profile to check role
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", session.user.id).single()

    // Default redirect path
    let redirectPath = "/dashboard/main"

    // Redirect based on role if profile exists
    if (profile?.role) {
      if (profile.role === "delivery_partner") {
        redirectPath = "/delivery-partner/dashboard"
      } else if (profile.role === "wholesaler") {
        redirectPath = "/wholesaler-dashboard"
      }
    }

    return redirect(redirectPath)
  } catch (error) {
    console.error("Root page error:", error)
    // If there's any error, redirect to login as a fallback
    return redirect("/login")
  }
}
