"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, CheckCircle, Clock } from "lucide-react"

export default function CompletedDeliveriesPage() {
  const [deliveries, setDeliveries] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClientComponentClient()

  useEffect(() => {
    const fetchCompletedDeliveries = async () => {
      try {
        setIsLoading(true)

        const response = await fetch("/api/delivery/history?status=delivered")
        if (!response.ok) throw new Error("Failed to fetch completed deliveries")

        const data = await response.json()
        setDeliveries(data.deliveries || [])
      } catch (error) {
        console.error("Error fetching completed deliveries:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCompletedDeliveries()
  }, [])

  if (isLoading) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-6">Completed Deliveries</h1>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="w-full">
              <CardHeader className="pb-2">
                <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
              </CardHeader>
              <CardContent className="pb-2">
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
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">Order #{delivery.id.substring(0, 8)}</CardTitle>
                  <Badge variant="success">Delivered</Badge>
                </div>
              </CardHeader>
              <CardContent className="pb-4">
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 mt-1 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{delivery.profiles.business_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {delivery.profiles.address}, {delivery.profiles.city}, {delivery.profiles.pincode}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Delivered on {new Date(delivery.updated_at || delivery.created_at).toLocaleString()}
                    </p>
                  </div>

                  {delivery.delivery_proofs && delivery.delivery_proofs[0] && (
                    <div className="mt-2 pt-2 border-t">
                      <p className="text-sm font-medium">Delivery Proof</p>
                      <p className="text-sm">Received by: {delivery.delivery_proofs[0].receiver_name}</p>
                      {delivery.delivery_proofs[0].notes && (
                        <p className="text-sm text-muted-foreground">Notes: {delivery.delivery_proofs[0].notes}</p>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
