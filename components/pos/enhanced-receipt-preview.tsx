"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Printer, Download, Mail, MessageSquare } from "lucide-react"

interface ReceiptItem {
  id: string
  name: string
  quantity: number
  price: number
  discount?: number
  category?: string
}

interface PaymentMethod {
  type: string
  amount: number
  reference?: string
}

interface ReceiptData {
  id: string
  items: ReceiptItem[]
  subtotal: number
  discount: number
  tax: number
  total: number
  paymentMethods: PaymentMethod[]
  customer?: {
    name: string
    phone?: string
    email?: string
    loyaltyPoints?: number
  }
  timestamp: Date
  cashier: string
  store: {
    name: string
    address: string
    phone: string
    email: string
    gst?: string
  }
}

interface EnhancedReceiptPreviewProps {
  receipt: ReceiptData
  onPrint?: () => void
  onDownload?: () => void
  onEmail?: () => void
  onSMS?: () => void
}

export function EnhancedReceiptPreview({ receipt, onPrint, onDownload, onEmail, onSMS }: EnhancedReceiptPreviewProps) {
  const [isOpen, setIsOpen] = useState(false)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount)
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date)
  }

  const ReceiptContent = () => (
    <div className="max-w-sm mx-auto bg-white p-4 font-mono text-sm">
      {/* Store Header */}
      <div className="text-center mb-4">
        <h2 className="font-bold text-lg">{receipt.store.name}</h2>
        <p className="text-xs text-gray-600">{receipt.store.address}</p>
        <p className="text-xs text-gray-600">Ph: {receipt.store.phone}</p>
        <p className="text-xs text-gray-600">Email: {receipt.store.email}</p>
        {receipt.store.gst && <p className="text-xs text-gray-600">GST: {receipt.store.gst}</p>}
      </div>

      <Separator className="my-2" />

      {/* Receipt Info */}
      <div className="mb-4">
        <div className="flex justify-between text-xs">
          <span>Receipt #:</span>
          <span>{receipt.id}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span>Date:</span>
          <span>{formatDate(receipt.timestamp)}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span>Cashier:</span>
          <span>{receipt.cashier}</span>
        </div>
        {receipt.customer && (
          <div className="flex justify-between text-xs">
            <span>Customer:</span>
            <span>{receipt.customer.name}</span>
          </div>
        )}
      </div>

      <Separator className="my-2" />

      {/* Items */}
      <div className="mb-4">
        {receipt.items.map((item, index) => (
          <div key={index} className="mb-2">
            <div className="flex justify-between">
              <span className="text-xs font-medium">{item.name}</span>
              <span className="text-xs">{formatCurrency(item.price * item.quantity)}</span>
            </div>
            <div className="flex justify-between text-xs text-gray-600">
              <span>
                {item.quantity} x {formatCurrency(item.price)}
              </span>
              {item.discount && item.discount > 0 && (
                <span className="text-red-600">-{formatCurrency(item.discount)}</span>
              )}
            </div>
            {item.category && (
              <Badge variant="outline" className="text-xs h-4 px-1">
                {item.category}
              </Badge>
            )}
          </div>
        ))}
      </div>

      <Separator className="my-2" />

      {/* Totals */}
      <div className="mb-4">
        <div className="flex justify-between text-xs">
          <span>Subtotal:</span>
          <span>{formatCurrency(receipt.subtotal)}</span>
        </div>
        {receipt.discount > 0 && (
          <div className="flex justify-between text-xs text-red-600">
            <span>Discount:</span>
            <span>-{formatCurrency(receipt.discount)}</span>
          </div>
        )}
        <div className="flex justify-between text-xs">
          <span>Tax:</span>
          <span>{formatCurrency(receipt.tax)}</span>
        </div>
        <Separator className="my-1" />
        <div className="flex justify-between font-bold">
          <span>Total:</span>
          <span>{formatCurrency(receipt.total)}</span>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="mb-4">
        <p className="text-xs font-medium mb-1">Payment:</p>
        {receipt.paymentMethods.map((payment, index) => (
          <div key={index} className="flex justify-between text-xs">
            <span>{payment.type}:</span>
            <span>{formatCurrency(payment.amount)}</span>
          </div>
        ))}
      </div>

      {/* Customer Loyalty */}
      {receipt.customer?.loyaltyPoints && (
        <div className="mb-4">
          <div className="flex justify-between text-xs">
            <span>Loyalty Points Earned:</span>
            <span>{receipt.customer.loyaltyPoints}</span>
          </div>
        </div>
      )}

      <Separator className="my-2" />

      {/* Footer */}
      <div className="text-center text-xs text-gray-600">
        <p>Thank you for your business!</p>
        <p>Visit us again soon</p>
      </div>
    </div>
  )

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Preview Receipt
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Receipt Preview</DialogTitle>
        </DialogHeader>

        <div className="max-h-96 overflow-y-auto">
          <ReceiptContent />
        </div>

        <div className="flex gap-2 mt-4">
          <Button
            onClick={() => {
              onPrint?.()
              setIsOpen(false)
            }}
            size="sm"
            className="flex-1"
          >
            <Printer className="w-4 h-4 mr-2" />
            Print
          </Button>
          <Button
            onClick={() => {
              onDownload?.()
              setIsOpen(false)
            }}
            variant="outline"
            size="sm"
            className="flex-1"
          >
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
          {receipt.customer?.email && (
            <Button
              onClick={() => {
                onEmail?.()
                setIsOpen(false)
              }}
              variant="outline"
              size="sm"
            >
              <Mail className="w-4 h-4" />
            </Button>
          )}
          {receipt.customer?.phone && (
            <Button
              onClick={() => {
                onSMS?.()
                setIsOpen(false)
              }}
              variant="outline"
              size="sm"
            >
              <MessageSquare className="w-4 h-4" />
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
