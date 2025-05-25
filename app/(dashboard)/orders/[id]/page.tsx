"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Loader2, ArrowLeft, Package, Store, CreditCard, Truck } from "lucide-react"
import Link from "next/link"

interface OrderData {
  id: string
  status: string
  payment_status: string
  payment_method: string
  total_amount: number
  created_at: string
  estimated_delivery?: string
  notes?: string
  wholesaler: {
    business_name: string
    address: string
    city: string
    pincode: string
    phone: string
  }
  order_items: Array<{
    id: string
    quantity: number
    price: number
    product: {
      name: string
    }
  }>
}

export default function OrderDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const [order, setOrder] = useState<OrderData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClientComponentClient()

  useEffect(() => {
    async function fetchOrder() {
      try {
        if (!params?.id || typeof params.id !== "string") {
          setError("Order ID not found")
          return
        }

        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!session) {
          router.push("/login")
          return
        }

        const { data, error: fetchError } = await supabase
          .from("orders")
          .select(`
            *,
            wholesaler:profiles!orders_wholesaler_id_fkey(
              business_name,
              address,
              city,
              pincode,
              phone
            ),
            order_items(
              id,
              quantity,
              price,
              product:products(name)
            )
          `)
          .eq("id", params.id)
          .eq("retailer_id", session.user.id)
          .single()

        if (fetchError) {
          setError("Order not found or access denied")
          return
        }

        setOrder(data as OrderData)
      } catch (err) {
        console.error("Error fetching order:", err)
        setError("Failed to load order details")
      } finally {
        setLoading(false)
      }
    }

    fetchOrder()
  }, [params?.id, supabase, router])

  const getStatusColor = (status: string) => {
    const colors = {
      placed: "bg-blue-100 text-blue-800",
      confirmed: "bg-green-100 text-green-800",
      dispatched: "bg-purple-100 text-purple-800",
      delivered: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
    }
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

  const getPaymentStatusColor = (status: string) => {
    return status === "paid" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Card>
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="h-8 w-8 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Order Not Found</h3>
            <p className="text-gray-600 mb-4">{error || "The order you're looking for doesn't exist."}</p>
            <Button asChild>
              <Link href="/orders">Back to Orders</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/orders">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Orders
          </Link>
        </Button>
      </div>

      {/* Order Header */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">Order #{order.id.substring(0, 8)}</CardTitle>
              <p className="text-gray-600">Placed on {formatDate(order.created_at)}</p>
            </div>
            <div className="flex gap-2">
              <Badge className={getStatusColor(order.status)}>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </Badge>
              <Badge className={getPaymentStatusColor(order.payment_status)}>
                {order.payment_status === "paid" ? "Paid" : "Pending"}
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Order Items */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Order Items
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {order.order_items.map((item) => (
              <div key={item.id} className="flex justify-between items-center">
                <div>
                  <p className="font-medium">{item.product?.name || "Product"}</p>
                  <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                </div>
                <p className="font-medium">₹{(item.price * item.quantity).toFixed(2)}</p>
              </div>
            ))}
            <Separator />
            <div className="flex justify-between items-center font-semibold text-lg">
              <span>Total Amount</span>
              <span>₹{order.total_amount.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Wholesaler Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="h-5 w-5" />
              Wholesaler Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="font-medium">{order.wholesaler.business_name}</p>
              <p className="text-sm text-gray-600">{order.wholesaler.address}</p>
              <p className="text-sm text-gray-600">
                {order.wholesaler.city}, {order.wholesaler.pincode}
              </p>
              <p className="text-sm text-gray-600">Phone: {order.wholesaler.phone}</p>
            </div>
          </CardContent>
        </Card>

        {/* Payment Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Method:</span>
              <span className="font-medium">{order.payment_method === "cod" ? "Cash on Delivery" : "UPI Payment"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Status:</span>
              <Badge className={getPaymentStatusColor(order.payment_status)}>
                {order.payment_status === "paid" ? "Paid" : "Pending"}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Amount:</span>
              <span className="font-medium">₹{order.total_amount.toFixed(2)}</span>
            </div>
            {order.payment_status === "pending" && (
              <Button className="w-full mt-4" asChild>
                <Link href={`/orders/${order.id}/pay`}>Make Payment</Link>
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Delivery Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Delivery Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {order.estimated_delivery && (
              <div className="flex justify-between">
                <span className="text-gray-600">Estimated Delivery:</span>
                <span className="font-medium">{formatDate(order.estimated_delivery)}</span>
              </div>
            )}
            {order.notes && (
              <div>
                <span className="text-gray-600">Notes:</span>
                <p className="mt-1">{order.notes}</p>
              </div>
            )}
            {!order.estimated_delivery && !order.notes && (
              <p className="text-gray-500 text-center py-4">No delivery information available</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
