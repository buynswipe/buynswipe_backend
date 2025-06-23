"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Download } from "lucide-react"

interface DocumentActionsProps {
  order: {
    id: string
    status: string
  }
  userRole: string
}

export function DocumentActions({ order, userRole }: DocumentActionsProps) {
  const handleDownloadInvoice = () => {
    window.open(`/api/documents/invoice/${order.id}`, "_blank")
  }

  const handleDownloadDispatch = () => {
    window.open(`/api/documents/dispatch/${order.id}`, "_blank")
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Documents</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <Button variant="outline" className="w-full" onClick={handleDownloadInvoice}>
          <FileText className="mr-2 h-4 w-4" />
          Download Invoice
        </Button>

        {(order.status === "dispatched" || order.status === "delivered") && (
          <Button variant="outline" className="w-full" onClick={handleDownloadDispatch}>
            <Download className="mr-2 h-4 w-4" />
            Download Dispatch Receipt
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
