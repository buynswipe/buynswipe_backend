"use client"

import { useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

export function ForceRedirect() {
  const supabase = createClientComponentClient()

  useEffect(() => {
    const checkRole = async () => {
      try {
        // Get current session
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!session) {
          window.location.href = "/login"
          return
        }

        // Get user profile
        const { data: profile } = await supabase.from("profiles").select("role").eq("id", session.user.id).single()

        if (profile?.role === "delivery_partner") {
          console.log("Forcing redirect to delivery partner dashboard")
          window.location.href = "/delivery-partner/dashboard"
        }
      } catch (error) {
        console.error("Error checking role:", error)
      }
    }

    checkRole()
  }, [supabase])

  return null
}
