"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Loader2,
  Store,
  Package,
  ArrowLeft,
  CreditCard,
  Truck,
  CheckCircle,
  Clock,
  Phone,
  MessageSquare,
} from "lucide-react"
import Link from "next/link"
import type { Order, UserProfile, OrderItem, Product, DeliveryPartner } from "@/types/database.types"

// Import the PaymentButton component
import { PaymentButton } from "./payment-button"
// Import the DocumentActions component
import { DocumentActions } from "./document-actions"
// Update the import for DeliveryTracking
import { DeliveryTracking } from "@/app/(dashboard)/components/delivery-tracking"

interface OrderWithDetails extends Order {
  retailer: UserProfile
  wholesaler: UserProfile
  order_items: (OrderItem & {
    product: Product
  })[]
  delivery_partner?: DeliveryPartner
}

export default function OrderDetailPage({ params }: { params: { id: string } }) {
  const [order, setOrder] = useState<OrderWithDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [showDeliveryTracking, setShowDeliveryTracking] = useState(false)
  const supabase = createClientComponentClient()
  const router = useRouter()

  // Fetch order details
  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setIsLoading(true)

        // Get user session
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!session) {
          throw new Error("Not authenticated")
        }

        setUserId(session.user.id)

        // Get user profile
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .single()

        if (profileError) throw profileError
        setUserRole(profile.role)

        // Fetch order with related data
        const { data, error } = await supabase
          .from("orders")
          .select(`
            *,
            retailer:profiles!retailer_id(*),
            wholesaler:profiles!wholesaler_id(*),
            order_items(*, product:products(*)),
            delivery_partner:delivery_partners(*)
          `)
          .eq("id", params.id)
          .single()

        if (error) throw error

        // Check if user is authorized to view this order
        if (
          (profile.role === "retailer" && data.retailer_id !== session.user.id) ||
          (profile.role === "wholesaler" && data.wholesaler_id !== session.user.id) ||
          (profile.role === "delivery_partner" && data.delivery_partner_id !== session.user.id)
        ) {
          throw new Error("Unauthorized")
        }

        setOrder(data as OrderWithDetails)

        // Show delivery tracking for dispatched orders with delivery partner
        if (
          (data.status === "dispatched" || data.status === "delivered") &&
          data.delivery_partner_id &&
          profile.role === "retailer"
        ) {
          setShowDeliveryTracking(true)
        }
      } catch (error: any) {
        console.error("Error fetching order details:", error)
        setError(error.message)
      } finally {
        setIsLoading(false)
      }
    }

    fetchOrderDetails()
  }, [supabase, params.id])

  // Format date
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "N/A"
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

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "placed":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">Placed</Badge>
      case "confirmed":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Confirmed</Badge>
      case "dispatched":
        return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200">Dispatched</Badge>
      case "delivered":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Delivered</Badge>
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  // Get payment status badge
  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Paid</Badge>
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">Pending</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" asChild className="mb-4">
          <Link href={userRole === "retailer" ? "/orders" : "/order-management"}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Link>
        </Button>
        <div className="p-4 bg-red-50 text-red-500 rounded-md">Error: {error || "Order not found"}</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button variant="ghost" size="sm" asChild className="mr-2">
          <Link href={userRole === "retailer" ? "/orders" : "/order-management"}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Link>
        </Button>
        <h2 className="text-xl md:text-2xl font-bold tracking-tight">Order #{order.id.substring(0, 8)}</h2>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Order Details</CardTitle>
              <CardDescription>
                Placed on {formatDate(order.created_at)} at {order.created_at ? formatTime(order.created_at) : "N/A"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {getStatusBadge(order.status)}
                <Badge variant="outline">{order.payment_method === "cod" ? "Cash on Delivery" : "UPI Payment"}</Badge>
                {getPaymentStatusBadge(order.payment_status)}
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-2">Order Items</h4>
                  <div className="space-y-2">
                    {order.order_items.map((item) => (
                      <div key={item.id} className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <span>{item.product.name}</span>
                            <p className="text-sm text-muted-foreground">
                              ₹{item.price.toFixed(2)} × {item.quantity}
                            </p>
                          </div>
                        </div>
                        <span className="font-medium">₹{(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                <div className="flex justify-between font-medium">
                  <span>Total Amount</span>
                  <span>₹{order.total_amount.toFixed(2)}</span>
                </div>

                {order.notes && (
                  <>
                    <Separator />
                    <div>
                      <h4 className="text-sm font-medium mb-2">Order Notes</h4>
                      <p className="text-sm">{order.notes}</p>
                    </div>
                  </>
                )}

                {order.delivery_instructions && (
                  <>
                    <Separator />
                    <div>
                      <h4 className="text-sm font-medium mb-2">Delivery Instructions</h4>
                      <p className="text-sm">{order.delivery_instructions}</p>
                    </div>
                  </>
                )}

                {order.estimated_delivery && (
                  <>
                    <Separator />
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>
                        Estimated Delivery: <span className="font-medium">{formatDate(order.estimated_delivery)}</span>
                      </span>
                    </div>
                  </>
                )}

                {order.delivery_partner && (
                  <>
                    <Separator />
                    <div>
                      <h4 className="text-sm font-medium mb-2">Delivery Partner</h4>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Truck className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{order.delivery_partner.name}</span>
                        </div>
                        <p className="text-sm">Phone: {order.delivery_partner.phone}</p>
                        <p className="text-sm">
                          Vehicle: {order.delivery_partner.vehicle_type} ({order.delivery_partner.vehicle_number})
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
            <CardFooter>
              {userRole === "retailer" && order.payment_method === "upi" && order.payment_status === "pending" && (
                <Button className="w-full" asChild>
                  <Link href={`/orders/${order.id}/pay`}>
                    <CreditCard className="mr-2 h-4 w-4" />
                    Make Payment
                  </Link>
                </Button>
              )}

              {userRole === "wholesaler" &&
                order.payment_method === "cod" &&
                order.payment_status === "pending" &&
                order.status === "delivered" && (
                  <PaymentButton
                    order={order}
                    onPaymentComplete={() => {
                      // Update local state
                      setOrder((prevOrder) => {
                        if (!prevOrder) return null
                        return {
                          ...prevOrder,
                          payment_status: "paid",
                        }
                      })
                    }}
                  />
                )}
            </CardFooter>
          </Card>

          {showDeliveryTracking && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Delivery Tracking</CardTitle>
                <CardDescription>Track your order's delivery status in real-time</CardDescription>
              </CardHeader>
              <CardContent>
                <DeliveryTracking orderId={order.id} />
              </CardContent>
              {order.delivery_partner && (
                <CardFooter className="flex flex-col sm:flex-row gap-2">
                  <Button variant="outline" className="w-full sm:w-auto" asChild>
                    <Link href={`tel:${order.delivery_partner.phone}`}>
                      <Phone className="mr-2 h-4 w-4" />
                      Call Delivery Partner
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full sm:w-auto">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Send Message
                  </Button>
                </CardFooter>
              )}
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Order Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative border-l border-gray-200 pl-6 pb-2">
                <div className="absolute -left-1.5 mt-1.5 h-3 w-3 rounded-full border border-white bg-blue-500"></div>
                <div className="mb-6">
                  <h3 className="text-lg font-semibold">Order Placed</h3>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(order.created_at)} at {order.created_at ? formatTime(order.created_at) : "N/A"}
                  </p>
                </div>
              </div>

              {order.status !== "placed" && order.status !== "rejected" && (
                <div className="relative border-l border-gray-200 pl-6 pb-2">
                  <div className="absolute -left-1.5 mt-1.5 h-3 w-3 rounded-full border border-white bg-green-500"></div>
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold">Order Confirmed</h3>
                    <p className="text-sm text-muted-foreground">
                      The wholesaler has confirmed your order and is preparing it.
                    </p>
                  </div>
                </div>
              )}

              {(order.status === "dispatched" || order.status === "delivered") && (
                <div className="relative border-l border-gray-200 pl-6 pb-2">
                  <div className="absolute -left-1.5 mt-1.5 h-3 w-3 rounded-full border border-white bg-purple-500"></div>
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold">Order Dispatched</h3>
                    <p className="text-sm text-muted-foreground">
                      Your order has been dispatched and is on its way.
                      {order.estimated_delivery && (
                        <span> Expected delivery by {formatDate(order.estimated_delivery)}.</span>
                      )}
                    </p>
                  </div>
                </div>
              )}

              {order.status === "delivered" && (
                <div className="relative pl-6">
                  <div className="absolute -left-1.5 mt-1.5 h-3 w-3 rounded-full border border-white bg-green-500"></div>
                  <div>
                    <h3 className="text-lg font-semibold">Order Delivered</h3>
                    <p className="text-sm text-muted-foreground">Your order has been delivered successfully.</p>
                  </div>
                </div>
              )}

              {order.status === "rejected" && (
                <div className="relative pl-6">
                  <div className="absolute -left-1.5 mt-1.5 h-3 w-3 rounded-full border border-white bg-red-500"></div>
                  <div>
                    <h3 className="text-lg font-semibold">Order Rejected</h3>
                    <p className="text-sm text-muted-foreground">
                      Unfortunately, the wholesaler was unable to fulfill this order.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{userRole === "retailer" ? "Wholesaler" : "Retailer"}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Store className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">
                    {userRole === "retailer" ? order.wholesaler.business_name : order.retailer.business_name}
                  </span>
                </div>
                <div className="space-y-1">
                  <p className="text-sm">
                    {userRole === "retailer" ? order.wholesaler.address : order.retailer.address}
                  </p>
                  <p className="text-sm">
                    {userRole === "retailer" ? order.wholesaler.city : order.retailer.city},{" "}
                    {userRole === "retailer" ? order.wholesaler.pincode : order.retailer.pincode}
                  </p>
                  <p className="text-sm">
                    Phone: {userRole === "retailer" ? order.wholesaler.phone : order.retailer.phone}
                  </p>
                </div>
              </div>
            </CardContent>
            {userRole === "retailer" && order.status !== "rejected" && (
              <CardFooter>
                <Button variant="outline" className="w-full" asChild>
                  <Link href={`tel:${order.wholesaler.phone}`}>
                    <Phone className="mr-2 h-4 w-4" />
                    Call Wholesaler
                  </Link>
                </Button>
              </CardFooter>
            )}
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Payment Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Payment Method:</span>
                  <span>{order.payment_method === "cod" ? "Cash on Delivery" : "UPI Payment"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Payment Status:</span>
                  <span
                    className={
                      order.payment_status === "paid" ? "text-green-600 font-medium" : "text-yellow-600 font-medium"
                    }
                  >
                    {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total Amount:</span>
                  <span className="font-medium">₹{order.total_amount.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
            {userRole === "retailer" && order.payment_method === "upi" && order.payment_status === "pending" && (
              <CardFooter>
                <Button className="w-full" asChild>
                  <Link href={`/orders/${order.id}/pay`}>
                    <CreditCard className="mr-2 h-4 w-4" />
                    Make Payment
                  </Link>
                </Button>
              </CardFooter>
            )}

            {userRole === "wholesaler" &&
              order.payment_method === "cod" &&
              order.payment_status === "pending" &&
              order.status === "delivered" && (
                <CardFooter>
                  <PaymentButton
                    order={order}
                    onPaymentComplete={() => {
                      // Update local state
                      setOrder((prevOrder) => {
                        if (!prevOrder) return null
                        return {
                          ...prevOrder,
                          payment_status: "paid",
                        }
                      })
                    }}
                  />
                </CardFooter>
              )}
          </Card>

          {/* Add the DocumentActions component */}
          {userRole && order && <DocumentActions order={order} userRole={userRole} />}

          {userRole === "wholesaler" && order.status === "confirmed" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full" asChild>
                  <Link href={`/order-management?tab=confirmed`}>
                    <Truck className="mr-2 h-4 w-4" />
                    Dispatch Order
                  </Link>
                </Button>
                {!order.delivery_partner && (
                  <Button variant="outline" className="w-full" asChild>
                    <Link href={`/order-management?tab=confirmed`}>
                      <Truck className="mr-2 h-4 w-4" />
                      Assign Delivery Partner
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {userRole === "wholesaler" && order.status === "dispatched" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full" asChild>
                  <Link href={`/order-management?tab=dispatched`}>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Mark as Delivered
                  </Link>
                </Button>
                {!order.delivery_partner && (
                  <Button variant="outline" className="w-full" asChild>
                    <Link href={`/order-management?tab=dispatched`}>
                      <Truck className="mr-2 h-4 w-4" />
                      Assign Delivery Partner
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
