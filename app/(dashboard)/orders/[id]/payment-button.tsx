"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, AlertTriangle, Database, CheckCircle, RefreshCw, CreditCard } from "lucide-react"
import type { Order, UserProfile } from "@/types/database.types"

interface PaymentButtonProps {
  order: Order & {
    retailer: UserProfile
  }
  onPaymentComplete?: () => void
}

export function PaymentButton({ order, onPaymentComplete }: PaymentButtonProps) {
  const [showDialog, setShowDialog] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<{ message: string; code?: string } | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(amount)
  }

  const handlePaymentConfirmation = async () => {
    try {
      setIsProcessing(true)
      setError(null)
      setSuccess(null)

      // Use the new simplified endpoint
      const response = await fetch("/api/payments/cod", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          orderId: order.id,
          amount: order.total_amount,
        }),
      })

      // Handle non-JSON responses (like HTML error pages)
      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text()
        console.error("Non-JSON response:", text)
        throw new Error("Received an invalid response from the server. Please try again.")
      }

      const data = await response.json()

      if (!response.ok) {
        console.error("Payment confirmation failed:", data)

        // Check for specific error codes
        if (data.code === "TABLE_NOT_FOUND" || data.code === "SCHEMA_OUTDATED") {
          setError({
            message: "Database setup required. Please run the database migration script.",
            code: data.code,
          })
          return
        }

        throw new Error(data.error || "Failed to process payment")
      }

      // Even if we get a success response, let's update the UI based on the order status
      // This is a more reliable indicator than the transaction creation
      setSuccess(data.message || "Payment marked as received successfully")

      // Close dialog and refresh data after success
      setTimeout(() => {
        setShowDialog(false)
        if (onPaymentComplete) {
          onPaymentComplete()
        }
      }, 2000)
    } catch (error: any) {
      console.error("Error processing payment:", error)
      setError({ message: error.message })

      // If we've tried less than 3 times and it's a server error, retry automatically
      if (
        retryCount < 2 &&
        (error.message.includes("Server error") ||
          error.message.includes("timeout") ||
          error.message.includes("network"))
      ) {
        setRetryCount((prev) => prev + 1)
        setError({ message: `Server error occurred. Retrying automatically (${retryCount + 1}/3)...` })

        // Wait 2 seconds before retrying
        setTimeout(() => {
          handlePaymentConfirmation()
        }, 2000)
      }
    } finally {
      setIsProcessing(false)
    }
  }

  const resetAndRetry = () => {
    setError(null)
    setRetryCount(0)
    handlePaymentConfirmation()
  }

  const runMigration = async () => {
    try {
      setIsProcessing(true)
      setError({ message: "Running database migration..." })

      const response = await fetch("/api/admin/run-migration", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          migration: "transactions",
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError({
          message: `Migration failed: ${data.error || "Unknown error"}`,
          code: "MIGRATION_FAILED",
        })
        return
      }

      setError({ message: "Migration completed. Retrying payment..." })

      // Wait a moment then retry the payment
      setTimeout(() => {
        resetAndRetry()
      }, 2000)
    } catch (error: any) {
      setError({
        message: `Migration error: ${error.message}`,
        code: "MIGRATION_ERROR",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <>
      <Button className="w-full" onClick={() => setShowDialog(true)} variant="default">
        <CreditCard className="mr-2 h-4 w-4" />
        Mark Payment as Received
      </Button>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Mark Payment as Received</DialogTitle>
            <DialogDescription>Confirm that you have received the cash payment for this order.</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Order ID:</span>
                <span>#{order.id.substring(0, 8)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Retailer:</span>
                <span>{order.retailer.business_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Amount:</span>
                <span className="font-bold">{formatCurrency(order.total_amount)}</span>
              </div>
            </div>

            {error && (
              <Alert variant="destructive" className="mt-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                  <div>{error.message}</div>
                  {(error.code === "TABLE_NOT_FOUND" ||
                    error.code === "SCHEMA_OUTDATED" ||
                    error.message.includes("Database error") ||
                    error.message.includes("SQL")) && (
                    <div className="mt-2">
                      <Button onClick={runMigration} variant="outline" size="sm" disabled={isProcessing}>
                        <Database className="mr-2 h-4 w-4" />
                        Fix Database
                      </Button>
                    </div>
                  )}
                  {error.message.includes("Server error") && !error.message.includes("Retrying") && (
                    <div className="mt-2">
                      <Button onClick={resetAndRetry} variant="outline" size="sm" disabled={isProcessing}>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Retry
                      </Button>
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="mt-4 bg-green-50 text-green-800 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)} disabled={isProcessing}>
              Cancel
            </Button>
            <Button onClick={handlePaymentConfirmation} disabled={isProcessing || !!success}>
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Confirm Payment Received"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
