"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Loader2, MapPin, CheckCircle, Truck, Clock, AlertTriangle } from "lucide-react"

interface DeliveryTrackingProps {
  orderId: string
}

interface DeliveryUpdate {
  id: string
  order_id: string
  delivery_partner_id: string
  status: string
  location_lat?: number
  location_lng?: number
  notes?: string
  created_at: string
}

interface DeliveryProof {
  id: string
  order_id: string
  delivery_partner_id: string
  photo_url?: string
  signature_url?: string
  receiver_name: string
  notes?: string
  created_at: string
}

export function DeliveryTracking({ orderId }: DeliveryTrackingProps) {
  const [updates, setUpdates] = useState<DeliveryUpdate[]>([])
  const [proof, setProof] = useState<DeliveryProof | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDeliveryUpdates = async () => {
      try {
        setIsLoading(true)

        const response = await fetch(`/api/delivery/tracking?orderId=${orderId}`)
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch delivery updates")
        }

        setUpdates(data.updates || [])
        setProof(data.proof || null)
      } catch (error: any) {
        console.error("Error fetching delivery updates:", error)
        setError(error.message)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDeliveryUpdates()

    // Set up polling for updates every 30 seconds
    const intervalId = setInterval(fetchDeliveryUpdates, 30000)

    return () => clearInterval(intervalId)
  }, [orderId])

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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return <div className="p-4 bg-red-50 text-red-500 rounded-md">Error loading delivery updates: {error}</div>
  }

  if (updates.length === 0) {
    return (
      <div className="text-center py-6">
        <Truck className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
        <p className="text-muted-foreground">No delivery updates available yet.</p>
      </div>
    )
  }

  // Sort updates by created_at
  const sortedUpdates = [...updates].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())

  // Get the latest status
  const latestUpdate = sortedUpdates[sortedUpdates.length - 1]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {getStatusIcon(latestUpdate.status)}
          <div>
            <p className="font-medium">{getStatusText(latestUpdate.status)}</p>
            <p className="text-sm text-muted-foreground">Last updated: {formatDateTime(latestUpdate.created_at)}</p>
          </div>
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

      <Separator />

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

      {proof && (
        <>
          <Separator />
          <div className="space-y-2">
            <h4 className="font-medium">Delivery Proof</h4>
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
                      <img
                        src={proof.photo_url || "/placeholder.svg"}
                        alt="Delivery photo"
                        className="object-cover w-full h-full"
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
                      <img
                        src={proof.signature_url || "/placeholder.svg"}
                        alt="Signature"
                        className="object-contain w-full h-full"
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
    </div>
  )
}
