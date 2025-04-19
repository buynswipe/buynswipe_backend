"use client"

import { CardFooter } from "@/components/ui/card"

import { CardDescription } from "@/components/ui/card"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, MapPin, Package, Navigation, CheckCircle } from "lucide-react"
import type { Order } from "@/types/database.types"

interface DeliveryHomeProps {
  orders: Order[]
}

export function DeliveryHome({ orders }: DeliveryHomeProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [completedOrders, setCompletedOrders] = useState<Order[]>([])
  const [activeOrders, setActiveOrders] = useState<Order[]>([])
  const [earnings, setEarnings] = useState<number>(0)
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    const fetchDashboardData = async () => {
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

        // Get active deliveries
        const { data: activeData } = await supabase
          .from("orders")
          .select("*")
          .eq("delivery_partner_id", partner.id)
          .in("status", ["dispatched"])
          .order("created_at", { ascending: false })

        setActiveOrders(activeData || [])

        // Get completed deliveries
        const { data: completedData } = await supabase
          .from("orders")
          .select("*")
          .eq("delivery_partner_id", partner.id)
          .in("status", ["delivered"])
          .order("created_at", { ascending: false })

        setCompletedOrders(completedData || [])

        // Get earnings
        const { data: earningsData } = await supabase
          .from("delivery_partner_earnings")
          .select("amount")
          .eq("delivery_partner_id", partner.id)

        const total = earningsData?.reduce((sum, e) => sum + (e.amount || 0), 0) || 0
        setEarnings(total)
      } catch (error: any) {
        setError(error.message)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [supabase])

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  }

  // Format time
  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error) {
    return <div className="p-4 bg-red-50 text-red-500 rounded-md">Error: {error}</div>
  }

  return (
    <div className="space-y-6">
      {/* Active Jobs Section */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Active Jobs</h2>
        <p className="text-muted-foreground">Your assigned deliveries</p>
      </div>

      {activeOrders.length === 0 ? (
        <div className="text-center py-12">
          <Package className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">No active jobs</h3>
          <p className="mt-2 text-sm text-muted-foreground">Check back later for new deliveries.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {activeOrders.map((order) => (
            <Card key={order.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">Order #{order.id.substring(0, 8)}</CardTitle>
                    <CardDescription>
                      {formatDate(order.created_at)} at {formatTime(order.created_at)}
                    </CardDescription>
                  </div>
                  <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">
                    {order.payment_method === "cod" ? "Cash on Delivery" : "UPI Payment"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pb-3">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm">Deliver to:</p>
                      <p className="text-sm font-medium">{order.retailer?.business_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {order.retailer?.address}, {order.retailer?.city}, {order.retailer?.pincode}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full" onClick={() => router.push(`/delivery/tracking/${order.id}`)}>
                  <Navigation className="mr-2 h-4 w-4" />
                  Start Delivery
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Completed Jobs Section */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Completed Jobs</h2>
        <p className="text-muted-foreground">Your recent deliveries</p>
      </div>

      {completedOrders.length === 0 ? (
        <div className="text-center py-12">
          <CheckCircle className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">No completed jobs</h3>
          <p className="mt-2 text-sm text-muted-foreground">Deliver something to see it here.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {completedOrders.map((order) => (
            <Card key={order.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">Order #{order.id.substring(0, 8)}</CardTitle>
                    <CardDescription>
                      {formatDate(order.created_at)} at {formatTime(order.created_at)}
                    </CardDescription>
                  </div>
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Delivered</Badge>
                </div>
              </CardHeader>
              <CardContent className="pb-3">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm">Delivered to:</p>
                      <p className="text-sm font-medium">{order.retailer?.business_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {order.retailer?.address}, {order.retailer?.city}, {order.retailer?.pincode}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Earnings Information Section */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Earnings</h2>
        <p className="text-muted-foreground">Your total earnings from deliveries</p>
        <div className="mt-4 p-4 bg-gray-50 rounded-md">
          <p className="text-lg font-semibold">Total Earnings: ₹{earnings.toFixed(2)}</p>
        </div>
      </div>
    </div>
  )
}
