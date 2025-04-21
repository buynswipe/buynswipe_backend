import { createServerSupabaseClient } from "@/lib/supabase-server"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { MapPin, Package, ArrowRight, Phone } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export const dynamic = "force-dynamic"

export default async function MyDeliveriesPage() {
  console.log("Running The Function")
  const supabase = createServerSupabaseClient()

  try {
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()
    if (sessionError) {
      throw new Error("Not authenticated")
    }

    console.log("User ID from session:", session.user.id)

    // Get delivery partner info
    const { data: partner, error: partnerError } = await supabase
      .from("delivery_partners")
      .select("id")
      .eq("user_id", session.user.id)
      .single()

    if (partnerError) {
      throw new Error("Delivery partner not found")
    }
    console.log("partner Id" + partner.id)

    // Get assigned orders
    const { data: deliveries } = await supabase
      .from("orders")
      .select(`
   *,
   retailer:profiles!retailer_id(business_name, address, city, pincode, phone),
   wholesaler:profiles!wholesaler_id(business_name, address, city, pincode)
 `)
      .eq("delivery_partner_id", partner?.id || "")
      .in("status", ["confirmed", "dispatched", "in_transit"])
      .order("created_at", { ascending: false })

    console.log("Orders length is " + deliveries?.length)

    const getStatusBadge = (status: string) => {
      switch (status) {
        case "confirmed":
          return <Badge variant="outline">Confirmed</Badge>
        case "dispatched":
          return <Badge variant="secondary">Dispatched</Badge>
        case "in_transit":
          return <Badge variant="default">In Transit</Badge>
        default:
          return <Badge variant="outline">{status}</Badge>
      }
    }

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">My Deliveries</h1>
          <p className="text-muted-foreground">Track and manage your assigned deliveries</p>
        </div>

        {!deliveries || deliveries.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Package className="mx-auto h-12 w-12 text-muted-foreground" />
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
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{delivery.retailer?.business_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {delivery.retailer?.address}, {delivery.retailer?.city}, {delivery.retailer?.pincode}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm">{delivery.retailer?.phone}</p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="p-4 pt-0">
                  <Button asChild variant="outline" className="w-full">
                    <Link href={`/delivery-partner/tracking/${delivery.id}`}>
                      Track Delivery
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    )
  } catch (error: any) {
    console.error("Error in MyDeliveriesPage:", error.message)
    return <div>Error: {error.message}</div>
  }
}
