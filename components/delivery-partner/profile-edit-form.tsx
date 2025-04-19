"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

interface ProfileEditFormProps {
  initialData: {
    id: string
    email: string
    business_name: string
    phone: string
    address: string
    city: string
    pincode: string
    vehicle_type: string
    vehicle_number: string
  }
}

export function ProfileEditForm({ initialData }: ProfileEditFormProps) {
  const [fullName, setFullName] = useState(initialData.business_name)
  const [phone, setPhone] = useState(initialData.phone)
  const [vehicleType, setVehicleType] = useState(initialData.vehicle_type)
  const [vehicleNumber, setVehicleNumber] = useState(initialData.vehicle_number)
  const [address, setAddress] = useState(initialData.address)
  const [city, setCity] = useState(initialData.city)
  const [pincode, setPincode] = useState(initialData.pincode)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClientComponentClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch("/api/delivery-partner/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName,
          phone,
          vehicleType,
          vehicleNumber,
          address,
          city,
          pincode,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to update profile")
      }

      setSuccess("Profile updated successfully!")

      // Refresh the page to reflect the changes
      router.refresh()
    } catch (error: any) {
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <CardContent className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {success && (
        <Alert className="bg-green-50 text-green-800 border-green-200">
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="fullName">Full Name</Label>
          <Input id="fullName" type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="vehicleType">Vehicle Type</Label>
          <Select value={vehicleType} onValueChange={(value) => setVehicleType(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select vehicle type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bike">Bike</SelectItem>
              <SelectItem value="auto">Auto</SelectItem>
              <SelectItem value="van">Van</SelectItem>
              <SelectItem value="truck">Truck</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="vehicleNumber">Vehicle Number</Label>
          <Input
            id="vehicleNumber"
            type="text"
            value={vehicleNumber}
            onChange={(e) => setVehicleNumber(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="address">Address</Label>
          <Input id="address" type="text" value={address} onChange={(e) => setAddress(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="city">City</Label>
          <Input id="city" type="text" value={city} onChange={(e) => setCity(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="pincode">Pincode</Label>
          <Input id="pincode" type="text" value={pincode} onChange={(e) => setPincode(e.target.value)} required />
        </div>
        <Button disabled={isLoading} className="w-full">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Updating...
            </>
          ) : (
            "Update Profile"
          )}
        </Button>
      </form>
    </CardContent>
  )
}
