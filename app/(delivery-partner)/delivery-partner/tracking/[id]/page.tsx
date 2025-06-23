import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { notFound, redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Phone, Clock, Package, Truck } from "lucide-react"

export const dynamic = "force-dynamic"
export const revalidate = 0

interface PageProps {
  params: {
    id: string
  }
}

export default async function DeliveryTrackingPage({ params }: PageProps) {
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

    // Get order details
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select(`
        *,
        retailer:retailer_id(business_name, address, city, pincode, phone),
        wholesaler:wholesaler_id(business_name, address, city, pincode, phone)
      `)
      .eq("id", params.id)
      .single()

    if (orderError || !order) {
      console.error("Error fetching order:", orderError)
      notFound()
    }

    // Check if this delivery partner is assigned to this order
    if (order.delivery_partner_id !== partner?.id && partner?.id !== "dev-partner-id") {
      notFound()
    }

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
        <div>
          <h1 className="text-3xl font-bold mb-2">Delivery Tracking</h1>
          <p className="text-muted-foreground">Order #{order.id.substring(0, 8)}</p>
        </div>

        {/* Order Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Delivery Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              {getStatusBadge(order.status)}
              <p className="text-lg font-semibold">₹{order.total_amount.toFixed(2)}</p>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              <Clock className="h-4 w-4 inline mr-1" />
              Created: {formatDate(order.created_at)}
            </p>
          </CardContent>
        </Card>

        {/* Delivery Address */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Delivery Address
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="font-medium">{order.retailer?.business_name}</p>
              <p className="text-sm text-gray-600">{order.retailer?.address}</p>
              <p className="text-sm text-gray-600">
                {order.retailer?.city}, {order.retailer?.pincode}
              </p>
              {order.retailer?.phone && (
                <div className="flex items-center gap-2 mt-3">
                  <Phone className="h-4 w-4" />
                  <a href={`tel:${order.retailer.phone}`} className="text-blue-600">
                    {order.retailer.phone}
                  </a>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Pickup Address */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Pickup Address
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="font-medium">{order.wholesaler?.business_name}</p>
              <p className="text-sm text-gray-600">{order.wholesaler?.address}</p>
              <p className="text-sm text-gray-600">
                {order.wholesaler?.city}, {order.wholesaler?.pincode}
              </p>
              {order.wholesaler?.phone && (
                <div className="flex items-center gap-2 mt-3">
                  <Phone className="h-4 w-4" />
                  <a href={`tel:${order.wholesaler.phone}`} className="text-blue-600">
                    {order.wholesaler.phone}
                  </a>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Payment Information */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Payment Method:</span>
                <Badge variant="outline">{order.payment_method === "cod" ? "Cash on Delivery" : "UPI Payment"}</Badge>
              </div>
              <div className="flex justify-between">
                <span>Total Amount:</span>
                <span className="font-semibold">₹{order.total_amount.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-4">
          {order.status === "dispatched" && <Button className="flex-1">Start Delivery</Button>}
          {order.status === "in_transit" && <Button className="flex-1">Mark as Out for Delivery</Button>}
          {order.status === "out_for_delivery" && <Button className="flex-1">Mark as Delivered</Button>}
          <Button variant="outline" className="flex-1">
            Call Customer
          </Button>
        </div>
      </div>
    )
  } catch (error) {
    console.error("Error in DeliveryTrackingPage:", error)
    notFound()
  }
}
