"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CreditCard, Banknote, Smartphone } from "lucide-react"
import { toast } from "sonner"

interface PaymentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  total: number
  onPaymentComplete: (paymentData: any) => void
}

export function PaymentDialog({ open, onOpenChange, total, onPaymentComplete }: PaymentDialogProps) {
  const [paymentMethod, setPaymentMethod] = useState("cash")
  const [cashReceived, setCashReceived] = useState("")
  const [processing, setProcessing] = useState(false)

  const change = Number.parseFloat(cashReceived) - total

  const handlePayment = async () => {
    setProcessing(true)

    try {
      const paymentData = {
        method: paymentMethod,
        amount: total,
        change: 0,
      }

      if (paymentMethod === "cash") {
        const received = Number.parseFloat(cashReceived)
        if (received < total) {
          toast.error("Insufficient cash received")
          return
        }
        paymentData.amount = received
        paymentData.change = change
      }

      // Simulate payment processing delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      onPaymentComplete(paymentData)

      // Reset form
      setCashReceived("")
      setPaymentMethod("cash")
    } catch (error) {
      toast.error("Payment processing failed")
    } finally {
      setProcessing(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Process Payment</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="text-center">
            <p className="text-2xl font-bold">₹{total.toFixed(2)}</p>
            <p className="text-sm text-gray-500">Total Amount</p>
          </div>

          <Tabs value={paymentMethod} onValueChange={setPaymentMethod}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="cash">
                <Banknote className="h-4 w-4 mr-2" />
                Cash
              </TabsTrigger>
              <TabsTrigger value="card">
                <CreditCard className="h-4 w-4 mr-2" />
                Card
              </TabsTrigger>
              <TabsTrigger value="upi">
                <Smartphone className="h-4 w-4 mr-2" />
                UPI
              </TabsTrigger>
            </TabsList>

            <TabsContent value="cash" className="space-y-4">
              <div>
                <Label htmlFor="cash-received">Cash Received</Label>
                <Input
                  id="cash-received"
                  type="number"
                  placeholder="Enter amount received"
                  value={cashReceived}
                  onChange={(e) => setCashReceived(e.target.value)}
                  step="0.01"
                />
              </div>

              {cashReceived && Number.parseFloat(cashReceived) >= total && (
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-sm font-medium text-green-800">Change to return: ₹{change.toFixed(2)}</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="card" className="space-y-4">
              <div className="text-center py-8">
                <CreditCard className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-sm text-gray-500">Insert or swipe card on the terminal</p>
              </div>
            </TabsContent>

            <TabsContent value="upi" className="space-y-4">
              <div className="text-center py-8">
                <Smartphone className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-sm text-gray-500">Show QR code to customer for UPI payment</p>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex space-x-2">
            <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)} disabled={processing}>
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={handlePayment}
              disabled={
                processing || (paymentMethod === "cash" && (!cashReceived || Number.parseFloat(cashReceived) < total))
              }
            >
              {processing ? "Processing..." : "Complete Payment"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
