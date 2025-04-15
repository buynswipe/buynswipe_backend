"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import {
  Loader2,
  QrCode,
  Copy,
  CheckCircle,
  RefreshCw,
  ArrowLeft,
  Smartphone,
  AlertTriangle,
  Clock,
} from "lucide-react"
import type { Order, UserProfile } from "@/types/database.types"

interface UpiPaymentProps {
  order: Order & {
    retailer: UserProfile
    wholesaler: UserProfile
  }
  onPaymentComplete: () => void
}

export function UpiPayment({ order, onPaymentComplete }: UpiPaymentProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [paymentData, setPaymentData] = useState<{
    upiUri: string
    qrCode: string
    txnId: string
    timeout: number
  } | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<"qr" | "id">("qr")
  const [upiId, setUpiId] = useState("")
  const [copySuccess, setCopySuccess] = useState(false)
  const [statusCheckInterval, setStatusCheckInterval] = useState<NodeJS.Timeout | null>(null)
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [isVerifying, setIsVerifying] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const router = useRouter()

  // Initialize payment
  const initializePayment = useCallback(async () => {
    if (!order) return

    try {
      setIsLoading(true)
      setError(null)

      console.log("Initializing UPI payment for order:", order.id)

      const response = await fetch("/api/payments/payu/upi", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId: order.id,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        console.error("UPI payment initialization error:", data)
        throw new Error(data.error || "Failed to initialize UPI payment")
      }

      console.log("UPI payment initialized successfully")
      setPaymentData(data)
      setTimeRemaining(data.timeout)

      // Start countdown timer
      const timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timer)
            return 0
          }
          return prev - 1
        })
      }, 1000)

      // Start checking payment status
      const statusCheck = setInterval(() => {
        checkPaymentStatus(data.txnId)
      }, 5000) // Check every 5 seconds

      setStatusCheckInterval(statusCheck)

      return () => {
        clearInterval(timer)
        clearInterval(statusCheck)
      }
    } catch (error: any) {
      console.error("Error initializing payment:", error)
      setError(error.message || "Failed to initialize payment. Please try again.")

      // If we've tried less than 3 times, retry after a delay
      if (retryCount < 3) {
        setRetryCount((prev) => prev + 1)
        setTimeout(() => {
          console.log(`Retrying payment initialization (attempt ${retryCount + 1})`)
          initializePayment()
        }, 3000) // Retry after 3 seconds
      }
    } finally {
      setIsLoading(false)
    }
  }, [order, retryCount])

  useEffect(() => {
    if (!order) return

    const cleanup = initializePayment()

    return () => {
      if (cleanup) cleanup()
      if (statusCheckInterval) {
        clearInterval(statusCheckInterval)
      }
    }
  }, [order, initializePayment, statusCheckInterval])

  // Check payment status
  const checkPaymentStatus = async (txnId: string) => {
    if (isVerifying) return

    try {
      setIsVerifying(true)

      const response = await fetch("/api/payments/payu/status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          txnId,
          orderId: order.id,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        console.error("Error checking payment status:", data.error)
        return
      }

      if (data.status === "success" || data.orderStatus === "paid") {
        // Payment successful
        if (statusCheckInterval) {
          clearInterval(statusCheckInterval)
        }

        // Refresh order data
        onPaymentComplete()
      }
    } catch (error) {
      console.error("Error checking payment status:", error)
    } finally {
      setIsVerifying(false)
    }
  }

  // Handle manual verification
  const handleVerifyPayment = async () => {
    if (!paymentData) return

    try {
      setIsVerifying(true)
      setError(null)

      const response = await fetch("/api/payments/payu/status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          txnId: paymentData.txnId,
          orderId: order.id,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to verify payment")
      }

      if (data.status === "success" || data.orderStatus === "paid") {
        // Payment successful
        if (statusCheckInterval) {
          clearInterval(statusCheckInterval)
        }

        // Refresh order data
        onPaymentComplete()
      } else if (data.status === "pending") {
        setError("Payment is still being processed. Please wait or try again in a few moments.")
      } else {
        setError("Payment verification failed. Please try again or use a different payment method.")
      }
    } catch (error: any) {
      console.error("Error verifying payment:", error)
      setError(error.message || "Failed to verify payment")
    } finally {
      setIsVerifying(false)
    }
  }

  // Copy UPI URI to clipboard
  const copyUpiUri = () => {
    if (!paymentData) return

    navigator.clipboard.writeText(paymentData.upiUri)
    setCopySuccess(true)
    setTimeout(() => setCopySuccess(false), 2000)
  }

  // Format time remaining
  const formatTimeRemaining = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount)
  }

  // Handle retry
  const handleRetry = () => {
    setRetryCount(0)
    initializePayment()
  }

  // Handle back to order
  const handleBackToOrder = () => {
    router.push(`/orders/${order.id}`)
  }

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-64 space-y-4">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="text-center">Initializing UPI payment...</span>
        <span className="text-sm text-muted-foreground">This may take a few moments</span>
      </div>
    )
  }

  if (error && !paymentData) {
    return (
      <div className="space-y-4">
        <Alert variant="destructive" className="my-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <div className="flex justify-center">
          <Button onClick={handleRetry}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry Payment
          </Button>
        </div>
      </div>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>UPI Payment</CardTitle>
        <CardDescription>Pay using any UPI app</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Payment Details */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Order ID:</span>
            <span className="font-medium">#{order.id.substring(0, 8)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Amount:</span>
            <span className="font-medium">{formatCurrency(order.total_amount)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Payment Method:</span>
            <Badge className="bg-green-100 text-green-800 hover:bg-green-200">UPI Payment</Badge>
          </div>

          {timeRemaining > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Time Remaining:</span>
              <Badge variant="outline" className="flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                {formatTimeRemaining(timeRemaining)}
              </Badge>
            </div>
          )}
        </div>

        <Separator />

        {/* Payment Methods */}
        <Tabs value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as "qr" | "id")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="qr">Scan QR Code</TabsTrigger>
            <TabsTrigger value="id">UPI ID</TabsTrigger>
          </TabsList>

          <TabsContent value="qr" className="space-y-4">
            {paymentData && (
              <div className="flex flex-col items-center">
                <div className="bg-white p-4 rounded-lg border">
                  {paymentData.qrCode ? (
                    <Image
                      src={paymentData.qrCode || "/placeholder.svg"}
                      alt="UPI QR Code"
                      width={200}
                      height={200}
                      className="w-48 h-48"
                      onError={(e) => {
                        // Fallback if image fails to load
                        const target = e.target as HTMLImageElement
                        target.onerror = null
                        target.src =
                          "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=" +
                          encodeURIComponent(paymentData.upiUri)
                      }}
                    />
                  ) : (
                    <QrCode className="h-48 w-48 text-gray-800" />
                  )}
                </div>

                <div className="mt-4 text-center">
                  <p className="text-sm text-muted-foreground">Scan this QR code with any UPI app</p>
                </div>

                <div className="flex items-center mt-4 p-3 bg-muted rounded-lg w-full">
                  <div className="flex-1 truncate">{paymentData.upiUri}</div>
                  <Button variant="ghost" size="sm" onClick={copyUpiUri}>
                    {copySuccess ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    <span className="sr-only">Copy UPI URI</span>
                  </Button>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">1. Open your UPI app and scan the QR code</p>
              <p className="text-sm text-muted-foreground">
                2. Enter the exact amount: {formatCurrency(order.total_amount)}
              </p>
              <p className="text-sm text-muted-foreground">3. Complete the payment in your UPI app</p>
            </div>
          </TabsContent>

          <TabsContent value="id" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="upi-id">Enter your UPI ID</Label>
                <div className="flex space-x-2">
                  <Input
                    id="upi-id"
                    placeholder="yourname@upi"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                  />
                  <Button
                    disabled={!upiId || !paymentData}
                    onClick={() => {
                      if (paymentData) {
                        window.location.href = `${paymentData.upiUri}&pa=${upiId}`
                      }
                    }}
                  >
                    <Smartphone className="h-4 w-4 mr-2" />
                    Pay
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">1. Enter your UPI ID (e.g., yourname@upi)</p>
                <p className="text-sm text-muted-foreground">2. Click on Pay to open your UPI app</p>
                <p className="text-sm text-muted-foreground">3. Complete the payment in your UPI app</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* UPI App Icons */}
        <div>
          <p className="text-sm font-medium mb-2">Pay using</p>
          <div className="grid grid-cols-4 gap-4">
            <div className="flex flex-col items-center">
              <Image
                src="/placeholder.svg?height=48&width=48"
                alt="PhonePe"
                width={48}
                height={48}
                className="rounded-lg"
              />
              <span className="text-xs mt-1">PhonePe</span>
            </div>
            <div className="flex flex-col items-center">
              <Image
                src="/placeholder.svg?height=48&width=48"
                alt="Google Pay"
                width={48}
                height={48}
                className="rounded-lg"
              />
              <span className="text-xs mt-1">Google Pay</span>
            </div>
            <div className="flex flex-col items-center">
              <Image
                src="/placeholder.svg?height=48&width=48"
                alt="Paytm"
                width={48}
                height={48}
                className="rounded-lg"
              />
              <span className="text-xs mt-1">Paytm</span>
            </div>
            <div className="flex flex-col items-center">
              <Image
                src="/placeholder.svg?height=48&width=48"
                alt="BHIM"
                width={48}
                height={48}
                className="rounded-lg"
              />
              <span className="text-xs mt-1">BHIM</span>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Timeout Message */}
        {timeRemaining === 0 && (
          <Alert variant="warning" className="bg-yellow-50 border-yellow-200 text-yellow-800">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <AlertDescription>
              The payment session has timed out. Please refresh to start a new payment session.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>

      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={handleBackToOrder}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Order
        </Button>

        <Button onClick={handleVerifyPayment} disabled={isVerifying || !paymentData || timeRemaining === 0}>
          {isVerifying ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Verifying...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 mr-2" />
              Verify Payment
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
