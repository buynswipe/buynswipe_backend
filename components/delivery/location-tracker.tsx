"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { MapPin, Navigation } from "lucide-react"

interface LocationTrackerProps {
  orderId: string
  onLocationUpdate: (lat: number, lng: number) => void
}

export function LocationTracker({ orderId, onLocationUpdate }: LocationTrackerProps) {
  const [tracking, setTracking] = useState(false)
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  const watchIdRef = useRef<number | null>(null)

  // Start tracking location
  const startTracking = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser")
      return
    }

    setTracking(true)
    toast({
      title: "Location tracking started",
      description: "Your location will be updated every 30 seconds",
    })

    // Watch position
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const newLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        }
        setLocation(newLocation)
        onLocationUpdate(newLocation.lat, newLocation.lng)
        updateOrderLocation(orderId, newLocation.lat, newLocation.lng)
      },
      (err) => {
        setError(`Error: ${err.message}`)
        setTracking(false)
      },
      {
        enableHighAccuracy: true,
        maximumAge: 30000,
        timeout: 27000,
      },
    )

    watchIdRef.current = watchId
  }

  // Stop tracking
  const stopTracking = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current)
      watchIdRef.current = null
    }

    setTracking(false)
    toast({
      title: "Location tracking stopped",
      description: "Your location will no longer be updated",
    })
  }

  // Update order location in database
  const updateOrderLocation = async (orderId: string, lat: number, lng: number) => {
    try {
      const response = await fetch("/api/delivery/tracking", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId,
          locationLat: lat,
          locationLng: lng,
          status: "in_transit",
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update location")
      }
    } catch (error) {
      console.error("Error updating location:", error)
    }
  }

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current)
      }
    }
  }, [])

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Location Tracking</h3>
        <Button variant={tracking ? "destructive" : "default"} onClick={tracking ? stopTracking : startTracking}>
          {tracking ? (
            <>
              <Navigation className="mr-2 h-4 w-4 animate-pulse" />
              Stop Tracking
            </>
          ) : (
            <>
              <MapPin className="mr-2 h-4 w-4" />
              Start Tracking
            </>
          )}
        </Button>
      </div>

      {location && (
        <div className="text-sm text-muted-foreground">
          Current location: {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
        </div>
      )}

      {error && <div className="text-sm text-red-500">{error}</div>}
    </div>
  )
}
