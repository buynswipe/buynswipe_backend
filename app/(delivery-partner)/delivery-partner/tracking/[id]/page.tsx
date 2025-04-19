import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Package, Truck, Clock, CheckCircle, AlertTriangle } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function DeliveryTrackingPage({ params }: { params: { id: string } }) {
  const supabase = createServerComponentClient({ cookies })
  const orderId = params.id

  // Get current user
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardHeader>
            <CardTitle>Not Authenticated</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Please log in to view delivery tracking.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Get delivery partner info
  const { data: deliveryPartner, error: partnerError } = await supabase
    .from("delivery_partners")
    .select("*")
    .eq("user_id", session.user.id)
    .single()

  if (partnerError && partnerError.code !== "PGRST116") {
    console.error("Error fetching delivery partner:", partnerError)
  }

  if (!deliveryPartner) {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              <span>Delivery Partner Profile Not Found</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>Your user account is not linked to a delivery partner profile.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Get order details
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select(`
      *,
      retailer:profiles!retailer_id(business_name, address, city, pincode, phone),
      wholesaler:profiles!wholesaler_id(business_name, address, city, pincode, phone)
    `)
    .eq("id", orderId)
    .single()

  if (orderError) {
    console.error("Error fetching order:", orderError)
    return notFound()
  }

  // Check if this order is assigned to the current delivery partner
  // Either directly in the orders table or via delivery_status_updates
  const { data: statusUpdates, error: statusError } = await supabase
    .from("delivery_status_updates")
    .select("*")
    .eq("order_id", orderId)
    .eq("delivery_partner_id", deliveryPartner.id)
    .order("created_at", { ascending: false })

  if (statusError) {
    console.error("Error fetching status updates:", statusError)
  }

  const isAssignedViaStatusUpdates = statusUpdates && statusUpdates.length > 0
  const isAssignedDirectly = order.delivery_partner_id === deliveryPartner.id

  if (!isAssignedDirectly && !isAssignedViaStatusUpdates) {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              <span>Not Authorized</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>This order is not assigned to you.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Get latest status
  const latestStatus = statusUpdates && statusUpdates.length > 0 ? statusUpdates[0].status : order.status

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "assigned":
      case "assigned_for_delivery":
        return <Badge className="bg-blue-500">Assigned</Badge>
      case "picked_up":
        return <Badge className="bg-orange-500">Picked Up</Badge>
      case "in_transit":
        return <Badge className="bg-purple-500">In Transit</Badge>
      case "delivered":
        return <Badge className="bg-green-500">Delivered</Badge>
      case "failed":
        return <Badge className="bg-red-500">Failed</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Order #{orderId.substring(0, 8)}</CardTitle>
            {getStatusBadge(latestStatus)}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-1">Pickup From</h3>
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 mt-1 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{order.wholesaler?.business_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {order.wholesaler?.address}, {order.wholesaler?.city}, {order.wholesaler?.pincode}
                    </p>
                    <p className="text-sm text-muted-foreground">Phone: {order.wholesaler?.phone || "N/A"}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-1">Deliver To</h3>
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 mt-1 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{order.retailer?.business_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {order.retailer?.address}, {order.retailer?.city}, {order.retailer?.pincode}
                    </p>
                    <p className="text-sm text-muted-foreground">Phone: {order.retailer?.phone || "N/A"}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-1">Order Details</h3>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Created: {new Date(order.created_at).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Payment: {order.payment_method.toUpperCase()} ({order.payment_status})
                  </p>
                </div>
                {order.delivery_instructions && (
                  <div className="mt-2 p-2 bg-yellow-50 rounded-md">
                    <p className="text-sm font-medium">Delivery Instructions:</p>
                    <p className="text-sm">{order.delivery_instructions}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-medium">Delivery Status</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div
                    className={`h-8 w-8 rounded-full flex items-center justify-center ${
                      latestStatus === "assigned" || latestStatus === "assigned_for_delivery"
                        ? "bg-blue-100 text-blue-600"
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    <Truck className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium">Assigned</p>
                    {isAssignedViaStatusUpdates && statusUpdates[0].created_at && (
                      <p className="text-xs text-muted-foreground">
                        {new Date(statusUpdates[0].created_at).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div
                    className={`h-8 w-8 rounded-full flex items-center justify-center ${
                      latestStatus === "picked_up" ? "bg-orange-100 text-orange-600" : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    <Package className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium">Picked Up</p>
                    {statusUpdates?.find((s) => s.status === "picked_up")?.created_at && (
                      <p className="text-xs text-muted-foreground">
                        {new Date(statusUpdates.find((s) => s.status === "picked_up")!.created_at).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div
                    className={`h-8 w-8 rounded-full flex items-center justify-center ${
                      latestStatus === "in_transit" ? "bg-purple-100 text-purple-600" : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    <Truck className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium">In Transit</p>
                    {statusUpdates?.find((s) => s.status === "in_transit")?.created_at && (
                      <p className="text-xs text-muted-foreground">
                        {new Date(statusUpdates.find((s) => s.status === "in_transit")!.created_at).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div
                    className={`h-8 w-8 rounded-full flex items-center justify-center ${
                      latestStatus === "delivered" ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    <CheckCircle className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium">Delivered</p>
                    {statusUpdates?.find((s) => s.status === "delivered")?.created_at && (
                      <p className="text-xs text-muted-foreground">
                        {new Date(statusUpdates.find((s) => s.status === "delivered")!.created_at).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-4 space-y-2">
                <Button className="w-full" variant="default">
                  Update Status
                </Button>
                <Button className="w-full" variant="outline">
                  Contact Customer
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
