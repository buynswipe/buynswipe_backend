"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Order, UserProfile } from "@/types/database.types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, ArrowLeft, CheckCircle, AlertTriangle } from "lucide-react"
import { UpiPayment } from "@/components/payments/upi-payment"

interface OrderWithDetails extends Order {
  wholesaler: UserProfile
  retailer: UserProfile
}

export default function OrderPaymentPage({ params }: { params: { id: string } }) {
  const [order, setOrder] = useState<OrderWithDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<"upi" | "cod">("upi")
  const [paymentSuccess, setPaymentSuccess] = useState(false)
  const supabase = createClientComponentClient()
  const router = useRouter()

  // Fetch order details
  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setIsLoading(true)
        setError(null)

        console.log("Fetching order details for ID:", params.id)

        // Get user session
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!session) {
          throw new Error("Not authenticated")
        }

        // Fetch order with related data
        const { data, error } = await supabase
          .from("orders")
          .select(`
            *,
            retailer:profiles!retailer_id(*),
            wholesaler:profiles!wholesaler_id(*)
          `)
          .eq("id", params.id)
          .single()

        if (error) {
          console.error("Error fetching order:", error)
          throw new Error(`Order not found: ${error.message}`)
        }

        if (!data) {
          throw new Error("Order not found")
        }

        // Check if user has permission to pay for this order
        if (data.retailer_id !== session.user.id) {
          throw new Error("You don't have permission to pay for this order")
        }

        // Check if order is already paid
        if (data.payment_status === "paid") {
          throw new Error("This order has already been paid")
        }

        setOrder(data as OrderWithDetails)

        // Set default payment method based on order
        if (data.payment_method) {
          setPaymentMethod(data.payment_method as "upi" | "cod")
        }
      } catch (error: any) {
        console.error("Error in fetchOrderDetails:", error)
        setError(error.message)
      } finally {
        setIsLoading(false)
      }
    }

    fetchOrderDetails()
  }, [supabase, params.id])

  // Handle payment method change
  const handlePaymentMethodChange = async (method: "upi" | "cod") => {
    if (!order) return

    setPaymentMethod(method)

    // Update order payment method
    try {
      const { error } = await supabase.from("orders").update({ payment_method: method }).eq("id", order.id)

      if (error) {
        console.error("Error updating payment method:", error)
      }
    } catch (error) {
      console.error("Error updating payment method:", error)
    }
  }

  // Handle payment completion
  const handlePaymentComplete = async () => {
    try {
      // Refresh order data
      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          retailer:profiles!retailer_id(*),
          wholesaler:profiles!wholesaler_id(*)
        `)
        .eq("id", params.id)
        .single()

      if (error) throw error

      setOrder(data as OrderWithDetails)

      if (data.payment_status === "paid") {
        setPaymentSuccess(true)

        // Redirect to order details page after a delay
        setTimeout(() => {
          router.push(`/orders/${params.id}`)
        }, 3000)
      }
    } catch (error: any) {
      console.error("Error refreshing order data:", error)
    }
  }

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount)
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
        <Button variant="ghost" size="sm" onClick={() => router.push(`/orders/${params.id}`)} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Order
        </Button>
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" onClick={() => router.push("/orders")} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Orders
        </Button>
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>Order not found</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center">
        <Button variant="ghost" size="sm" onClick={() => router.push(`/orders/${params.id}`)} className="mr-2">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Order
        </Button>
        <h2 className="text-2xl font-bold tracking-tight">Make Payment</h2>
      </div>

      {paymentSuccess ? (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <div className="flex justify-center mb-2">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <CardTitle className="text-center text-green-800">Payment Successful!</CardTitle>
            <CardDescription className="text-center text-green-700">
              Your payment has been processed successfully.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-green-700">
              Thank you for your payment. You will be redirected to the order details page shortly.
            </p>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button onClick={() => router.push(`/orders/${params.id}`)}>View Order Details</Button>
          </CardFooter>
        </Card>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
              <CardDescription>Review your order before making payment</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Order ID:</span>
                <span className="font-medium">#{params.id.substring(0, 8)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Wholesaler:</span>
                <span className="font-medium">{order.wholesaler.business_name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Payment Method:</span>
                <Tabs
                  value={paymentMethod}
                  onValueChange={(value) => handlePaymentMethodChange(value as "upi" | "cod")}
                >
                  <TabsList>
                    <TabsTrigger value="upi">UPI Payment</TabsTrigger>
                    <TabsTrigger value="cod">Cash on Delivery</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
              <Separator />
              <div className="flex justify-between items-center font-medium">
                <span>Total Amount:</span>
                <span className="text-lg">{formatCurrency(order.total_amount)}</span>
              </div>
            </CardContent>
          </Card>

          {paymentMethod === "upi" ? (
            <UpiPayment order={order} onPaymentComplete={handlePaymentComplete} />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Cash on Delivery</CardTitle>
                <CardDescription>Pay when your order is delivered</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm">
                    By selecting Cash on Delivery, you agree to pay the full amount of{" "}
                    <strong>{formatCurrency(order.total_amount)}</strong> when your order is delivered.
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    1. Your order will be processed and prepared for delivery.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    2. You will pay the delivery partner when your order arrives.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    3. Please ensure you have the exact amount ready for payment.
                  </p>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => router.push(`/orders/${params.id}`)}>
                  Cancel
                </Button>
                <Button
                  onClick={async () => {
                    try {
                      // Update order payment method to COD
                      const { error } = await supabase
                        .from("orders")
                        .update({ payment_method: "cod" })
                        .eq("id", order.id)

                      if (error) throw error

                      // Redirect to order details
                      router.push(`/orders/${params.id}?payment_method=cod`)
                    } catch (error: any) {
                      console.error("Error setting COD payment:", error)
                      setError(error.message)
                    }
                  }}
                >
                  Confirm Cash on Delivery
                </Button>
              </CardFooter>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
