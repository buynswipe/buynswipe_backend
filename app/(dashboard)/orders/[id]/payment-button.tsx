"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { CheckCircle, Loader2 } from "lucide-react"

interface PaymentButtonProps {
  order: any
  onPaymentComplete: () => void
}

export function PaymentButton({ order, onPaymentComplete }: PaymentButtonProps) {
  const [isProcessing, setIsProcessing] = useState(false)

  const handlePayment = async () => {
    setIsProcessing(true)
    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 2000))
    onPaymentComplete()
    setIsProcessing(false)
  }

  return (
    <Button onClick={handlePayment} disabled={isProcessing}>
      {isProcessing ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing Payment...
        </>
      ) : (
        <>
          <CheckCircle className="mr-2 h-4 w-4" />
          Mark as Paid
        </>
      )}
    </Button>
  )
}
