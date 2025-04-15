"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Loader2, MapPin, CheckCircle, Truck, Clock, AlertTriangle, Phone, MessageSquare } from "lucide-react"
import { useOrder } from "@/contexts/order-context"
import { useMessaging } from "@/contexts/messaging-context"
import Link from "next/link"
import Image from "next/image"

interface OrderTrackingProps {
  orderId: string
}

export function OrderTracking({ orderId }: OrderTrackingProps) {
  const [updates, setUpdates] = useState<any[]>([])
  const [proof, setProof] = useState<any | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null)
  const [message, setMessage] = useState("")

  const { fetchOrderById, activeOrder } = useOrder()
  const { sendMessage } = useMessaging()

  // Fetch order and tracking data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)

        // Fetch order details
        await fetchOrderById(orderId)

        // Fetch tracking updates
        const response = await fetch(`/api/delivery/tracking?orderId=${orderId}`)
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch tracking data")
        }

        setUpdates(data.updates || [])
        setProof(data.proof || null)
      } catch (error: any) {
        console.error("Error fetching tracking data:", error)
        setError(error.message)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()

    // Set up polling for updates every 30 seconds
    const interval = setInterval(fetchData, 30000)
    setRefreshInterval(interval)

    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval)
      }
    }
  }, [orderId, fetchOrderById])

  // Format date
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "assigned":
        return <Clock className="h-5 w-5 text-blue-500" />
      case "picked_up":
        return <MapPin className="h-5 w-5 text-amber-500" />
      case "in_transit":
        return <Truck className="h-5 w-5 text-purple-500" />
      case "delivered":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "failed":
        return <AlertTriangle className="h-5 w-5 text-red-500" />
      default:
        return <Clock className="h-5 w-5 text-gray-500" />
    }
  }

  // Get status text
  const getStatusText = (status: string) => {
    switch (status) {
      case "assigned":
        return "Assigned to delivery partner"
      case "picked_up":
        return "Picked up from wholesaler"
      case "in_transit":
        return "In transit to your location"
      case "delivered":
        return "Delivered successfully"
      case "failed":
        return "Delivery attempt failed"
      default:
        return status.replace(/_/g, " ")
    }
  }

  // Handle sending message
  const handleSendMessage = async () => {
    if (!activeOrder?.delivery_partner?.user_id || !message.trim()) return

    await sendMessage(activeOrder.delivery_partner.user_id, message, orderId)
    setMessage("")
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return <div className="p-4 bg-red-50 text-red-500 rounded-md">Error loading tracking data: {error}</div>
  }

  if (!activeOrder?.delivery_partner) {
    return (
      <div className="text-center py-6">
        <Truck className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
        <p className="text-muted-foreground">No delivery partner assigned yet.</p>
      </div>
    )
  }

  if (updates.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Delivery Tracking</CardTitle>
          <CardDescription>Your order has been assigned to a delivery partner</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 mb-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Truck className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="font-medium">{activeOrder.delivery_partner.name}</p>
              <p className="text-sm text-muted-foreground">
                {activeOrder.delivery_partner.vehicle_type} • {activeOrder.delivery_partner.vehicle_number}
              </p>
            </div>
          </div>
          <div className="text-center py-6">
            <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
            <p className="text-muted-foreground">Waiting for delivery updates...</p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" className="w-full sm:w-auto" asChild>
            <Link href={`tel:${activeOrder.delivery_partner.phone}`}>
              <Phone className="mr-2 h-4 w-4" />
              Call Delivery Partner
            </Link>
          </Button>
        </CardFooter>
      </Card>
    )
  }

  // Sort updates by created_at
  const sortedUpdates = [...updates].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())

  // Get the latest status
  const latestUpdate = sortedUpdates[sortedUpdates.length - 1]

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Delivery Tracking</CardTitle>
            <CardDescription>Real-time updates on your order delivery</CardDescription>
          </div>
          <Badge
            className={
              latestUpdate.status === "delivered"
                ? "bg-green-100 text-green-800"
                : latestUpdate.status === "failed"
                  ? "bg-red-100 text-red-800"
                  : "bg-blue-100 text-blue-800"
            }
          >
            {latestUpdate.status.replace(/_/g, " ").toUpperCase()}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Delivery Partner Info */}
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Truck className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="font-medium">{activeOrder.delivery_partner.name}</p>
            <p className="text-sm text-muted-foreground">
              {activeOrder.delivery_partner.vehicle_type} • {activeOrder.delivery_partner.vehicle_number}
            </p>
          </div>
        </div>

        <Separator />

        {/* Current Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getStatusIcon(latestUpdate.status)}
            <div>
              <p className="font-medium">{getStatusText(latestUpdate.status)}</p>
              <p className="text-sm text-muted-foreground">Last updated: {formatDateTime(latestUpdate.created_at)}</p>
            </div>
          </div>

          {latestUpdate.location_lat && latestUpdate.location_lng && (
            <Button variant="outline" size="sm" asChild>
              <Link
                href={`https://maps.google.com/?q=${latestUpdate.location_lat},${latestUpdate.location_lng}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MapPin className="mr-2 h-4 w-4" />
                View Location
              </Link>
            </Button>
          )}
        </div>

        <Separator />

        {/* Timeline */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium">Delivery Timeline</h4>
          <div className="space-y-4">
            {sortedUpdates.map((update, index) => (
              <div key={update.id} className="relative pl-6 pb-4">
                <div className="absolute left-0 top-1.5 h-3 w-3 rounded-full bg-primary"></div>
                {index < sortedUpdates.length - 1 && (
                  <div className="absolute left-1.5 top-4 bottom-0 w-px bg-gray-200"></div>
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{getStatusText(update.status)}</p>
                    <span className="text-xs text-muted-foreground">{formatDateTime(update.created_at)}</span>
                  </div>
                  {update.notes && <p className="text-sm text-muted-foreground mt-1">{update.notes}</p>}
                  {update.location_lat && update.location_lng && (
                    <a
                      href={`https://maps.google.com/?q=${update.location_lat},${update.location_lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline mt-1 inline-block"
                    >
                      View location on map
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Proof of Delivery */}
        {proof && (
          <>
            <Separator />
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Delivery Proof</h4>
              <p className="text-sm">
                <span className="font-medium">Received by:</span> {proof.receiver_name}
              </p>
              {proof.notes && (
                <p className="text-sm">
                  <span className="font-medium">Notes:</span> {proof.notes}
                </p>
              )}
              <div className="grid grid-cols-2 gap-2 mt-2">
                {proof.photo_url && (
                  <Card>
                    <CardContent className="p-2">
                      <div className="aspect-square relative overflow-hidden rounded">
                        <Image
                          src={proof.photo_url || "/placeholder.svg"}
                          alt="Delivery photo"
                          fill
                          className="object-cover"
                        />
                      </div>
                      <p className="text-xs text-center mt-1">Delivery Photo</p>
                    </CardContent>
                  </Card>
                )}
                {proof.signature_url && (
                  <Card>
                    <CardContent className="p-2">
                      <div className="aspect-square relative overflow-hidden rounded bg-gray-50">
                        <Image
                          src={proof.signature_url || "/placeholder.svg"}
                          alt="Signature"
                          fill
                          className="object-contain"
                        />
                      </div>
                      <p className="text-xs text-center mt-1">Signature</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </>
        )}

        {/* Message Input */}
        {!proof && (
          <>
            <Separator />
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Contact Delivery Partner</h4>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 px-3 py-2 border rounded-md"
                />
                <Button onClick={handleSendMessage} disabled={!message.trim()}>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Send
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row gap-2">
        <Button variant="outline" className="w-full sm:w-auto" asChild>
          <Link href={`tel:${activeOrder.delivery_partner.phone}`}>
            <Phone className="mr-2 h-4 w-4" />
            Call Delivery Partner
          </Link>
        </Button>
        <Button variant="outline" className="w-full sm:w-auto" asChild>
          <Link href={`/orders/${orderId}`}>View Order Details</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
