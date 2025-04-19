"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { CheckCircle, MapPin, Package, User } from "lucide-react"

export default function CompletedDeliveriesPage() {
  const [deliveries, setDeliveries] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClientComponentClient()

  useEffect(() => {
    const fetchCompletedDeliveries = async () => {
      try {
        setIsLoading(true)

        // Get user session
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!session) {
          throw new Error("Not authenticated")
        }

        // Get delivery partner info
        const { data: partner } = await supabase
          .from("delivery_partners")
          .select("id")
          .eq("user_id", session.user.id)
          .single()

        if (!partner) {
          throw new Error("Delivery partner not found")
        }

        // Get completed deliveries
        const { data } = await supabase
          .from("orders")
          .select(`
            *,
            retailer:retailer_id(business_name, address, city, pincode),
            wholesaler:wholesaler_id(business_name, address, city, pincode)
          `)
          .eq("delivery_partner_id", partner.id)
          .eq("status", "delivered")
          .order("created_at", { ascending: false })

        setDeliveries(data || [])
      } catch (error) {
        console.error("Error fetching completed deliveries:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCompletedDeliveries()
  }, [supabase])

  if (isLoading) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-6">Completed Deliveries</h1>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="w-full">
              <CardContent className="p-8">
                <div className="h-4 w-full bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="h-4 w-2/3 bg-gray-200 rounded animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Completed Deliveries</h1>

      {deliveries.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <CheckCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-medium mb-2">No completed deliveries</h2>
            <p className="text-muted-foreground">You haven't completed any deliveries yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {deliveries.map((delivery) => (
            <Card key={delivery.id} className="w-full">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      <h3 className="font-medium">Order #{delivery.id.substring(0, 8)}</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        From: {delivery.wholesaler?.business_name || "Unknown Wholesaler"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">To: {delivery.retailer?.business_name || "Unknown Retailer"}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Delivery Address: {delivery.retailer?.address}, {delivery.retailer?.city},{" "}
                      {delivery.retailer?.pincode}
                    </div>
                    <div className="text-sm font-medium">Payment Method: {delivery.payment_method.toUpperCase()}</div>
                    <div className="text-sm font-medium">Amount: ₹{delivery.total_amount.toFixed(2)}</div>
                  </div>

                  <div className="flex flex-col gap-2 md:items-end justify-center">
                    <div className="px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm font-medium">
                      Delivered
                    </div>
                    <Button asChild className="mt-2">
                      <Link href={`/delivery/tracking/${delivery.id}`}>Track Delivery</Link>
                    </Button>
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
