"use client"

import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Phone, Clock, CreditCard } from "lucide-react"

type Delivery = {
  id: string
  order_number: string
  status: string
  created_at: string
  delivery_address: string
  delivery_city: string
  delivery_pincode: string
  total_amount: number
  payment_method: string
  payment_status: string
  profiles: {
    business_name: string
    phone: string
  }
}

export function DeliveryList({ deliveries }: { deliveries: Delivery[] }) {
  if (deliveries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-lg text-muted-foreground">No deliveries assigned yet</p>
      </div>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {deliveries.map((delivery) => (
        <Card key={delivery.id}>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">Order #{delivery.order_number}</CardTitle>
              <Badge variant={getStatusVariant(delivery.status)}>{delivery.status}</Badge>
            </div>
            <CardDescription>{formatDistanceToNow(new Date(delivery.created_at), { addSuffix: true })}</CardDescription>
          </CardHeader>
          <CardContent className="pb-2">
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <div className="text-sm">
                  {delivery.delivery_address}, {delivery.delivery_city}, {delivery.delivery_pincode}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <div className="text-sm">{delivery.profiles.phone}</div>
              </div>
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                <div className="text-sm">
                  {delivery.payment_method} - {delivery.payment_status}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div className="text-sm">{delivery.profiles.business_name}</div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Link href={`/delivery/tracking/${delivery.id}`} className="w-full">
              <Button className="w-full">
                {delivery.status === "out_for_delivery" ? "Update Status" : "View Details"}
              </Button>
            </Link>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}

function getStatusVariant(status: string) {
  switch (status) {
    case "pending":
      return "secondary"
    case "processing":
      return "secondary"
    case "out_for_delivery":
      return "default"
    case "delivered":
      return "success"
    case "cancelled":
      return "destructive"
    default:
      return "outline"
  }
}
