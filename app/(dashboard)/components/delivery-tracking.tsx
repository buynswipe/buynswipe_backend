"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { CheckCircle2, Clock, MapPin, Package, Truck } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"

type DeliveryStatus = "confirmed" | "dispatched" | "in_transit" | "out_for_delivery" | "delivered"

interface DeliveryUpdate {
  id: string
  order_id: string
  status: DeliveryStatus
  location?: string
  notes?: string
  created_at: string
}

interface DeliveryTrackingProps {
  orderId: string
  initialStatus: DeliveryStatus
  isDeliveryPartner?: boolean
}

export function DeliveryTracking({ orderId, initialStatus, isDeliveryPartner = false }: DeliveryTrackingProps) {
  const [status, setStatus] = useState<DeliveryStatus>(initialStatus)
  const [updates, setUpdates] = useState<DeliveryUpdate[]>([])
  const [loading, setLoading] = useState(false)
  const [location, setLocation] = useState("")
  const [notes, setNotes] = useState("")
  const supabase = createClientComponentClient()
  const { toast } = useToast()

  const statusOrder: DeliveryStatus[] = ["confirmed", "dispatched", "in_transit", "out_for_delivery", "delivered"]
  const statusLabels = {
    confirmed: "Order Confirmed",
    dispatched: "Order Dispatched",
    in_transit: "In Transit",
    out_for_delivery: "Out for Delivery",
    delivered: "Delivered",
  }

  const statusIcons = {
    confirmed: <CheckCircle2 className="h-5 w-5" />,
    dispatched: <Package className="h-5 w-5" />,
    in_transit: <Truck className="h-5 w-5" />,
    out_for_delivery: <MapPin className="h-5 w-5" />,
    delivered: <CheckCircle2 className="h-5 w-5" />,
  }

  useEffect(() => {
    fetchDeliveryUpdates()

    // Set up real-time subscription for updates
    const channel = supabase
      .channel(`delivery_updates_${orderId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "delivery_updates",
          filter: `order_id=eq.${orderId}`,
        },
        (payload) => {
          const newUpdate = payload.new as DeliveryUpdate
          setUpdates((prev) => [newUpdate, ...prev])
          setStatus(newUpdate.status)
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [orderId, supabase])

  const fetchDeliveryUpdates = async () => {
    try {
      const { data, error } = await supabase
        .from("delivery_updates")
        .select("*")
        .eq("order_id", orderId)
        .order("created_at", { ascending: false })

      if (error) throw error

      if (data && data.length > 0) {
        setUpdates(data)
        // Update the current status to the most recent one
        setStatus(data[0].status)
      }
    } catch (error) {
      console.error("Error fetching delivery updates:", error)
    }
  }

  const updateDeliveryStatus = async (newStatus: DeliveryStatus) => {
    if (!isDeliveryPartner) return

    setLoading(true)
    try {
      // Update the order status
      const { error: orderError } = await supabase.from("orders").update({ status: newStatus }).eq("id", orderId)

      if (orderError) throw orderError

      // Add a new delivery update
      const { error: updateError } = await supabase.from("delivery_updates").insert({
        order_id: orderId,
        status: newStatus,
        location: location || undefined,
        notes: notes || undefined,
      })

      if (updateError) throw updateError

      toast({
        title: "Status updated",
        description: `Order status updated to ${statusLabels[newStatus]}`,
      })

      // Clear form fields
      setLocation("")
      setNotes("")
    } catch (error) {
      console.error("Error updating delivery status:", error)
      toast({
        title: "Update failed",
        description: "Failed to update delivery status. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getNextStatus = (): DeliveryStatus | null => {
    const currentIndex = statusOrder.indexOf(status)
    if (currentIndex < statusOrder.length - 1) {
      return statusOrder[currentIndex + 1]
    }
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Delivery Tracking</CardTitle>
        <CardDescription>Track your order in real-time</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            {statusOrder.map((step, index) => {
              const isCompleted = statusOrder.indexOf(status) >= index
              const isCurrent = status === step

              return (
                <div key={step} className="flex flex-col items-center">
                  <div
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-full border-2",
                      isCompleted
                        ? "border-green-500 bg-green-50 text-green-500"
                        : "border-gray-300 bg-gray-50 text-gray-400",
                      isCurrent && "ring-2 ring-green-200",
                    )}
                  >
                    {statusIcons[step]}
                  </div>
                  <span className={cn("mt-1 text-xs font-medium", isCompleted ? "text-green-500" : "text-gray-500")}>
                    {statusLabels[step]}
                  </span>
                </div>
              )
            })}
          </div>
          <div className="relative mt-2">
            <div className="absolute top-0 h-1 w-full bg-gray-200 rounded"></div>
            <div
              className="absolute top-0 h-1 bg-green-500 rounded transition-all duration-500 ease-in-out"
              style={{
                width: `${(statusOrder.indexOf(status) / (statusOrder.length - 1)) * 100}%`,
              }}
            ></div>
          </div>
        </div>

        {isDeliveryPartner && (
          <>
            <div className="space-y-4 mb-6">
              <h3 className="text-sm font-medium">Update Delivery Status</h3>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <label htmlFor="location" className="text-sm font-medium">
                    Current Location
                  </label>
                  <input
                    id="location"
                    placeholder="Enter current location"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="notes" className="text-sm font-medium">
                    Notes
                  </label>
                  <textarea
                    id="notes"
                    placeholder="Add any additional notes"
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
              </div>

              {getNextStatus() && (
                <Button
                  onClick={() => updateDeliveryStatus(getNextStatus()!)}
                  disabled={loading || !getNextStatus()}
                  className="w-full"
                >
                  {loading ? "Updating..." : `Update to ${statusLabels[getNextStatus()!]}`}
                </Button>
              )}
            </div>
            <Separator className="my-4" />
          </>
        )}

        <div>
          <h3 className="text-sm font-medium mb-4">Delivery Updates</h3>
          {updates.length > 0 ? (
            <div className="space-y-4">
              {updates.map((update) => (
                <div key={update.id} className="border rounded-md p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {statusIcons[update.status]}
                      <span className="font-medium">{statusLabels[update.status]}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Clock className="h-4 w-4" />
                      <time dateTime={update.created_at}>{new Date(update.created_at).toLocaleString()}</time>
                    </div>
                  </div>
                  {update.location && (
                    <div className="mt-2 text-sm">
                      <span className="font-medium">Location:</span> {update.location}
                    </div>
                  )}
                  {update.notes && (
                    <div className="mt-2 text-sm">
                      <span className="font-medium">Notes:</span> {update.notes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500">
              <Package className="mx-auto h-12 w-12 opacity-30 mb-2" />
              <p>No delivery updates yet</p>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="text-sm text-gray-500">
          <span className="font-medium">Current Status:</span> {statusLabels[status]}
        </div>
        <div className="text-sm text-gray-500">
          <span className="font-medium">Order ID:</span> {orderId.slice(0, 8)}...
        </div>
      </CardFooter>
    </Card>
  )
}
