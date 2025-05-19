import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Package, MapPin, Clock, ArrowRight, AlertTriangle, Phone } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function MyDeliveriesPage() {
  const supabase = createServerComponentClient({ cookies })

  // Get user session
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login")
  }

  // Get delivery partner info
  const { data: partner, error: partnerError } = await supabase
    .from("delivery_partners")
    .select("id")
    .eq("user_id", session.user.id)
    .single()

  if (partnerError && !partnerError.message.includes("No rows found")) {
    console.error("Error fetching delivery partner:", partnerError)
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>Error loading your delivery partner profile. Please try again later.</AlertDescription>
        </Alert>
      </div>
    )
  }

  // If no partner found, create sample data for development
  const partnerId = partner?.id || "dev-partner-id"

  // Get deliveries
  const { data: deliveries, error: deliveriesError } = await supabase
    .from("orders")
    .select(`
      *,
      retailer:retailer_id(*),
      wholesaler:wholesaler_id(*)
    `)
    .eq("delivery_partner_id", partnerId)
    .in("status", ["confirmed", "dispatched", "in_transit", "out_for_delivery"])
    .order("created_at", { ascending: false })

  if (deliveriesError) {
    console.error("Error fetching deliveries:", deliveriesError)
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>Error loading your deliveries. Please try again later.</AlertDescription>
        </Alert>
      </div>
    )
  }

  // Create sample data if no real data exists
  const hasDeliveries = deliveries && deliveries.length > 0

  const sampleDeliveries = [
    {
      id: "2abb2968-29ab-46d7-bfb1-a47640e5027f",
      created_at: new Date().toISOString(),
      status: "dispatched",
      retailer: {
        business_name: "Sample Retail Store",
        address: "123 Retail Street",
        city: "Delhi",
        pincode: "110001",
        phone: "9876543211",
      },
      wholesaler: {
        business_name: "Mega Wholesale Supplies",
      },
      delivery_instructions: "Call before delivery",
    },
    {
      id: "cb40debd-9c0f-434d-a401-8b8915d8e4ea",
      created_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
      status: "in_transit",
      retailer: {
        business_name: "City Retail Shop",
        address: "456 Market Road",
        city: "Mumbai",
        pincode: "400001",
        phone: "9876543222",
      },
      wholesaler: {
        business_name: "Mega Wholesale Supplies",
      },
    },
  ]

  const displayDeliveries = hasDeliveries ? deliveries : sampleDeliveries

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return <Badge variant="outline">Confirmed</Badge>
      case "dispatched":
        return <Badge variant="secondary">Dispatched</Badge>
      case "in_transit":
        return <Badge variant="default">In Transit</Badge>
      case "out_for_delivery":
        return <Badge className="bg-blue-100 text-blue-800">Out for Delivery</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">My Deliveries</h1>
        <p className="text-muted-foreground">Track and manage your assigned deliveries</p>
      </div>

      {!hasDeliveries && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 mb-4">
          <p className="text-yellow-700">
            <strong>Development Mode:</strong> Showing sample data because no real deliveries are assigned to this
            partner.
          </p>
        </div>
      )}

      {displayDeliveries.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-medium mb-2">No active deliveries</h2>
            <p className="text-muted-foreground">You don't have any active deliveries assigned to you at the moment.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {displayDeliveries.map((delivery) => (
            <Card key={delivery.id} className="w-full">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-medium">Order #{delivery.id.substring(0, 8)}</h3>
                  {getStatusBadge(delivery.status)}
                </div>
                <div className="space-y-4">
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 mt-1 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{delivery.retailer?.business_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {delivery.retailer?.address}, {delivery.retailer?.city}, {delivery.retailer?.pincode}
                      </p>
                      {delivery.retailer?.phone && (
                        <p className="text-sm flex items-center mt-1">
                          <Phone className="h-3 w-3 mr-1" />
                          <a href={`tel:${delivery.retailer.phone}`} className="text-blue-600">
                            {delivery.retailer.phone}
                          </a>
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium">From: {delivery.wholesaler?.business_name}</p>
                    {delivery.delivery_instructions && (
                      <div className="mt-2">
                        <p className="text-sm font-medium">Delivery Instructions:</p>
                        <p className="text-sm text-muted-foreground">{delivery.delivery_instructions}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">{new Date(delivery.created_at).toLocaleString()}</p>
                  </div>

                  <Button asChild variant="outline" className="w-full">
                    <Link href={`/delivery-partner/tracking/${delivery.id}`}>
                      Track Delivery
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
