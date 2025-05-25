"use client"

import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Package, MapPin, Phone, Clock } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function MyDeliveriesPage() {
  const supabase = createServerComponentClient({ cookies })

  // Get user session
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login")
  }

  try {
    // Get delivery partner info
    const { data: partner, error: partnerError } = await supabase
      .from("delivery_partners")
      .select("id")
      .eq("user_id", session.user.id)
      .maybeSingle()

    if (partnerError) {
      console.error("Error fetching delivery partner:", partnerError)
    }

    // Use partner ID or fallback for development
    const partnerId = partner?.id || "dev-partner-id"

    // Get all deliveries for this partner
    const { data: deliveries, error: deliveriesError } = await supabase
      .from("orders")
      .select(`
        *,
        retailer:retailer_id(business_name, address, city, pincode, phone),
        wholesaler:wholesaler_id(business_name)
      `)
      .eq("delivery_partner_id", partnerId)
      .order("created_at", { ascending: false })

    if (deliveriesError) {
      console.error("Error fetching deliveries:", deliveriesError)
    }

    // Use real data or sample data for development
    const displayDeliveries =
      deliveries && deliveries.length > 0
        ? deliveries
        : [
            {
              id: "2abb2968-29ab-46d7-bfb1-a47640e5027f",
              created_at: new Date().toISOString(),
              status: "dispatched",
              total_amount: 60.0,
              payment_method: "cod",
              retailer_id: "sample-retailer",
              wholesaler_id: "sample-wholesaler",
              retailer: {
                business_name: "Sample Retail Store",
                address: "123 Retail Street",
                city: "Delhi",
                pincode: "110001",
                phone: "9876543211",
              },
              wholesaler: {
                business_name: "Mega Wholesale Supplies",
              },
            },
            {
              id: "cb40debd-9c0f-434d-a401-8b8915d8e4ea",
              created_at: new Date(Date.now() - 86400000).toISOString(),
              status: "delivered",
              total_amount: 120.0,
              payment_method: "cod",
              retailer_id: "sample-retailer-2",
              wholesaler_id: "sample-wholesaler",
              retailer: {
                business_name: "City Retail Shop",
                address: "456 Market Road",
                city: "Mumbai",
                pincode: "400001",
                phone: "9876543222",
              },
              wholesaler: {
                business_name: "Mega Wholesale Supplies",
              },
            },
          ]

    const usingSampleData = !deliveries || deliveries.length === 0

    const getStatusBadge = (status: string) => {
      const statusConfig = {
        dispatched: { label: "Dispatched", className: "bg-blue-100 text-blue-800" },
        in_transit: { label: "In Transit", className: "bg-yellow-100 text-yellow-800" },
        out_for_delivery: { label: "Out for Delivery", className: "bg-orange-100 text-orange-800" },
        delivered: { label: "Delivered", className: "bg-green-100 text-green-800" },
        failed: { label: "Failed", className: "bg-red-100 text-red-800" },
      }

      const config = statusConfig[status as keyof typeof statusConfig] || {
        label: status,
        className: "bg-gray-100 text-gray-800",
      }

      return <Badge className={config.className}>{config.label}</Badge>
    }

    const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    }

    return (
      <div className="space-y-6">
        {usingSampleData && (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 mb-4">
            <p className="text-yellow-700">
              <strong>Development Mode:</strong> Showing sample data because no real deliveries are assigned to this
              partner.
            </p>
          </div>
        )}

        <div>
          <h1 className="text-3xl font-bold mb-2">My Deliveries</h1>
          <p className="text-muted-foreground">Track and manage your assigned deliveries</p>
        </div>

        {displayDeliveries.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No deliveries assigned</h3>
              <p className="text-gray-600">You don't have any deliveries assigned to you at the moment.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {displayDeliveries.map((delivery) => (
              <Card key={delivery.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">Order #{delivery.id.substring(0, 8)}</CardTitle>
                      <p className="text-sm text-gray-600 flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {formatDate(delivery.created_at)}
                      </p>
                    </div>
                    <div className="text-right">
                      {getStatusBadge(delivery.status)}
                      <p className="text-lg font-semibold mt-1">₹{delivery.total_amount.toFixed(2)}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Delivery Address */}
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-gray-500 mt-0.5" />
                      <div>
                        <p className="font-medium">{delivery.retailer?.business_name}</p>
                        <p className="text-sm text-gray-600">{delivery.retailer?.address}</p>
                        <p className="text-sm text-gray-600">
                          {delivery.retailer?.city}, {delivery.retailer?.pincode}
                        </p>
                      </div>
                    </div>

                    {/* Contact */}
                    <div className="flex items-center gap-3">
                      <Phone className="h-5 w-5 text-gray-500" />
                      <span className="text-sm">{delivery.retailer?.phone}</span>
                    </div>

                    {/* Payment Method */}
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        {delivery.payment_method === "cod" ? "Cash on Delivery" : "UPI Payment"}
                      </Badge>
                      <span className="text-sm text-gray-600">from {delivery.wholesaler?.business_name}</span>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <Button asChild size="sm">
                        <Link href={`/delivery-partner/tracking/${delivery.id}`}>View Details</Link>
                      </Button>
                      {delivery.status === "dispatched" && (
                        <Button variant="outline" size="sm">
                          Start Delivery
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    )
  } catch (error) {
    console.error("Error in MyDeliveriesPage:", error)

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">My Deliveries</h1>
          <p className="text-muted-foreground">Track and manage your assigned deliveries</p>
        </div>

        <Card>
          <CardContent className="p-8 text-center">
            <h3 className="text-lg font-semibold text-red-600 mb-2">Error Loading Deliveries</h3>
            <p className="text-gray-600 mb-4">There was an error loading your deliveries. Please try again.</p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </CardContent>
        </Card>
      </div>
    )
  }
}
