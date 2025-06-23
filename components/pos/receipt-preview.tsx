"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Printer, Download } from "lucide-react"

interface ReceiptPreviewProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  transaction: any
  onPrint: () => void
}

export function ReceiptPreview({ open, onOpenChange, transaction, onPrint }: ReceiptPreviewProps) {
  if (!transaction) return null

  const handleDownload = () => {
    // Generate and download receipt as PDF
    window.print()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Receipt Preview</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Receipt Content */}
          <div className="bg-white p-6 border rounded-lg font-mono text-sm">
            <div className="text-center mb-4">
              <h3 className="font-bold">RETAIL BANDHU</h3>
              <p>Your Retail Partner</p>
              <p>GST: 12ABCDE1234F1Z5</p>
            </div>

            <Separator className="my-4" />

            <div className="space-y-1">
              <div className="flex justify-between">
                <span>Receipt #:</span>
                <span>{transaction.id?.slice(-8)}</span>
              </div>
              <div className="flex justify-between">
                <span>Date:</span>
                <span>{new Date(transaction.createdAt).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Cashier:</span>
                <span>Admin</span>
              </div>
            </div>

            <Separator className="my-4" />

            <div className="space-y-2">
              {transaction.items?.map((item: any, index: number) => (
                <div key={index}>
                  <div className="flex justify-between">
                    <span>{item.name}</span>
                    <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                  <div className="text-xs text-gray-500 ml-2">
                    {item.quantity} x ₹{item.price.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            <Separator className="my-4" />

            <div className="space-y-1">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>₹{transaction.subtotal?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax (18%):</span>
                <span>₹{transaction.tax?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>Total:</span>
                <span>₹{transaction.total?.toFixed(2)}</span>
              </div>
            </div>

            <Separator className="my-4" />

            <div className="space-y-1">
              <div className="flex justify-between">
                <span>Payment:</span>
                <span>{transaction.paymentMethod?.toUpperCase()}</span>
              </div>
              <div className="flex justify-between">
                <span>Paid:</span>
                <span>₹{transaction.amountPaid?.toFixed(2)}</span>
              </div>
              {transaction.change > 0 && (
                <div className="flex justify-between">
                  <span>Change:</span>
                  <span>₹{transaction.change?.toFixed(2)}</span>
                </div>
              )}
            </div>

            <div className="text-center mt-6 text-xs">
              <p>Thank you for your business!</p>
              <p>Visit us again soon</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2">
            <Button variant="outline" className="flex-1" onClick={handleDownload}>
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            <Button className="flex-1" onClick={onPrint}>
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
