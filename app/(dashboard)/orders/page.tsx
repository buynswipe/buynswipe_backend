"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Order, UserProfile } from "@/types/database.types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Loader2, ShoppingCart, Store, Clock, CheckCircle, AlertTriangle, Package } from "lucide-react"
import Link from "next/link"

interface OrderWithDetails extends Order {
  wholesaler: UserProfile
  order_items: {
    id: string
    product_id: string
    quantity: number
    price: number
    product: {
      name: string
    }
  }[]
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderWithDetails[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClientComponentClient()

  // Fetch orders
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setIsLoading(true)

        // Get user session
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!session) {
          throw new Error("Not authenticated")
        }

        // Fetch orders with related data
        const { data, error } = await supabase
          .from("orders")
          .select(`
           *,
           wholesaler:profiles!wholesaler_id(id, business_name, phone, address, city, pincode),
           order_items(id, product_id, quantity, price, product:products(name))
         `)
          .eq("retailer_id", session.user.id)
          .order("created_at", { ascending: false })

        if (error) throw error

        setOrders(data as OrderWithDetails[])
      } catch (error: any) {
        setError(error.message)
      } finally {
        setIsLoading(false)
      }
    }

    fetchOrders()
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
        return <Badge variant="outline">Pending</Badge>
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

  if (error) {
    return <div className="p-4 bg-red-50 text-red-500 rounded-md">Error: {error}</div>
  }

  // Group orders by status
  const placedOrders = orders.filter((order) => order.status === "placed")
  const confirmedOrders = orders.filter((order) => order.status === "confirmed")
  const dispatchedOrders = orders.filter((order) => order.status === "dispatched")
  const deliveredOrders = orders.filter((order) => order.status === "delivered")
  const rejectedOrders = orders.filter((order) => order.status === "rejected")

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">My Orders</h2>
        <p className="text-muted-foreground">Track and manage your orders from various wholesalers.</p>
      </div>

      <Tabs defaultValue="all">
        <TabsList className="grid grid-cols-3 md:grid-cols-6 w-full mb-4 overflow-x-auto tabs-list">
          <TabsTrigger value="all" className="text-xs md:text-sm whitespace-nowrap">
            All ({orders.length})
          </TabsTrigger>
          <TabsTrigger value="placed" className="text-xs md:text-sm whitespace-nowrap">
            Placed ({placedOrders.length})
          </TabsTrigger>
          <TabsTrigger value="confirmed" className="text-xs md:text-sm whitespace-nowrap">
            Confirmed ({confirmedOrders.length})
          </TabsTrigger>
          <TabsTrigger value="dispatched" className="text-xs md:text-sm whitespace-nowrap">
            Dispatched ({dispatchedOrders.length})
          </TabsTrigger>
          <TabsTrigger value="delivered" className="text-xs md:text-sm whitespace-nowrap">
            Delivered ({deliveredOrders.length})
          </TabsTrigger>
          <TabsTrigger value="rejected" className="text-xs md:text-sm whitespace-nowrap">
            Rejected ({rejectedOrders.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4 mt-6">
          {renderOrders(orders)}
        </TabsContent>

        <TabsContent value="placed" className="space-y-4 mt-6">
          {renderOrders(placedOrders)}
        </TabsContent>

        <TabsContent value="confirmed" className="space-y-4 mt-6">
          {renderOrders(confirmedOrders)}
        </TabsContent>

        <TabsContent value="dispatched" className="space-y-4 mt-6">
          {renderOrders(dispatchedOrders)}
        </TabsContent>

        <TabsContent value="delivered" className="space-y-4 mt-6">
          {renderOrders(deliveredOrders)}
        </TabsContent>

        <TabsContent value="rejected" className="space-y-4 mt-6">
          {renderOrders(rejectedOrders)}
        </TabsContent>
      </Tabs>
    </div>
  )

  function renderOrders(ordersList: OrderWithDetails[]) {
    if (ordersList.length === 0) {
      return (
        <div className="text-center py-12">
          <ShoppingCart className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">No orders found</h3>
          <p className="mt-2 text-sm text-muted-foreground">You don't have any orders in this category.</p>
          <Button asChild className="mt-4">
            <Link href="/wholesalers">Browse Wholesalers</Link>
          </Button>
        </div>
      )
    }

    return ordersList.map((order) => (
      <Card key={order.id} className="overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <div>
              <CardTitle className="text-lg">
                Order #{order.id.substring(0, 8)}
                <span className="ml-2">{getStatusBadge(order.status)}</span>
              </CardTitle>
              <CardDescription>
                Placed on {formatDate(order.created_at)} at {formatTime(order.created_at)}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="font-normal">
                {order.payment_method === "cod" ? "Cash on Delivery" : "UPI Payment"}
              </Badge>
              {getPaymentStatusBadge(order.payment_status)}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-3 md:p-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <h4 className="text-sm font-medium mb-1">Wholesaler</h4>
              <div className="flex items-start gap-2">
                <Store className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <div>
                  <p className="font-medium">{order.wholesaler.business_name}</p>
                  <p className="text-xs md:text-sm text-muted-foreground">{order.wholesaler.address}</p>
                  <p className="text-xs md:text-sm text-muted-foreground">
                    {order.wholesaler.city}, {order.wholesaler.pincode}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium mb-1">Order Status</h4>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <CheckCircle
                    className={`h-4 w-4 ${order.status !== "rejected" ? "text-green-500" : "text-muted-foreground"}`}
                  />
                  <span
                    className={`text-xs md:text-sm ${order.status !== "rejected" ? "font-medium" : "text-muted-foreground"}`}
                  >
                    Order Placed
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {order.status === "confirmed" || order.status === "dispatched" || order.status === "delivered" ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : order.status === "rejected" ? (
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                  ) : (
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span
                    className={`text-xs md:text-sm ${
                      order.status === "confirmed" || order.status === "dispatched" || order.status === "delivered"
                        ? "font-medium"
                        : order.status === "rejected"
                          ? "text-red-500"
                          : "text-muted-foreground"
                    }`}
                  >
                    {order.status === "rejected" ? "Order Rejected" : "Order Confirmed"}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {order.status === "dispatched" || order.status === "delivered" ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span
                    className={`text-xs md:text-sm ${
                      order.status === "dispatched" || order.status === "delivered"
                        ? "font-medium"
                        : "text-muted-foreground"
                    }`}
                  >
                    Order Dispatched
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {order.status === "delivered" ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span
                    className={`text-xs md:text-sm ${order.status === "delivered" ? "font-medium" : "text-muted-foreground"}`}
                  >
                    Order Delivered
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium mb-1">Order Details</h4>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-xs md:text-sm text-muted-foreground">Total Items:</span>
                  <span className="text-xs md:text-sm font-medium">
                    {order.order_items.reduce((sum, item) => sum + item.quantity, 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs md:text-sm text-muted-foreground">Total Amount:</span>
                  <span className="text-xs md:text-sm font-medium">₹{order.total_amount.toFixed(2)}</span>
                </div>
                {order.estimated_delivery && (
                  <div className="flex justify-between">
                    <span className="text-xs md:text-sm text-muted-foreground">Estimated Delivery:</span>
                    <span className="text-xs md:text-sm font-medium">{formatDate(order.estimated_delivery)}</span>
                  </div>
                )}
                {order.notes && (
                  <div className="mt-2">
                    <span className="text-xs md:text-sm text-muted-foreground">Notes:</span>
                    <p className="text-xs md:text-sm mt-1">{order.notes}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <Separator className="my-3 md:my-4" />

          <div>
            <h4 className="text-sm font-medium mb-1">Order Items</h4>
            <div className="space-y-2">
              {order.order_items.map((item) => (
                <div key={item.id} className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs md:text-sm">{item.product?.name || "Product"}</span>
                    <span className="text-xs md:text-sm text-muted-foreground">× {item.quantity}</span>
                  </div>
                  <span className="text-xs md:text-sm font-medium">₹{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
        <Button variant="outline" size="sm" asChild>
          <Link href={`/orders/${order.id}`}>View Order</Link>
        </Button>
      </Card>
    ))
  }
}
