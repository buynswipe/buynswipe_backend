"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { UserProfile } from "@/types/database.types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, MapPin, Store, Phone, Package } from "lucide-react"
import Link from "next/link"

export default function WholesalersPage() {
  const [wholesalers, setWholesalers] = useState<UserProfile[]>([])
  const [filteredWholesalers, setFilteredWholesalers] = useState<UserProfile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [pincode, setPincode] = useState("")
  const [city, setCity] = useState("")
  const [category, setCategory] = useState("all")
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null)
  const [isLoadingLocation, setIsLoadingLocation] = useState(false)
  const [locationError, setLocationError] = useState<string | null>(null)
  const supabase = createClientComponentClient()

  // Categories for filtering
  const categories = [
    { value: "all", label: "All Categories" },
    { value: "Groceries", label: "Groceries" },
    { value: "Electronics", label: "Electronics" },
    { value: "Clothing", label: "Clothing" },
    { value: "Stationery", label: "Stationery" },
    { value: "Personal Care", label: "Personal Care" },
  ]

  // Fetch wholesalers
  useEffect(() => {
    const fetchWholesalers = async () => {
      try {
        setIsLoading(true)
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("role", "wholesaler")
          .eq("is_approved", true)

        if (error) throw error

        setWholesalers(data)
        setFilteredWholesalers(data)
      } catch (error: any) {
        setError(error.message)
      } finally {
        setIsLoading(false)
      }
    }

    fetchWholesalers()
  }, [supabase])

  // Filter wholesalers based on search term, pincode, city, and category
  useEffect(() => {
    let filtered = [...wholesalers]

    // Filter by search term (business name)
    if (searchTerm) {
      filtered = filtered.filter((w) => w.business_name.toLowerCase().includes(searchTerm.toLowerCase()))
    }

    // Filter by pincode
    if (pincode) {
      filtered = filtered.filter((w) => w.pincode === pincode)
    }

    // Filter by city
    if (city) {
      filtered = filtered.filter((w) => w.city.toLowerCase() === city.toLowerCase())
    }

    // Filter by category (would need to join with products table in a real implementation)
    // For demo purposes, we'll just use a random assignment
    if (category && category !== "all") {
      // In a real implementation, you would fetch products and filter wholesalers
      // based on whether they have products in the selected category
      filtered = filtered.filter((w) => {
        // This is just for demo - in reality, you'd check if the wholesaler has products in this category
        const hash = w.id.charCodeAt(0) + w.id.charCodeAt(1)
        const categories = ["Groceries", "Electronics", "Clothing", "Stationery", "Personal Care"]
        const wholesalerCategories = categories.filter((_, index) => hash % (index + 2) === 0)
        return wholesalerCategories.includes(category)
      })
    }

    // Sort by distance if user location is available
    if (userLocation) {
      filtered.sort((a, b) => {
        if (!a.latitude || !a.longitude || !b.latitude || !b.longitude) return 0

        const distA = calculateDistance(userLocation.latitude, userLocation.longitude, a.latitude, a.longitude)

        const distB = calculateDistance(userLocation.latitude, userLocation.longitude, b.latitude, b.longitude)

        return distA - distB
      })
    }

    setFilteredWholesalers(filtered)
  }, [wholesalers, searchTerm, pincode, city, category, userLocation])

  // Get user's current location
  const getUserLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser")
      return
    }

    setIsLoadingLocation(true)
    setLocationError(null)

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        setUserLocation({ latitude, longitude })

        // Update user's location in the database
        try {
          const { error } = await supabase.auth.getSession()
          if (error) throw error

          const { error: updateError } = await supabase
            .from("profiles")
            .update({
              latitude,
              longitude,
            })
            .eq("id", (await supabase.auth.getUser()).data.user?.id)

          if (updateError) throw updateError
        } catch (error: any) {
          console.error("Error updating location:", error.message)
        }

        setIsLoadingLocation(false)
      },
      (error) => {
        setLocationError(`Error getting location: ${error.message}`)
        setIsLoadingLocation(false)
      },
    )
  }

  // Calculate distance between two coordinates in kilometers
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371 // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1)
    const dLon = deg2rad(lon2 - lon1)
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    const d = R * c // Distance in km
    return d
  }

  const deg2rad = (deg: number) => {
    return deg * (Math.PI / 180)
  }

  // Format distance
  const formatDistance = (distance: number) => {
    if (distance < 1) {
      return `${(distance * 1000).toFixed(0)} m`
    }
    return `${distance.toFixed(1)} km`
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error) {
    return <div className="p-4 bg-red-50 text-red-500 rounded-md">Error: {error}</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Browse Wholesalers</h2>
        <p className="text-muted-foreground">Find wholesalers near you and explore their products.</p>
      </div>

      <Tabs defaultValue="location">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="location">Search by Location</TabsTrigger>
          <TabsTrigger value="name">Search by Name</TabsTrigger>
        </TabsList>

        <TabsContent value="location" className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Button onClick={getUserLocation} disabled={isLoadingLocation} className="w-full">
                {isLoadingLocation ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Getting Location...
                  </>
                ) : (
                  <>
                    <MapPin className="mr-2 h-4 w-4" />
                    Use My Current Location
                  </>
                )}
              </Button>
              {locationError && <p className="text-sm text-red-500 mt-1">{locationError}</p>}
              {userLocation && (
                <p className="text-sm text-green-600 mt-1">Location found! Sorting wholesalers by distance.</p>
              )}
            </div>
            <div className="flex-1">
              <Input placeholder="Enter Pincode" value={pincode} onChange={(e) => setPincode(e.target.value)} />
            </div>
            <div className="flex-1">
              <Input placeholder="Enter City" value={city} onChange={(e) => setCity(e.target.value)} />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="name" className="space-y-4">
          <Input
            placeholder="Search by business name"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </TabsContent>
      </Tabs>

      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm text-muted-foreground">{filteredWholesalers.length} wholesalers found</p>
        </div>
        <div>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select Category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredWholesalers.map((wholesaler) => (
          <Card key={wholesaler.id} className="overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">{wholesaler.business_name}</CardTitle>
              <CardDescription className="flex items-center">
                <MapPin className="h-3.5 w-3.5 mr-1" />
                {wholesaler.city}, {wholesaler.pincode}
                {userLocation && wholesaler.latitude && wholesaler.longitude && (
                  <Badge variant="outline" className="ml-2">
                    {formatDistance(
                      calculateDistance(
                        userLocation.latitude,
                        userLocation.longitude,
                        wholesaler.latitude,
                        wholesaler.longitude,
                      ),
                    )}
                  </Badge>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-3">
              <div className="flex items-center text-sm mb-2">
                <Store className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>{wholesaler.address}</span>
              </div>
              <div className="flex items-center text-sm">
                <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>{wholesaler.phone}</span>
              </div>
              <div className="mt-4">
                <Badge className="mr-2 bg-blue-100 text-blue-800 hover:bg-blue-200">Groceries</Badge>
                <Badge className="mr-2 bg-green-100 text-green-800 hover:bg-green-200">Personal Care</Badge>
                <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200">Stationery</Badge>
              </div>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full">
                <Link href={`/wholesalers/${wholesaler.id}`}>
                  <Package className="mr-2 h-4 w-4" />
                  View Products
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {filteredWholesalers.length === 0 && (
        <div className="text-center py-12">
          <Store className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">No wholesalers found</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Try adjusting your search criteria or browse all wholesalers.
          </p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => {
              setSearchTerm("")
              setPincode("")
              setCity("")
              setCategory("all")
              setUserLocation(null)
            }}
          >
            Reset Filters
          </Button>
        </div>
      )}
    </div>
  )
}
