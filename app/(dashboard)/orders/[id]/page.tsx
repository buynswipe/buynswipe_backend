"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, ArrowLeft, Store, Package } from "lucide-react"
import Link from "next/link"

interface OrderData {
  id: string
  status: string
  created_at: string
  total_amount: number
  payment_method: string
  payment_status: string
  retailer_id: string
  wholesaler_id: string
  order_items: Array<{
    id: string
    quantity: number
    price: number
    product: {
      id: string
      name: string
    }
  }>
  retailer: {
    id: string
    business_name: string
    address: string
    city: string
    pincode: string
    phone: string
  }
  wholesaler: {
    id: string
    business_name: string
    address: string
    city: string
    pincode: string
    phone: string
  }
}

export default function OrderDetailPage({ params }: { params: { id: string } }) {
  const [order, setOrder] = useState<OrderData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userRole, setUserRole] = useState<string | null>(null)
  const supabase = createClientComponentClient()
  const router = useRouter()

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setIsLoading(true)

        // Get user session
        const {
          data: { session },
        } = await supabase.auth.getSession()
        if (!session) {
          setError("Not authenticated")
          return
        }

        // Get user profile
        const { data: profile } = await supabase.from("profiles").select("role").eq("id", session.user.id).single()

        if (profile) {
          setUserRole(profile.role)
        }

        // Fetch order
        const { data: orderData, error: orderError } = await supabase
          .from("orders")
          .select(`
            *,
            retailer:profiles!retailer_id(id, business_name, address, city, pincode, phone),
            wholesaler:profiles!wholesaler_id(id, business_name, address, city, pincode, phone),
            order_items(
              id,
              quantity,
              price,
              product:products(id, name)
            )
          `)
          .eq("id", params.id)
          .single()

        if (orderError) {
          console.error("Order fetch error:", orderError)
          setError("Failed to load order")
          return
        }

        if (!orderData) {
          setError("Order not found")
          return
        }

        setOrder(orderData)
      } catch (err) {
        console.error("Unexpected error:", err)
        setError("An unexpected error occurred")
      } finally {
        setIsLoading(false)
      }
    }

    fetchOrder()
  }, [params.id, supabase])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      placed: { label: "Placed", className: "bg-blue-100 text-blue-800" },
      confirmed: { label: "Confirmed", className: "bg-green-100 text-green-800" },
      dispatched: { label: "Dispatched", className: "bg-purple-100 text-purple-800" },
      delivered: { label: "Delivered", className: "bg-green-100 text-green-800" },
      rejected: { label: "Rejected", className: "bg-red-100 text-red-800" },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || {
      label: status,
      className: "bg-gray-100 text-gray-800",
    }

    return <Badge className={config.className}>{config.label}</Badge>
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/orders">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Orders
          </Link>
        </Button>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-red-600 mb-2">Error Loading Order</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button onClick={() => window.location.reload()}>Try Again</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/orders">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Orders
          </Link>
        </Button>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Order Not Found</h3>
              <p className="text-gray-600">The requested order could not be found.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href={userRole === "retailer" ? "/orders" : "/order-management"}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Order #{order.id.substring(0, 8)}</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          {/* Order Details Card */}
          <Card>
            <CardHeader>
              <CardTitle>Order Details</CardTitle>
              <CardDescription>Placed on {formatDate(order.created_at)}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Status */}
              <div className="flex gap-2">
                {getStatusBadge(order.status)}
                <Badge variant="outline">{order.payment_method === "cod" ? "Cash on Delivery" : "UPI Payment"}</Badge>
                <Badge variant={order.payment_status === "paid" ? "default" : "secondary"}>
                  {order.payment_status === "paid" ? "Paid" : "Pending"}
                </Badge>
              </div>

              {/* Order Items */}
              <div>
                <h4 className="font-medium mb-3">Order Items</h4>
                <div className="space-y-2">
                  {order.order_items.map((item) => (
                    <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Package className="h-4 w-4 text-gray-500" />
                        <div>
                          <p className="font-medium">{item.product.name}</p>
                          <p className="text-sm text-gray-600">
                            ₹{item.price.toFixed(2)} × {item.quantity}
                          </p>
                        </div>
                      </div>
                      <span className="font-medium">₹{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="border-t pt-4">
                <div className="flex justify-between items-center text-lg font-semibold">
                  <span>Total Amount</span>
                  <span>₹{order.total_amount.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Business Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Store className="h-4 w-4" />
                {userRole === "retailer" ? "Wholesaler" : "Retailer"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="font-medium">
                  {userRole === "retailer" ? order.wholesaler.business_name : order.retailer.business_name}
                </p>
                <p className="text-sm text-gray-600">
                  {userRole === "retailer" ? order.wholesaler.address : order.retailer.address}
                </p>
                <p className="text-sm text-gray-600">
                  {userRole === "retailer" ? order.wholesaler.city : order.retailer.city},{" "}
                  {userRole === "retailer" ? order.wholesaler.pincode : order.retailer.pincode}
                </p>
                <p className="text-sm text-gray-600">
                  Phone: {userRole === "retailer" ? order.wholesaler.phone : order.retailer.phone}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Payment Info */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Method:</span>
                  <span className="text-sm font-medium">
                    {order.payment_method === "cod" ? "Cash on Delivery" : "UPI Payment"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Status:</span>
                  <span
                    className={`text-sm font-medium ${
                      order.payment_status === "paid" ? "text-green-600" : "text-yellow-600"
                    }`}
                  >
                    {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Amount:</span>
                  <span className="text-sm font-medium">₹{order.total_amount.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
