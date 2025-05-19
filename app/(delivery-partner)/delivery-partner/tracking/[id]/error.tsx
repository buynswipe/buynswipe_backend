"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"

export default function OrderTrackingError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Order tracking error:", error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-4">
      <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
      <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
      <p className="text-muted-foreground mb-6 text-center max-w-md">
        We encountered an error while loading the order details.
        {error?.message ? ` Error: ${error.message}` : ""}
      </p>
      <div className="flex gap-4">
        <Button variant="default" onClick={reset}>
          Try again
        </Button>
        <Button variant="outline" asChild>
          <a href="/delivery-partner/active">Go to Active Deliveries</a>
        </Button>
      </div>
    </div>
  )
}
