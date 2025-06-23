"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { CreditCard, Banknote, Smartphone } from "lucide-react"

interface PaymentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  total: number
  onPayment: (paymentData: any) => void
}

export function PaymentDialog({ open, onOpenChange, total, onPayment }: PaymentDialogProps) {
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card" | "upi">("cash")
  const [cashReceived, setCashReceived] = useState("")
  const [change, setChange] = useState(0)

  const handleCashReceivedChange = (value: string) => {
    setCashReceived(value)
    const received = Number.parseFloat(value) || 0
    setChange(Math.max(0, received - total))
  }

  const handlePayment = () => {
    const paymentData = {
      method: paymentMethod,
      cashReceived: paymentMethod === "cash" ? Number.parseFloat(cashReceived) || 0 : total,
    }
    onPayment(paymentData)
  }

  const isValidPayment = () => {
    if (paymentMethod === "cash") {
      const received = Number.parseFloat(cashReceived) || 0
      return received >= total
    }
    return true
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Process Payment</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Total Amount */}
          <div className="text-center">
            <p className="text-sm text-gray-500">Total Amount</p>
            <p className="text-3xl font-bold">₹{total.toFixed(2)}</p>
          </div>

          {/* Payment Method Selection */}
          <div className="space-y-3">
            <Label>Payment Method</Label>
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant={paymentMethod === "cash" ? "default" : "outline"}
                onClick={() => setPaymentMethod("cash")}
                className="flex flex-col gap-1 h-16"
              >
                <Banknote className="h-5 w-5" />
                <span className="text-xs">Cash</span>
              </Button>
              <Button
                variant={paymentMethod === "card" ? "default" : "outline"}
                onClick={() => setPaymentMethod("card")}
                className="flex flex-col gap-1 h-16"
              >
                <CreditCard className="h-5 w-5" />
                <span className="text-xs">Card</span>
              </Button>
              <Button
                variant={paymentMethod === "upi" ? "default" : "outline"}
                onClick={() => setPaymentMethod("upi")}
                className="flex flex-col gap-1 h-16"
              >
                <Smartphone className="h-5 w-5" />
                <span className="text-xs">UPI</span>
              </Button>
            </div>
          </div>

          {/* Cash Payment Details */}
          {paymentMethod === "cash" && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="cash-received">Cash Received</Label>
                <Input
                  id="cash-received"
                  type="number"
                  step="0.01"
                  value={cashReceived}
                  onChange={(e) => handleCashReceivedChange(e.target.value)}
                  placeholder="0.00"
                  autoFocus
                />
              </div>

              {change > 0 && (
                <div className="bg-green-50 p-3 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Change to Return:</span>
                    <span className="text-lg font-bold text-green-600">₹{change.toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          <Separator />

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handlePayment} disabled={!isValidPayment()} className="flex-1">
              Complete Payment
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
