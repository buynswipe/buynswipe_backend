"use client"

import { createServerSupabaseClient } from "@/lib/supabase-server"
import { Badge } from "@/components/ui/badge"
import { useEffect } from "react"
import { useRouter } from "next/navigation"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default function MyDeliveriesPage() {
  const supabase = createServerSupabaseClient()
  const router = useRouter()

  useEffect(() => {
    const checkPartnerProfile = async () => {
      // Get user session
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        router.replace("/login")
        return
      }

      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single()

      if (profileError) {
        console.error("Error fetching profile:", profileError)
        router.replace("/error")
        return
      }

      // Get delivery partner info
      const { data: partner, error: partnerError } = await supabase
        .from("delivery_partners")
        .select("*")
        .eq("user_id", session.user.id)
        .single()

      if (partnerError && !partnerError.message.includes("No rows found")) {
        console.error("Error fetching delivery partner:", partnerError)
        router.replace("/error")
        return
      }

      // First check if partner exists
      if (!partner?.id) {
        router.replace("/delivery-partner/setup")
        return
      }
    }

    checkPartnerProfile()
  }, [router])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return <Badge variant="outline">Confirmed</Badge>
      case "dispatched":
        return <Badge variant="secondary">Dispatched</Badge>
      case "in_transit":
        return <Badge variant="default">In Transit</Badge>
      case "out_for_delivery":
        return <Badge className="bg-blue-100 text-blue-800">Out for Delivery</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <p className="text-gray-600">Redirecting...</p>
      </div>
    </div>
  )
}
