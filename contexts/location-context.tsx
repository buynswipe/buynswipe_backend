"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

interface LocationContextType {
  currentLocation: { lat: number; lng: number } | null
  isTracking: boolean
  error: string | null

  startTracking: () => void
  stopTracking: () => void
  updateOrderLocation: (orderId: string, status?: string, notes?: string) => Promise<boolean>
}

const LocationContext = createContext<LocationContextType | undefined>(undefined)

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [isTracking, setIsTracking] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [watchId, setWatchId] = useState<number | null>(null)

  const supabase = createClientComponentClient()

  // Start location tracking
  const startTracking = useCallback(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser")
      return
    }

    // Clear any existing watch
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId)
    }

    const id = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        setCurrentLocation({ lat: latitude, lng: longitude })
        setIsTracking(true)
        setError(null)
      },
      (err) => {
        setError(`Error getting location: ${err.message}`)
        setIsTracking(false)
      },
      {
        enableHighAccuracy: true,
        maximumAge: 30000,
        timeout: 27000,
      },
    )

    setWatchId(id)
  }, [watchId])

  // Stop location tracking
  const stopTracking = useCallback(() => {
    if (watchId !== null && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchId)
      setWatchId(null)
      setIsTracking(false)
    }
  }, [watchId])

  // Update order location
  const updateOrderLocation = async (orderId: string, status?: string, notes?: string) => {
    try {
      if (!currentLocation) {
        throw new Error("Current location not available")
      }

      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        throw new Error("You must be logged in to update location")
      }

      // Get delivery partner ID
      const { data: partner, error: partnerError } = await supabase
        .from("delivery_partners")
        .select("id")
        .eq("user_id", session.user.id)
        .single()

      if (partnerError) {
        throw new Error("Delivery partner profile not found")
      }

      // Create delivery status update
      const payload: any = {
        orderId,
        locationLat: currentLocation.lat,
        locationLng: currentLocation.lng,
      }

      if (status) {
        payload.status = status
      }

      if (notes) {
        payload.notes = notes
      }

      const response = await fetch("/api/delivery/tracking", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to update location")
      }

      return true
    } catch (error: any) {
      console.error("Error updating order location:", error)
      setError(error.message)
      return false
    }
  }

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (watchId !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchId)
      }
    }
  }, [watchId])

  const value = {
    currentLocation,
    isTracking,
    error,
    startTracking,
    stopTracking,
    updateOrderLocation,
  }

  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>
}

export function useLocation() {
  const context = useContext(LocationContext)

  if (context === undefined) {
    throw new Error("useLocation must be used within a LocationProvider")
  }

  return context
}
