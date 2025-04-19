"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { MapPin, Phone, AlertTriangle, Navigation } from "lucide-react"
import { useLocation } from "@/contexts/location-context"

interface DeliveryNavigationProps {
  orderId: string
  retailerAddress: string
  retailerPhone: string
  onReportIssue: (issue: string) => void
}

export function DeliveryNavigation({
  orderId,
  retailerAddress,
  retailerPhone,
  onReportIssue,
}: DeliveryNavigationProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { currentLocation } = useLocation()

  useEffect(() => {
    if (!currentLocation) {
      setError("Please enable location services to start navigation")
    }
  }, [currentLocation])

  const handleReportIssue = (issue: string) => {
    onReportIssue(issue)
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Navigation</CardTitle>
        <CardDescription>Follow the directions to the delivery location</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="font-medium">Deliver to:</p>
              <p className="text-sm text-muted-foreground">{retailerAddress}</p>
            </div>
          </div>
          <Button asChild variant="outline" className="w-full">
            <a href={`https://maps.google.com/?q=${retailerAddress}`} target="_blank" rel="noopener noreferrer">
              <Navigation className="mr-2 h-4 w-4" />
              Open in Google Maps
            </a>
          </Button>
        </div>

        <div className="space-y-2">
          <Button asChild variant="outline" className="w-full">
            <a href={`tel:${retailerPhone}`}>
              <Phone className="mr-2 h-4 w-4" />
              Contact Retailer
            </a>
          </Button>
        </div>

        <Separator />

        <div className="space-y-2">
          <p className="font-medium">Report Issue</p>
          <Button variant="ghost" className="w-full justify-start" onClick={() => handleReportIssue("Traffic delay")}>
            Traffic Delay
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={() => handleReportIssue("Address not found")}
          >
            Address Not Found
          </Button>
          <Button variant="ghost" className="w-full justify-start" onClick={() => handleReportIssue("Item damaged")}>
            Item Damaged
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
