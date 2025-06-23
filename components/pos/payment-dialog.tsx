"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { CreditCard, Banknote, Smartphone, Calculator } from "lucide-react"
import { toast } from "sonner"
import { useIsMobile } from "@/hooks/use-mobile"

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
  const isMobile = useIsMobile()

  const change = Number.parseFloat(cashReceived) - total
  const quickAmounts = [
    Math.ceil(total),
    Math.ceil(total / 50) * 50,
    Math.ceil(total / 100) * 100,
    Math.ceil(total / 500) * 500,
  ].filter((amount, index, arr) => arr.indexOf(amount) === index && amount > total)

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
      <DialogContent className={`${isMobile ? "w-[95vw] h-[90vh] max-w-none" : "sm:max-w-md"} p-0`}>
        <div className="flex flex-col h-full">
          <DialogHeader className="p-4 pb-2">
            <DialogTitle className="flex items-center space-x-2">
              <Calculator className="h-5 w-5" />
              <span>Process Payment</span>
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 p-4 space-y-6 overflow-y-auto">
            {/* Total Amount */}
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-sm text-gray-500 mb-2">Total Amount</p>
                <p className={`font-bold ${isMobile ? "text-4xl" : "text-3xl"}`}>₹{total.toFixed(2)}</p>
              </CardContent>
            </Card>

            {/* Payment Method Tabs */}
            <Tabs value={paymentMethod} onValueChange={setPaymentMethod}>
              <TabsList className={`grid w-full grid-cols-3 ${isMobile ? "h-12" : ""}`}>
                <TabsTrigger value="cash" className="flex items-center space-x-2">
                  <Banknote className="h-4 w-4" />
                  <span className={isMobile ? "text-sm" : ""}>Cash</span>
                </TabsTrigger>
                <TabsTrigger value="card" className="flex items-center space-x-2">
                  <CreditCard className="h-4 w-4" />
                  <span className={isMobile ? "text-sm" : ""}>Card</span>
                </TabsTrigger>
                <TabsTrigger value="upi" className="flex items-center space-x-2">
                  <Smartphone className="h-4 w-4" />
                  <span className={isMobile ? "text-sm" : ""}>UPI</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="cash" className="space-y-4 mt-6">
                <div>
                  <Label htmlFor="cash-received" className={isMobile ? "text-base" : ""}>
                    Cash Received
                  </Label>
                  <Input
                    id="cash-received"
                    type="number"
                    placeholder="Enter amount received"
                    value={cashReceived}
                    onChange={(e) => setCashReceived(e.target.value)}
                    step="0.01"
                    className={isMobile ? "text-base h-12 mt-2" : "mt-1"}
                  />
                </div>

                {/* Quick Amount Buttons */}
                {quickAmounts.length > 0 && (
                  <div>
                    <Label className={isMobile ? "text-base" : ""}>Quick Amounts</Label>
                    <div className={`grid grid-cols-2 gap-2 ${isMobile ? "mt-2" : "mt-1"}`}>
                      {quickAmounts.slice(0, 4).map((amount) => (
                        <Button
                          key={amount}
                          variant="outline"
                          onClick={() => setCashReceived(amount.toString())}
                          className={isMobile ? "h-12" : ""}
                        >
                          ₹{amount}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Change Display */}
                {cashReceived && Number.parseFloat(cashReceived) >= total && (
                  <Card>
                    <CardContent className={`${isMobile ? "p-4" : "p-3"} bg-green-50`}>
                      <div className="flex justify-between items-center">
                        <span className={`${isMobile ? "text-base" : "text-sm"} font-medium text-green-800`}>
                          Change to return:
                        </span>
                        <span className={`${isMobile ? "text-lg" : ""} font-bold text-green-800`}>
                          ₹{change.toFixed(2)}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="card" className="space-y-4 mt-6">
                <Card>
                  <CardContent className={`${isMobile ? "p-6" : "p-4"} text-center`}>
                    <CreditCard className={`${isMobile ? "h-16 w-16" : "h-12 w-12"} mx-auto mb-4 text-gray-400`} />
                    <p className={`${isMobile ? "text-base" : "text-sm"} text-gray-500`}>
                      Insert or swipe card on the terminal
                    </p>
                    <p className={`${isMobile ? "text-sm" : "text-xs"} text-gray-400 mt-2`}>
                      Follow the prompts on your card reader
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="upi" className="space-y-4 mt-6">
                <Card>
                  <CardContent className={`${isMobile ? "p-6" : "p-4"} text-center`}>
                    <Smartphone className={`${isMobile ? "h-16 w-16" : "h-12 w-12"} mx-auto mb-4 text-gray-400`} />
                    <p className={`${isMobile ? "text-base" : "text-sm"} text-gray-500`}>
                      Show QR code to customer for UPI payment
                    </p>
                    <p className={`${isMobile ? "text-sm" : "text-xs"} text-gray-400 mt-2`}>
                      Or share UPI ID for payment
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Action Buttons */}
          <div className="p-4 border-t">
            <div className="flex space-x-2">
              <Button
                variant="outline"
                className={`flex-1 ${isMobile ? "h-12" : ""}`}
                onClick={() => onOpenChange(false)}
                disabled={processing}
              >
                Cancel
              </Button>
              <Button
                className={`flex-1 ${isMobile ? "h-12" : ""}`}
                onClick={handlePayment}
                disabled={
                  processing || (paymentMethod === "cash" && (!cashReceived || Number.parseFloat(cashReceived) < total))
                }
              >
                {processing ? "Processing..." : "Complete Payment"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
