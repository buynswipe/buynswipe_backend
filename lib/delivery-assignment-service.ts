"use client"

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useEffect, useState } from "react"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"

export function useDeliveryAssignments() {
  const [isLoading, setIsLoading] = useState(true)
  const [newAssignments, setNewAssignments] = useState(0)
  const supabase = createClientComponentClient()
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    const fetchDeliveryPartnerInfo = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!session) return

        // Get delivery partner ID
        const { data: partner } = await supabase
          .from("delivery_partners")
          .select("id")
          .eq("user_id", session.user.id)
          .single()

        if (!partner) return

        // Set up real-time subscription for new order assignments
        const channel = supabase
          .channel("order-assignments")
          .on(
            "postgres_changes",
            {
              event: "UPDATE",
              schema: "public",
              table: "orders",
              filter: `delivery_partner_id=eq.${partner.id}`,
            },
            (payload) => {
              // Check if this is a new assignment (delivery_partner_id was just set)
              const newOrder = payload.new as any
              const oldOrder = payload.old as any

              if (
                newOrder.delivery_partner_id === partner.id &&
                (!oldOrder.delivery_partner_id || oldOrder.delivery_partner_id !== partner.id)
              ) {
                // This is a new assignment
                setNewAssignments((prev) => prev + 1)

                // Show toast notification
                toast({
                  title: "New Delivery Assignment",
                  description: `You have been assigned to a new delivery (Order #${newOrder.id.substring(0, 8)})`,
                  action: {
                    label: "View",
                    onClick: () => router.push("/delivery-partner/active"),
                  },
                })
              }
            },
          )
          .subscribe()

        return () => {
          supabase.removeChannel(channel)
        }
      } catch (error) {
        console.error("Error setting up delivery assignments listener:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDeliveryPartnerInfo()
  }, [supabase, toast, router])

  return { isLoading, newAssignments }
}
