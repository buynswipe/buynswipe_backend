"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function MyDeliveriesPage() {
  const [loading, setLoading] = useState(true)
  const [deliveries, setDeliveries] = useState<any[]>([])
  const [partner, setPartner] = useState<any>(null)
  const supabase = createClientComponentClient()
  const router = useRouter()

  useEffect(() => {
    const checkPartnerProfile = async () => {
      try {
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
        const { data: partnerData, error: partnerError } = await supabase
          .from("delivery_partners")
          .select("*")
          .eq("user_id", session.user.id)
          .single()

        if (partnerError && !partnerError.message.includes("No rows found")) {
          console.error("Error fetching delivery partner:", partnerError)
          router.replace("/error")
          return
        }

        // Check if partner exists
        if (!partnerData?.id) {
          router.replace("/delivery-partner/setup")
          return
        }

        setPartner(partnerData)

        // Fetch deliveries for this partner
        const { data: deliveriesData, error: deliveriesError } = await supabase
          .from("orders")
          .select(`
            *,
            profiles:retailer_id(full_name, business_name),
            wholesaler:wholesaler_id(business_name)
          `)
          .eq("delivery_partner_id", partnerData.id)
          .order("created_at", { ascending: false })

        if (deliveriesError) {
          console.error("Error fetching deliveries:", deliveriesError)
        } else {
          setDeliveries(deliveriesData || [])
        }
      } catch (error) {
        console.error("Error in checkPartnerProfile:", error)
        router.replace("/error")
      } finally {
        setLoading(false)
      }
    }

    checkPartnerProfile()
  }, [router, supabase])

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
      case "delivered":
        return <Badge className="bg-green-100 text-green-800">Delivered</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <div className="grid gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!partner) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600">Setting up delivery partner profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">My Deliveries</h1>
        <p className="text-gray-600">Manage your assigned deliveries</p>
      </div>

      {deliveries.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-gray-500">No deliveries assigned yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {deliveries.map((delivery) => (
            <Card key={delivery.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">
                    Order #{delivery.reference_number || delivery.id.slice(0, 8)}
                  </CardTitle>
                  {getStatusBadge(delivery.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Customer:</span>
                    <span className="text-sm font-medium">
                      {delivery.profiles?.business_name || delivery.profiles?.full_name || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Wholesaler:</span>
                    <span className="text-sm font-medium">{delivery.wholesaler?.business_name || "N/A"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total Amount:</span>
                    <span className="text-sm font-medium">₹{delivery.total_amount?.toLocaleString() || "0"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Delivery Address:</span>
                    <span className="text-sm font-medium">{delivery.delivery_address || "Address not provided"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Created:</span>
                    <span className="text-sm font-medium">{new Date(delivery.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
