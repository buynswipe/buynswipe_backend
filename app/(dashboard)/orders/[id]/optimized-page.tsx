"use client"

import { useState, useEffect, useMemo, Suspense } from "react"
import { useParams, useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowLeft, Package, Store, CreditCard, Truck, AlertCircle } from "lucide-react"
import Link from "next/link"

// Lazy load heavy components
const PaymentButton = lazy(() => import("./payment-button"))
const DocumentActions = lazy(() => import("./document-actions"))

import { lazy } from "react"

interface OrderData {
  id: string
  status: string
  payment_status: string
  payment_method: string
  total_amount: number
  created_at: string
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

// Memoized components for better performance
const OrderStatusBadge = memo(({ status }: { status: string }) => {
  const statusConfig = useMemo(() => {
    const configs = {
      placed: { label: "Placed", className: "bg-blue-100 text-blue-800" },
      confirmed: { label: "Confirmed", className: "bg-green-100 text-green-800" },
      dispatched: { label: "Dispatched", className: "bg-purple-100 text-purple-800" },
      delivered: { label: "Delivered", className: "bg-green-100 text-green-800" },
      rejected: { label: "Rejected", className: "bg-red-100 text-red-800" },
    }
    return configs[status as keyof typeof configs] || { label: status, className: "bg-gray-100 text-gray-800" }
  }, [status])

  return <Badge className={statusConfig.className}>{statusConfig.label}</Badge>
})

const PaymentStatusBadge = memo(({ status }: { status: string }) => {
  const className = status === "paid" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
  return <Badge className={className}>{status === "paid" ? "Paid" : "Pending"}</Badge>
})

const OrderItemsList = memo(({ items }: { items: OrderData["order_items"] }) => {
  const totalItems = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items])

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="font-medium">Order Items</h4>
        <span className="text-sm text-gray-500">{totalItems} items</span>
      </div>
      {items.map((item) => (
        <div key={item.id} className="flex justify-between items-center">
          <div>
            <p className="font-medium">{item.product?.name || "Product"}</p>
            <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
          </div>
          <p className="font-medium">₹{(item.price * item.quantity).toFixed(2)}</p>
        </div>
      ))}
    </div>
  )
})

const WholesalerInfo = memo(({ wholesaler }: { wholesaler: OrderData["wholesaler"] }) => (
  <div className="space-y-3">
    <div>
      <p className="font-medium">{wholesaler.business_name}</p>
      <p className="text-sm text-gray-600">{wholesaler.address}</p>
      <p className="text-sm text-gray-600">
        {wholesaler.city}, {wholesaler.pincode}
      </p>
      <p className="text-sm text-gray-600">Phone: {wholesaler.phone}</p>
    </div>
  </div>
))

// Loading skeleton component
const OrderDetailsSkeleton = () => (
  <div className="max-w-4xl mx-auto space-y-6">
    <div className="flex items-center gap-4">
      <Skeleton className="h-10 w-32" />
    </div>
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-16" />
          </div>
        </div>
      </CardHeader>
    </Card>
    <div className="grid gap-6 md:grid-cols-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
)

import { memo } from "react"

export default function OptimizedOrderDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const [order, setOrder] = useState<OrderData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClientComponentClient()

  // Memoized date formatter
  const formatDate = useMemo(() => {
    return (dateStr: string) => {
      return new Date(dateStr).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    }
  }, [])

  useEffect(() => {
    async function fetchOrder() {
      try {
        if (!params?.id) {
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

        // Optimized query - only fetch what we need
        const { data, error: fetchError } = await supabase
          .from("orders")
          .select(`
            id,
            status,
            payment_status,
            payment_method,
            total_amount,
            created_at,
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

  if (loading) {
    return <OrderDetailsSkeleton />
  }

  if (error || !order) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Card>
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
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
              <OrderStatusBadge status={order.status} />
              <PaymentStatusBadge status={order.payment_status} />
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
          <CardContent>
            <OrderItemsList items={order.order_items} />
            <Separator className="my-4" />
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
          <CardContent>
            <WholesalerInfo wholesaler={order.wholesaler} />
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
              <PaymentStatusBadge status={order.payment_status} />
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Amount:</span>
              <span className="font-medium">₹{order.total_amount.toFixed(2)}</span>
            </div>
            {order.payment_status === "pending" && (
              <Suspense fallback={<Skeleton className="h-10 w-full" />}>
                <PaymentButton orderId={order.id} amount={order.total_amount} />
              </Suspense>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<Skeleton className="h-10 w-full" />}>
              <DocumentActions orderId={order.id} />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
