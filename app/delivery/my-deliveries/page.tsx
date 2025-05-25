import { createServerSupabaseClient } from "@/lib/supabase-server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Package, MapPin, Clock, ArrowRight, AlertTriangle, Phone } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { DeliveryPartnerHeader } from "@/components/delivery-partner/header"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function MyDeliveriesPage() {
  const supabase = createServerSupabaseClient()

  // Get user session
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>Please log in to access this page</AlertDescription>
        </Alert>
      </div>
    )
  }

  // Get user profile
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", session.user.id)
    .single()

  if (profileError) {
    console.error("Error fetching profile:", profileError)
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>Error loading your profile. Please try again later.</AlertDescription>
        </Alert>
      </div>
    )
  }

  // Get delivery partner info
  const { data: partner, error: partnerError } = await supabase
    .from("delivery_partners")
    .select("*")
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

  // First check if partner exists
  if (!partner?.id) {
    return (
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">My Deliveries</h1>
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Your delivery partner profile is not properly set up. Please contact an administrator.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  // Then fetch with more detailed logging and expanded status options
  console.log("Fetching deliveries for partner ID:", partner.id)
  const { data: deliveries, error: deliveriesError } = await supabase
    .from("orders")
    .select(`
     *,
     retailer:retailer_id(business_name, address, city, pincode, phone),
     wholesaler:wholesaler_id(business_name)
   `)
    .eq("delivery_partner_id", partner.id)
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

  console.log(`Found ${deliveries?.length || 0} deliveries for partner ID ${partner.id}`)

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
    <>
      <DeliveryPartnerHeader />
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">My Deliveries</h1>
          <p className="text-muted-foreground">Track and manage your assigned deliveries</p>
        </div>

        {!deliveries || deliveries.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-xl font-medium mb-2">No active deliveries</h2>
              <p className="text-muted-foreground">
                You don't have any active deliveries assigned to you at the moment.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {deliveries.map((delivery) => (
              <Card key={delivery.id} className="w-full">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">Order #{delivery.id.substring(0, 8)}</CardTitle>
                    {getStatusBadge(delivery.status)}
                  </div>
                </CardHeader>
                <CardContent className="pb-2">
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
                  </div>
                </CardContent>
                <div className="p-4 pt-0">
                  <Button asChild variant="outline" className="w-full">
                    <Link href={`/delivery/tracking/${delivery.id}`}>
                      Track Delivery
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
