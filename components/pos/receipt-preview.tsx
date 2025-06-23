"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Printer } from "lucide-react"
import { useRef } from "react"

interface ReceiptPreviewProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  transaction: any
}

export function ReceiptPreview({ open, onOpenChange, transaction }: ReceiptPreviewProps) {
  const receiptRef = useRef<HTMLDivElement>(null)

  if (!transaction) return null

  const handlePrint = () => {
    if (receiptRef.current) {
      const printContent = receiptRef.current.innerHTML
      const printWindow = window.open("", "_blank")

      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Receipt</title>
              <style>
                body { font-family: monospace; font-size: 12px; margin: 0; padding: 20px; }
                .receipt { max-width: 300px; margin: 0 auto; }
                .center { text-align: center; }
                .right { text-align: right; }
                .bold { font-weight: bold; }
                .separator { border-top: 1px dashed #000; margin: 10px 0; }
                table { width: 100%; border-collapse: collapse; }
                td { padding: 2px 0; }
              </style>
            </head>
            <body>
              <div class="receipt">${printContent}</div>
            </body>
          </html>
        `)
        printWindow.document.close()
        printWindow.print()
        printWindow.close()
      }
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Receipt Preview</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Receipt Content */}
          <div
            ref={receiptRef}
            className="bg-white p-4 border rounded-lg font-mono text-sm"
            style={{ fontFamily: "monospace" }}
          >
            <div className="text-center mb-4">
              <h2 className="font-bold text-lg">RETAIL BANDHU</h2>
              <p className="text-sm">Point of Sale System</p>
            </div>

            <Separator className="my-3" />

            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Receipt #:</span>
                <span>{transaction.transaction_number}</span>
              </div>
              <div className="flex justify-between">
                <span>Date:</span>
                <span>{formatDate(transaction.created_at)}</span>
              </div>
              {transaction.customer_name && (
                <div className="flex justify-between">
                  <span>Customer:</span>
                  <span>{transaction.customer_name}</span>
                </div>
              )}
            </div>

            <Separator className="my-3" />

            {/* Items */}
            <div className="space-y-2">
              {transaction.items?.map((item: any, index: number) => (
                <div key={index}>
                  <div className="font-medium">{item.product_name}</div>
                  <div className="flex justify-between text-sm">
                    <span>
                      {item.quantity} x ₹{item.unit_price.toFixed(2)}
                    </span>
                    <span>₹{item.line_total.toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>

            <Separator className="my-3" />

            {/* Totals */}
            <div className="space-y-1">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>₹{transaction.subtotal.toFixed(2)}</span>
              </div>
              {transaction.tax_amount > 0 && (
                <div className="flex justify-between">
                  <span>Tax:</span>
                  <span>₹{transaction.tax_amount.toFixed(2)}</span>
                </div>
              )}
              {transaction.discount_amount > 0 && (
                <div className="flex justify-between">
                  <span>Discount:</span>
                  <span>-₹{transaction.discount_amount.toFixed(2)}</span>
                </div>
              )}
              <Separator className="my-2" />
              <div className="flex justify-between font-bold text-lg">
                <span>TOTAL:</span>
                <span>₹{transaction.total_amount.toFixed(2)}</span>
              </div>
            </div>

            <Separator className="my-3" />

            {/* Payment Info */}
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Payment:</span>
                <span className="uppercase">{transaction.payment_method}</span>
              </div>
              {transaction.payment_method === "cash" && (
                <>
                  <div className="flex justify-between">
                    <span>Cash Received:</span>
                    <span>₹{transaction.cash_received?.toFixed(2)}</span>
                  </div>
                  {transaction.change_given > 0 && (
                    <div className="flex justify-between">
                      <span>Change:</span>
                      <span>₹{transaction.change_given.toFixed(2)}</span>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="text-center mt-6 text-xs">
              <p>Thank you for your business!</p>
              <p>Visit us again soon</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button variant="outline" onClick={handlePrint} className="flex-1">
              <Printer className="h-4 w-4 mr-2" />
              Print Receipt
            </Button>
            <Button onClick={() => onOpenChange(false)} className="flex-1">
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
