"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { CreditCard, Banknote, Smartphone, Wallet, Building, Calculator, Plus, Minus } from "lucide-react"
import { toast } from "sonner"
import { useIsMobile } from "@/hooks/use-mobile"

interface PaymentMethod {
  id: string
  name: string
  type: "cash" | "card" | "upi" | "wallet" | "bank_transfer"
  processingFee: number
  isActive: boolean
}

interface Customer {
  id: string
  name: string
  loyaltyPoints: number
}

interface Discount {
  id: string
  name: string
  value: number
}

interface EnhancedPaymentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  total: number
  customer?: Customer | null
  discount?: Discount | null
  onPaymentComplete: (paymentData: any) => void
}

export function EnhancedPaymentDialog({
  open,
  onOpenChange,
  total,
  customer,
  discount,
  onPaymentComplete,
}: EnhancedPaymentDialogProps) {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [selectedPayments, setSelectedPayments] = useState<
    Array<{
      methodId: string
      amount: number
      reference?: string
    }>
  >([])
  const [cashReceived, setCashReceived] = useState("")
  const [loyaltyPointsToRedeem, setLoyaltyPointsToRedeem] = useState(0)
  const [processing, setProcessing] = useState(false)
  const [splitPayment, setSplitPayment] = useState(false)
  const isMobile = useIsMobile()

  const maxLoyaltyRedemption = Math.min(customer?.loyaltyPoints || 0, Math.floor(total))
  const loyaltyDiscount = loyaltyPointsToRedeem
  const finalTotal = total - loyaltyDiscount
  const remainingAmount = finalTotal - selectedPayments.reduce((sum, p) => sum + p.amount, 0)

  useEffect(() => {
    if (open) {
      loadPaymentMethods()
      resetForm()
    }
  }, [open])

  const loadPaymentMethods = async () => {
    try {
      const response = await fetch("/api/pos/payment-methods")
      if (response.ok) {
        const data = await response.json()
        setPaymentMethods(data.methods || [])
      }
    } catch (error) {
      console.error("Failed to load payment methods:", error)
    }
  }

  const resetForm = () => {
    setSelectedPayments([])
    setCashReceived("")
    setLoyaltyPointsToRedeem(0)
    setSplitPayment(false)
  }

  const addPaymentMethod = (methodId: string, amount: number = remainingAmount) => {
    const method = paymentMethods.find((m) => m.id === methodId)
    if (!method) return

    setSelectedPayments((prev) => [...prev, { methodId, amount: Math.min(amount, remainingAmount) }])
  }

  const updatePaymentAmount = (index: number, amount: number) => {
    setSelectedPayments((prev) =>
      prev.map((payment, i) => (i === index ? { ...payment, amount: Math.max(0, amount) } : payment)),
    )
  }

  const removePayment = (index: number) => {
    setSelectedPayments((prev) => prev.filter((_, i) => i !== index))
  }

  const getPaymentMethodIcon = (type: string) => {
    switch (type) {
      case "cash":
        return <Banknote className="h-4 w-4" />
      case "card":
        return <CreditCard className="h-4 w-4" />
      case "upi":
        return <Smartphone className="h-4 w-4" />
      case "wallet":
        return <Wallet className="h-4 w-4" />
      case "bank_transfer":
        return <Building className="h-4 w-4" />
      default:
        return <CreditCard className="h-4 w-4" />
    }
  }

  const handlePayment = async () => {
    if (remainingAmount > 0.01) {
      toast.error("Payment amount doesn't match total")
      return
    }

    setProcessing(true)

    try {
      const paymentData = {
        payments: selectedPayments.map((payment) => ({
          ...payment,
          method: paymentMethods.find((m) => m.id === payment.methodId),
        })),
        loyaltyPointsRedeemed: loyaltyPointsToRedeem,
        finalTotal,
        originalTotal: total,
        loyaltyDiscount,
      }

      await onPaymentComplete(paymentData)
      resetForm()
    } catch (error) {
      toast.error("Payment processing failed")
    } finally {
      setProcessing(false)
    }
  }

  const quickAmounts = [
    Math.ceil(finalTotal),
    Math.ceil(finalTotal / 50) * 50,
    Math.ceil(finalTotal / 100) * 100,
    Math.ceil(finalTotal / 500) * 500,
  ].filter((amount, index, arr) => arr.indexOf(amount) === index && amount > finalTotal)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`${isMobile ? "w-[95vw] h-[90vh] max-w-none" : "max-w-2xl"} p-0`}>
        <div className="flex flex-col h-full">
          <DialogHeader className="p-4 pb-2">
            <DialogTitle className="flex items-center space-x-2">
              <Calculator className="h-5 w-5" />
              <span>Enhanced Payment Processing</span>
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 p-4 space-y-6 overflow-y-auto">
            {/* Payment Summary */}
            <Card>
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>₹{total.toFixed(2)}</span>
                  </div>
                  {loyaltyPointsToRedeem > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Loyalty Discount:</span>
                      <span>-₹{loyaltyDiscount.toFixed(2)}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Final Total:</span>
                    <span>₹{finalTotal.toFixed(2)}</span>
                  </div>
                  {remainingAmount > 0 && (
                    <div className="flex justify-between text-red-600">
                      <span>Remaining:</span>
                      <span>₹{remainingAmount.toFixed(2)}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Customer & Loyalty */}
            {customer && (
              <Card>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Customer: {customer.name}</span>
                      <Badge variant="secondary">{customer.loyaltyPoints} points</Badge>
                    </div>
                    {customer.loyaltyPoints > 0 && (
                      <div className="space-y-2">
                        <Label>Redeem Loyalty Points (1 point = ₹1)</Label>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setLoyaltyPointsToRedeem(Math.max(0, loyaltyPointsToRedeem - 10))}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <Input
                            type="number"
                            value={loyaltyPointsToRedeem}
                            onChange={(e) =>
                              setLoyaltyPointsToRedeem(
                                Math.min(maxLoyaltyRedemption, Math.max(0, Number.parseInt(e.target.value) || 0)),
                              )
                            }
                            className="text-center"
                            max={maxLoyaltyRedemption}
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setLoyaltyPointsToRedeem(Math.min(maxLoyaltyRedemption, loyaltyPointsToRedeem + 10))
                            }
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setLoyaltyPointsToRedeem(maxLoyaltyRedemption)}
                          >
                            Max
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Payment Methods */}
            <Card>
              <CardContent className="p-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-medium">Payment Methods</Label>
                    <Button variant="outline" size="sm" onClick={() => setSplitPayment(!splitPayment)}>
                      {splitPayment ? "Single Payment" : "Split Payment"}
                    </Button>
                  </div>

                  {!splitPayment ? (
                    /* Single Payment Mode */
                    <div className="grid grid-cols-2 gap-2">
                      {paymentMethods
                        .filter((m) => m.isActive)
                        .map((method) => (
                          <Button
                            key={method.id}
                            variant="outline"
                            className="h-16 flex flex-col items-center justify-center"
                            onClick={() => addPaymentMethod(method.id, finalTotal)}
                            disabled={selectedPayments.length > 0}
                          >
                            {getPaymentMethodIcon(method.type)}
                            <span className="text-sm mt-1">{method.name}</span>
                            {method.processingFee > 0 && (
                              <span className="text-xs text-gray-500">+{method.processingFee}%</span>
                            )}
                          </Button>
                        ))}
                    </div>
                  ) : (
                    /* Split Payment Mode */
                    <div className="space-y-3">
                      {selectedPayments.map((payment, index) => {
                        const method = paymentMethods.find((m) => m.id === payment.methodId)
                        return (
                          <div key={index} className="flex items-center space-x-2 p-3 border rounded-lg">
                            {method && getPaymentMethodIcon(method.type)}
                            <span className="flex-1">{method?.name}</span>
                            <Input
                              type="number"
                              value={payment.amount}
                              onChange={(e) => updatePaymentAmount(index, Number.parseFloat(e.target.value) || 0)}
                              className="w-24"
                              step="0.01"
                            />
                            <Button variant="ghost" size="sm" onClick={() => removePayment(index)}>
                              <Minus className="h-4 w-4" />
                            </Button>
                          </div>
                        )
                      })}

                      {remainingAmount > 0 && (
                        <div className="grid grid-cols-3 gap-2">
                          {paymentMethods
                            .filter((m) => m.isActive)
                            .slice(0, 3)
                            .map((method) => (
                              <Button
                                key={method.id}
                                variant="outline"
                                size="sm"
                                onClick={() => addPaymentMethod(method.id)}
                                className="flex items-center space-x-1"
                              >
                                {getPaymentMethodIcon(method.type)}
                                <span className="text-xs">{method.name}</span>
                              </Button>
                            ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Cash Payment Details */}
            {selectedPayments.some((p) => paymentMethods.find((m) => m.id === p.methodId)?.type === "cash") && (
              <Card>
                <CardContent className="p-4">
                  <div className="space-y-4">
                    <Label>Cash Received</Label>
                    <Input
                      type="number"
                      placeholder="Enter cash amount"
                      value={cashReceived}
                      onChange={(e) => setCashReceived(e.target.value)}
                      step="0.01"
                      className={isMobile ? "text-base h-12" : ""}
                    />

                    {quickAmounts.length > 0 && (
                      <div>
                        <Label className="text-sm">Quick Amounts</Label>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          {quickAmounts.slice(0, 4).map((amount) => (
                            <Button
                              key={amount}
                              variant="outline"
                              size="sm"
                              onClick={() => setCashReceived(amount.toString())}
                            >
                              ₹{amount}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}

                    {cashReceived && Number.parseFloat(cashReceived) >= finalTotal && (
                      <Card>
                        <CardContent className="p-3 bg-green-50">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-green-800">Change to return:</span>
                            <span className="font-bold text-green-800">
                              ₹{(Number.parseFloat(cashReceived) - finalTotal).toFixed(2)}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
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
                disabled={processing || remainingAmount > 0.01 || selectedPayments.length === 0}
              >
                {processing ? "Processing..." : `Complete Payment ₹${finalTotal.toFixed(2)}`}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
