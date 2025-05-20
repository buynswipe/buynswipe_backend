"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { RoleGuard } from "@/components/role-guard"
import DashboardContent from "./dashboard-content"

export default function DashboardPage() {
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    const checkUserRole = async () => {
      try {
        // Get session
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!session) {
          router.push("/login")
          return
        }

        // Get user profile to check role
        const { data: profile } = await supabase.from("profiles").select("role").eq("id", session.user.id).single()

        // Redirect based on role
        if (profile?.role === "delivery_partner") {
          console.log("Redirecting delivery partner to /delivery-partner/dashboard")
          router.push("/delivery-partner/dashboard")
        } else if (profile?.role === "wholesaler") {
          console.log("Redirecting wholesaler to /wholesaler-dashboard")
          router.push("/wholesaler-dashboard")
        } else if (profile?.role === "retailer") {
          // For retailers, load the retailer dashboard
          router.push("/dashboard/main")
        } else if (profile?.role === "admin") {
          // For admins, load the admin dashboard
          router.push("/dashboard/main")
        } else {
          // For unknown roles, still try to redirect to a safe page
          router.push("/dashboard/main")
        }
      } catch (error) {
        console.error("Error checking user role:", error)
        // If there's an error, still try to redirect to a safe page
        router.push("/dashboard/main")
      }
    }

    checkUserRole()
  }, [router, supabase])

  return (
    <RoleGuard allowedRoles={["admin", "retailer", "wholesaler"]}>
      <DashboardContent />
    </RoleGuard>
  )
}
