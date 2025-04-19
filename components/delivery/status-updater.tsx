"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { Package, CheckCircle, AlertTriangle, Loader2 } from "lucide-react"

interface StatusUpdaterProps {
  orderId: string
  currentStatus: string
  onStatusUpdate: (status: string) => void
}

export function StatusUpdater({ orderId, currentStatus, onStatusUpdate }: StatusUpdaterProps) {
  const [status, setStatus] = useState(currentStatus)
  const [notes, setNotes] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true)

      const response = await fetch("/api/delivery/tracking", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId,
          status,
          notes: notes.trim() || null,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update status")
      }

      toast({
        title: "Status updated",
        description: `Order status updated to ${status}`,
        variant: "default",
      })

      onStatusUpdate(status)
      setNotes("")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardContent className="pt-6 space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Update Status</label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="assigned">Assigned</SelectItem>
              <SelectItem value="picked_up">Picked Up</SelectItem>
              <SelectItem value="in_transit">In Transit</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="failed">Failed Delivery</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Notes (optional)</label>
          <Textarea
            placeholder="Add any notes about this delivery..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
          />
        </div>

        <Button className="w-full" onClick={handleSubmit} disabled={isSubmitting || status === currentStatus}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Updating...
            </>
          ) : status === "delivered" ? (
            <>
              <CheckCircle className="mr-2 h-4 w-4" />
              Mark as Delivered
            </>
          ) : status === "failed" ? (
            <>
              <AlertTriangle className="mr-2 h-4 w-4" />
              Report Delivery Issue
            </>
          ) : (
            <>
              <Package className="mr-2 h-4 w-4" />
              Update Status
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
