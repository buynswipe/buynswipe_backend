"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { IndianRupee, CheckCircle, X, Loader2, AlertTriangle } from "lucide-react"
import type { Order } from "@/types/database.types"

interface CODCollectionProps {
  order: Order
  onComplete: (amountCollected: number) => void
  onCancel: () => void
}

export function CODCollection({ order, onComplete, onCancel }: CODCollectionProps) {
  const [amountCollected, setAmountCollected] = useState<string>(order.total_amount.toString())
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const amount = Number.parseFloat(amountCollected)

      if (isNaN(amount)) {
        throw new Error("Please enter a valid amount")
      }

      // Check if the amount matches the order total
      const expectedAmount = order.total_amount
      const difference = Math.abs(amount - expectedAmount)

      if (difference > 0.01) {
        // Allow for small rounding errors
        // In a real implementation, you might want to handle this differently
        // For now, we'll just show a warning but allow it to proceed
        if (
          !confirm(
            `The amount collected (₹${amount.toFixed(2)}) doesn't match the order total (₹${expectedAmount.toFixed(2)}). Do you want to continue?`,
          )
        ) {
          setIsLoading(false)
          return
        }
      }

      // In a real implementation, you would submit this to your API
      // For now, we'll just simulate a delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      onComplete(amount)
    } catch (err: any) {
      setError(err.message || "Failed to process payment. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Cash Collection</CardTitle>
        <CardDescription>Order #{order.id.substring(0, 8)}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount-collected">Amount Collected (₹)</Label>
            <div className="relative">
              <IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="amount-collected"
                type="number"
                step="0.01"
                value={amountCollected}
                onChange={(e) => setAmountCollected(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>

          <Alert className="bg-blue-50 border-blue-200">
            <AlertDescription className="text-blue-600">
              Expected amount: ₹{order.total_amount.toFixed(2)}
            </AlertDescription>
          </Alert>

          {Number.parseFloat(amountCollected) !== order.total_amount && (
            <Alert className="bg-yellow-50 border-yellow-200">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-600">
                The amount entered doesn't match the order total.
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button type="submit" className="w-full" disabled={isLoading || !amountCollected}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Confirm Collection
              </>
            )}
          </Button>
        </form>
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full" onClick={onCancel}>
          <X className="mr-2 h-4 w-4" />
          Cancel
        </Button>
      </CardFooter>
    </Card>
  )
}
