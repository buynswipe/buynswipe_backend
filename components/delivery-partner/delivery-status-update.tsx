"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Loader2, Truck, Package, CheckCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { notifyDeliveryStatusUpdate } from "@/lib/delivery-notification-helper"

interface DeliveryStatusUpdateProps {
  orderId: string
  currentStatus: string
}

export function DeliveryStatusUpdate({ orderId, currentStatus }: DeliveryStatusUpdateProps) {
  const [status, setStatus] = useState(currentStatus)
  const [notes, setNotes] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const supabase = createClientComponentClient()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!status) {
      toast({
        title: "Error",
        description: "Please select a status",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmitting(true)

      // Get user session
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        throw new Error("Not authenticated")
      }

      // Get delivery partner info
      const { data: partner, error: partnerError } = await supabase
        .from("delivery_partners")
        .select("id")
        .eq("user_id", session.user.id)
        .single()

      if (partnerError) {
        console.error("Error fetching delivery partner:", partnerError)
        throw new Error("Failed to retrieve delivery partner information")
      }

      if (!partner) {
        throw new Error("Your account is not linked to any delivery partner")
      }

      // Create status update with location if available
      let locationData = {}
      try {
        // Try to get current location
        if (navigator.geolocation) {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: true,
              timeout: 5000,
              maximumAge: 0,
            })
          })

          locationData = {
            location_lat: position.coords.latitude,
            location_lng: position.coords.longitude,
          }
        }
      } catch (locationError) {
        console.warn("Could not get location", locationError)
        // Continue without location data
      }

      // Create status update
      const { error: updateError } = await supabase.from("delivery_status_updates").insert({
        order_id: orderId,
        delivery_partner_id: partner.id,
        status,
        notes: notes || null,
        ...locationData,
      })

      if (updateError) {
        console.error("Error creating status update:", updateError)
        throw new Error("Failed to create status update")
      }

      // Update order status if delivered
      if (status === "delivered") {
        const { error: orderUpdateError } = await supabase
          .from("orders")
          .update({ status: "delivered" })
          .eq("id", orderId)

        if (orderUpdateError) {
          console.error("Error updating order status:", orderUpdateError)
          // Don't throw error here, we've already updated the status
          toast({
            title: "Partial Success",
            description: "Delivery status updated, but order status could not be updated",
            variant: "default",
          })
        }
      }

      // Send notifications about the status update
      try {
        await notifyDeliveryStatusUpdate(orderId, status, partner.id)
      } catch (notificationError: any) {
        console.error("Failed to send status update notifications:", notificationError)
        toast({
          title: "Notification Error",
          description: notificationError.message || "Failed to send status update notifications",
          variant: "destructive",
        })
        // Continue anyway
      }

      toast({
        title: "Status Updated",
        description: `Delivery status has been updated to "${status.replace(/_/g, " ")}"`,
      })

      // Refresh the page
      router.refresh()
    } catch (error: any) {
      console.error("Error updating status:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to update status",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Determine available status options based on current status
  const getStatusOptions = () => {
    switch (currentStatus) {
      case "dispatched":
        return [
          { value: "picked_up", label: "Picked Up", icon: Package },
          { value: "in_transit", label: "In Transit", icon: Truck },
          { value: "delivered", label: "Delivered", icon: CheckCircle },
        ]
      case "picked_up":
        return [
          { value: "in_transit", label: "In Transit", icon: Truck },
          { value: "delivered", label: "Delivered", icon: CheckCircle },
        ]
      case "in_transit":
        return [{ value: "delivered", label: "Delivered", icon: CheckCircle }]
      default:
        return []
    }
  }

  const statusOptions = getStatusOptions()

  if (statusOptions.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Update Delivery Status</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Status</label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">
                      <option.icon className="h-4 w-4" />
                      {option.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Notes (optional)</label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any additional notes about the delivery"
              rows={3}
            />
          </div>

          <Button type="submit" disabled={isSubmitting || status === currentStatus} className="w-full">
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              "Update Status"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
