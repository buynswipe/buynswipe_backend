"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PrintDocument } from "@/components/documents/print-document"
import { FileText, FileCheck } from "lucide-react"
import type { Order } from "@/types/database.types"

interface DocumentActionsProps {
  order: Order
  userRole: string
}

export function DocumentActions({ order, userRole }: DocumentActionsProps) {
  // Determine which documents are available based on order status and user role
  const canViewInvoice = order.payment_status === "paid"
  const canViewDispatchReceipt =
    (order.status === "dispatched" || order.status === "delivered") &&
    (userRole === "wholesaler" || userRole === "retailer")

  // If no documents are available, don't render the card
  if (!canViewInvoice && !canViewDispatchReceipt) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Documents</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {canViewInvoice && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-500" />
              <span>Invoice</span>
            </div>
            <PrintDocument documentId={order.id} documentType="invoice" buttonText="Print Invoice" />
          </div>
        )}

        {canViewDispatchReceipt && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileCheck className="h-4 w-4 text-green-500" />
              <span>Dispatch Receipt</span>
            </div>
            <PrintDocument documentId={order.id} documentType="dispatch" buttonText="Print Receipt" />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
