"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { IndianRupee, CheckCircle, X, Loader2 } from "lucide-react"

interface CODReconciliationProps {
  orderTotal: number
  onComplete: (amountCollected: number) => void
  onCancel: () => void
}

export function CODReconciliation({ orderTotal, onComplete, onCancel }: CODReconciliationProps) {
  const [amountCollected, setAmountCollected] = useState<string>(orderTotal.toString())
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
      if (amount !== orderTotal) {
        throw new Error("Amount collected does not match the order total")
      }

      // Simulate a successful payment processing
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
        <CardTitle>COD Reconciliation</CardTitle>
        <CardDescription>Verify and confirm the cash amount collected</CardDescription>
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
            <AlertDescription className="text-blue-600">Expected amount: ₹{orderTotal.toFixed(2)}</AlertDescription>
          </Alert>

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
